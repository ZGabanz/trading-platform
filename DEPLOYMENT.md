# Deployment Instructions

## 🚀 Quick Start

The application is now fully functional with mock API data and can be deployed to various platforms.

### Current Status

✅ **All APIs working** - Mock data endpoints are functional
✅ **Rate limiting implemented** - 429 errors resolved
✅ **Caching system** - 5-second cache for performance
✅ **Error handling** - Proper fallbacks and retry logic

## 🔧 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Application will be available at http://localhost:3000
```

## 🌐 Deploy to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts and your app will be deployed
```

### Option 2: GitHub Integration

1. Push code to GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

**Environment Variables (automatically set by Vercel):**

- `NEXT_PUBLIC_API_URL` - Will be set to your Vercel URL
- `NODE_ENV=production`

## 🎯 Deploy to Render.com

### Option 1: GitHub Integration

1. Push code to GitHub repository
2. Go to [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `NEXT_PUBLIC_API_URL=https://your-app.onrender.com`

### Option 2: Manual Deploy

```bash
# 1. Install Render CLI
npm install -g render

# 2. Deploy using render.yaml
render deploy
```

## 🌊 Deploy to Netlify

### Option 1: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=.next
```

### Option 2: GitHub Integration

1. Push to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Connect repository
5. Configure:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
   - **Environment Variables**:
     - `NEXT_PUBLIC_API_URL=https://your-app.netlify.app`

## 🚂 Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway deploy
```

## ☁️ Deploy to AWS Amplify

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Configure build settings:
   ```yaml
   version: 1
   applications:
     - frontend:
         phases:
           preBuild:
             commands:
               - npm install
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: .next
           files:
             - "**/*"
   ```

## 🐋 Deploy with Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build and Run

```bash
# Build image
docker build -t financial-dashboard .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3000 financial-dashboard
```

## 🔐 Environment Variables

### Required Variables

| Variable              | Description  | Default                 |
| --------------------- | ------------ | ----------------------- |
| `NEXT_PUBLIC_API_URL` | API base URL | `http://localhost:3000` |
| `NODE_ENV`            | Environment  | `development`           |

### Platform-Specific Setup

#### Vercel

```bash
# Set via Vercel CLI
vercel env add NEXT_PUBLIC_API_URL

# Or via Vercel Dashboard
# Project Settings → Environment Variables
```

#### Render.com

```bash
# Set in render.yaml or Dashboard
# Environment Variables section
```

#### Netlify

```bash
# Set via Netlify CLI
netlify env:set NEXT_PUBLIC_API_URL https://your-app.netlify.app

# Or via Netlify Dashboard
# Site Settings → Environment Variables
```

## 🔍 Troubleshooting

### Common Issues

1. **API 404 Errors**

   - Ensure `NEXT_PUBLIC_API_URL` is set correctly
   - Check that the deployment includes all API routes

2. **Build Failures**

   - Verify all dependencies are in `package.json`
   - Check for TypeScript errors: `npm run type-check`

3. **Rate Limiting Issues**
   - Check browser console for rate limit statistics
   - Verify API endpoints are responding correctly

### Debug Commands

```bash
# Check API endpoints
curl https://your-app.vercel.app/api/system/health

# Check environment variables
echo $NEXT_PUBLIC_API_URL

# Test local build
npm run build && npm start
```

## 📊 Performance Optimization

### For Production Deployment

1. **Enable Compression**

   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
     // ... other config
   };
   ```

2. **Optimize Images**

   ```javascript
   // next.config.js
   module.exports = {
     images: {
       domains: ["your-domain.com"],
       formats: ["image/webp"],
     },
   };
   ```

3. **Enable Analytics**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       instrumentationHook: true,
     },
   };
   ```

## 🎯 Post-Deployment Checklist

- [ ] All API endpoints responding correctly
- [ ] Rate limiting working as expected
- [ ] System status page showing correct data
- [ ] Currency converter functioning
- [ ] Deal management working
- [ ] No console errors in browser
- [ ] Mobile responsive design working
- [ ] Performance metrics acceptable

## 📈 Monitoring

### Health Check Endpoint

```bash
curl https://your-app.vercel.app/api/system/health
```

### Expected Response

```json
{
  "systemHealth": 75,
  "onlineServices": 3,
  "totalServices": 4,
  "services": [...],
  "timestamp": "2025-07-05T11:50:13.560Z"
}
```

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

---

## 🎉 Ready to Deploy!

Your application is now ready for deployment to any platform. All APIs are mocked and functional, rate limiting is implemented, and the application includes proper error handling and caching.

Choose your preferred deployment platform and follow the instructions above!
