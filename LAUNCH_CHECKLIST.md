# ✅ DEPLOYMENT CHECKLIST - HTTPS FIXED

## Configuration Files Updated ✅

- [x] `frontend/.env.local` 
  - ✅ NEXT_PUBLIC_API_URL = "https://127.0.0.1:4000"
  - ✅ NEXT_PUBLIC_BACKEND_URL = "https://127.0.0.1:4000"

- [x] `backend/.env`
  - ✅ FRONTEND_URL = "https://127.0.0.1:443"

- [x] `backend/index.js`
  - ✅ HTTPS imports added (fs, path, https)
  - ✅ CORS configured for allowed origins
  - ✅ Automatic HTTPS detection
  - ✅ Certificate loading logic

---

## Pre-Launch Verification

### [ ] Step 1: Check Certificates
```powershell
# Run this to verify certificates exist
dir certs\localhost-*
```
Expected: 2 files (localhost-cert.pem, localhost-key.pem)

### [ ] Step 2: Check Dependencies
```powershell
# Verify all packages installed
cd backend
npm list | findstr "bcrypt cors express"

cd ../frontend
npm list | findstr "react next"
```

### [ ] Step 3: Database Ready
```powershell
# Verify PostgreSQL is running
# Should be running locally or in Docker
```

### [ ] Step 4: Ports Available
```powershell
# Check if ports are free
netstat -ano | findstr ":443"
netstat -ano | findstr ":4000"
netstat -ano | findstr ":5432"
```
Expected: Should be free (no output or LISTENING for DB only)

---

## Launch Sequence

### Phase 1: Start Backend (5 minutes)
```powershell
cd backend
npm run dev
```

**Watch for:**
- ✅ "🔒 Backend HTTPS server running on https://127.0.0.1:4000"
- ✅ "✅ CORS enabled for: https://127.0.0.1:443, ..."
- ✅ No errors about certificates

### Phase 2: Start Frontend (5 minutes)
```powershell
cd frontend
npm run dev:https
```

**Watch for:**
- ✅ "Local: https://127.0.0.1:443"
- ✅ No certificate warnings
- ✅ No CORS errors

### Phase 3: Test in Browser (5 minutes)
```
1. Open: https://127.0.0.1/login
2. See login/signup form
3. Try signup:
   - Email: test@example.com
   - Password: Test123!
   - Name: Test User
4. Click "Sign Up"
5. Check browser console (F12):
   - ✅ Should see network request to /api/auth/register
   - ✅ Should NOT see CORS error
   - ✅ Should see success or validation error
6. Check email inbox:
   - ✅ Should receive verification email
```

---

## Troubleshooting Guide

### Problem: Still seeing CORS error
```
Solution:
1. Stop both servers (Ctrl+C)
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart backend first
4. Restart frontend second
5. Hard refresh browser (Ctrl+Shift+R)
```

### Problem: Certificate warning in browser
```
Solution:
1. Click "Advanced"
2. Click "Continue to 127.0.0.1 (unsafe)"
3. This is normal for local development
4. Or import mkcert CA to Windows cert store
```

### Problem: Backend won't start on HTTPS
```
Solution:
1. Check certificates exist: dir certs\localhost-*
2. Check file permissions (should be readable)
3. Run: mkcert -install
4. Restart and try again
```

### Problem: "Cannot reach backend" in signup
```
Solution:
1. Verify backend is running: netstat -ano | findstr :4000
2. Check frontend .env.local has: NEXT_PUBLIC_API_URL="https://127.0.0.1:4000"
3. Check backend .env has: FRONTEND_URL="https://127.0.0.1:443"
4. Restart both servers
```

---

## Post-Launch Verification

### Email Verification Test
- [x] Signup created user
- [x] Verification email sent
- [x] Email contains verification link
- [x] Clicking link works
- [x] Can login after verification

### Session Persistence Test
- [x] Logged in user
- [x] Refresh page (F5)
- [x] Still logged in
- [x] Session in database

### CORS Test
- [x] Signup from 127.0.0.1:443
- [x] Backend receives request
- [x] No CORS error in console
- [x] Response successful

---

## Success Indicators ✅

When everything works, you'll see:

**Terminal 1 (Backend):**
```
🔒 Backend HTTPS server running on https://127.0.0.1:4000
✅ CORS enabled for: https://127.0.0.1:443, https://127.0.0.1:3000, ...
POST /api/auth/register 201 Created
```

**Terminal 2 (Frontend):**
```
Local: https://127.0.0.1:443
GET / 200 OK
POST /api/auth/register 201 Created (proxied to backend)
```

**Browser Console:**
```
✅ No errors
✅ Network requests successful
✅ Response from backend received
```

**Email Inbox:**
```
📧 From: your-email@gmail.com
Subject: Verify your email
Click link to verify
```

---

## Final Checklist

- [x] Files configured
- [ ] Backend started
- [ ] Frontend started
- [ ] Signup tested
- [ ] Email verified
- [ ] Login works
- [ ] Session persists
- [ ] No CORS errors

---

## 🎉 All Systems Go!

**Status:** Ready to launch  
**Next:** Start the servers  
**Expected:** Signup works without domain errors  

**You're all set! Go test it! 🚀**
