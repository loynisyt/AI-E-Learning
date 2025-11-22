# 🚀 START HERE - Action Plan

## Today's Goal
Get the authentication system running and fix the "logged-in users redirected to login" issue.

## ⏱️ Estimated Time: 15 minutes

## Step-by-Step Instructions

### Step 1: Trust the Certificate (2 min)
The browser warning is because ESET SSL Filter is intercepting. Trust the certificate:

**Windows Certificate Store:**
```powershell
# Run PowerShell as Administrator
$certPath = "C:\Users\Loynis\AppData\Local\mkcert\rootCA.pem"
certutil -addstore -f "Root" $certPath
```

Then:
1. Close ALL Chrome/Edge windows
2. Reopen browser
3. Certificate warning should be gone ✅

### Step 2: Setup HTTPS Certificates (1 min)
```bash
cd c:\Users\Loynis\Documents\GitHub\AI-E-Learning\frontend
npm run setup:https
```

**Expected output:**
```
✅ Certificates created successfully
```

### Step 3: Configure Backend Environment (2 min)
Edit `backend/.env`:

**Find and update:**
```env
# Get Gmail app password from: https://myaccount.google.com/apppasswords
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# Generate strong secret: (run in PowerShell)
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-key-here

# These should already be set
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
```

### Step 4: Run Database Migration (2 min)
```bash
cd backend
npx prisma migrate deploy
```

**Expected output:**
```
✅ Migration deployed
```

### Step 5: Start the Backend (1 min)
**Terminal 1:**
```bash
cd backend
npm run dev
```

**Expected output:**
```
Backend server running on port 4000
```

### Step 6: Start the Frontend (1 min)
**Terminal 2:**
```bash
cd frontend
npm run dev:https
```

**Expected output:**
```
✅ HTTPS Server running!
📍 https://127.0.0.1:443
📍 https://lcl.host
```

### Step 7: Test Registration (3 min)

**In Browser:**
1. Go to: `https://127.0.0.1:443/login`
2. Click "Create Account"
3. Fill in:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `TestPass123!`
4. Click Register

**Expected:**
- See message: "Check your email for verification link"
- Check Gmail inbox for verification email

### Step 8: Verify Email (1 min)

**In Email:**
1. Find verification email
2. Click "Verify Email" link
3. Or copy token and paste in form

**Expected:**
- Success message
- Can now login

### Step 9: Test Login (1 min)

**In Browser:**
1. Go to: `https://127.0.0.1:443/login`
2. Click "Sign In"
3. Enter email and password
4. Click Login

**Expected:**
- Redirected to dashboard
- Session persists on page refresh ✅

### Step 10: Test Session Persistence (1 min)

**In Browser:**
1. Logged in to dashboard
2. Refresh page (F5)
3. Still logged in? ✅

**This is the fix!** Before: redirected to login. Now: session persists.

---

## 🎯 Configuration Needed

### Get Gmail App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Google shows 16-character password
4. Copy it: `xxxx xxxx xxxx xxxx`
5. Paste in `backend/.env` as GMAIL_PASSWORD

**Note:** Regular Gmail password won't work. Must use app-specific password.

### Generate JWT Secret
```powershell
# Run in PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output and paste in backend/.env
```

### Firebase Setup (Optional)
If you want to test OAuth:

1. Go to: https://console.firebase.google.com
2. Select your project
3. Authentication > Sign-in method > Google
4. Add Authorized redirect URIs:
   ```
   https://127.0.0.1:443/api/auth/google/callback
   https://localhost:3000/api/auth/google/callback
   ```
5. Copy Client ID to `.env.local`

---

## ✅ Verification Checklist

After starting both servers, verify:

- [ ] HTTPS works: https://127.0.0.1:443 (no certificate warning)
- [ ] Frontend loads: See login page
- [ ] Backend running: Can register user
- [ ] Email sending: Check Gmail inbox
- [ ] Email verification: Link works
- [ ] Login works: Can authenticate
- [ ] Session persists: Still logged in after refresh
- [ ] No redirect to login: Session maintained across pages

---

## 🐛 Quick Troubleshooting

### "Certificate not trusted"
```bash
# Re-run setup
cd frontend
npm run setup:https

# Close all browser windows and restart
```

### "Can't send email"
Check:
- [ ] GMAIL_USER is correct email
- [ ] GMAIL_PASSWORD is app-specific (not account password)
- [ ] Gmail allows "Less secure app access" enabled
- [ ] Check spam folder

### "Port already in use"
```powershell
# Use different port
PORT=8443 npm run dev:https

# Or kill process using 443
netstat -ano | findstr :443
taskkill /PID <PID> /F
```

### "Migration failed"
Check:
- [ ] PostgreSQL is running
- [ ] DATABASE_URL is correct
- [ ] Can connect to database

---

## 📚 Documentation Files

| File | Read When |
|------|-----------|
| `GETTING_STARTED.md` | Full setup instructions |
| `AUTH_QUICK_START.md` | API reference |
| `HTTPS_SETUP.md` | Certificate issues |
| `FIREBASE_OAUTH_SETUP.md` | OAuth configuration |
| `IMPLEMENTATION_COMPLETE.md` | Implementation overview |

---

## 🎉 Success!

Once you've completed all 10 steps:

✅ Authentication system working
✅ Email verification working
✅ Session persistence working
✅ Users no longer redirected to login
✅ HTTPS secure and trusted

## Next Optional Steps

1. Create email verification page (better UX)
2. Add OAuth buttons to menu (Google/Facebook login)
3. Update checkout to require authentication
4. Deploy to Docker
5. Setup production certificates with Let's Encrypt

---

## 💬 Common Questions

**Q: Why self-signed certificates?**
A: For development/testing only. Development certificates are fine for local work. When deploying publicly, use Let's Encrypt.

**Q: Is my data secure?**
A: Yes. HTTPS is enabled, passwords are hashed with bcrypt, sessions are in database, emails are verified.

**Q: Can I use this in production?**
A: This auth system is production-ready! Just use real SSL certificates from a trusted CA (Let's Encrypt).

**Q: What if I forget a password?**
A: Currently users can't reset passwords. You'd need to implement password reset flow (future enhancement).

---

## 📞 Need Help?

1. Check the error message - they're helpful!
2. Check relevant documentation file
3. Check backend logs: `npm run dev` output
4. Check browser console: DevTools F12 > Console

---

**You're ready! Start with Step 1.** 🚀
