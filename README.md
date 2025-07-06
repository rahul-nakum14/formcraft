# FormCraft - Vercel Deployment Guide

## Overview
FormCraft is a full-stack form builder application built with React, Express, and MongoDB. This guide will help you deploy it to Vercel.

## Prerequisites
- Vercel account
- MongoDB database (MongoDB Atlas recommended)
- Stripe account (for payments)
- Email service (Gmail SMTP or similar)

## Environment Variables Required

Set these environment variables in your Vercel project settings:

### Database
```
DATABASE_URL=your_mongodb_connection_string
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=formcraft
```

### Authentication
```
JWT_SECRET=your_secure_jwt_secret_key
```

### Email Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM=FormCraft <no-reply@formcraft.app>
APP_URL=https://your-vercel-domain.vercel.app
```

### Stripe Configuration
```
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Client-side Environment Variables
Create a `.env` file in the client directory:
```
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

## Deployment Steps

### 1. Prepare Your Repository
```bash
# Make sure all changes are committed
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave empty)
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### 3. Configure Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add all the environment variables listed above
4. Redeploy the project

### 4. Configure Custom Domain (Optional)
1. Go to your Vercel project dashboard
2. Navigate to Settings > Domains
3. Add your custom domain
4. Update the `APP_URL` environment variable with your custom domain

## Build Process

The application uses the following build process:
1. **Client Build**: Vite builds the React application to `dist/public`
2. **Server**: Express server runs as a serverless function on Vercel
3. **Static Files**: Built client files are served from the same serverless function

## Troubleshooting

### Common Issues

#### 1. "Page not found" Error
- Ensure all routes in `vercel.json` are correctly configured
- Check that the build output directory matches the configuration

#### 2. API Routes Not Working
- Verify environment variables are set correctly
- Check Vercel function logs for errors
- Ensure database connection is working

#### 3. Images Not Loading
- Check that static file serving is configured correctly
- Verify asset paths in the built application

#### 4. Database Connection Issues
- Ensure MongoDB Atlas IP whitelist includes Vercel's IP ranges
- Check that the connection string is correct
- Verify database user permissions

### Debugging
1. Check Vercel function logs in the dashboard
2. Use `console.log` statements in your server code
3. Test API endpoints using tools like Postman
4. Verify environment variables are loaded correctly

## Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## File Structure
```
formcraft/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── dist/            # Build output
├── vercel.json      # Vercel configuration
└── package.json     # Dependencies and scripts
```

## Support
If you encounter issues:
1. Check the Vercel documentation
2. Review the function logs in Vercel dashboard
3. Test locally to isolate issues
4. Verify all environment variables are set correctly 