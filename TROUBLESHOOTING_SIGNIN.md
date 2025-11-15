# Sign In Network Error - Troubleshooting Guide

## 🔍 Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try to sign in
4. Look for error messages

### Common Errors:

#### **CORS Error**
```
Access to fetch at 'https://backend.railway.app/api/auth/signin' from origin 'https://frontend.vercel.app'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```
**Solution:** CORS not configured correctly → Go to Step 2

#### **Network Error / Failed to Fetch**
```
POST https://backend.railway.app/api/auth/signin net::ERR_NAME_NOT_RESOLVED
```
**Solution:** Backend URL wrong or backend not deployed → Go to Step 3

#### **Mixed Content Error**
```
Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource 'http://...'
```
**Solution:** Using HTTP instead of HTTPS → Go to Step 4

---

## 🔍 Step 2: Check Network Tab

1. Open DevTools → **Network** tab
2. Filter: **Fetch/XHR**
3. Try to sign in
4. Look for the signin request

### Check Request Details:

#### **Request URL**
```
Should be: https://your-backend.railway.app/api/auth/signin
NOT: http://localhost:8080/api/auth/signin
```

#### **Status Code**
- **No status (red)** = Can't reach backend
- **0** = CORS blocked
- **404** = Wrong route
- **500** = Backend error
- **502/503** = Backend down

#### **Response Headers**
Check if CORS headers present:
```
access-control-allow-origin: https://your-frontend.vercel.app
access-control-allow-credentials: true
```

---

## 🛠️ Step 3: Verify Backend Deployment

### Check Backend Health

```bash
# Test backend is accessible
curl https://your-backend.railway.app/health

# Expected response:
{"status":"healthy"}
```

If this fails:
- ❌ Backend is not deployed
- ❌ Backend URL is wrong
- ❌ Backend crashed on startup

### Check Railway Logs

1. Go to Railway dashboard
2. Click on your backend service
3. Go to **Deployments** tab
4. Check latest deployment status
5. Click **View Logs**

**Look for:**
- ✅ "🚀 Server starting on port..."
- ✅ "✓ Database connected successfully"
- ✅ "✓ Storage initialized"
- ❌ Any error messages

---

## 🛠️ Step 4: Fix CORS Configuration

### Option A: Railway Environment Variable

1. Go to Railway dashboard
2. Select your backend service
3. Go to **Variables** tab
4. Add/Update:
   ```
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   ```
5. **Important:** Use exact URL (no trailing slash)
6. Redeploy backend

### Option B: Update Code (if variable doesn't work)

If environment variable doesn't work, check the CORS middleware code:

File: `backend/internal/middleware/cors.go`

Should have:
```go
allowedOrigins := strings.Split(os.Getenv("CORS_ORIGINS"), ",")
```

---

## 🛠️ Step 5: Verify Frontend Environment Variables

### Check Vercel Environment Variables

1. Go to Vercel dashboard
2. Select your frontend project
3. Go to **Settings** → **Environment Variables**
4. Verify:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

**Important:**
- ✅ Must be HTTPS (not HTTP)
- ✅ Must end with `/api`
- ✅ No trailing slash after `/api`
- ✅ Must be the actual Railway URL

### If you changed it:
1. Save the variable
2. Go to **Deployments** tab
3. Click on latest deployment
4. Click **Redeploy**

---

## 🛠️ Step 6: Check API URL in Code

### Frontend API Client

File: `lib/api-client.ts` line 8

```typescript
baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
```

This should pick up the environment variable. If not working, temporarily hardcode for testing:

```typescript
baseURL: 'https://your-backend.railway.app/api',
```

---

## 🧪 Step 7: Test Backend Directly

### Test Sign In Endpoint

```bash
curl -X POST https://your-backend.railway.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "wrongpassword"
  }'
```

**Expected responses:**

✅ **Working (even with wrong password):**
```json
{"error":"Invalid credentials"}
```

❌ **CORS issue:** No response, browser blocks it

❌ **Backend down:**
```
curl: (7) Failed to connect to...
```

❌ **Wrong route:**
```json
{"error":"404 page not found"}
```

---

## 🔧 Common Fixes

### Fix 1: CORS Origin Mismatch

**Problem:** Frontend URL doesn't match CORS_ORIGINS

**Check:**
```bash
# Your frontend URL (from browser address bar)
https://reviewers-adzzat-abc123.vercel.app

# CORS_ORIGINS in Railway
https://reviewers-adzzat-abc123.vercel.app  ✅ Match

# Common mistakes:
https://reviewers-adzzat-abc123.vercel.app/  ❌ Extra trailing slash
http://reviewers-adzzat-abc123.vercel.app   ❌ HTTP instead of HTTPS
reviewers-adzzat-abc123.vercel.app          ❌ Missing https://
```

**Fix:**
1. Copy exact URL from browser (without trailing slash)
2. Update CORS_ORIGINS in Railway
3. Redeploy backend

---

### Fix 2: Wrong Backend URL

**Problem:** Frontend pointing to localhost or wrong URL

**Check Vercel logs:**
1. Vercel dashboard → Deployments
2. Click latest deployment
3. Check build logs for:
   ```
   ✓ Environment variables
   NEXT_PUBLIC_API_URL: http://localhost:8080/api  ❌ Wrong!
   ```

**Fix:**
1. Update `NEXT_PUBLIC_API_URL` in Vercel
2. Must start with `https://`
3. Must be your Railway backend URL
4. Redeploy frontend

---

### Fix 3: Backend Not Running

**Check Railway:**
1. Dashboard → Your backend service
2. Check status (should be green "Active")
3. If red/crashed, check logs for errors

**Common startup errors:**
- Missing DATABASE_URL
- Missing JWT_SECRET
- Missing SUPABASE credentials
- Database connection failed

**Fix:**
1. Add all required environment variables
2. Redeploy

---

### Fix 4: Mixed Content (HTTP/HTTPS)

**Problem:** Frontend (HTTPS) trying to call backend (HTTP)

**Check:**
- Frontend: `https://...vercel.app` ✅
- Backend: `http://...railway.app` ❌ Should be HTTPS

**Fix:**
Railway automatically provides HTTPS. Make sure you're using:
```
https://your-app.railway.app
```
NOT:
```
http://your-app.railway.app
```

---

## 📋 Quick Checklist

Run through this checklist:

- [ ] Backend health endpoint responds: `curl https://backend/health`
- [ ] Backend logs show "Server starting"
- [ ] Backend logs show "Database connected"
- [ ] Frontend NEXT_PUBLIC_API_URL is HTTPS (not HTTP)
- [ ] Frontend NEXT_PUBLIC_API_URL ends with `/api`
- [ ] Backend CORS_ORIGINS matches exact frontend URL
- [ ] No trailing slashes in URLs
- [ ] Both frontend and backend deployed successfully
- [ ] Browser console shows the actual error message

---

## 🚀 Working Configuration Example

### Vercel Environment Variables:
```bash
NEXT_PUBLIC_API_URL=https://reviewers-adzzat-production.up.railway.app/api
```

### Railway Environment Variables:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key-minimum-32-characters
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=your-key
PORT=8080
CORS_ORIGINS=https://reviewers-adzzat.vercel.app
```

---

## 🆘 Still Not Working?

### Collect Debug Info:

1. **Frontend URL:** (from browser)
   ```

   ```

2. **Backend URL:** (from Railway)
   ```

   ```

3. **Browser Console Error:**
   ```

   ```

4. **Network Tab Request URL:**
   ```

   ```

5. **Railway Backend Logs:**
   ```

   ```

6. **Environment Variables:**
   - Vercel NEXT_PUBLIC_API_URL: _______________
   - Railway CORS_ORIGINS: _______________

---

## 💡 Most Likely Issue

Based on "network error" at sign in, **90% chance it's one of these:**

1. **CORS Origin Mismatch** (60% of cases)
   - Frontend URL: `https://app-abc.vercel.app`
   - CORS setting: `https://app-xyz.vercel.app` ❌
   - **Fix:** Update CORS_ORIGINS to match exact frontend URL

2. **Wrong API URL** (25% of cases)
   - Still pointing to `localhost:8080` ❌
   - **Fix:** Update NEXT_PUBLIC_API_URL in Vercel

3. **Backend Not Running** (10% of cases)
   - Railway deployment failed
   - **Fix:** Check Railway logs, add missing env vars

4. **HTTP vs HTTPS** (5% of cases)
   - Using HTTP backend URL on HTTPS frontend
   - **Fix:** Use HTTPS for backend URL

---

## ✅ Success Test

Once fixed, you should see in Network tab:

```
Request URL: https://backend.railway.app/api/auth/signin
Status Code: 401 (or 200 if credentials correct)
Response: {"error":"Invalid credentials"} or {"token":"..."}
```

And in Console:
- ✅ No CORS errors
- ✅ No network errors
- ✅ Clear error message from backend
