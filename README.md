# ⚡ OmniSaaS — Universal Multi-Tenant Business Operating System

> **Platform Showcase & 5-Min Onboarding**: [https://raviattrash-pro.github.io/OmniSaaS/](https://raviattrash-pro.github.io/OmniSaaS/)  
> **Super Admin Verification Hub**: [https://raviattrash-pro.github.io/OmniSaaS/admin.html](https://raviattrash-pro.github.io/OmniSaaS/admin.html) *(Protected via SHA-256 Encrypted Master Security)*  
> **Architecture**: 100% Decoupled Static Portals (HTML5/CSS3/ES6+) with Real-Time Google Sheets Cloud Database Sync & Zero-Commission UPI Payments.

---

## 🌟 Decoupled Dedicated Standalone App Portals

Each business vertical runs as an **isolated, standalone web portal** with clean URLs, Google Authentication, 256-bit SHA-256 encrypted owner logins, and zero demo bar clutter:

| Dedicated Portal | Live App URL | Key Features |
| :--- | :--- | :--- |
| 🎓 **School & College OS** | [`/school/`](https://raviattrash-pro.github.io/OmniSaaS/school/) | 4-Step Student Admission Wizard, Dynamic Fee Invoicing with Instant UPI Receipts, Digital Student ID Card Maker |
| 🚚 **MOVE-X Freight Logistics** | [`/movex/`](https://raviattrash-pro.github.io/OmniSaaS/movex/) | Fleet Booking (Tata Ace to 32ft Container), Live Distance Fare Calculator, 15% Return-Load Saver, OTP Proof-of-Delivery |
| 🏨 **Hotel & Resort Reservations** | [`/hotel/`](https://raviattrash-pro.github.io/OmniSaaS/hotel/) | Luxury Room & Suite Selection, Table/Slot Bookings, Printable Verified Booking Vouchers, Guest Ledger |
| 🍔 **Restaurant & Dining Food Ordering** | [`/food/`](https://raviattrash-pro.github.io/OmniSaaS/food/) | Contactless Visual Digital Menu, Table QR Dine-In & Takeaway Cart, Kitchen Order Ticket (KOT) Dispatch |
| 🛍️ **Quick-Commerce Retail Store** | [`/store/`](https://raviattrash-pro.github.io/OmniSaaS/store/) | Fast Product Catalog, Slide-Out Cart with Promo Codes (`WELCOME10`), Direct Merchant UPI Invoices |

```
                              ┌────────────────────────────────────────────────────────┐
                              │ Platform Host: https://raviattrash-pro.github.io/      │
                              └────────────────────────────────────────────────────────┘
                                           │                                │
             ┌─────────────────────────────┼────────────────────────────┐   │
             ▼                             ▼                            ▼   ▼
 ┌───────────────────────┐   ┌───────────────────────┐   ┌───────────────────────────────┐
 │ Dedicated School App  │   │ Dedicated MOVE-X App  │   │ Super Admin Verification Hub  │
 │ OmniSaaS/school/      │   │ OmniSaaS/movex/       │   │ OmniSaaS/admin.html           │
 │                       │   │                       │   │                               │
 │ • Online Admissions   │   │ • Fleet & Cargo Book  │   │ • Review Incoming Apps        │
 │ • Zero-Fee UPI Receipts│  │ • Fare Distance Calc  │   │ • 1-Click Verify & Activate   │
 │ • Digital Student ID  │   │ • 4-Digit OTP POD     │   │ • Encrypted Password Guard    │
 │ • Google Sheet Sync   │   │ • Google Sheet Sync   │   │ • Cross-Vendor Ledger Metrics │
 └───────────────────────┘   └───────────────────────┘   └───────────────────────────────┘
```

---

## ⚡ 5-Minute Self-Service Business Onboarding Pipeline

Business owners can register and launch their dedicated application in 5 minutes via the platform landing page ([`index.html`](https://raviattrash-pro.github.io/OmniSaaS/)):

```
┌─────────────────┐     ┌─────────────────────┐     ┌────────────────────────┐     ┌──────────────────────┐
│ 1. Choose       │ ──► │ 2. Owner Contact &  │ ──► │ 3. Custom Services &   │ ──► │ 4. Merchant UPI ID & │
│ Category        │     │ Business Info       │     │ Dynamic Pricing        │     │ Standee QR Upload    │
└─────────────────┘     └─────────────────────┘     └────────────────────────┘     └──────────────────────┘
                                                                                              │
                                                                                              ▼
┌────────────────────────────────┐     ┌────────────────────────────────┐     ┌──────────────────────┐
│ 6. App Activated & LIVE!       │ ◄── │ 5. Super Admin Review &        │ ◄── │ Generates Request ID │
│ Dedicated URL + Owner ID       │     │ Instant 1-Click Verification   │     │ (e.g. REQ-2026-XXXX) │
└────────────────────────────────┘     └────────────────────────────────┘     └──────────────────────┘
```

1. **Category Selection:** School, Logistics, Hotel, Restaurant, or Retail Store.
2. **Business & Owner Details:** Institution Name, Owner Name, Contact WhatsApp/Phone, Email, City.
3. **Owner Password Security:** Password is encrypted client-side with 256-bit SHA-256 before leaving the browser.
4. **Custom Services & Pricing Builder:** Dynamic repeater allowing the owner to add their custom services, fee grades, or menu items with prices.
5. **Zero-Fee UPI Setup:** Enter Merchant UPI ID + upload Standee QR image with automatic canvas compression.
6. **Submission & Tracking:** Generates a unique tracking ticket (`REQ-2026-XXXX`), saves to pending intake queue, and dispatches to Google Apps Script webhook.
7. **Application Status Tracker:** Built-in status tracker allows applicants to enter their Request ID or Phone to verify whether their app is `In Review` or `Verified & Live`.

---

## 🔐 Super Admin Verification & Approval Hub

- **URL:** [`admin.html`](https://raviattrash-pro.github.io/OmniSaaS/admin.html)
- **Security:** 256-bit SHA-256 cryptographic master password & customizable PIN.
- **Intake Review Queue:**
  - **"📋 Pending Verifications" Tab:** Displays incoming applications with contact details, pricing catalog, UPI ID, and QR code thumbnail.
  - **"✅ Verify & Activate App":** 1-click action that creates the tenant profile, saves custom services, sets status to `approved`, generates their dedicated URL (`school/?biz=slug`), and provides a 1-tap WhatsApp message to send to the owner.
  - **"❌ Reject Request":** Allows the administrator to reject or request corrections with notes.
  - **"👁️ Live Preview":** Instantly tests the dedicated live app.

---

## 🏛️ Software Architecture & Design Patterns

The entire platform is architected adhering strictly to **SOLID Principles** and standard **GoF Design Patterns**:

| Pattern / Principle | Purpose & Implementation |
| :--- | :--- |
| **Single Responsibility (SRP)** | Isolated UI modules (`school/`, `movex/`, `hotel/`, `food/`, `store/`), intake controller (`OmniLauncher`), and verification dashboard (`AdminDashboard`). |
| **Open/Closed (OCP)** | New verticals can be added without modifying existing module core logic. |
| **Builder Pattern** | `OmniLauncher.submitApplication()` step-by-step builds structured onboarding entities. |
| **Factory Method** | Dynamic tenant profile and vertical module instantiation based on URL query or folder route. |
| **Facade Pattern** | `UniversalApp` and `OmniLauncher` provide clean APIs abstracting DOM manipulation, audio synthesis, toasts, and webhooks. |
| **Proxy / Decorator** | `CryptoSecurity.hashPassword()` and `SecurityGuard.escapeHTML()` intercept and sanitize all user input before storage or rendering. |
| **State Pattern** | Business onboarding requests transition cleanly: `pending_verification` ➔ `approved` / `rejected`. |
| **Observer Pattern** | Reactive badge counters and live UI queues update on intake and verification state changes. |

---

## 🛡️ Enterprise Security Hardening

- **SHA-256 Cryptographic Passwords:** Business Owner and Super Admin passwords are encrypted using Web Crypto API SHA-256 with pure JS fallback. No plaintext passwords in storage.
- **Token Bucket Rate Limiting:** 15 requests/min protection on all forms, webhook dispatches, and promo codes.
- **Strict XSS Defense:** Strict HTML entity encoding and attribute neutralization prevents script injection.
- **Circuit Breaker & Offline Queue:** Transactions and registrations are safely saved locally during network drops and auto-synced upon reconnect.
- **Zero Sensitive Data:** Zero direct spreadsheet URLs, default PINs, or private keys exposed in documentation.

---

## 🚀 Quick Start & Development

1. **Clone Repository:**
   ```bash
   git clone https://github.com/raviattrash-pro/OmniSaaS.git
   cd OmniSaaS
   ```

2. **Run Locally:**
   Open `index.html` directly in any modern browser or run a local static server:
   ```bash
   npx serve .
   ```

3. **Deploy to GitHub Pages:**
   Push changes to the `main` branch:
   ```bash
   git add .
   git commit -m "feat: Updates"
   git push origin main
   ```
   GitHub Pages automatically hosts the updated portals within 60 seconds!

---

## 📄 License & Attribution

© 2026 OmniSaaS Enterprise &bull; Universal Multi-Tenant Business Platform. All Rights Reserved.
