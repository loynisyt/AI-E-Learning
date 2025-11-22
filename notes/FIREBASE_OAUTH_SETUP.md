# Browser Certificate Trust & Firebase Setup

## Current Certificate Status

Your certificate is valid but ESET SSL Filter is intercepting it. This is normal for development.

**Certificate Details:**
- Issued by: mkcert development certificate
- Valid from: November 14, 2025
- Expires: February 14, 2028
- Hash: f9d2e63a76268d7e51c5112b752ae58d2909e59e3b55772e5921b81601862fc6

## Fix: Trust mkcert CA in Browser

### Step 1: Export mkcert Root CA

```bash
# Find the mkcert CA location
mkcert -CAROOT

# This shows path like: C:\Users\Loynis\AppData\Local\mkcert
# The file is: rootCA.pem
```

### Step 2: Import CA Certificate into Windows & Browser

#### Windows Certificate Store (Recommended)
```powershell
# Run as Administrator
$certPath = "C:\Users\Loynis\AppData\Local\mkcert\rootCA.pem"

# Import to Trusted Root
certutil -addstore -f "Root" $certPath

# Verify
certutil -store Root | findstr mkcert
```

#### Chrome/Edge (Automatic after Windows import)
- Just close and restart browser
- Certificate will be trusted automatically

#### Firefox (Manual import)
1. Settings > Privacy & Security > Certificates > View Certificates
2. Click "Import" 
3. Select `C:\Users\Loynis\AppData\Local\mkcert\rootCA.pem`
4. Check "Trust this CA to identify websites"
5. Click OK

## Firebase OAuth Setup

### Your Secure URLs for Firebase

Use these URLs in Firebase Console:

**Development URLs** (with HTTPS):
```
Frontend: https://127.0.0.1:443
         https://localhost:3000
         https://lcl.host

Backend: https://127.0.0.1:4000
```

**Firebase OAuth Redirect URIs:**
```
https://127.0.0.1:443/callback
https://localhost:3000/callback
https://lcl.host/callback
```

### Firebase Console Setup

1. **Go to Firebase Console**
   - https://console.firebase.google.com
   - Select your project

2. **Authentication > Sign-in Method > Google**
   - Click Google
   - Enable it
   - Add Authorized redirect URIs:
     ```
     https://127.0.0.1:443/callback
     https://localhost:3000/callback
     ```

3. **OAuth Consent Screen**
   - Add authorized domains:
     ```
     127.0.0.1
     localhost
     lcl.host
     ```

4. **Copy Web Client ID**
   - Go to Credentials
   - Click your OAuth 2.0 client
   - Copy Client ID
   - Save as `NEXT_PUBLIC_FIREBASE_CLIENT_ID` in `.env.local`

### Example .env.local

```env
# Firebase Web Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Auth
NEXT_PUBLIC_API_URL=https://127.0.0.1:4000
JWT_SECRET=your-secret
```

## Access Your Application

### Secure URLs (HTTPS)

After trusting the certificate:

```
https://127.0.0.1:443     ✅ Browser URL
https://localhost:3000    ✅ Browser URL
https://lcl.host          ✅ Browser URL (if hosts file configured)
```

### Configure Hosts File (Optional but Recommended)

Windows hosts file: `C:\Windows\System32\drivers\etc\hosts`

Add these lines:
```
127.0.0.1 lcl.host
127.0.0.1 localhost
```

Save and restart browser. Then access:
```
https://lcl.host
https://localhost:3000
```

## ESET SSL Filter Warning

This is completely normal and secure. ESET is inspecting HTTPS traffic for security.

**What's happening:**
1. Browser connects to your server
2. ESET intercepts and inspects the connection
3. ESET forwards traffic to your app
4. Your connection remains encrypted

**This is safe for development** - ESET is just filtering for malware/phishing.

## Docker Production URLs

When deployed with Docker:

```
Frontend: https://yourdomain.com
Backend: https://api.yourdomain.com
```

Update Firebase with production URLs at that time.

## Troubleshooting Certificate Trust

### Issue: "Not Secure" still shows
**Solution**: 
1. Close ALL browser windows completely
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart browser
4. Re-import certificate

### Issue: Certificate still shows warning
**Solution**: Regenerate certificates
```bash
cd frontend
npm run setup:https
# Restart browser
npm run dev:https
```

### Issue: "Can't reach server"
**Solution**: Check server is running
```bash
# Terminal 1
cd frontend
npm run dev:https

# Terminal 2
curl https://127.0.0.1:443 -k  # -k ignores certificate warnings for testing
```

## Security Notes

✅ Your certificates are:
- Self-signed (mkcert) - perfect for development
- Encrypted in transit
- Valid for 3 years (until Feb 2028)
- Trusted after importing CA

✅ HTTPS is required for:
- OAuth/Google Sign-in
- Email verification
- Secure cookie storage
- Session management

✅ Never use development certificates in production
- Use Let's Encrypt or trusted CA
- Keep private keys secure
- Monitor certificate expiration

## Test HTTPS Connection

```bash
# Test with curl (ignore certificate warning)
curl -k https://127.0.0.1:443

# Test with PowerShell
[System.Net.ServicePointManager]::ServerCertificateValidationCallback = { $true }
$response = Invoke-WebRequest -Uri "https://127.0.0.1:443" -SkipCertificateCheck
Write-Host $response.StatusCode
```

## Firebase OAuth Callback Setup

Your OAuth callback will be handled by:

**Frontend** (`frontend/app/api/auth/google/callback/route.js` - to be created):
```javascript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthClient from '@/lib/authClient';

export default function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    // Exchange code for token with Firebase
    // Then call AuthClient.connectProvider() or registerUser()
  }, []);

  return <div>Processing Google Sign-in...</div>;
}
```

## Summary

✅ **Certificates are:**
- Valid and properly generated
- Trusted after CA import
- Ready for development
- Secure for local testing

✅ **Your secure URLs:**
```
https://127.0.0.1:443
https://localhost:3000
https://lcl.host (optional)
```

✅ **Next steps:**
1. Import mkcert CA into Windows
2. Configure Firebase with your URLs
3. Restart browser
4. Test OAuth flow

**Status**: 🟢 Ready for Firebase OAuth setup!
