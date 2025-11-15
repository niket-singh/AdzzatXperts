# Post-Deployment Testing Guide
**Platform:** Reviewers-Adzzat
**Date:** November 15, 2025

---

## 🎯 Pre-Test Checklist

Before starting tests, verify:

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and healthy (`GET /health` returns 200)
- [ ] Database connected (check backend logs)
- [ ] Environment variables configured
- [ ] CORS origins properly set
- [ ] SSL certificates active (HTTPS/WSS)

---

## 1️⃣ Critical Path Tests (MUST PASS)

### **1.1 Health Check**
```bash
# Backend health
curl https://your-backend.railway.app/health

# Expected: {"status":"healthy"}
```

- [ ] Backend responds with 200 OK
- [ ] Frontend loads without errors
- [ ] Check browser console for errors

### **1.2 Database Connection**
- [ ] Backend logs show: "✓ Database connected successfully"
- [ ] No database connection errors in logs
- [ ] Migrations completed successfully

### **1.3 Storage Connection**
- [ ] Backend logs show: "✓ Storage initialized"
- [ ] Supabase bucket accessible
- [ ] No storage errors in logs

---

## 2️⃣ Authentication Tests

### **2.1 Contributor Signup**
1. Go to signup page
2. Fill form:
   - Email: `contributor@test.com`
   - Password: `Test123!`
   - Name: `Test Contributor`
   - Role: `CONTRIBUTOR`
3. Click "Sign Up"

**Expected Results:**
- [ ] Redirects to contributor dashboard
- [ ] Token stored in localStorage
- [ ] User name displayed in navbar
- [ ] No errors in console

### **2.2 Reviewer Signup**
1. Create reviewer account:
   - Email: `reviewer@test.com`
   - Role: `REVIEWER`

**Expected Results:**
- [ ] Account created
- [ ] Shows "Pending Approval" message
- [ ] Cannot access reviewer dashboard yet

### **2.3 Admin Signup**
1. Create admin account:
   - Email: `admin@test.com`
   - Role: `ADMIN`

**Expected Results:**
- [ ] Account created
- [ ] Redirects to admin dashboard
- [ ] Can see admin-only features

### **2.4 Sign In Flow**
1. Sign out
2. Sign in with each account

**Expected Results:**
- [ ] Successful login for all accounts
- [ ] Token refreshed
- [ ] Redirected to correct dashboard

### **2.5 Password Reset**
1. Click "Forgot Password"
2. Enter email: `contributor@test.com`
3. Copy token from API response (check Network tab)
4. Go to reset password page
5. Enter token and new password

**Expected Results:**
- [ ] Token generated successfully
- [ ] Password reset works
- [ ] Can sign in with new password
- [ ] Old password no longer works

**Note:** In production, you'd receive token via email (feature removed as requested)

---

## 3️⃣ Contributor Workflow Tests

### **3.1 File Upload**
**As Contributor:**
1. Go to contributor dashboard
2. Click "Upload Submission"
3. Fill form:
   - Title: `Test React Component`
   - Domain: `Frontend`
   - Language: `JavaScript`
   - File: Upload a ZIP file

**Expected Results:**
- [ ] File uploads successfully
- [ ] Shows in "My Submissions" list
- [ ] Status is "PENDING"
- [ ] File size displayed correctly
- [ ] Upload date visible

### **3.2 View Submissions**
**As Contributor:**
1. Go to "My Submissions"
2. Check submission list

**Expected Results:**
- [ ] All submissions visible
- [ ] Can filter by status (Pending, Claimed, Eligible, Approved)
- [ ] Can search by title
- [ ] Status badges display correctly
- [ ] Loading skeleton shows during fetch

### **3.3 Download Submission**
**As Contributor:**
1. Click on a submission
2. Click "Download" button

**Expected Results:**
- [ ] File downloads successfully
- [ ] Original filename preserved
- [ ] ZIP file opens correctly

### **3.4 Delete Submission**
**As Contributor:**
1. Select a PENDING submission
2. Click "Delete"
3. Confirm deletion

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Submission deleted from database
- [ ] File deleted from storage
- [ ] Removed from list immediately (optimistic UI)
- [ ] Cannot delete CLAIMED/ELIGIBLE/APPROVED submissions

---

## 4️⃣ Admin Workflow Tests

### **4.1 Approve Reviewer**
**As Admin:**
1. Go to "User Management"
2. Find reviewer account (status: "Pending")
3. Click "Approve"

**Expected Results:**
- [ ] Reviewer approved
- [ ] Status changes to "Approved"
- [ ] Activity logged
- [ ] WebSocket notification sent (if connected)

### **4.2 Toggle Green Light**
**As Admin:**
1. Find approved reviewer
2. Toggle green light OFF
3. Toggle green light ON

**Expected Results:**
- [ ] Status toggles correctly
- [ ] Icon changes (🟢/🔴)
- [ ] When turned ON, queued tasks auto-assign
- [ ] Activity logged

### **4.3 Switch User Role**
**As Admin:**
1. Select a contributor
2. Click "Switch Role"
3. Change to REVIEWER

**Expected Results:**
- [ ] Role changed successfully
- [ ] isApproved set to false (requires re-approval)
- [ ] User sees new dashboard on next login
- [ ] Activity logged

### **4.4 View Activity Logs**
**As Admin:**
1. Go to "Logs" section
2. Review recent activities

**Expected Results:**
- [ ] All actions logged (signups, approvals, uploads, etc.)
- [ ] Timestamps correct
- [ ] User info displayed
- [ ] Can filter by action type
- [ ] Pagination works

### **4.5 View Statistics**
**As Admin:**
1. Go to admin dashboard
2. Check stats cards

**Expected Results:**
- [ ] Total users count correct
- [ ] Total submissions count correct
- [ ] Pending reviews count correct
- [ ] Charts load correctly
- [ ] Leaderboard shows contributors with most submissions

### **4.6 Approve Submission**
**As Admin:**
1. Find ELIGIBLE submission
2. Click "Approve"

**Expected Results:**
- [ ] Status changes to APPROVED
- [ ] Contributor notified (if WebSocket connected)
- [ ] Activity logged

---

## 5️⃣ Reviewer Workflow Tests

### **5.1 Access Control**
**As Unapproved Reviewer:**
1. Try to access reviewer dashboard

**Expected Results:**
- [ ] Shows "Pending Approval" message
- [ ] Cannot claim tasks
- [ ] Cannot see reviewer features

**As Approved Reviewer (Green Light OFF):**
1. Go to reviewer dashboard

**Expected Results:**
- [ ] Shows "Green Light is OFF" message
- [ ] No tasks assigned
- [ ] Cannot claim new tasks

**As Approved Reviewer (Green Light ON):**
1. Go to reviewer dashboard

**Expected Results:**
- [ ] Tasks automatically assigned
- [ ] Can see assigned tasks
- [ ] Can submit reviews

### **5.2 Auto-Assignment**
**As Admin:**
1. Turn ON green light for reviewer
2. Upload 3 submissions as contributor

**Expected Results:**
- [ ] Tasks auto-assigned to reviewer
- [ ] Submission status changes to CLAIMED
- [ ] assignedAt timestamp set
- [ ] Reviewer sees tasks in dashboard

### **5.3 Submit Review**
**As Reviewer:**
1. Open assigned task
2. Download and review file
3. Submit feedback:
   - Feedback: `Great code! Clean and well-documented.`
   - Mark as Eligible: Yes
   - Account Posted In: `@reviewer_account`

**Expected Results:**
- [ ] Review submitted successfully
- [ ] Submission status changes to ELIGIBLE
- [ ] Contributor notified (if WebSocket)
- [ ] Review visible to contributor
- [ ] Activity logged

---

## 6️⃣ Real-Time WebSocket Tests

### **6.1 WebSocket Connection**
1. Open browser DevTools → Network → WS
2. Sign in as any user

**Expected Results:**
- [ ] WebSocket connects to `wss://your-backend/api/ws?token=xxx`
- [ ] Connection status: 101 Switching Protocols
- [ ] Ping/pong heartbeat every 54 seconds
- [ ] No reconnection attempts (stable connection)

### **6.2 Real-Time Submission Updates**
**Test Setup:**
1. Open 2 browser windows
2. Window A: Logged in as Admin
3. Window B: Logged in as Contributor

**Test:**
1. In Window A, approve a submission
2. Check Window B (contributor dashboard)

**Expected Results:**
- [ ] Submission list updates in real-time (no refresh needed)
- [ ] Status badge changes automatically
- [ ] Toast notification appears

### **6.3 Real-Time Notifications**
**Test Setup:**
1. Window A: Admin
2. Window B: Reviewer

**Test:**
1. In Window A, approve reviewer
2. Check Window B

**Expected Results:**
- [ ] Toast notification appears in Window B
- [ ] "Approved" badge updates without refresh

### **6.4 WebSocket Reconnection**
**Test:**
1. Open DevTools → Network → Offline mode
2. Wait 5 seconds
3. Go back online

**Expected Results:**
- [ ] Shows "Reconnecting..." indicator at bottom left
- [ ] Reconnects automatically with exponential backoff
- [ ] Connection restored within 2-4 seconds
- [ ] No data loss

---

## 7️⃣ Analytics & Audit Tests

### **7.1 Analytics Dashboard**
**As Admin:**
1. Go to `/admin/analytics`

**Expected Results:**
- [ ] Overview cards show correct metrics
- [ ] Charts load correctly
- [ ] Can switch between 7d/30d/90d views
- [ ] Distribution charts accurate
- [ ] Top contributors list correct

### **7.2 Audit Logs**
**As Admin:**
1. Go to `/admin/audit-logs`
2. Perform various actions (approve user, upload file, etc.)
3. Refresh audit logs

**Expected Results:**
- [ ] All actions logged with:
  - User ID and name
  - Action type
  - Timestamp
  - IP address
  - User agent
- [ ] Can filter by action type
- [ ] Can filter by user
- [ ] Pagination works
- [ ] Metadata displayed correctly

---

## 8️⃣ Security Tests

### **8.1 Authentication Protection**
**Test:**
1. Sign out
2. Try to access `/admin`
3. Try to access `/reviewer`
4. Try to access `/contributor`

**Expected Results:**
- [ ] Redirects to `/signin` for all protected routes
- [ ] No data leaked before redirect
- [ ] Token cleared from localStorage

### **8.2 Authorization Protection**
**Test:**
1. Sign in as Contributor
2. Try to access `/admin` (modify URL manually)
3. Try to call admin API: `GET /api/users`

**Expected Results:**
- [ ] Shows 403 Forbidden or redirects
- [ ] API returns 401/403 error
- [ ] No admin data accessible

### **8.3 Rate Limiting**
**Test:**
```bash
# Send 101 requests in 1 minute
for i in {1..101}; do
  curl https://your-backend/api/auth/signin \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

**Expected Results:**
- [ ] First 100 requests succeed (or fail with 401)
- [ ] 101st request returns `429 Too Many Requests`
- [ ] Error message: "Too many requests"

### **8.4 SQL Injection Protection**
**Test:**
1. Try to sign in with:
   - Email: `admin' OR '1'='1`
   - Password: `anything`

**Expected Results:**
- [ ] Returns "Invalid credentials" (not SQL error)
- [ ] No database error leaked
- [ ] Request logged properly

### **8.5 XSS Protection**
**Test:**
1. Upload submission with title:
   ```
   <script>alert('XSS')</script>Test
   ```

**Expected Results:**
- [ ] Script tags escaped/sanitized
- [ ] No alert popup
- [ ] Title displays as plain text

---

## 9️⃣ Performance Tests

### **9.1 Page Load Speed**
**Test:**
1. Open DevTools → Network
2. Hard refresh each page
3. Check "Load" time

**Expected Results:**
- [ ] Home page: < 2 seconds
- [ ] Dashboard pages: < 3 seconds
- [ ] All static assets cached (304)
- [ ] Images optimized

### **9.2 API Response Times**
**Test:**
```bash
# Test submission list endpoint
time curl https://your-backend/api/submissions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Results:**
- [ ] Submissions endpoint: < 500ms
- [ ] User list endpoint: < 300ms
- [ ] Analytics endpoint: < 1s
- [ ] Logs endpoint: < 800ms

### **9.3 Database Query Performance**
**Check backend logs for slow queries:**

**Expected Results:**
- [ ] No queries > 100ms (thanks to indexes)
- [ ] Connection pool healthy (no "connection exhausted" errors)
- [ ] No N+1 query issues

### **9.4 File Upload/Download Speed**
**Test:**
1. Upload a 5MB ZIP file
2. Download the same file

**Expected Results:**
- [ ] Upload completes in < 10 seconds
- [ ] Download starts immediately
- [ ] Progress indicator shows
- [ ] No timeout errors

---

## 🔟 Mobile Responsiveness Tests

### **10.1 Mobile View**
**Test on:**
- [ ] iPhone 12/13 (390x844)
- [ ] Galaxy S21 (360x800)
- [ ] iPad (768x1024)

**Check:**
- [ ] Navbar collapses to hamburger menu
- [ ] Tables are horizontally scrollable
- [ ] Forms are usable (inputs not too small)
- [ ] Buttons are tappable (min 44x44px)
- [ ] No horizontal scrolling
- [ ] Text readable without zooming

### **10.2 Touch Interactions**
**Test:**
- [ ] Buttons respond to touch
- [ ] Dropdowns work on touch
- [ ] Modal dialogs can be dismissed
- [ ] File upload works from mobile
- [ ] Swipe gestures don't break UI

---

## 1️⃣1️⃣ Error Handling Tests

### **11.1 Network Errors**
**Test:**
1. Start file upload
2. Turn off network mid-upload
3. Turn back on

**Expected Results:**
- [ ] Error message appears
- [ ] "Try Again" button shown
- [ ] Retry works correctly

### **11.2 Invalid Input**
**Test:**
1. Submit signup form with:
   - Invalid email: `notanemail`
   - Short password: `123`

**Expected Results:**
- [ ] Form validation errors shown
- [ ] Specific error messages displayed
- [ ] Form doesn't submit
- [ ] Errors clear when corrected

### **11.3 404 Pages**
**Test:**
1. Navigate to `/random-nonexistent-page`

**Expected Results:**
- [ ] Shows custom 404 page
- [ ] "Go Home" button works
- [ ] No console errors

### **11.4 Server Errors**
**Test:**
1. Cause a 500 error (e.g., corrupt database connection)

**Expected Results:**
- [ ] User-friendly error message
- [ ] Error boundary catches it
- [ ] Option to refresh/retry
- [ ] Error logged on backend

---

## 1️⃣2️⃣ Regression Tests

### **12.1 Dark Mode**
**Test:**
1. Toggle dark mode on/off
2. Refresh page
3. Navigate to different pages

**Expected Results:**
- [ ] Theme persists across refreshes
- [ ] All components respect theme
- [ ] No white flashes on load
- [ ] Icons switch correctly

### **12.2 Global Search (Cmd+K)**
**Test:**
1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows)
2. Type search query
3. Navigate with arrow keys
4. Press Enter

**Expected Results:**
- [ ] Search modal opens
- [ ] Debounced search (300ms delay)
- [ ] Results appear
- [ ] Keyboard navigation works
- [ ] ESC closes modal

### **12.3 Loading Skeletons**
**Test:**
1. Hard refresh dashboard page
2. Watch loading states

**Expected Results:**
- [ ] Skeleton loaders appear first
- [ ] Shimmer animation smooth
- [ ] Layout doesn't shift when data loads
- [ ] No flashing content

### **12.4 Empty States**
**Test:**
1. View page with no data (new user)

**Expected Results:**
- [ ] Shows appropriate empty state
- [ ] Includes helpful message
- [ ] Call-to-action button present
- [ ] Icon/illustration displays

---

## 📋 Post-Test Checklist

After completing all tests:

### **Critical Issues** (Must fix immediately)
- [ ] No authentication bypasses
- [ ] No data leakage
- [ ] No 500 errors
- [ ] Database connected
- [ ] File uploads work

### **High Priority** (Fix within 24h)
- [ ] WebSocket connects properly
- [ ] Real-time updates work
- [ ] All API endpoints respond
- [ ] Mobile view usable

### **Medium Priority** (Fix within 48h)
- [ ] Loading states smooth
- [ ] Error messages helpful
- [ ] Performance acceptable
- [ ] Audit logs complete

### **Nice to Have** (Fix when possible)
- [ ] Animations smooth
- [ ] Search debouncing optimal
- [ ] Empty states polished

---

## 🚨 Rollback Criteria

Rollback deployment if:
- [ ] Users cannot sign in
- [ ] Database connection fails
- [ ] File uploads fail
- [ ] Critical data loss occurs
- [ ] Security vulnerability exposed
- [ ] > 50% of features broken

---

## 📊 Success Criteria

Deployment is successful if:
- ✅ All authentication flows work
- ✅ All CRUD operations work
- ✅ WebSocket connects and updates in real-time
- ✅ No critical errors in logs
- ✅ Performance within acceptable range
- ✅ Mobile view is usable
- ✅ Security tests pass

---

## 🔍 Monitoring Post-Deployment

### **First 24 Hours**
- Monitor error logs every 2 hours
- Check WebSocket connection stability
- Monitor database connection pool
- Watch for rate limit violations
- Check Supabase storage usage

### **First Week**
- Review analytics daily
- Check audit logs for anomalies
- Monitor performance metrics
- Gather user feedback
- Watch for memory leaks

### **Ongoing**
- Weekly security reviews
- Monthly performance audits
- Quarterly load testing
- Continuous user feedback

---

## 📞 Emergency Contacts

If critical issues arise:
- Check Railway logs: `railway logs`
- Check Supabase dashboard
- Review error monitoring (if set up)
- Contact support if infrastructure issue

---

## ✅ Testing Complete

Once all tests pass:
1. Document any issues found
2. Create tickets for non-critical bugs
3. Update this checklist with any new tests
4. Celebrate successful deployment! 🎉

**Tested By:** _______________
**Date:** _______________
**Deployment Status:** _______________
**Issues Found:** _______________
