<div align="center">

<img src="https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" />
<img src="https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe" />
<img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge" />

# 🏛️ Agora.cy

### Το marketplace της Κύπρου — Αγόρασε & Πούλησε με Ασφάλεια

**Agora.cy** είναι ένα full-stack marketplace για Κύπρους χρήστες με escrow-based πληρωμές, dispute resolution, live AI chat, και πλήρες admin dashboard.

[🌐 Live Demo](#) · [📋 Docs](#architecture) · [🐛 Issues](#)

</div>

---

## ✨ Features

### 🛒 Marketplace Core
- **Αγγελίες** — Ανέβασε με φωτογραφίες, κατηγορία, τοποθεσία, τιμή, κατάσταση
- **Αναζήτηση & Φίλτρα** — Full-text search, categories, τιμή, κατάσταση, τοποθεσία
- **Προωθημένες Αγγελίες** — Badge "Προωθημένο" για premium listings
- **Real-time messaging** — Chat μεταξύ αγοραστή/πωλητή

### 💳 Escrow Payment System
- **Stripe Checkout** — Ασφαλής πληρωμή με κάρτα
- **Escrow Hold** — Τα χρήματα κρατούνται μέχρι επιβεβαίωση παραλαβής
- **IBAN Payout** — Manual SEPA transfer στον πωλητή μέσω admin dashboard
- **Anti-fraud** — 5-στάδιο order flow με dispute protection

### 📦 Order Flow (5 Statuses)
```
⏳ ΕΚΚΡΕΜΕΙ → 📦 ΑΠΕΣΤΑΛΗ → ✅ ΠΑΡΑΔΟΘΗΚΕ → 💰 ΠΛΗΡΩΘΗΚΕ
                    ↓
              ⚖️ ΥΠΟ ΔΙΑΦΟΡΑ (admin arbitration)
```

### ⚖️ Dispute System
- Αγοραστής ανοίγει dispute: "Δεν έλαβα", "Χαλασμένο", "Λάθος αντικείμενο"
- Πωλητής ανοίγει dispute: "Δεν επιβεβαιώνει παραλαβή"
- Admin αποφασίζει — escrow παγώνει αυτόματα
- Tracking number + courier support για αποδείξεις

### 🤖 AI Live Chat
- Floating chat widget σε όλες τις σελίδες
- 13+ FAQ topics στα Ελληνικά (escrow, αγορά, πώληση, ασφάλεια)
- Fallback email → `support@agora.cy`
- Typing indicators + quick-action buttons

### 🔐 Security & Compliance
- Row Level Security (RLS) σε όλες τις Supabase tables
- Google OAuth + Email/Password authentication
- Terms of Service checkbox υποχρεωτικό στην εγγραφή
- `/safety`, `/gdpr`, `/terms`, `/contact` pages
- Admin routes προστατευμένα με `ADMIN_SECRET`
- Proxy middleware: `/listings/new` και `/profile/me` απαιτούν login

---

## 🏗️ Architecture

```
c:\Agora.cy
├── app/
│   ├── page.tsx                    # Homepage (Hero, Categories, Latest)
│   ├── listings/
│   │   ├── page.tsx                # Listings με φίλτρα
│   │   ├── new/page.tsx            # Create listing (protected)
│   │   └── [id]/page.tsx           # Listing detail + checkout
│   ├── profile/
│   │   ├── me/page.tsx             # My profile (orders, earnings, disputes)
│   │   └── [id]/page.tsx           # Public profile
│   ├── admin/
│   │   └── payouts/page.tsx        # Admin dashboard (ADMIN_SECRET protected)
│   ├── api/
│   │   ├── checkout/
│   │   │   ├── create-payment-intent/  # Stripe payment
│   │   │   └── confirm-order/          # Post-payment DB update
│   │   ├── orders/
│   │   │   ├── confirm-delivery/       # Buyer confirms → payout triggered
│   │   │   ├── mark-shipped/           # Seller marks shipped + tracking
│   │   │   └── open-dispute/           # Dispute creation + admin GET
│   │   ├── admin/payouts/              # Admin IBAN payout management
│   │   ├── connect/                    # Stripe Connect onboarding
│   │   ├── profile/update-bank/        # Seller IBAN storage
│   │   └── webhooks/stripe/            # Stripe webhook handler
│   ├── contact/page.tsx
│   ├── gdpr/page.tsx
│   ├── safety/page.tsx
│   ├── terms/page.tsx
│   ├── how-it-works/page.tsx
│   └── messages/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── LiveChat.tsx                # AI chat widget
│   ├── AuthModal.tsx               # Login/Register + Terms checkbox
│   ├── CheckoutModal.tsx           # Stripe Elements
│   ├── ListingCard.tsx
│   ├── ImageUpload.tsx
│   └── FilterSidebar.tsx
├── lib/
│   ├── supabase/                   # Client + Server Supabase
│   ├── stripe.ts
│   ├── listings.ts
│   ├── messages.ts
│   └── mock-auth.ts                # Auth hook wrapper
├── supabase/
│   ├── MASTER-MIGRATION.sql        # Idempotent DB schema
│   └── schema.sql
└── proxy.ts                        # Next.js 16 middleware (route protection)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/agora-cy.git
cd agora-cy

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Fill in your credentials (see Environment Variables below)

# Run database migration
# → Go to Supabase Dashboard → SQL Editor
# → Paste & run: supabase/MASTER-MIGRATION.sql

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

Create `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Admin
ADMIN_SECRET=your-very-secret-admin-key-here
NEXT_PUBLIC_ADMIN_SECRET=your-very-secret-admin-key-here

# App
NEXT_PUBLIC_APP_URL=https://agora.cy
```

> ⚠️ **NEVER commit `.env.local` to git** — it's in `.gitignore`

---

## 🗄️ Database Schema

Run `supabase/MASTER-MIGRATION.sql` in the Supabase SQL Editor.

### Main Tables
| Table | Description |
|-------|-------------|
| `profiles` | User profiles (IBAN, location, avatar) |
| `listings` | Marketplace listings |
| `orders` | Transactions with escrow status |
| `disputes` | Dispute records |
| `ratings` | Post-transaction ratings |
| `messages` | Real-time messaging |

### Order Statuses
| Status | Meaning |
|--------|---------|
| `paid` | Buyer paid, awaiting seller shipment |
| `shipped` | Seller marked as shipped |
| `delivered` | Buyer confirmed receipt → payout triggered |
| `disputed` | Under dispute, escrow frozen |
| `cancelled` | Cancelled |

---

## 👨‍💼 Admin Dashboard

Access at `/admin/payouts` with the `ADMIN_SECRET` key.

**Features:**
- View all pending IBAN payouts
- Copy IBAN with one click
- Mark as paid (with SEPA reference note)
- View completed payouts history
- See all open disputes

---

## 🧪 Testing

```bash
# TypeScript check
npx tsc --noEmit

# Production build
npm run build

# All 22 routes tested and passing ✅
```

**Audit Results (20/04/2026):**
- ✅ TypeScript: 0 errors
- ✅ Build: Exit code 0
- ✅ 22/22 route tests passed
- ✅ Admin security: 401 unauthorized, 200 authorized

---

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Homepage — Hero, categories, latest listings |
| `/listings` | All listings with search & filters |
| `/listings/new` | Create listing (login required) |
| `/listings/[id]` | Listing detail + buy button |
| `/profile/me` | My profile, orders, earnings, disputes |
| `/profile/[id]` | Public user profile |
| `/admin/payouts` | Admin payout dashboard |
| `/how-it-works` | How Agora.cy works |
| `/safety` | Safety tips |
| `/contact` | Contact info |
| `/gdpr` | GDPR & Privacy |
| `/terms` | Terms of Service |
| `/messages` | Messaging inbox |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Payments | Stripe (Checkout + Webhooks) |
| Storage | Supabase Storage (listing images) |
| Styling | Vanilla CSS (custom design system) |
| Icons | Lucide React |
| Hosting | Vercel (recommended) |

---


## 📄 License

Private — All rights reserved © 2026 Agora.cy
