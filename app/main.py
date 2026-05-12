from contextlib import asynccontextmanager
from pathlib import Path
import os
import sys
import logging

import pandas as pd
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add the parent directory to the path to import the model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import BugReport, create_tables, get_db
from model.bug_triage_model import BugTriageModel

ROOT_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT_DIR / "model" / "bug_triage_model.pkl"


def get_allowed_origins() -> list[str]:
    allowed_origins = os.getenv(
        "ALLOWED_ORIGINS",
        ",".join(
            [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://automated-bug-triage-system.up.railway.app",
                "https://automated-bug-triage.vercel.app",
                "https://automated-bug-triage-system.onrender.com",
            ]
        ),
    )
    return [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]


# Lazy-loaded model
_model = None

def get_model():
    """Lazy load model on first use"""
    global _model
    if _model is None:
        logger.info("Initializing model...")
        _model = BugTriageModel()
        if MODEL_PATH.exists():
            logger.info(f"Loading model from {MODEL_PATH}")
            _model.load_model(str(MODEL_PATH))
        else:
            logger.warning(f"Model file not found at {MODEL_PATH}")
    return _model


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Starting up...")
    create_tables()
    # Don't load model on startup - it will be loaded on first request
    logger.info("Startup complete")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="Automated Bug Triage System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BugReportRequest(BaseModel):
    title: str
    description: str


class BugReportResponse(BaseModel):
    assigned_to: str
    assignment_confidence: float
    priority: str
    priority_confidence: float
    is_duplicate: bool = False
    duplicate_info: dict = {}


class BugHistoryResponse(BaseModel):
    id: int
    title: str
    description: str
    assigned_to: str
    assignment_confidence: float
    priority: str
    priority_confidence: float
    confidence: float
    is_duplicate: bool
    duplicate_of: int | None = None
    created_at: str


@app.post("/predict", response_model=BugReportResponse)
async def predict_bug_assignment(
    request: BugReportRequest,
    db: Session = Depends(get_db),
):
    try:
        model = get_model()
        prediction = model.predict(request.title, request.description)

        existing_reports = db.query(BugReport).all()
        existing_df = pd.DataFrame(
            [
                {
                    "id": report.id,
                    "title": report.title,
                    "description": report.description,
                }
                for report in existing_reports
            ]
        )
        duplicates = model.detect_duplicates(
            request.title,
            request.description,
            existing_df,
        )

        is_duplicate = len(duplicates) > 0
        duplicate_info = {}
        if is_duplicate:
            most_similar = max(duplicates, key=lambda item: item["similarity"])
            duplicate_info = {
                "id": most_similar["id"],
                "title": most_similar["title"],
                "similarity": most_similar["similarity"],
            }

        db_report = BugReport(
            title=request.title,
            description=request.description,
            predicted_assigned_to=prediction["assigned_to"],
            assignment_confidence=prediction["assignment_confidence"],
            predicted_priority=prediction["priority"],
            priority_confidence=prediction["priority_confidence"],
            is_duplicate=1 if is_duplicate else 0,
            duplicate_of=duplicate_info["id"] if duplicate_info else None,
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)

        return BugReportResponse(
            assigned_to=prediction["assigned_to"],
            assignment_confidence=prediction["assignment_confidence"],
            priority=prediction["priority"],
            priority_confidence=prediction["priority_confidence"],
            is_duplicate=is_duplicate,
            duplicate_info=duplicate_info,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Bug Triage System is running"}


@app.get("/reports", response_model=list[BugHistoryResponse])
async def get_bug_reports(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    reports = db.query(BugReport).order_by(BugReport.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": report.id,
            "title": report.title,
            "description": report.description,
            "assigned_to": report.predicted_assigned_to,
            "assignment_confidence": report.assignment_confidence,
            "priority": report.predicted_priority,
            "priority_confidence": report.priority_confidence,
            "confidence": max(report.assignment_confidence, report.priority_confidence),
            "created_at": report.created_at.isoformat(),
            "is_duplicate": bool(report.is_duplicate),
            "duplicate_of": report.duplicate_of,
        }
        for report in reports
    ]


@app.get("/bugs", response_model=list[BugHistoryResponse])
async def get_bug_history(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    return await get_bug_reports(skip=skip, limit=limit, db=db)


@app.post("/retrain")
async def retrain_model(db: Session = Depends(get_db)):
    try:
        model = get_model()
        reports = db.query(BugReport).all()

        if len(reports) < 10:
            raise HTTPException(status_code=400, detail="Not enough data for retraining")

        data = []
        for report in reports:
            data.append(
                {
                    "title": report.title,
                    "description": report.description,
                    "assigned_to": report.predicted_assigned_to,
                    "priority": report.predicted_priority,
                }
            )

        df = pd.DataFrame(data)
        model.train_from_frames(
            df[["title", "description", "assigned_to"]],
            df[["title", "description", "priority"]],
        )
        model.save_model(str(MODEL_PATH))

        return {"message": "Model retrained successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {exc}") from exc


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
