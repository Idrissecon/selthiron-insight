# Deployment Guide

## Backend Deployment (Render - Free Tier)

### Prerequisites
- Render account (free tier available)
- GitHub repository with your code

### Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Render deployment"
   git push origin main
   ```

2. **Create PostgreSQL Database on Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "PostgreSQL"
   - Name: `selthiron-db`
   - Select Free tier
   - Click "Create Database"
   - Copy the `DATABASE_URL` from the dashboard

3. **Deploy Backend to Render**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub account
   - Select your repository
   - Select the `server` folder as root directory
   - Name: `selthiron-backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **Set Environment Variables**
   - In Render web service settings → Environment
   - Add `DATABASE_URL` (from your PostgreSQL database)
   - Add `JWT_SECRET` (use a strong random string: https://generate-random.org/api-key)
   - Add `PORT` = `3001`

5. **Run Database Migrations**
   - In Render web service settings → Advanced → Pre-deploy command
   - Add: `npx prisma migrate deploy`

6. **Get Backend URL**
   - Render will provide a URL like `https://selthiron-backend.onrender.com`
   - Note this URL for frontend configuration

## Frontend Deployment (Vercel)

### Steps

1. **Deploy Frontend to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import your repository
   - Select the root directory (exclude `server` folder)

2. **Set Environment Variable**
   - In Vercel project settings → Environment Variables
   - Add `VITE_API_URL` = your Railway backend URL
   - Example: `https://your-backend.railway.app/api`

3. **Deploy**
   - Vercel will automatically build and deploy
   - You'll get a URL like `https://your-app.vercel.app`

## Local Development with PostgreSQL

### Using Docker (Recommended)

```bash
# Start PostgreSQL container
docker run --name selthiron-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=selthiron \
  -p 5432:5432 \
  -d postgres

# Update .env in server folder
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/selthiron"

# Run migrations
cd server
npx prisma migrate dev
npx prisma generate
npm run dev
```

### Using Local PostgreSQL

If you have PostgreSQL installed locally:

```bash
# Create database
createdb selthiron

# Update .env
DATABASE_URL="postgresql://user:password@localhost:5432/selthiron"

# Run migrations
cd server
npx prisma migrate dev
npx prisma generate
npm run dev
```

## Migration from SQLite to PostgreSQL

If you have existing data in SQLite:

```bash
# Export SQLite data
cd server
npx prisma db pull
npx prisma db push --skip-generate

# Or use a migration tool like pgloader
# This is more complex and requires manual setup
```

## Important Notes

- **Prisma Studio** is for development only - not available in production
- To view production data, use Railway's PostgreSQL console or pgAdmin
- Railway provides a built-in PostgreSQL viewer in their dashboard
- Always use strong JWT secrets in production
- Railway free tier includes PostgreSQL with 1GB storage
- Vercel free tier includes SSL and automatic HTTPS

## Troubleshooting

### Backend fails to start
- Check Railway logs for errors
- Ensure DATABASE_URL is set correctly
- Verify migrations ran successfully

### Frontend can't connect to backend
- Check VITE_API_URL is set correctly in Vercel
- Verify backend is running and accessible
- Check CORS configuration in backend

### Database connection issues
- Verify DATABASE_URL format
- Check PostgreSQL is running
- Ensure database exists
