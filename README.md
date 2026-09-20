# ⚡ OmniSaaS — Universal Multi-Business Operating System & Rapid Onboarding Engine

> **Live Platform URL**: [https://raviattrash-pro.github.io/OmniSaaS/](https://raviattrash-pro.github.io/OmniSaaS/)  
> **Dedicated Admin Portal**: [https://raviattrash-pro.github.io/OmniSaaS/admin/](https://raviattrash-pro.github.io/OmniSaaS/admin/) *(PIN: 1234)*  
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
│ • Locked school branding     │ │ • Locked hotel branding      │ │ • Master PIN Protected       │
│ • Student Admissions & Fees  │ │ • Room Reservations & Dining │ │ • 5-Minute Rapid Onboarder   │
│ • Direct merchant UPI        │ │ • Direct merchant UPI        │ │ • 1-Click GitHub Deployer    │
│ • Dedicated Sheet Tab        │ │ • Dedicated Sheet Tab        │ │ • Cross-Vendor Ledger Feed   │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

---

## 📊 Pre-Mapped Google Sheets Databases

Each vertical routes transactions and registrations to its own master Google Spreadsheet, and automatically creates a **separate, dedicated tab for each business**:

| Business Vertical | Official Connected Google Sheet |
|:---|:---|
| 🎓 **School / College Admissions & Fees** | [Open School Sheet](https://docs.google.com/spreadsheets/d/1z1K_O8vl9ftwTlJmnLMzLrjC5V7sfhEMbToWjPuCL-w/edit?usp=sharing) |
| 🚚 **MOVE-X Freight Logistics Ledger** | [Open MoveX Sheet](https://docs.google.com/spreadsheets/d/1Mnb-CnvAhb8bTr5dulfzHZTEoD1rs2BbwgwkGKZxnnY/edit?usp=sharing) |
| 🛍️ **Ecommerce Retail Store Orders** | [Open Ecommerce Sheet](https://docs.google.com/spreadsheets/d/1G1Z3GKyzP9Y_s8av1GSHj1UKwctlwhLuvW9L8FO0zGk/edit?usp=sharing) |
| 🏨 **Hotel & Resort Reservations** | [Open Hotel Sheet](https://docs.google.com/spreadsheets/d/1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k/edit?usp=sharing) |
| 🍲 **Restaurant & Food Orders** | [Open Food Sheet](https://docs.google.com/spreadsheets/d/1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k/edit?usp=sharing) |

> 💡 **Multi-Business Tab Automation**: When you onboard 5 different schools (e.g. DPS, St. Xaviers, Cambridge High), each school gets its own cleanly separated tab with all its students, admissions, and fee payments organized independently.

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
- **Default Master PIN**: `1234`
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
