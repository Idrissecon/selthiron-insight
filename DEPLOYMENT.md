# Deployment Guide

## Backend Deployment (Fly.io - Free Tier)

### Prerequisites
- Fly.io account (free tier available, requires credit card for verification only)
- GitHub repository with your code
- Fly.io CLI installed: `brew install flyctl` (Mac) or visit fly.io/docs

### Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for Fly.io deployment"
   git push origin main
   ```

2. **Install Fly.io CLI**
   ```bash
   brew install flyctl  # Mac
   # Or visit https://fly.io/docs/hands-on/install-flyctl/
   ```

3. **Login to Fly.io**
   ```bash
   flyctl auth login
   ```

4. **Create PostgreSQL Database on Fly.io**
   ```bash
   cd server
   flyctl postgres create --name selthiron-db
   ```
   - Copy the `DATABASE_URL` provided
   - Select a region (closest to you)

5. **Configure Fly.io for Backend**
   ```bash
   flyctl launch
   ```
   - App name: `selthiron-backend`
   - Region: same as your database
   - Select "No" for deploying now
   - Select "No" for PostgreSQL (already created)

6. **Update fly.toml**
   Open `server/fly.toml` and update:
   ```toml
   [build]
     dockerfile = "Dockerfile"

   [env]
     PORT = "3001"
     DATABASE_URL = "your-database-url-here"
     JWT_SECRET = "your-jwt-secret-here"
   ```

7. **Create Dockerfile**
   The Dockerfile has been created in `server/Dockerfile` with the following content:
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .
   RUN npm run build

   RUN npx prisma generate

   EXPOSE 3001

   CMD ["npm", "start"]
   ```

8. **Deploy to Fly.io**
   ```bash
   flyctl deploy
   ```

9. **Run Database Migrations**
   ```bash
   flyctl ssh console --app selthiron-backend
   # In the SSH console:
   npx prisma migrate deploy
   exit
   ```

10. **Get Backend URL**
    - Fly.io provides a URL like `https://selthiron-backend.fly.dev`
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
