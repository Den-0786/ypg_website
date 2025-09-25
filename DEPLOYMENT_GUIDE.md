# YPG Website Deployment Guide for Render

This guide will help you deploy both the backend (Django) and frontend (Next.js) to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Domain (Optional)**: Have a custom domain ready if needed

## Backend Deployment (Django)

### Step 1: Deploy Backend Service

1. **Log into Render Dashboard**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `ypg-website-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - **Start Command**: `gunicorn ypg_backend.wsgi:application`

### Step 2: Environment Variables

Add these environment variables in Render dashboard:

```
DEBUG=False
SECRET_KEY=<generate-a-secure-secret-key>
ALLOWED_HOSTS=ypg-website-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://ypg-website-frontend.onrender.com
DATABASE_URL=<will-be-provided-by-postgres-service>
```

### Step 3: Create PostgreSQL Database

1. **Click "New +" → "PostgreSQL"**
2. **Configure:**

   - **Name**: `ypg-website-db`
   - **Plan**: Starter (Free)
   - **Database Name**: `ypg_website_db`
   - **User**: `ypg_website_user`

3. **Connect to Backend Service:**
   - Go to your backend service settings
   - Add database connection
   - Copy the `DATABASE_URL` to environment variables

### Step 4: Deploy Backend

1. **Click "Create Web Service"**
2. **Wait for deployment to complete**
3. **Test the backend**: Visit `https://ypg-website-backend.onrender.com/admin/`

## Frontend Deployment (Next.js)

### Step 1: Deploy Frontend Service

1. **Click "New +" → "Static Site"**
2. **Connect your GitHub repository**
3. **Configure:**
   - **Name**: `ypg-website-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `out`

### Step 2: Environment Variables

Add these environment variables:

```
NEXT_PUBLIC_API_BASE_URL=https://ypg-website-backend.onrender.com
NEXT_PUBLIC_SITE_URL=https://ypg-website-frontend.onrender.com
NODE_ENV=production
```

### Step 3: Deploy Frontend

1. **Click "Create Static Site"**
2. **Wait for deployment to complete**
3. **Test the frontend**: Visit your frontend URL

## Post-Deployment Steps

### 1. Create Admin User

SSH into your backend service or use Render's shell:

```bash
python manage.py createsuperuser
```

Or use the build script that automatically creates an admin user:

- Username: `admin`
- Password: `admin123`

### 2. Test API Endpoints

Test these endpoints to ensure everything works:

- `GET https://ypg-website-backend.onrender.com/api/events/`
- `GET https://ypg-website-backend.onrender.com/api/team/`
- `GET https://ypg-website-backend.onrender.com/api/donations/`

### 3. Configure Custom Domain (Optional)

1. **In Render Dashboard**:

   - Go to your service settings
   - Click "Custom Domains"
   - Add your domain
   - Update DNS records as instructed

2. **Update Environment Variables**:
   - Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS`
   - Redeploy both services

## Monitoring and Maintenance

### Health Checks

- Backend: `https://ypg-website-backend.onrender.com/admin/`
- Frontend: Your frontend URL

### Logs

Monitor logs in Render dashboard for both services.

### Database Backups

Render provides automatic backups for paid plans.

## Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check build logs in Render dashboard
   - Ensure all dependencies are in requirements.txt/package.json

2. **Database Connection Issues**:

   - Verify DATABASE_URL is correct
   - Check database service is running

3. **CORS Errors**:

   - Update CORS_ALLOWED_ORIGINS with correct frontend URL
   - Ensure HTTPS is used in production

4. **Static Files Not Loading**:
   - Run `python manage.py collectstatic` locally
   - Check STATIC_ROOT and STATIC_URL settings

### Support

- Render Documentation: [render.com/docs](https://render.com/docs)
- Django Deployment: [docs.djangoproject.com/en/stable/howto/deployment/](https://docs.djangoproject.com/en/stable/howto/deployment/)
- Next.js Deployment: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

## Cost Estimation

### Free Tier Limits

- **Web Service**: 750 hours/month (free tier)
- **Database**: 1GB storage (free tier)
- **Static Site**: Unlimited (free tier)

### Paid Plans

- **Web Service**: $7/month for always-on
- **Database**: $7/month for persistent storage

## Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **HTTPS**: Always use HTTPS in production
3. **Database**: Use strong passwords and limit access
4. **CORS**: Only allow necessary origins
5. **Admin Access**: Change default admin credentials

## Performance Optimization

1. **Static Files**: Use CDN for static assets
2. **Database**: Optimize queries and use indexing
3. **Caching**: Implement Redis for caching (paid feature)
4. **Images**: Optimize images and use WebP format
