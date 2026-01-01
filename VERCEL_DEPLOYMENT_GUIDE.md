# Vercel Deployment Guide for DataWorld

This guide will help you deploy your DataWorld web application to Vercel. Since you have a full-stack application (React frontend + Express backend), you have several deployment options.

## Table of Contents
1. [Option 1: Deploy Both Frontend and Backend on Vercel](#option-1-deploy-both-on-vercel)
2. [Option 2: Deploy Frontend on Vercel + Backend on Render/Railway](#option-2-split-deployment)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Post-Deployment Steps](#post-deployment-steps)

---

## Option 1: Deploy Both Frontend and Backend on Vercel

### Prerequisites
- A Vercel account (free at [vercel.com](https://vercel.com))
- GitHub repository with your code
- Node.js installed locally

### Step 1: Project Structure Setup

First, reorganize your project to be Vercel-friendly:

```
dataworld/
├── client/           # Frontend (Vite + React)
├── server/           # Backend (Express)
├── package.json      # Root package.json
├── vercel.json       # Vercel configuration
└── .env              # Environment variables
```

### Step 2: Create Root package.json

Create a `package.json` in your root directory:

```json
{
  "name": "dataworld",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "install:client": "cd client && npm install",
    "install:server": "cd server && npm install",
    "install:all": "npm run install:client && npm run install:server",
    "build:client": "cd client && npm run build",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\""
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Install concurrently:
```bash
npm install
```

### Step 3: Configure Vercel

Create a `vercel.json` file in the root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/$1"
    }
  ]
}
```

### Step 4: Update Backend for Vercel

Modify `server/index.ts` to work as a serverless function:

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import datasetRoutes from './routes/datasets';
import draftRoutes from './routes/drafts';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/drafts', draftRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Export for Vercel
export default app;
```

### Step 5: Update Client API Configuration

Modify `client/src/config/api.ts` to use environment variables:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export { API_BASE_URL };
```

### Step 6: Deploy to Vercel

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com) and log in
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Other
     - **Root Directory**: `./`
     - **Build Command**: `npm run build:client`
     - **Output Directory**: `client/dist`
   - Click "Deploy"

3. **Or deploy via Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

---

## Option 2: Split Deployment (Recommended for Production)

This is often more reliable for production apps.

### Part A: Deploy Frontend on Vercel

1. **Prepare Client for Deployment**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy Frontend**:
   - Push to GitHub
   - Import repository to Vercel
   - Settings:
     - Root Directory: `client`
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Set Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com`

### Part B: Deploy Backend on Render/Railway

#### Option A: Render (Free tier available)

1. **Prepare Backend**:
   ```bash
   cd server
   npm install
   ```

2. **Deploy to Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Settings:
     - Root Directory: `server`
     - Build Command: `npm install`
     - Start Command: `npm start`
   - Add Environment Variables (see section below)
   - Click "Create Web Service"

3. **Update Client API URL**:
   - Set `VITE_API_URL` to your Render URL (e.g., `https://your-app.onrender.com`)

#### Option B: Railway (Free tier available)

1. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Add environment variables
   - Railway will auto-detect and deploy

---

## Environment Variables Setup

### Required Environment Variables

#### For Backend (server/.env):
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-super-secret-jwt-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
```

#### For Frontend (client/.env):
```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-firebase-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-firebase-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Setting Environment Variables

#### On Vercel (Frontend):
1. Go to Project Dashboard
2. Settings → Environment Variables
3. Add each variable with `VITE_` prefix
4. Redeploy after adding

#### On Render/Railway (Backend):
1. Go to your service dashboard
2. Settings → Environment Variables
3. Add each variable (no `VITE_` prefix)
4. Redeploy after adding

---

## Post-Deployment Steps

### 1. Update CORS Configuration

Modify `server/src/app.ts` or add CORS middleware:

```typescript
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend.vercel.app',
  'https://your-custom-domain.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### 2. Update Google OAuth Redirect URLs

Go to Google Cloud Console:
1. Navigate to Credentials
2. Edit your OAuth 2.0 Client ID
3. Add your production URLs to "Authorized redirect URIs":
   - `https://your-backend-url.com/api/auth/google/callback`
   - `https://your-frontend-url.com/api/auth/google/callback`

### 3. Test the Deployment

1. **Check Backend Health**:
   ```bash
   curl https://your-backend-url.com/api/health
   ```

2. **Check Frontend**:
   - Visit your Vercel URL
   - Try logging in
   - Upload a test file
   - Create a chart

3. **Check Browser Console**:
   - Open Developer Tools
   - Check for CORS errors
   - Check API response errors

### 4. Custom Domain (Optional)

#### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

#### For Render (Backend):
1. Go to Settings → Custom Domains
2. Add your custom domain
3. Update DNS records

---

## Troubleshooting

### Issue: CORS Errors
**Solution**: Update `server/src/app.ts` with your production URLs in CORS configuration

### Issue: MongoDB Connection Failed
**Solution**: 
- Check `MONGODB_URI` in environment variables
- Ensure IP whitelist includes `0.0.0.0/0` or Vercel's IP ranges
- Use MongoDB Atlas (free tier works well)

### Issue: File Uploads Fail
**Solution**: 
- Check if backend has file size limits
- Verify MongoDB document size limits (16MB)
- Consider using file storage services (AWS S3, Cloudinary) for large files

### Issue: Build Fails
**Solution**:
- Check build logs in Vercel/Render dashboard
- Ensure all dependencies are listed in package.json
- Verify TypeScript configuration

### Issue: Slow Performance
**Solution**:
- Add caching headers
- Optimize database queries
- Consider CDN for static assets
- Use Vercel Analytics to monitor performance

---

## Cost Summary

### Free Tier (Recommended for Development/MVP):
- **Vercel (Frontend)**: Free
  - 100GB bandwidth/month
  - Unlimited deployments
  - SSL certificates
- **Render (Backend)**: Free
  - 750 hours/month
  - 0.1 CPU, 512MB RAM
  - PostgreSQL/Redis available
- **MongoDB Atlas**: Free
  - 512MB storage
  - Shared RAM
- **Firebase Authentication**: Free
  - Up to 10,000 verifications/month

### Estimated Monthly Cost (Production):
- Vercel Pro: $20/month
- Render Pro: $7/month
- MongoDB Atlas: $9/month
- **Total**: ~$36/month

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## Quick Start Command Summary

```bash
# Install dependencies
npm install

# Build client
cd client && npm run build

# Test locally
npm run dev

# Deploy to Vercel (CLI)
npm install -g vercel
vercel

# Check deployment
vercel ls
```

---

## Support

If you encounter issues:
1. Check deployment logs in Vercel/Render dashboard
2. Review browser console for errors
3. Verify all environment variables are set
4. Test API endpoints using Postman or curl
5. Check this project's GitHub issues section
