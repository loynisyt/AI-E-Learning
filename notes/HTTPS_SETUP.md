# HTTPS & SSL Certificate Management Guide

## Current Certificate Status ✅

Your HTTPS setup is now **secure and fully functional**:
- ✅ Valid SSL certificates installed
- ✅ HTTPS server running on port 443
- ✅ Security headers enabled
- ✅ Automatic certificate validation
- ✅ Error handling and guidance

## Certificate Files

### Location
```
c:\Users\Loynis\Documents\GitHub\AI-E-Learning\certs\
├── localhost-cert.pem     (SSL Certificate)
└── localhost-key.pem      (Private Key)
```

### File Details
| File | Purpose | Size | Created |
|------|---------|------|---------|
| `localhost-cert.pem` | SSL Certificate (public) | ~2KB | 2025-11-14 |
| `localhost-key.pem` | Private Key (secret) | ~2KB | 2025-11-14 |

### What They Contain

**localhost-cert.pem** (Public Certificate)
```
-----BEGIN CERTIFICATE-----
[Base64 encoded certificate data]
-----END CERTIFICATE-----
```
- Valid for: localhost, 127.0.0.1, lcl.host, *.lcl.host
- Issued by: mkcert development CA
- Expires: 2028-02-14
- Purpose: Proves server identity to browsers

**localhost-key.pem** (Private Key - KEEP SECRET!)
```
-----BEGIN PRIVATE KEY-----
[Base64 encoded key data]
-----END PRIVATE KEY-----
```
- **NEVER** commit to version control
- **NEVER** share with anyone
- **NEVER** upload to public repositories
- Purpose: Decrypts HTTPS traffic

## How HTTPS Works

```
Browser                          Server
  │                                │
  │──── Hello (client hello) ──────→ 
  │                                │
  │←─── Hello (send cert) ─────────│ (localhost-cert.pem)
  │                                │
  │──── Verify + Key Exchange ────→
  │                                │
  │←─── Encrypted Session Key ────│ (encrypted with private key)
  │                                │
  │═════ Encrypted Connection ════│
  │      (all data encrypted)      │
  │                                │
```

## Running HTTPS Server

### Method 1: Using npm script (Recommended)
```bash
cd frontend
npm run dev:https
```

### Method 2: Direct node command
```bash
cd frontend
node https-server.mjs
```

### Method 3: With custom hostname
```bash
cd frontend
HOSTNAME=lcl.host PORT=443 node https-server.mjs
```

### Expected Output
```
🔒 HTTPS Server running securely!
─────────────────────────────────

📍 https://127.0.0.1:443
📍 https://lcl.host:443

🔐 Certificates:
   Key:  c:\Users\Loynis\Documents\GitHub\AI-E-Learning\certs\localhost-key.pem
   Cert: c:\Users\Loynis\Documents\GitHub\AI-E-Learning\certs\localhost-cert.pem

⚠️  Development mode - browsers will show certificate warnings
   This is normal for self-signed certificates
```

## Accessing the Secure Server

### Via Browser
- Navigate to: `https://127.0.0.1:443`
- Or: `https://lcl.host`

### Browser Certificate Warning (Normal)
```
⚠️ "Your connection is not private"
```

**Why?** 
- Certificates are self-signed (not from a trusted authority)
- Perfect for local development
- Browsers trust mkcert's local CA after first setup

**Solution:**
1. Click "Advanced"
2. Click "Proceed to 127.0.0.1" (or lcl.host)
3. Browser remembers and won't warn again

## Certificate Security Best Practices

### ✅ DO:
- ✅ Keep `localhost-key.pem` private
- ✅ Add `certs/` to `.gitignore` (private keys should never be in version control)
- ✅ Use HTTPS for all development with OAuth
- ✅ Regenerate certificates when changing domains
- ✅ Use strong passwords for key encryption

### ❌ DON'T:
- ❌ Share `localhost-key.pem` with anyone
- ❌ Commit certificates to Git
- ❌ Publish private keys anywhere
- ❌ Use development certificates in production
- ❌ Modify certificate files manually

## Protecting Certificate Files

### Check .gitignore
Ensure certificates directory is ignored:

```bash
# View .gitignore
cat .gitignore
```

Should include:
```
certs/
*.pem
.env
.env.local
```

### File Permissions (Windows)
```powershell
# Restrict access to certificates
icacls "C:\Users\Loynis\Documents\GitHub\AI-E-Learning\certs" /inheritance:r /grant:r "%USERNAME%:F"
```

### File Permissions (Linux/Mac)
```bash
# Make private key readable only by owner
chmod 600 certs/localhost-key.pem
chmod 644 certs/localhost-cert.pem
```

## Troubleshooting

### Issue: "SSL certificates not found"
**Cause**: Certificate files missing or in wrong location

**Solution**:
```bash
cd frontend
npm run setup:https
```

### Issue: "Permission denied. Port 443 requires admin privileges"
**Cause**: Port 443 is restricted on Windows

**Solution 1: Run as Administrator**
```powershell
# Start PowerShell as Administrator
npm run dev:https
```

**Solution 2: Use different port**
```bash
PORT=8443 node frontend/https-server.mjs
# Then access https://127.0.0.1:8443
```

### Issue: "Port 443 is already in use"
**Cause**: Another process using port 443

**Solution 1: Find what's using port 443**
```powershell
netstat -ano | findstr :443
# Kill process: taskkill /PID <PID> /F
```

**Solution 2: Use different port**
```bash
PORT=8443 npm run dev:https
```

### Issue: Browser shows "NET::ERR_CERT_AUTHORITY_INVALID"
**Cause**: mkcert CA not installed in browser trust store

**Solution**:
1. Run: `npm run setup:https`
2. Restart browser
3. Clear browser cache

## Regenerating Certificates

If you need new certificates:

### Option 1: Automatic (Recommended)
```bash
cd frontend
npm run setup:https
```

### Option 2: Manual
```bash
# Uninstall old CA
mkcert -uninstall

# Create new CA and certificates
mkcert -install
mkcert -cert-file=../certs/localhost-cert.pem \
       -key-file=../certs/localhost-key.pem \
       localhost 127.0.0.1 lcl.host

# Restart server
npm run dev:https
```

## Certificate Details

### View Certificate Info
```bash
# Display certificate details
openssl x509 -in certs/localhost-cert.pem -text -noout
```

### Verify Certificate & Key Match
```bash
# Should output the same hash if they match
openssl x509 -noout -modulus -in certs/localhost-cert.pem | openssl md5
openssl pkey -noout -modulus -in certs/localhost-key.pem | openssl md5
```

## Production Considerations

### For Production (Not Now)
- [ ] Use certificates from trusted CA (Let's Encrypt, Digicert, etc.)
- [ ] Implement automatic certificate renewal
- [ ] Store private keys in secure vaults (HashiCorp Vault, AWS Secrets)
- [ ] Implement certificate pinning
- [ ] Regular security audits
- [ ] Monitor certificate expiration

### Current Development Setup
- Self-signed certificates (mkcert)
- Local CA installed on development machine
- No external network exposure
- Perfect for local development and testing

## Security Features Enabled

### SSL/TLS Configuration
✅ Minimum TLS 1.2 in production
✅ Maximum TLS 1.3 in production
✅ Development allows earlier versions (flexibility)

### Security Headers
✅ `Strict-Transport-Security` - Force HTTPS
✅ `X-Content-Type-Options` - Prevent MIME sniffing
✅ `X-Frame-Options` - Prevent clickjacking
✅ `X-XSS-Protection` - Enable browser XSS filter

### Certificate Validation
✅ Automatic PEM format validation
✅ File size checks (not empty)
✅ Readable by application
✅ Path verification

## HTTPS Server Architecture

```
https-server.mjs
│
├─ Read certificates
│  ├─ Validate format
│  ├─ Check files exist
│  └─ Verify not empty
│
├─ Prepare Next.js app
│
├─ Create HTTPS server
│  ├─ Load key & cert
│  ├─ Configure TLS options
│  └─ Add security headers
│
├─ Listen on port 443
│  └─ 127.0.0.1:443
│
└─ Error handling
   ├─ Port in use
   ├─ Permission denied
   └─ Certificate errors
```

## Docker & HTTPS

For Docker deployment with HTTPS:

### Mount Certificates
```yaml
services:
  frontend:
    volumes:
      - ./certs/localhost-cert.pem:/app/certs/localhost-cert.pem:ro
      - ./certs/localhost-key.pem:/app/certs/localhost-key.pem:ro
```

### Use Reverse Proxy (nginx)
```nginx
server {
    listen 443 ssl;
    server_name localhost lcl.host 127.0.0.1;
    
    ssl_certificate /etc/nginx/certs/localhost-cert.pem;
    ssl_certificate_key /etc/nginx/certs/localhost-key.pem;
    
    location / {
        proxy_pass http://nextjs:3000;
    }
}
```

## Summary

✅ **Your HTTPS setup is now:**
- Fully functional and secure
- Ready for OAuth (requires HTTPS)
- Protected with self-signed certificates
- Validated on every startup
- With comprehensive error messages
- Including security headers

✅ **Certificate files are:**
- In secure location: `./certs/`
- Protected from version control
- Validated for integrity
- Ready for Docker deployment

✅ **Next steps:**
1. Run `npm run dev:https` to start
2. Access `https://127.0.0.1:443`
3. Test OAuth flows
4. Deploy to Docker when ready

**Questions?** Check the error messages - they now provide detailed guidance!
