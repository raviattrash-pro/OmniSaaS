# 🚀 GitHub Pages Hosting & Dedicated Business URLs Guide

This enterprise application is **100% static HTML5, CSS3, and Vanilla JavaScript with zero build steps**, making it ideal for high-speed, free hosting on **GitHub Pages**.

Every business onboarded receives its **own dedicated GitHub Pages URL named directly after the business** (e.g., `https://<username>.github.io/<business-slug>/`), while the agency admin manages all vendors from a **separate, password-protected admin URL**.

---

## 🏛️ Architecture Overview

```
                        ┌────────────────────────────────────────────────────────┐
                        │   GitHub Pages Host: https://<username>.github.io/    │
                        └────────────────────────────────────────────────────────┘
                                     │                                  │
       ┌─────────────────────────────┴────────────┐                     │
       ▼                                          ▼                     ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│  Delhi Public School Portal  │ │ Grand Oberoi Palace & Suites │ │ Agency Master Admin Console  │
│  https://<user>.github.io/   │ │ https://<user>.github.io/   │ │ https://<user>.github.io/    │
│  dps-school/                 │ │ grand-oberoi/                │ │ <repo>/admin/                │
│                              │ │                              │ │                              │
│ • Locked school branding     │ │ • Locked hotel branding      │ │ • Master PIN Protected       │
│ • Student Admissions & Fees  │ │ • Room Reservations & Dining │ │ • 5-Minute Rapid Onboarder   │
│ • Direct merchant UPI        │ │ • Direct merchant UPI        │ │ • 1-Click GitHub Deployer    │
│ • Google Sheets Sync         │ │ • Google Sheets Sync         │ │ • Cross-Vendor Ledger Feed   │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

---

## ⚡ Deployment Methods for Dedicated Business URLs

### Method 1: Dedicated Repository per Business (`https://<username>.github.io/<slug>/`)
Every business gets its own GitHub repository named with their business slug:

#### Option A: Direct 1-Click In-Browser Deploy (GitHub REST API)
1. Open Admin Console at `admin/index.html` (or `admin.html`).
2. Go to **⚙️ GitHub Deployer & Backups** (Tab 4).
3. Enter your **GitHub Username** and a **GitHub Personal Access Token (PAT)** with `repo` and `pages` scopes.
4. In the **⚡ 5-Minute Rapid Onboarder** (Tab 1), fill in the business details.
5. In Step 5, click **"🐙 1-Click Deploy to GitHub Pages (API)"**.
6. The dashboard automatically creates the repo `https://github.com/<username>/<slug>`, commits the tailored client `config.js`, and enables GitHub Pages!
7. The dedicated business URL is live in ~60 seconds: `https://<username>.github.io/<slug>/`.

#### Option B: Zero-Touch `deploy-<slug>.bat` Push (No API Token Needed)
1. In Step 5 of the Onboarder, click **"📜 Download deploy.bat"**.
2. Run `deploy-<slug>.bat` on your computer (double click).
3. The script automatically:
   - Stages all platform assets
   - Injects the tailored `config.js` locked to this vendor
   - Initializes git and pushes to `https://github.com/<username>/<slug>.git`
   - Enables GitHub Pages automatically (via GitHub CLI `gh` if installed, or standard git push)

---

### Method 2: Single Repository Deep-Slug Routing (`https://<username>.github.io/<repo>/<slug>/`)
If you prefer to host all businesses inside one master repository:

1. Push this project to your central repository:
   ```bash
   git init
   git add .
   git commit -m "Initial launch: OmniSaaS Multi-Vendor Platform"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```
2. Enable GitHub Pages:
   - Repository `Settings` ➔ `Pages`.
   - Branch: `main` ➔ `/ (root)` ➔ `Save`.
3. Client URLs:
   - Delhi Public School: `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/?slug=dps-school`
   - St. Xavier's: `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/?slug=st-xaviers`
   - Grand Oberoi: `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/?slug=grand-oberoi`
   - MOVE-X Logistics: `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/?slug=movex-logistics`
   - Spice Garden: `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/?slug=spice-garden`
   - QuickMart: `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/?slug=quickmart-store`

`404.html` and `URLQueryTenantEngine` automatically catch sub-slugs, look up the vendor profile, apply their custom theme colors, set the page title, lock out the demo selector, and load their real catalog!

---

## 🔐 Standalone Admin Management Portal

- **Dedicated Admin URL**:
  - `https://<YOUR_USERNAME>.github.io/<REPO_NAME>/admin/` (or `admin.html`)
- **Default Master PIN**: `1234`
- **Capabilities**:
  - **Cross-Vendor Revenue Engine**: Real-time aggregated gross volume across all schools, hotels, logistics, restaurants, and retail stores.
  - **5-Minute Rapid Onboarder**: 5-step wizard with auto-slug generation, custom branding, UPI standee upload, and fee catalog configuration.
  - **Vendor Roster with Dedicated URLs**: View every vendor's dedicated URL, test deep links, toggle active/suspended status, and export configs.
  - **Cross-Vendor Unified Transaction Feed**: Live audit trail of all admissions, fee receipts, freight orders, and reservations across all client URLs.
  - **Full Encrypted JSON Backups**: One-click export and import of all client configurations.

---

## 🛡️ Enterprise Security Compliance

- **Token Bucket Rate Limiter**: 15 req/min with strict backoff protection on all forms, webhook dispatches, and promo codes.
- **Strict HTML & Attribute Escaping**: `SecurityGuard.escapeHTML()` and `sanitizeAttr()` neutralize any XSS injections.
- **Circuit Breaker & Offline Queue**: Uninterrupted offline order logging with automatic re-sync upon connection recovery.
- **OTP Brute-Force Lockout**: Logistics verification automatically locks out for 5 minutes after 3 failed OTP attempts.
- **Client-Side Cryptographic Password Encryption**: `CryptoSecurity.hashPassword()` utilizes 256-bit SHA-256 cryptographic hashing for both Business Owners and Platform Super Admins, completely preventing plaintext password storage.
- **Spreadsheet Formula Injection Defense**: In `Code.gs` and CSV exports, all cells beginning with `=`, `+`, `-`, or `@` are stripped of injection vectors.
- **Frame-Busting & Clickjacking Defense**: Embedded frame-busting scripts prevent malicious framing.
