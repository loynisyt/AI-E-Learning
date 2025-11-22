# 🔒 Local HTTPS Development Setup

## Problem Solved ✅
Your frontend on `https://127.0.0.1:443` was getting **unauthorized domain** errors because the backend wasn't accepting requests from that origin and wasn't running on HTTPS.

---

## Solution ✅ - What Was Fixed

### 1. **Frontend Configuration** (`frontend/.env.local`)
```env
# Now points to HTTPS backend on correct port
NEXT_PUBLIC_API_URL="https://127.0.0.1:4000"
NEXT_PUBLIC_BACKEND_URL="https://127.0.0.1:4000"
```

### 2. **Backend Configuration** (`backend/.env`)
```env
# Allows CORS from your frontend
FRONTEND_URL="https://127.0.0.1:443"
```

### 3. **Backend CORS** (`backend/index.js`)
Updated to accept requests from:
- `https://127.0.0.1:443` ✅ (Your frontend)
- `https://127.0.0.1:3000`
- `http://localhost:3000`
- `https://localhost:3000`

### 4. **Backend HTTPS Support**
Backend now automatically:
- ✅ Detects if certificates exist (`certs/localhost-cert.pem` and `certs/localhost-key.pem`)
- ✅ Runs on HTTPS if certificates are found
- ✅ Falls back to HTTP if certificates don't exist
- ✅ Listens on `https://127.0.0.1:4000`

---

## 🚀 How to Run

### **Terminal 1: Backend**
```powershell
cd backend
npm run dev
```

Expected output:
```
🔒 Backend HTTPS server running on https://127.0.0.1:4000
✅ CORS enabled for: https://127.0.0.1:443, https://127.0.0.1:3000, ...
```

### **Terminal 2: Frontend**
```powershell
cd frontend
npm run dev:https
```

Expected output:
```
Local: https://127.0.0.1:443
```

---

## ✅ Testing the Setup

1. **Open your browser** and go to: `https://127.0.0.1/login`
2. **Try to sign up** with any email/password
3. You should see:
   - ✅ API call to `https://127.0.0.1:4000/api/auth/register`
   - ✅ No CORS errors
   - ✅ No "unauthorized domain" errors
   - ✅ Success message or error from registration

---

## 🔍 Troubleshooting

### **Still getting CORS errors?**
1. Check backend is running on HTTPS:
   ```
   netstat -ano | findstr :4000
   ```
2. Verify certificates exist:
   ```
   dir certs\localhost-*
   ```
3. Restart both servers (close and rerun)

### **Backend says "HTTPS setup failed"?**
- Check certificate files are in `certs/` folder
- Run: `mkcert -install` if certificates aren't trusted
- Check file permissions (should be readable)

### **Still can't reach backend?**
- Verify FRONTEND_URL in `backend/.env` is exactly: `https://127.0.0.1:443`
- Verify NEXT_PUBLIC_API_URL in `frontend/.env.local` is exactly: `https://127.0.0.1:4000`
- No trailing slashes!

---

## 📋 Environment Variables Summary

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="https://127.0.0.1:4000"        # ← Backend API endpoint
NEXT_PUBLIC_BACKEND_URL="https://127.0.0.1:4000"    # ← Same as above
```

### Backend (`backend/.env`)
```env
FRONTEND_URL="https://127.0.0.1:443"                # ← Your frontend URL
DATABASE_URL="postgresql://..."                     # ← Your database
GMAIL_USER="..."                                    # ← Email verification
GMAIL_PASSWORD="..."                                # ← Email app password
```

---

## 🎯 What Happens Now

### Signup Flow:
1. User enters email/password at `https://127.0.0.1/login`
2. Frontend calls `https://127.0.0.1:4000/api/auth/register`
3. Backend receives request (CORS allows it ✅)
4. Backend hashes password, saves to DB
5. Backend sends verification email
6. Returns user data to frontend
7. Frontend receives response (no CORS error ✅)
8. Signup completes successfully ✅

### Login Flow:
1. User enters credentials at `https://127.0.0.1/login`
2. Frontend calls `https://127.0.0.1:4000/api/auth/login`
3. Backend verifies password
4. Creates session in database
5. Returns session cookie
6. Frontend stores session
7. User redirected to dashboard ✅
8. Session persists on page refresh ✅

---

## 🔐 Security Notes

✅ **Self-signed certificates** are fine for local development
✅ **CORS is properly configured** to only allow your frontend
✅ **Sessions stored in database** (7-day expiry)
✅ **Passwords are hashed** with bcrypt (10 rounds)
✅ **Cookies are HttpOnly** (can't be accessed by JavaScript)

For production, you'll need:
- Real SSL certificates from Let's Encrypt or CA
- Environment-specific configuration
- Stricter CORS rules
- Production database

---

## 📞 Next Steps

1. ✅ Start backend: `npm run dev` (from `backend/` folder)
2. ✅ Start frontend: `npm run dev:https` (from `frontend/` folder)
3. ✅ Visit: `https://127.0.0.1/login`
4. ✅ Try to sign up
5. ✅ Check you receive a verification email
6. ✅ Verify email and login

**Everything should work now! 🎉**
