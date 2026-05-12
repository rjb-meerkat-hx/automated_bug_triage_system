# Deployment Guide: Render + Vercel

This guide will help you deploy the Automated Bug Triage System with:
- **Backend**: Render (FastAPI)
- **Frontend**: Vercel (React)

## 🚀 Quick Deployment

### 1. Deploy Backend to Render

1. **Go to [Render Dashboard](https://render.com)**
2. **Sign up** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Select `automated_bug_triage_system`**
6. **Configure Service:**
   ```
   Name: automated-bug-triage-api
   Environment: Python
   Build Command: pip install -r requirements.txt
   Start Command: python start_render.py
   ```
7. **Add Environment Variables:**
   ```
   DATABASE_URL=sqlite:///./bug_triage.db
   HOST=0.0.0.0
   PORT=8000
   DEBUG=false
   MODEL_PATH=./model/bug_triage_model.pkl
   ALLOWED_ORIGINS=https://automated-bug-triage.vercel.app,https://automated-bug-triage-system.onrender.com
   LOG_LEVEL=INFO
   ```
8. **Click "Create Web Service"**

### 2. Deploy Frontend to Vercel

1. **Go to [Vercel Dashboard](https://vercel.com)**
2. **Sign up** with GitHub
3. **Click "Add New..." → "Project"**
4. **Import `automated_bug_triage_system` repository**
5. **Configure Project:**
   ```
   Framework: Vite
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```
6. **Add Environment Variables:**
   ```
   VITE_API_URL=https://automated-bug-triage-system.onrender.com
   VITE_APP_NAME=Automated Bug Triage System
   VITE_APP_VERSION=1.0.0
   ```
7. **Click "Deploy"**

## 📋 Configuration Files Created

### Backend (Render)
- `render.yaml` - Service configuration
- `start_render.py` - Deployment script with database setup and model training

### Frontend (Vercel)
- `vercel.json` - Build and deployment configuration
- `frontend.env.example` - Environment variables template

### CORS Configuration
Updated `app/main.py` to allow cross-origin requests between:
- Local development (localhost:3000, localhost:5173)
- Railway deployment
- Render backend
- Vercel frontend

## 🔗 Your Live URLs

After deployment:

### Backend (Render)
```
https://automated-bug-triage-system.onrender.com
```

**API Endpoints:**
- Health Check: `https://automated-bug-triage-system.onrender.com/health`
- API Docs: `https://automated-bug-triage-system.onrender.com/docs`
- Predict: `https://automated-bug-triage-system.onrender.com/predict`
- Reports: `https://automated-bug-triage-system.onrender.com/reports`

### Frontend (Vercel)
```
https://automated-bug-triage.vercel.app
```

## 🧪 Testing Your Deployment

### 1. Test Backend
```bash
curl https://automated-bug-triage-system.onrender.com/health
```

### 2. Test API
```bash
curl -X POST "https://automated-bug-triage-system.onrender.com/predict" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Login button not working",
       "description": "Users cannot click the login button"
     }'
```

### 3. Test Frontend
Visit `https://automated-bug-triage.vercel.app` and test the UI

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `ALLOWED_ORIGINS` includes both frontend and backend URLs
   - Check environment variables are set correctly

2. **Model Not Found**
   - Render needs time to train the model on first deployment
   - Check Render logs for training progress

3. **Build Failures**
   - Verify `requirements.txt` has all dependencies
   - Check Node.js version compatibility

4. **Database Issues**
   - SQLite file should persist across deployments
   - Check Render storage permissions

### Monitoring

#### Render
- **Logs**: Dashboard → Service → Logs
- **Metrics**: Dashboard → Service → Metrics
- **Health Checks**: Automatic health monitoring

#### Vercel
- **Logs**: Dashboard → Project → Logs
- **Analytics**: Dashboard → Project → Analytics
- **Deployments**: Dashboard → Project → Deployments

## 💰 Cost Breakdown

### Render (Backend)
- **Free Tier**: $0/month (750 hours/month)
- **Starter**: $7/month (unlimited hours)
- **Standard**: $25/month (more power)

### Vercel (Frontend)
- **Hobby**: $0/month (personal projects)
- **Pro**: $20/month (bandwidth + analytics)
- **Enterprise**: Custom pricing

## 🔄 CI/CD Pipeline

Both platforms provide automatic deployments:

1. **Push to GitHub** → Automatic deployments
2. **Branch Deploys** → Preview deployments
3. **Rollbacks** → One-click rollback
4. **Environment Variables** → Secure configuration

## 📊 Performance Optimization

### Backend Optimizations
- Model caching in memory
- Database connection pooling
- Request rate limiting
- Health checks

### Frontend Optimizations
- Code splitting
- Lazy loading
- Image optimization
- CDN distribution

## 🔒 Security Considerations

- HTTPS enforced on both platforms
- Environment variables for secrets
- CORS properly configured
- Rate limiting available
- SSL certificates managed

## 📱 Mobile Support

Both deployments are mobile-responsive:
- Render serves API to mobile apps
- Vercel serves responsive web app
- Progressive Web App (PWA) ready

## 🚀 Next Steps

1. **Deploy both services**
2. **Test cross-origin functionality**
3. **Set up monitoring**
4. **Configure custom domains**
5. **Set up analytics**

Your Automated Bug Triage System will be production-ready!
