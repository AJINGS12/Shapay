# Shapay

**AI-powered payment infrastructure for merchants — checkout, recurring billing, and intelligent payment recovery, built on the Nomba API.**

Live app: https://shapay-ten.vercel.app
Backend API: https://shapay-production.up.railway.app

---

## Overview

Shapay is a merchant payment platform that helps businesses accept payments, manage recurring subscriptions, and automatically recover failed transactions using AI. Built for the Nomba Hackathon 2026.

Merchants often lose recurring revenue to failed subscription payments and lack visibility into payment performance. Shapay solves this with a centralized dashboard, real subscription lifecycle management, and an AI recovery pipeline that automatically writes and sends a personalized email to a customer the moment their payment fails.

---

## Key Features

### Merchant Dashboard
- Real-time payment and revenue overview
- Multi-tenant — each merchant only sees their own data
- Activity feed across payments and subscriptions
- AI-generated financial insights derived from live account data

### Payment Management
- Generate Nomba Checkout payment links
- Verify transaction status server-side (not just trust the redirect)
- Full payment history with status tracking

### Subscription Management
- Create subscriptions with recurring billing intervals
- Full lifecycle support: **active → paused → resumed → cancelled**
- Manual renewal trigger that calls Nomba's real tokenized-card-payment API

### AI-Powered Payment Recovery
- On payment failure, Claude (Anthropic) generates a personalized recovery email
- Delivered automatically via Resend, using a branded HTML template
- A "Simulate Failed Payment" tool lets you trigger this live for demo purposes

### Analytics
- Revenue trend (last 14 days), computed from real transaction data
- Payment and subscription status breakdowns
- Success rate and MRR tracking

---

## Tech Stack

**Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Recharts, Firebase Auth
**Backend:** Node.js, Express
**Database:** Supabase (PostgreSQL)
**Payments:** Nomba Checkout API, Nomba Tokenized Card Payment API
**AI:** Anthropic Claude API (recovery message generation)
**Email:** Resend
**Hosting:** Vercel (frontend), Railway (backend)

---

## Architecture

```
Merchant Dashboard (Next.js, Vercel)
        │
        │  x-merchant-id header on every request
        ▼
Express API (Railway)
        │
        ├── Nomba Checkout API — payment initialization & verification
        ├── Nomba Tokenized Card API — recurring charge attempts
        ├── Claude API — recovery message generation
        ├── Resend — recovery email delivery
        └── Supabase — payments, subscriptions, merchant profiles
```

**Multi-tenancy:** every payment and subscription record is tagged with a `merchant_id`, derived from the logged-in merchant's Firebase user ID and sent as a request header. All queries are filtered by this ID.

**Webhook security:** Nomba's `payment_success` / `payment_failed` webhook payloads are verified using HMAC-SHA256 against the raw request body, per Nomba's documented signature scheme, before any event is processed.

**Payment confirmation:** rather than trusting only the browser redirect (which can be spoofed or revisited), the payment callback independently calls Nomba's transaction verification endpoint before marking a payment as paid.

---

## Environment Variables

Backend (`.env`, also set in Railway):

```
PORT=5000
NOMBA_BASE_URL=https://sandbox.nomba.com
NOMBA_CLIENT_ID=
NOMBA_CLIENT_SECRET=
NOMBA_PARENT_ACCOUNT_ID=
NOMBA_WEBHOOK_SECRET=
APP_CALLBACK_URL=
BACKEND_BASE_URL=
FRONTEND_BASE_URL=
CLAUDE_API_KEY=
RESEND_API_KEY=
```

Frontend (`.env.local`, also set in Vercel):

```
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_FIREBASE_*  (standard Firebase web config)
```

None of these are committed to the repository.

---

## Known Limitation: Automated Recurring Charges

Nomba's tokenized-card-payment API is fully implemented per their official documentation, matching the verified pattern used by other Nomba Hackathon participants:

1. First payment goes through Nomba's hosted checkout with `tokenizeCard: true`.
2. On success, Nomba is expected to return a `tokenKey` in the `payment_success` webhook payload, tied to the customer's card.
3. Future charges use that `tokenKey` against `/v1/checkout/tokenized-card-payment` — a server-to-server call with no customer interaction.

In this sandbox environment, tokenization does not complete during checkout — confirmed directly in Nomba's own transaction data (`onlineCheckoutTokenizedCardPayment: "false"`) even when `tokenizeCard: true` is sent. This appears to be an environment/account-level limitation rather than an implementation issue.

As a result, the "Renew Now" action fails gracefully with a clear, honest explanation rather than a fake success. The renewal code itself is correct and would work automatically as soon as tokenization succeeds — including correctly distinguishing a genuinely completed charge from a card-scheme OTP challenge (Mastercard/Visa support silent recurring charges; Verve requires per-transaction OTP and cannot support unattended billing).

---

## Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd apps/merchant-dashboard
npm install
npm run dev
```

---

## Test Credentials (Nomba Sandbox)

Card: `5434 6210 7425 2808`
CVV: 123
Expiry: 12/30
PIN: `1234`
OTP (success): `123456`

---

## Team

Ismail Umar Ajingi 