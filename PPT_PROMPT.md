# Automated Bug Triage System - PowerPoint Presentation Prompt (15 SLIDES)

## Project Overview

**Project Title:** Automated Bug Triage System

**Subject:** Software Engineering and Project Management

**Objective:** Create an intelligent, machine learning-powered system that automates the process of assigning incoming bug reports to appropriate developers or teams and predicting their priority levels.

---

## Slide 1: Title Slide
- Title: "Automated Bug Triage System"
- Subtitle: "Intelligent Bug Assignment & Priority Prediction using ML"
- Course: Software Engineering and Project Management
- Author: [Your Name]
- Date: April 2026
- **Visual**: Project logo or system screenshot

---

## Slide 2: Problem & Solution
**Current Challenges:**
- Manual bug assignment is time-consuming and error-prone
- Large volume and inconsistent prioritization
- Difficulty identifying duplicates
- No structured automation

**Solution:**
- ML-powered automated assignment (87-92% accuracy)
- Intelligent priority prediction (85-90% accuracy)
- Duplicate detection using similarity analysis
- Scalable REST API architecture

**Objectives:**
1. Develop ML pipeline for bug classification
2. Create REST API for predictions
3. Implement duplicate detection
4. Build web interface
5. Deploy with Docker/Railway

---

## Slide 3: System Architecture & Tech Stack
**Three-Layer Architecture:**

**Frontend Layer** (React/Vite on :3000)
- Bug submission form
- Results display
- Dashboard & analytics
- Real-time interaction

**API Layer** (FastAPI on :8000)
- /predict endpoint (assignment + priority)
- /reports endpoint (view all)
- /health (status check)
- /retrain (model update)

**Backend Layers:**
- **ML Pipeline**: TF-IDF vectorization, Logistic Regression, Naive Bayes
- **Database**: SQLite (dev), PostgreSQL (prod)
- **Storage**: Bug reports, predictions, confidence scores

**Technology Stack:**

**Frontend**: React 19, Vite, Tailwind CSS, Axios, React Router  
**Backend**: FastAPI, Uvicorn, SQLAlchemy, Pydantic  
**ML**: Scikit-learn, Pandas, NLTK, NumPy  
**DevOps**: Docker, Docker Compose, Railway.app, Git  

---

## Slide 4: Key Features & Database Design

**System Features:**
- ✓ Automated Bug Assignment (87-92% accuracy)
- ✓ Priority Classification (85-90% accuracy)
- ✓ Duplicate Detection (cosine similarity)
- ✓ REST API (production-ready)
- ✓ Database Storage (persistent)
- ✓ Model Retraining (continuous improvement)

**Database Schema - BugReport Table:**

| Column | Type | Purpose |
|--------|------|---------|
| id | PK | Unique identifier |
| title | String | Bug subject |
| description | Text | Detailed description |
| predicted_assigned_to | String | ML prediction |
| assignment_confidence | Float | Confidence (0-1) |
| predicted_priority | String | Priority level |
| priority_confidence | Float | Confidence score |
| created_at | DateTime | Timestamp |
| is_duplicate | Int | Duplicate flag |
| duplicate_of | FK | References original bug |

---

## Slide 5: Machine Learning Pipeline

**Text Preprocessing & Feature Extraction:**
1. **Preprocessing**: Lowercase → Remove special chars → Tokenize → Remove stopwords
2. **Vectorization**: TF-IDF (Term Frequency-Inverse Document Frequency)
3. **Feature Vectors**: Sparse numerical representation

**ML Models (Parallel Processing):**
- **Assignment Model**: Logistic Regression
  - Predicts: Developer/Team
  - Accuracy: 87-92%
- **Priority Model**: Multinomial Naive Bayes
  - Predicts: LOW/MEDIUM/HIGH/CRITICAL
  - Accuracy: 85-90%

**Post-Processing:**
- Confidence scoring
- Duplicate detection (cosine similarity)
- Result aggregation

**Training Data:**
- Train-Test Split: 80-20
- Training Samples: 1000+
- Features: 500-1000 TF-IDF vectors
- Evaluation: Accuracy, Precision, Recall, F1-Score

---

## Slide 6: API & Workflow

---

## Slide 7: Request-Response Workflow
