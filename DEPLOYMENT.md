# Deployment Guide - Supabase + Vercel

This guide explains how to deploy Selthiron Insights using Supabase (free tier) and Vercel (free tier).

## Prerequisites
- Supabase account (free tier available)
- Vercel account (free tier available)
- GitHub repository with your code

## Step 1: Set up Supabase

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `selthiron-insights`
   - Database password: generate a strong password
   - Region: choose closest to your users
   - Click "Create new project"
   - Wait for project to be ready (2-3 minutes)

2. **Run Database Schema**
   - In Supabase dashboard, go to SQL Editor
   - Click "New Query"
   - Copy the contents of `supabase/schema.sql`
   - Paste and run the SQL script
   - This creates the tables and RLS policies

3. **Get Supabase Credentials**
   - In Supabase dashboard → Settings → API
   - Copy `Project URL` (this is `VITE_SUPABASE_URL`)
   - Copy `anon public` key (this is `VITE_SUPABASE_ANON_KEY`)

## Step 2: Deploy Frontend to Vercel

1. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import from GitHub
   - Select your repository `selthiron-insight`
   - Click "Deploy"

2. **Add Environment Variables**
   - In Vercel project → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Click "Save"
   - Redeploy the project (Settings → Deployments → Redeploy)

3. **Access Your App**
   - Vercel will provide a URL like `https://selthiron-insight.vercel.app`
   - Your app is now live and accessible to users

## Step 3: Verify Deployment

1. **Test Authentication**
   - Open your Vercel URL
   - Try signing up a new account
   - Verify you can log in
   - Check Supabase dashboard → Authentication → Users to see the user

2. **Test File Upload**
   - Upload CSV files
   - Verify reconciliation works
   - Check Supabase dashboard → Table Editor → files and reconciliations tables

3. **Test History**
   - Navigate to History page
   - Verify you can see previous reconciliations
   - Check Supabase dashboard → Table Editor → reconciliations

## Viewing Data in Supabase

Supabase provides a built-in dashboard to view your data:

1. **Table Editor**
   - Go to Supabase dashboard → Table Editor
   - View/edit data in `profiles`, `files`, and `reconciliations` tables
   - Similar to Prisma Studio but in the browser

2. **SQL Editor**
   - Run custom SQL queries
   - Debug data issues
   - Export data

3. **Authentication Dashboard**
   - View all users
   - Manage user sessions
   - Reset passwords

## Benefits of This Setup

- **Completely Free**: Both Supabase and Vercel have generous free tiers
- **Dashboard Visual**: Supabase provides a visual dashboard to view data
- **No Backend Server**: No need to manage Express server
- **Automatic Scaling**: Vercel handles scaling automatically
- **SSL Included**: HTTPS enabled by default
- **Easy Updates**: Push to GitHub → Vercel auto-deploys

## Troubleshooting

### Authentication not working
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in Vercel
- Check Supabase dashboard → Authentication → Users
- Ensure email confirmation is disabled in Supabase settings (for testing)

### File upload failing
- Check Supabase dashboard → Table Editor → files table
- Verify RLS policies are set correctly
- Check browser console for errors

### History page empty
- Verify data exists in Supabase → Table Editor → reconciliations
- Check that `user_id` matches the logged-in user
- Verify RLS policies allow users to see their own data

### Can't see data in Supabase
- Go to Supabase dashboard → Table Editor
- Select the table you want to view
- Data should be visible there

