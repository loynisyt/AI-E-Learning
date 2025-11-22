# Stripe Integration & HTTPS Setup Guide

Complete guide for setting up Stripe payments with HTTPS for OAuth on `lcl.host`.

## 📋 Quick Summary

You now have:
1. ✅ Stripe Checkout component (`StripeCheckout.jsx`)
2. ✅ Checkout page (`/checkout`)
3. ✅ Backend Stripe API endpoint
4. ✅ Success/cancel pages
5. ✅ Environment variables configured
6. ✅ HTTPS setup instructions

---

## 🔌 Part 1: Stripe Setup

### Step 1: Get Your Stripe Price IDs

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/products)
2. Create products if not already done:
   - **Premium** - $29/month
   - **Premium+** - $49/month
3. For each product, create a monthly recurring price
4. Copy the **Price IDs** (start with `price_`)

Example Price IDs:
```
Premium: price_1STSNNQxJSkOR0hKXxJvZnJ7
Premium+: price_1STSNNQxJSkOR0hKqK8nL9M0
```

### Step 2: Update Backend Stripe Configuration

Edit `backend/app/api/stripe/route.js` and update the `STRIPE_PRICE_IDS`:

```javascript
const STRIPE_PRICE_IDS = {
  premium: 'price_YOUR_PREMIUM_PRICE_ID',
  'premium-plus': 'price_YOUR_PREMIUM_PLUS_PRICE_ID',
};
```

### Step 3: Configure Webhook (Optional but Recommended)

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint:
   - **URL**: `http://localhost:4000/api/stripe/webhook` (or your backend URL)
   - **Events**: `checkout.session.completed`, `payment_intent.succeeded`
3. Copy the **Webhook Secret** and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxxxxxxxxx
```

### Step 4: Test Stripe Keys

Use Stripe's test credit card:
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

---

## 🔒 Part 2: HTTPS Setup for lcl.host

### Step 1: Install mkcert

**Windows (PowerShell as Admin):**
```powershell
# Using Chocolatey
choco install mkcert

# Or using Scoop
scoop install mkcert
```

**macOS:**
```bash
brew install mkcert
brew install nss
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt install mkcert
```

### Step 2: Generate Local SSL Certificates

In your project root directory:

```powershell
# Create local Certificate Authority (run once)
mkcert -install

# Generate certificates for lcl.host
mkcert lcl.host "*.lcl.host"
```

This creates:
- `lcl.host+1.pem` (certificate)
- `lcl.host+1-key.pem` (private key)

Move these to your project root if not already there.

### Step 3: Update /etc/hosts

**Windows:**
1. Open `C:\Windows\System32\drivers\etc\hosts` as Administrator
2. Add at the end:
```
127.0.0.1 lcl.host
127.0.0.1 www.lcl.host
```

**macOS/Linux:**
```bash
echo "127.0.0.1 lcl.host" | sudo tee -a /etc/hosts
```

Verify:
```powershell
ping lcl.host
# Should resolve to 127.0.0.1
```

### Step 4: Configure Next.js for HTTPS

Install additional dependency:
```bash
cd frontend
npm install dotenv
```

Create `next-https.config.js` in frontend root:

```javascript
import fs from 'fs';
import path from 'path';

export const getServerConfig = () => {
  const certPath = path.join(process.cwd(), '../lcl.host+1.pem');
  const keyPath = path.join(process.cwd(), '../lcl.host+1-key.pem');

  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }
  return null;
};
```

### Step 5: Update package.json Dev Script

In `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:https": "next dev --experimental-https",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

Run with HTTPS:
```bash
npm run dev:https
```

Or for standard HTTP:
```bash
npm run dev
```

### Step 6: Update Environment Variables

Edit `.env.local`:

**For local development (HTTP):**
```env
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_FRONTEND_URL="http://localhost:3000"
NEXT_PUBLIC_BACKEND_URL="http://localhost:4000"
```

**For lcl.host with HTTPS:**
```env
NEXTAUTH_URL="https://lcl.host:3000"
NEXT_PUBLIC_FRONTEND_URL="https://lcl.host:3000"
NEXT_PUBLIC_BACKEND_URL="https://lcl.host:4000"
```

---

## 🔑 Part 3: OAuth Configuration

### Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ai-elearning-f6a27`
3. Go to **Authentication** → **Settings** → **Authorized redirect URIs**
4. Add both:
   - `http://localhost:3000/__/auth/handler`
   - `https://lcl.host:3000/__/auth/handler`

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project
3. Go to **APIs & Services** → **Credentials**
4. Edit OAuth 2.0 Client ID
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://lcl.host:3000
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://lcl.host:3000/api/auth/callback/google
   ```

### Facebook OAuth

1. Go to [Facebook Developer Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Go to **Settings** → **Basic**
4. Set **App Domains**: `lcl.host`
5. Go to **Facebook Login** → **Settings**
6. Add **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://lcl.host:3000/api/auth/callback/facebook
   ```

---

## 🚀 Part 4: Testing Stripe Checkout

### Workflow:

1. **Start backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend with HTTPS:**
   ```bash
   cd frontend
   npm run dev:https
   # or npm run dev for HTTP
   ```

3. **Navigate to pricing:**
   - Visit `https://lcl.host:3000/` (or `http://localhost:3000/`)
   - Click "Choose Your Plan"

4. **Click "Get Premium":**
   - Redirects to `/checkout?plan=premium`
   - Shows StripeCheckout component

5. **Click "Subscribe to Premium":**
   - Creates Stripe checkout session
   - Redirects to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`

6. **Complete payment:**
   - Success page shows
   - Redirects to dashboard

---

## 🐛 Troubleshooting

### HTTPS/Certificate Issues

**Error: "NET::ERR_CERT_AUTHORITY_INVALID"**
- This is expected with self-signed certs
- Click "Advanced" → "Proceed"
- In production, use proper SSL certs

**Certificates not found**
```bash
# Regenerate certificates
mkcert lcl.host "*.lcl.host"

# Verify they exist
ls -la lcl.host+1*  # macOS/Linux
dir lcl.host+1*     # Windows
```

### Stripe Issues

**Error: "Invalid price ID"**
- Update `STRIPE_PRICE_IDS` in `backend/app/api/stripe/route.js`
- Copy correct IDs from Stripe Dashboard

**Webhook failures**
- Add webhook endpoint to Stripe
- Update `STRIPE_WEBHOOK_SECRET`
- Ensure backend URL is correct

### OAuth Issues

**"Redirect URI mismatch"**
- Verify URLs match exactly in provider dashboards
- Use HTTPS for lcl.host, HTTP for localhost
- Include port number (`:3000`)

### Database Issues

**"Can't reach database"**
```bash
# Make sure Docker containers are running
docker compose up -d postgres directus backend

# Or use host database
# Update DATABASE_URL in .env.local
```

---

## 📱 Component Usage

### StripeCheckout Component

```jsx
import StripeCheckout from '@/frontend/components/StripeCheckout/StripeCheckout';

export default function MyCheckoutPage() {
  return (
    <StripeCheckout
      planId="premium"
      planName="Premium"
      price={2900}
    />
  );
}
```

Or use the URL params:
```jsx
// Will read from ?plan=premium in URL
<StripeCheckout />
```

### Backend API Endpoint

```bash
POST /api/stripe/checkout
Content-Type: application/json

{
  "planId": "premium",
  "planName": "Premium",
  "amount": 2900,
  "userEmail": "user@example.com"
}

Response:
{
  "sessionId": "cs_test_xxxxxxxxxxxx"
}
```

---

## 📚 Key Files Created

- ✅ `frontend/components/StripeCheckout/StripeCheckout.jsx` - Payment component
- ✅ `frontend/app/checkout/page.js` - Checkout page
- ✅ `frontend/app/checkout/success/page.js` - Success page
- ✅ `backend/app/api/stripe/route.js` - Backend endpoint
- ✅ `HTTPS_SETUP.md` - HTTPS guide
- ✅ `.env.local` - Updated configuration
- ✅ `frontend/package.json` - Added Stripe packages

---

## ✅ Next Steps

1. [ ] Install Stripe package: `npm install @stripe/react-stripe-js @stripe/stripe-js`
2. [ ] Update Stripe price IDs
3. [ ] Generate SSL certificates with mkcert
4. [ ] Update `/etc/hosts`
5. [ ] Configure OAuth providers
6. [ ] Test payment flow
7. [ ] Set up webhook in Stripe dashboard
8. [ ] Update database user model to track subscription status

---

## 🎯 Production Checklist

Before going live:
- [ ] Use production Stripe keys
- [ ] Replace self-signed certs with valid SSL
- [ ] Update OAuth redirect URIs to production domain
- [ ] Enable HTTPS enforcement
- [ ] Set up proper Stripe webhook handling
- [ ] Update `NEXTAUTH_URL` and all URLs to production domain
- [ ] Add database migration for user subscription status
- [ ] Test full payment flow end-to-end

---

**Questions?** Check the troubleshooting section or review the generated files.
