# ⚡ OmniSaaS — Universal Multi-Business Operating System & Rapid Onboarding Engine

> **Live Platform URL**: [https://raviattrash-pro.github.io/OmniSaaS/](https://raviattrash-pro.github.io/OmniSaaS/)  
> **Dedicated Admin Portal**: [https://raviattrash-pro.github.io/OmniSaaS/admin/](https://raviattrash-pro.github.io/OmniSaaS/admin/) *(Protected via SHA-256 Encrypted Master Security)*  
> **Zero-Backend Architecture**: 100% Static HTML5, CSS3 & Vanilla JavaScript hosted on GitHub Pages with Google Sheets Cloud Database Sync.

---

## 🌟 The OmniSaaS Advantage

OmniSaaS allows you to launch custom-branded, enterprise-grade digital portals for **any business in under 5 minutes**. 

Every business onboarded receives its **own dedicated GitHub Pages URL named directly after the business** (e.g. `https://raviattrash-pro.github.io/dps-school/` or `https://raviattrash-pro.github.io/OmniSaaS/?slug=dps-school`), with their own dedicated sheet tab inside their vertical's Google Sheet!

```
                        ┌────────────────────────────────────────────────────────┐
                        │ GitHub Pages Host: https://raviattrash-pro.github.io/  │
                        └────────────────────────────────────────────────────────┘
                                     │                                  │
       ┌─────────────────────────────┴────────────┐                     │
       ▼                                          ▼                     ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│  Delhi Public School Portal  │ │ Grand Oberoi Palace & Suites │ │ Agency Master Admin Console  │
│  https://raviattrash-pro.    │ │ https://raviattrash-pro.    │ │ https://raviattrash-pro.    │
│  github.io/dps-school/       │ │ github.io/grand-oberoi/      │ │ github.io/OmniSaaS/admin/    │
│                              │ │                              │ │                              │
│ • Locked school branding     │ │ • Locked hotel branding      │ │ • Encrypted Access Guard     │
│ • Student Admissions & Fees  │ │ • Room Reservations & Dining │ │ • 5-Minute Rapid Onboarder   │
│ • Direct merchant UPI        │ │ • Direct merchant UPI        │ │ • 1-Click GitHub Deployer    │
│ • Dedicated Sheet Tab        │ │ • Dedicated Sheet Tab        │ │ • Cross-Vendor Ledger Feed   │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 📊 Cloud Database & Google Sheets Integration

Each vertical routes transactions and registrations securely via Google Apps Script webhooks, automatically organizing data into **dedicated business tabs**:

| Business Vertical | Cloud Database Routing | Status |
|:---|:---|:---|
| 🎓 **School / College Admissions & Fees** | Secure Google Sheets Webhook Routing | 🟢 Connected |
| 🚚 **MOVE-X Freight Logistics Ledger** | Secure Google Sheets Webhook Routing | 🟢 Connected |
| 🛍️ **Ecommerce Retail Store Orders** | Secure Google Sheets Webhook Routing | 🟢 Connected |
| 🏨 **Hotel & Resort Reservations** | Secure Google Sheets Webhook Routing | 🟢 Connected |
| 🍲 **Restaurant & Food Orders** | Secure Google Sheets Webhook Routing | 🟢 Connected |

> 💡 **Multi-Business Tab Automation**: When onboarding multiple schools or businesses (e.g. DPS, St. Xaviers, Cambridge High), each business automatically receives its own cleanly separated tab with all transactions, student profiles, and fee receipts organized independently.

---

## ⚡ 5 Supported Business Verticals

1. 🎓 **Student Management & Admissions System**:
   - Online admissions application with auto Reference ID generation
   - Fee payment portal with dynamic UPI QR standee and printable receipt slips
   - Student activity, sports & club enrollments
   - Real-time application & fee status lookup
2. 🚚 **MOVE-X Logistics & Vehicle Booking**:
   - On-demand fleet dispatch (Tata Ace, 3-Wheeler Cargo, 8ft Pickup, Cabs)
   - Transparent pricing: Base + Distance + Helpers/Stairs + 85% Guaranteed Driver Payout
   - Return-load pairing discount (15% Saver on recurring lanes)
   - Fraud prevention with 4-digit Delivery OTP and 5-minute brute-force lockout
3. 🏨 **Hotel & Resort Reservation Portal**:
   - Luxury suites, capacity indicators, check-in/out date pickers & instant reservation vouchers
4. 🍲 **Restaurant Food Ordering System**:
   - Gourmet menu categories, item customizations, and instant kitchen order tickets
5. 🛍️ **Quick Commerce & E-Commerce Store**:
   - Product catalog, category filters, slide-out shopping cart drawer & promo code engine

---

## 🔐 Standalone Admin Management Portal

- **URL**: `admin/index.html` or `admin.html`
- **Security**: Protected with SHA-256 cryptographic master password & customizable PIN
- **Features**:
  - **Cross-Vendor Revenue Engine**: Real-time aggregated platform volume across all schools, hotels, logistics, restaurants, and retail stores
  - **5-Minute Rapid Onboarder**: 5-step wizard with auto-slug generation, custom branding, UPI standee upload, and fee catalog configuration
  - **Vendor Roster with Dedicated URLs**: View every vendor's dedicated URL, test deep links, toggle active/suspended status, and export configs
  - **Cross-Vendor Unified Transaction Feed**: Live audit trail of all admissions, fee receipts, freight orders, and reservations across all client URLs
  - **Full Encrypted JSON Backups**: One-click export and import of all client configurations

---

## 🛡️ Enterprise Security Hardening

- **Token Bucket Rate Limiting**: 15 req/min protection on all forms, webhook dispatches, and promo codes.
- **XSS Sanitization**: Strict HTML escaping and attribute neutralization prevents script injection.
- **Circuit Breaker & Offline Queue**: Orders and payments are safely saved locally during network drops and auto-synced upon reconnect.
- **Spreadsheet Formula Injection Defense**: Neutralizes `=, +, -, @` formula payloads in Google Sheets and CSV exports.
- **OTP Brute-Force Lockout**: 5-minute lockout after 3 consecutive failed OTP attempts.

---

## 🚀 How to Deploy on GitHub Pages

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: OmniSaaS Multi-Business Platform"
   git branch -M main
   git remote add origin https://github.com/raviattrash-pro/OmniSaaS.git
   git push -u origin main
   ```
2. **Enable GitHub Pages**:
   - On GitHub, go to `Settings` ➔ `Pages`.
   - Under **Build and deployment** ➔ **Branch**, choose `main` ➔ `/ (root)` ➔ `Save`.
   - Your live platform is immediately available at `https://raviattrash-pro.github.io/OmniSaaS/`!
