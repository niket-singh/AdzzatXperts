# 🚀 Complete Setup Guide - Local Testing & Deployment

This guide will walk you through setting up the application locally and deploying it to production.

---

## Part 1: Local Testing Setup

### Prerequisites
Before starting, make sure you have:
- ✅ **Node.js 18+** installed ([Download](https://nodejs.org/))
- ✅ **Go 1.21+** installed ([Download](https://go.dev/dl/))
- ✅ **Git** installed

Check versions:
```bash
node --version    # Should be 18+
go version        # Should be 1.21+
git --version
```

---

### Step 1: Create Required Accounts (FREE)

#### 1.1 Create Neon Database Account
1. Go to [neon.tech](https://neon.tech)
2. Click "Sign up" (free, no credit card required)
3. Sign in with GitHub or Google
4. Create a new project:
   - Name: `adzzatxperts`
   - Region: Choose closest to you
5. **Copy the connection string** - looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
6. Save this for later!

#### 1.2 Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" (free, no credit card required)
3. Sign in with GitHub
4. Click "New project"
   - Name: `adzzatxperts`
   - Database password: (create one, save it)
   - Region: Choose closest to you
5. Wait for project to be created (~2 minutes)
6. Go to **Settings** → **API**
7. **Copy these values**:
   - `Project URL` (looks like: `https://xxxxx.supabase.co`)
   - `service_role` key (anon key is NOT enough, you need service_role)
8. Go to **Storage** → Click "Create a new bucket"
   - Name: `submissions`
   - Public bucket: **Yes** (or configure policies)
   - Click "Create bucket"

---

### Step 2: Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/niket-singh/AdzzatXperts.git
cd AdzzatXperts
```

---

### Step 3: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create .env file from example
cp .env.example .env

# Open .env in your text editor
# On Windows: notepad .env
# On Mac: open -e .env
# On Linux: nano .env
```

**Edit `backend/.env` with your values:**

```env
# Database URL from Neon (Step 1.1)
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# Create a random secret key (minimum 32 characters)
# You can use this generator: https://generate-secret.vercel.app/32
# Or just type any random string with 32+ characters
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-12345

# Supabase values from Step 1.2
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...

# Port for backend server
PORT=8080

# Frontend URL (for CORS)
CORS_ORIGINS=http://localhost:3000
```

**Save the file!**

```bash
# Download Go dependencies
go mod download

# Start the backend server
go run cmd/api/main.go
```

**Expected Output:**
```
[GIN-debug] Listening and serving HTTP on :8080
```

✅ **Backend is running!** Keep this terminal open.

---

### Step 4: Setup Frontend

Open a **NEW terminal** (keep backend running in the first one):

```bash
# Navigate to project root
cd AdzzatXperts

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local

# Open .env.local in your text editor
# On Windows: notepad .env.local
# On Mac: open -e .env.local
# On Linux: nano .env.local
```

**Edit `.env.local`:**

```env
# Point to your local backend
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Save the file!**

```bash
# Start the frontend
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000

✓ Ready in 2.5s
```

✅ **Frontend is running!**

---

### Step 5: Test the Application

Open your browser and go to: **http://localhost:3000**

#### Test 1: Sign Up as Contributor
1. You should see the landing page with Sign In/Sign Up tabs
2. Click **Sign Up** tab
3. Fill in:
   - **Name**: Test Contributor
   - **Email**: contributor@test.com
   - **Password**: password123
   - **I am a**: Contributor
4. Click **Sign Up**
5. ✅ **Expected**: Redirected to Contributor Dashboard

#### Test 2: Upload a Submission
1. Click **"+ Upload New Task"** button
2. Fill in:
   - **Task Title**: My First Test Task
   - **Domain**: Choose any (e.g., "Instagram")
   - **Language**: Choose any (e.g., "English")
   - **Upload ZIP File**: Create a test.zip file or use any ZIP file
3. Click **"Upload Task"**
4. ✅ **Expected**:
   - Success message
   - Submission appears in "Pending" tab
   - Status shows "PENDING"

#### Test 3: Sign Up as Reviewer
1. Click **Logout** (top right)
2. Click **Sign Up** tab
3. Fill in:
   - **Name**: Test Reviewer
   - **Email**: reviewer@test.com
   - **Password**: password123
   - **I am a**: Reviewer
4. Click **Sign Up**
5. ✅ **Expected**: Screen showing "Pending Approval" message

#### Test 4: Sign Up as Admin
1. Click **Logout**
2. Click **Sign Up** tab
3. Fill in:
   - **Name**: Admin User
   - **Email**: admin@test.com
   - **Password**: password123
   - **I am a**: Contributor (we'll change it to admin via database)
4. Click **Sign Up**

**Now make this user an admin via database:**

Go to your **Neon Dashboard**:
1. Go to [neon.tech](https://neon.tech)
2. Click your project
3. Click **SQL Editor** (left sidebar)
4. Run this query:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
```
5. Click **Run**
6. ✅ **Expected**: Shows "UPDATE 1"

Go back to your app and refresh the page - you should now see the Admin Dashboard!

#### Test 5: Admin Approves Reviewer
1. In Admin Dashboard, click **Users** tab
2. Find "Test Reviewer" (reviewer@test.com)
3. You should see status "Pending"
4. Click **"Approve"** button
5. ✅ **Expected**: Status changes to "Approved"

#### Test 6: Reviewer Reviews Task
1. Click **Logout**
2. Sign in as reviewer (reviewer@test.com / password123)
3. ✅ **Expected**: See the "My First Test Task" in "Claimed" tab (auto-assigned!)
4. Click **"Download"** to download the file
5. Click **"Review"** button
6. Fill in:
   - **Feedback**: This is great work!
   - **Account Posted In**: @testaccount (optional)
   - Check **"Mark as eligible for approval"**
7. Click **"Submit Review"**
8. ✅ **Expected**: Task moves to "Eligible" tab

#### Test 7: Admin Approves Task
1. Click **Logout**
2. Sign in as admin (admin@test.com / password123)
3. Click **Submissions** tab
4. Click **"Eligible"** filter
5. Find "My First Test Task"
6. Click **"Approve"** button
7. Confirm
8. ✅ **Expected**: Task status becomes "APPROVED"

#### Test 8: Test NEW Features

**Role Switching:**
1. As admin, go to **Users** tab
2. Find "Test Contributor"
3. Click **"Switch Role"**
4. Type: `REVIEWER`
5. Confirm
6. ✅ **Expected**: User role changes to REVIEWER

**Activity Logs:**
1. As admin, click **Logs** tab
2. ✅ **Expected**: See all recent activities:
   - SIGNUP events
   - UPLOAD events
   - REVIEW events
   - APPROVE events
   - SWITCH_ROLE event (from role switching above)

**Statistics:**
1. As admin, click **Stats** tab
2. ✅ **Expected**: See:
   - Total Users: 3
   - Total Submissions: 1
   - Contributor statistics table
   - Reviewer statistics table

**Search:**
1. In any dashboard, use the search bar
2. Type part of a submission title, domain, or language
3. ✅ **Expected**: Real-time filtering

**Delete:**
1. Sign in as contributor
2. Upload a new submission
3. Click **"Delete"** button (only on pending submissions)
4. Confirm
5. ✅ **Expected**: Submission deleted

**Auto-Refresh:**
1. Open two browsers (or tabs)
2. Sign in to different accounts
3. Make changes in one
4. ✅ **Expected**: Other browser updates within 30 seconds

---

### ✅ Local Testing Complete!

If all tests pass, your application is working correctly locally!

---

## Part 2: Deployment to Production

Now let's deploy to production. We'll use:
- **Railway** for backend (free tier available)
- **Vercel** for frontend (free tier available)

---

### Step 1: Push Code to GitHub (if not already done)

```bash
# In project root
git add -A
git commit -m "Ready for deployment"
git push origin main  # or your branch name
```

---

### Step 2: Deploy Backend to Railway

#### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click **"Login"**
3. Sign in with GitHub
4. Allow access to your repositories

#### 2.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **AdzzatXperts** repository
4. Railway will detect your project

#### 2.3 Configure Build Settings
1. In the project, click your service
2. Click **"Settings"**
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `go build -o server cmd/api/main.go`
5. Set **Start Command**: `./server`

#### 2.4 Add Environment Variables
1. Click **"Variables"** tab
2. Add these variables one by one:

```
DATABASE_URL = (your Neon connection string from earlier)
JWT_SECRET = (same secret from local .env)
SUPABASE_URL = (your Supabase URL from earlier)
SUPABASE_SERVICE_KEY = (your Supabase service key from earlier)
PORT = 8080
CORS_ORIGINS = https://your-app-name.vercel.app
```

**Important**: For `CORS_ORIGINS`, we'll update this after deploying frontend!

#### 2.5 Deploy
1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. ✅ Once complete, you'll see a URL like: `https://adzzatxperts-production.up.railway.app`
4. **Copy this URL** - you'll need it for frontend!

Test backend:
- Visit: `https://your-backend-url.railway.app`
- You might see a 404, that's okay (there's no root route)

---

### Step 3: Deploy Frontend to Vercel

#### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign in with GitHub
4. Allow access to your repositories

#### 3.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **AdzzatXperts** repository
3. Click **"Import"**

#### 3.3 Configure Project
1. **Framework Preset**: Next.js (should be auto-detected)
2. **Root Directory**: `./` (leave as is)
3. **Build Command**: `npm run build` (auto-detected)
4. **Output Directory**: `.next` (auto-detected)

#### 3.4 Add Environment Variable
1. Click **"Environment Variables"**
2. Add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url.railway.app/api
   ```
   (Use the Railway URL from Step 2.5, and add `/api` at the end)

3. Click **"Deploy"**
4. Wait for deployment (~2-3 minutes)
5. ✅ Once complete, you'll see a URL like: `https://adzzatxperts.vercel.app`

#### 3.5 Update Backend CORS
Now go back to Railway:
1. Open your Railway project
2. Click **"Variables"**
3. Find `CORS_ORIGINS`
4. Update to: `https://your-frontend-url.vercel.app`
   (Use the Vercel URL from above, WITHOUT /api)
5. Click **"Save"**
6. Backend will redeploy automatically

---

### Step 4: Test Production Deployment

1. Open your Vercel URL: `https://your-app-name.vercel.app`
2. ✅ **Expected**: See the landing page
3. Try signing up as a contributor
4. ✅ **Expected**: Works! Redirects to dashboard
5. Try uploading a file
6. ✅ **Expected**: File uploads successfully
7. Test all features from local testing

---

### Step 5: Create Your First Admin User in Production

Since you can't easily access the production database, here's a trick:

**Option 1: Use Neon SQL Editor**
1. Go to [neon.tech](https://neon.tech)
2. Open your project
3. Click **SQL Editor**
4. Sign up as a contributor first on your production site
5. Then run:
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

**Option 2: Direct Database Access**
1. Install a PostgreSQL client like [pgAdmin](https://www.pgadmin.org/) or [TablePlus](https://tableplus.com/)
2. Connect using your Neon connection string
3. Find the `users` table
4. Change the role of your user to `ADMIN`

---

## 🎉 Deployment Complete!

Your application is now live and accessible to anyone!

### Production URLs
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://your-backend-url.railway.app`

---

## 📊 Monitoring & Maintenance

### View Backend Logs
1. Go to Railway dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click on active deployment
5. See logs in real-time

### View Frontend Logs
1. Go to Vercel dashboard
2. Click your project
3. Click **"Deployments"** tab
4. Click on active deployment
5. Click **"Functions"** to see API logs

### Database Management
1. Go to Neon dashboard
2. Use SQL Editor to run queries
3. View table data
4. Manage users

---

## 🐛 Troubleshooting

### Issue: Backend won't deploy on Railway
**Solution**:
- Check build logs in Railway
- Make sure `backend/go.mod` exists
- Verify environment variables are set

### Issue: Frontend shows connection errors
**Solution**:
- Check `NEXT_PUBLIC_API_URL` is set correctly
- Make sure it ends with `/api`
- Verify backend is running (visit backend URL)

### Issue: CORS errors in browser
**Solution**:
- Check backend `CORS_ORIGINS` includes your Vercel URL
- Make sure there's no trailing slash
- Redeploy backend after changing CORS

### Issue: File uploads fail
**Solution**:
- Verify Supabase credentials in backend
- Check "submissions" bucket exists in Supabase
- Verify bucket is public or has correct policies

### Issue: Database connection fails
**Solution**:
- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Ensure `?sslmode=require` is in the URL

---

## 🔒 Security Checklist

Before going live:
- [ ] Change JWT_SECRET to a strong random value
- [ ] Use a strong database password
- [ ] Keep Supabase service key secret
- [ ] Set CORS_ORIGINS to only your frontend URL
- [ ] Review Supabase bucket permissions
- [ ] Test all user roles
- [ ] Test file upload/download

---

## 📈 Next Steps

After deployment:
1. **Create admin account** (using database query)
2. **Sign up as different roles** to test
3. **Share the URL** with your team/users
4. **Monitor the activity logs** in admin dashboard
5. **Check statistics** to see usage

---

## 🆘 Need Help?

If you run into issues:

1. **Check the logs**:
   - Railway logs for backend errors
   - Vercel logs for frontend errors
   - Browser console for client errors

2. **Verify environment variables**:
   - Railway dashboard → Variables
   - Vercel dashboard → Settings → Environment Variables

3. **Test backend directly**:
   - Visit: `https://your-backend.railway.app/api/health` (if you added health endpoint)
   - Use Postman or curl to test API endpoints

4. **Common fixes**:
   - Clear browser cache
   - Redeploy both backend and frontend
   - Check database connection
   - Verify all environment variables

---

## ✅ Summary

### Local Testing:
1. ✅ Install Node.js and Go
2. ✅ Create Neon database account
3. ✅ Create Supabase account and bucket
4. ✅ Setup backend with `.env`
5. ✅ Setup frontend with `.env.local`
6. ✅ Run both servers
7. ✅ Test all features

### Deployment:
1. ✅ Push code to GitHub
2. ✅ Deploy backend to Railway with environment variables
3. ✅ Deploy frontend to Vercel with API URL
4. ✅ Update CORS in backend
5. ✅ Test production site
6. ✅ Create admin user

**You're all set!** 🚀

---

**Questions?** Check `READY-FOR-TESTING.md` or the main `README.md` for more details.
