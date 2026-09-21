/**
 * Enterprise Multi-Vendor Admin Dashboard Controller
 * -------------------------------------------------------------
 * Provides agency/admin owners complete control:
 * - 5-Minute Rapid Guided Vendor Onboarder (School, Hotel, MoveX, Restaurant, Retail)
 * - Auto-Slug Generation & Dedicated Business GitHub Pages URLs
 * - Direct 1-Click GitHub API Deployment & Pages Automation
 * - Zero-Touch deploy-<slug>.bat Script Generator for Instant Push
 * - Multi-Vendor Roster Management with Dedicated URL Previews
 * - Cross-Vendor Aggregate Metrics & Revenue Engine
 * - Direct Client WhatsApp Welcome Dispatch
 * - 1-Click config.js Generator for isolated GitHub repo hosting
 * - Cross-Vendor Unified Audit Trail & Activity Feed
 * - Full JSON Backup & Restore
 */

const AdminDashboard = {
  activeTab: 'wizard', // 'wizard' | 'roster' | 'activity' | 'backup'
  currentStep: 1,
  wizardData: {
    vertical: 'student_management',
    businessName: '',
    slug: '',
    tagline: '',
    logoIcon: '🎓',
    themeColor: '#1e3a8a',
    accentColor: '#f59e0b',
    currency: '₹',
    upiId: '',
    whatsappNumber: '',
    googleScriptUrl: 'https://script.google.com/macros/s/AKfycbwwN9X-FoeMqef1wY2k3pyISpmNU7Svg-Qr_TXcUZTGgXCJCyoy34f4_CJvaRXFLRGD/exec',
    customLogoData: '',
    customQrData: '',
    catalogItems: []
  },
  editingVendorId: null,

  // =========================================================================
  // 🔐 AUTHENTICATION GATE (PIN / PASSWORD PROTECTED)
  // =========================================================================
  init() {
    this.checkAuth();
    this.loadGitHubConfigInputs();
    this.loadGoogleVerification();
    this.loadMetrics();
    this.updatePendingCountBadge();
    this.renderVerificationQueue();
    this.renderRoster();
    this.renderIndexingUrlsTable();
    this.initWizardDefaults('student_management');

    // Real-time cross-tab synchronization
    window.addEventListener('storage', (e) => {
      if (e.key === 'pending_business_requests' || e.key === 'saved_client_profiles') {
        this.updatePendingCountBadge();
        this.renderVerificationQueue();
        this.renderRoster();
        this.loadMetrics();
      }
    });
  },

  checkAuth() {
    const isAuthed = sessionStorage.getItem('admin_authenticated') === 'true';
    const overlay = document.getElementById('admin-login-overlay');
    if (overlay) {
      overlay.style.display = isAuthed ? 'none' : 'flex';
    }
  },

  async handleLogin(e) {
    e.preventDefault();
    const pinInput = document.getElementById('admin_pin_input');
    const pin = pinInput.value.trim();
    const savedHash = localStorage.getItem('admin_master_pin_hash');
    const legacyPin = localStorage.getItem('admin_master_pin') || '1234';

    const isValid = await CryptoSecurity.verifyPassword(pin, savedHash || legacyPin, '1234');

    if (isValid) {
      // Transparently upgrade to encrypted SHA-256 hash if not yet hashed
      if (!savedHash) {
        const hash = await CryptoSecurity.hashPassword(pin);
        localStorage.setItem('admin_master_pin_hash', hash);
        localStorage.removeItem('admin_master_pin');
      }

      sessionStorage.setItem('admin_authenticated', 'true');
      document.getElementById('admin-login-overlay').style.display = 'none';
      this.loadMetrics();
      this.showToast('✅ Welcome to Admin Control Center', 'success');
    } else {
      const errEl = document.getElementById('login_error_msg');
      if (errEl) {
        errEl.innerText = '❌ Incorrect Master Password / PIN. (Default is 1234)';
        errEl.style.display = 'block';
      }
    }
  },

  openChangePasswordModal() {
    const existing = document.getElementById('admin-password-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'admin-modal-overlay';
    overlay.id = 'admin-password-modal';
    overlay.innerHTML = `
      <div class="admin-modal-card">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 14px;">
          <span style="font-size: 30px;">🔑</span>
          <div>
            <h3 style="font-size: 16px; font-weight: 900; margin: 0; color: var(--admin-text-main);">Change Master Admin Password</h3>
            <p style="font-size: 12px; color: var(--admin-text-muted); margin: 2px 0 0 0;">Secured with SHA-256 cryptographic encryption.</p>
          </div>
        </div>
        
        <form onsubmit="AdminDashboard.handleAdminPasswordChange(event)">
          <div class="admin-form-group" style="margin-bottom: 12px;">
            <label>Current Master Password / PIN *</label>
            <input type="password" id="admin_curr_pin" class="admin-input" required placeholder="Enter current PIN / Password (default: 1234)" />
          </div>
          
          <div class="admin-form-group" style="margin-bottom: 12px;">
            <label>New Master Password (Min. 4 Characters) *</label>
            <input type="password" id="admin_new_pin" class="admin-input" required minlength="4" placeholder="Enter new Master PIN or Password" />
          </div>
          
          <div class="admin-form-group" style="margin-bottom: 18px;">
            <label>Confirm New Password *</label>
            <input type="password" id="admin_conf_pin" class="admin-input" required minlength="4" placeholder="Re-type new Master PIN or Password" />
          </div>
          
          <div style="display: flex; gap: 10px;">
            <button type="submit" class="btn-admin btn-admin-primary" style="flex: 1; padding: 10px; font-weight: 800;">
              🔒 Encrypt & Save Admin Password
            </button>
            <button type="button" class="btn-admin btn-admin-outline" onclick="document.getElementById('admin-password-modal').remove()">
              Cancel
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  async handleAdminPasswordChange(e) {
    if (e && e.preventDefault) e.preventDefault();
    const curr = document.getElementById('admin_curr_pin').value.trim();
    const newPin = document.getElementById('admin_new_pin').value.trim();
    const confPin = document.getElementById('admin_conf_pin').value.trim();

    if (!curr || !newPin || !confPin) {
      this.showToast('⚠️ Please fill out all password fields.', 'error');
      return;
    }
    if (newPin.length < 4) {
      this.showToast('⚠️ New password must be at least 4 characters.', 'error');
      return;
    }
    if (newPin !== confPin) {
      this.showToast('❌ New password and confirmation do not match.', 'error');
      return;
    }

    const savedHash = localStorage.getItem('admin_master_pin_hash');
    const legacyPin = localStorage.getItem('admin_master_pin') || '1234';
    const isValid = await CryptoSecurity.verifyPassword(curr, savedHash || legacyPin, '1234');

    if (!isValid) {
      this.showToast('❌ Current master password is incorrect.', 'error');
      return;
    }

    const newHash = await CryptoSecurity.hashPassword(newPin);
    localStorage.setItem('admin_master_pin_hash', newHash);
    localStorage.removeItem('admin_master_pin');

    const modal = document.getElementById('admin-password-modal');
    if (modal) modal.remove();

    this.showToast('🔒 Master Admin Password encrypted & updated successfully!', 'success');
  },

  logout() {
    sessionStorage.removeItem('admin_authenticated');
    window.location.reload();
  },

  // =========================================================================
  // 🌐 SLUG GENERATION & DEDICATED GITHUB PAGES URL ENGINE
  // =========================================================================
  slugify(text) {
    if (!text) return 'my-business';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')     // Remove invalid chars
      .replace(/[\s_]+/g, '-')          // Replace spaces and underscores with -
      .replace(/-+/g, '-')              // Replace multiple - with single -
      .replace(/^-+|-+$/g, '') || 'my-business'; // Trim leading/trailing -
  },

  getGitHubConfig() {
    let username = localStorage.getItem('admin_github_username') || 'raviattrash-pro';
    if (window.location.hostname.endsWith('.github.io')) {
      username = window.location.hostname.replace('.github.io', '');
    }
    return {
      username: username,
      repo: 'OmniSaaS',
      token: localStorage.getItem('admin_github_token') || ''
    };
  },

  saveGitHubConfig() {
    const userEl = document.getElementById('cfg_github_username');
    const tokenEl = document.getElementById('cfg_github_token');
    if (userEl) localStorage.setItem('admin_github_username', userEl.value.trim());
    if (tokenEl) localStorage.setItem('admin_github_token', tokenEl.value.trim());
    this.updateUrlPreview();
  },

  loadGitHubConfigInputs() {
    const cfg = this.getGitHubConfig();
    const userEl = document.getElementById('cfg_github_username');
    const tokenEl = document.getElementById('cfg_github_token');
    if (userEl && !userEl.value) userEl.value = cfg.username;
    if (tokenEl && cfg.token) tokenEl.value = cfg.token;
  },

  openGitHubSettings() {
    this.switchTab('backup');
    const userEl = document.getElementById('cfg_github_username');
    if (userEl) userEl.focus();
  },

  getDedicatedBusinessUrl(slug) {
    const cleanSlug = this.slugify(slug || this.wizardData.slug || 'my-business');
    const { username } = this.getGitHubConfig();
    return `https://${username}.github.io/${cleanSlug}/`;
  },

  getDeepLaunchUrl(slug, vertical = 'student_management') {
    const cleanSlug = this.slugify(slug || this.wizardData.slug || 'my-business');
    const folder = vertical === 'student_management' ? 'school' :
                   vertical === 'movex_booking' ? 'movex' :
                   vertical === 'hotel_booking' ? 'hotel' :
                   vertical === 'food_order' ? 'food' : 'store';
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:');
    if (isLocal) {
      return `${folder}/index.html?biz=${cleanSlug}`;
    }
    const basePath = window.location.pathname.includes('/OmniSaaS') ? '/OmniSaaS' : '';
    return `${window.location.origin}${basePath}/${folder}/?biz=${cleanSlug}`;
  },

  onBusinessNameInput(name) {
    this.wizardData.businessName = name;
    const slugInput = document.getElementById('wiz_slug');
    if (slugInput) {
      slugInput.value = this.slugify(name);
      this.wizardData.slug = slugInput.value;
    }
    this.updateUrlPreview();
  },

  updateUrlPreview() {
    const slugInput = document.getElementById('wiz_slug');
    const slug = slugInput ? this.slugify(slugInput.value) : (this.wizardData.slug || 'my-business');
    const previewEl = document.getElementById('wiz_slug_preview');
    const dedicatedUrl = this.getDedicatedBusinessUrl(slug);
    if (previewEl) {
      previewEl.innerHTML = `🌐 <strong>Dedicated URL:</strong> <span style="color: var(--admin-accent); word-break: break-all;">${dedicatedUrl}</span>`;
    }
  },

  // =========================================================================
  // 📊 CROSS-VENDOR AGGREGATE METRICS ENGINE
  // =========================================================================
  loadMetrics() {
    const profiles = this.getSavedProfiles();
    const activeCount = profiles.filter(p => p.status !== 'suspended').length;
    const suspendedCount = profiles.filter(p => p.status === 'suspended').length;

    // Calculate aggregated revenue across all vertical databases
    const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
    const movex = JSON.parse(localStorage.getItem('movex_ledger') || '[]');
    const hotels = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
    const orders = JSON.parse(localStorage.getItem('store_orders') || '[]');
    const admissions = JSON.parse(localStorage.getItem('student_admissions') || '[]');

    const feeRev = fees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    const movexRev = movex.reduce((sum, m) => sum + (Number(m.finalFare) || 0), 0);
    const hotelRev = hotels.reduce((sum, h) => sum + (Number(h.totalFare) || 0), 0);
    const orderRev = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalRev = feeRev + movexRev + hotelRev + orderRev;

    const totalTx = fees.length + movex.length + hotels.length + orders.length + admissions.length;

    // Update Metric DOM Elements
    const elVendors = document.getElementById('metric_total_vendors');
    const elActive = document.getElementById('metric_active_vendors');
    const elRev = document.getElementById('metric_total_revenue');
    const elTx = document.getElementById('metric_total_tx');

    if (elVendors) elVendors.innerText = profiles.length;
    if (elActive) elActive.innerText = `${activeCount} Active (${suspendedCount} Paused)`;
    if (elRev) elRev.innerText = `₹${totalRev.toLocaleString()}`;
    if (elTx) elTx.innerText = totalTx.toLocaleString();
  },

  getSavedProfiles() {
    const configGlobal = (window.MASTER_CONFIG && Array.isArray(window.MASTER_CONFIG.vendorProfiles)) ? window.MASTER_CONFIG.vendorProfiles : [];
    const saved = localStorage.getItem('saved_client_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          for (const bp of configGlobal) {
            if (!merged.some(p => p.id === bp.id || (p.slug && bp.slug && p.slug.toLowerCase() === bp.slug.toLowerCase()))) {
              merged.push(bp);
            }
          }
          // Guarantee every profile has a dedicated slug
          let updated = false;
          merged.forEach(p => {
            if (!p.slug) {
              p.slug = this.slugify(p.businessName || p.id);
              updated = true;
            }
          });
          if (updated) localStorage.setItem('saved_client_profiles', JSON.stringify(merged));
          return merged;
        }
      } catch (e) {
        console.error('Failed to parse saved_client_profiles', e);
      }
    }

    // Default pre-seeded enterprise profiles with dedicated slugs
    const defaults = [
      {
        id: "profile_dps",
        slug: "dps-school",
        businessName: "Delhi Public School (DPS)",
        vertical: "student_management",
        tagline: "Excellence in K-12 Education & Online Fee Portal",
        logoIcon: "🏛️",
        themeColor: "#047857",
        accentColor: "#f59e0b",
        currency: "₹",
        upiId: "payments@dpsdelhi.edu",
        whatsappNumber: "+919811223344",
        googleScriptUrl: "",
        isProductionClientMode: true,
        status: "active",
        createdAt: "2026-01-10T10:00:00Z"
      },
      {
        id: "profile_stxaviers",
        slug: "st-xaviers",
        businessName: "St. Xavier's International Collegiate",
        vertical: "student_management",
        tagline: "Admissions 2026-27 & Digital Student Portal",
        logoIcon: "🎓",
        themeColor: "#1e3a8a",
        accentColor: "#38bdf8",
        currency: "₹",
        upiId: "admissions@stxaviers.edu",
        whatsappNumber: "+919876543210",
        googleScriptUrl: "",
        isProductionClientMode: true,
        status: "active",
        createdAt: "2026-01-15T12:00:00Z"
      },
      {
        id: "profile_oberoi",
        slug: "grand-oberoi",
        businessName: "The Grand Oberoi Palace & Suites",
        vertical: "hotel_booking",
        tagline: "5-Star Heritage Hospitality & Dining Reservations",
        logoIcon: "🏨",
        themeColor: "#831843",
        accentColor: "#f59e0b",
        currency: "₹",
        upiId: "reservations@oberoipalace.com",
        whatsappNumber: "+919810011223",
        googleScriptUrl: "",
        isProductionClientMode: true,
        status: "active",
        createdAt: "2026-02-01T15:00:00Z"
      },
      {
        id: "profile_movex",
        slug: "movex-logistics",
        businessName: "MOVE-X Intra-City Freight Lines",
        vertical: "movex_booking",
        tagline: "On-Demand Commercial Vehicle Logistics Platform",
        logoIcon: "🚚",
        themeColor: "#0284c7",
        accentColor: "#10b981",
        currency: "₹",
        upiId: "billing@movexlogistics.in",
        whatsappNumber: "+919988776655",
        googleScriptUrl: "",
        isProductionClientMode: true,
        status: "active",
        createdAt: "2026-02-10T16:00:00Z"
      },
      {
        id: "profile_spice",
        slug: "spice-garden",
        businessName: "Spice Garden Fine Indian Cuisine",
        vertical: "food_order",
        tagline: "Artisanal Curries, Tandoor & Fast Express Delivery",
        logoIcon: "🍔",
        themeColor: "#b91c1c",
        accentColor: "#f59e0b",
        currency: "₹",
        upiId: "orders@spicegarden.food",
        whatsappNumber: "+919711223344",
        googleScriptUrl: "",
        isProductionClientMode: true,
        status: "active",
        createdAt: "2026-02-18T18:00:00Z"
      },
      {
        id: "profile_quickmart",
        slug: "quickmart-store",
        businessName: "QuickMart Instant Supermarket",
        vertical: "ecommerce",
        tagline: "Fresh Groceries & Daily Needs Delivered in 15 Mins",
        logoIcon: "🛍️",
        themeColor: "#4f46e5",
        accentColor: "#ec4899",
        currency: "₹",
        upiId: "payments@quickmart.store",
        whatsappNumber: "+919655443322",
        googleScriptUrl: "",
        isProductionClientMode: true,
        status: "active",
        createdAt: "2026-03-01T20:00:00Z"
      }
    ];

    localStorage.setItem('saved_client_profiles', JSON.stringify(defaults));
    return defaults;
  },

  // =========================================================================
  // 📋 SELF-SERVICE VERIFICATION & APPROVAL ENGINE
  // =========================================================================
  updatePendingCountBadge() {
    const list = JSON.parse(localStorage.getItem('pending_business_requests') || '[]');
    const pendingCount = list.filter(r => r.status === 'pending_verification').length;
    const badge = document.getElementById('badge_pending_count');
    if (badge) {
      badge.innerText = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
    }
  },

  renderVerificationQueue() {
    this.updatePendingCountBadge();
    const container = document.getElementById('verification_queue_container');
    if (!container) return;

    const list = JSON.parse(localStorage.getItem('pending_business_requests') || '[]');
    if (list.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 48px 20px; color: var(--admin-text-muted); background: var(--admin-card-bg); border-radius: 12px; border: 1px dashed var(--admin-border);">
          <div style="font-size: 40px; margin-bottom: 8px;">📭</div>
          <h3 style="font-size: 16px; font-weight: 800; color: var(--admin-text-main); margin-bottom: 4px;">No Pending Business Applications</h3>
          <p style="font-size: 12px; max-width: 420px; margin: 0 auto 16px;">When business owners submit their application from the Platform Landing Page (index.html), they will appear here for review and instant 1-click activation.</p>
          <button class="btn-admin btn-admin-accent" style="font-size: 12px;" onclick="AdminDashboard.seedSampleRequest()">
            🧪 Load Demo Submission (Sample Intake)
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = list.map(req => {
      const isPending = req.status === 'pending_verification';
      const isApproved = req.status === 'approved';
      const isRejected = req.status === 'rejected';

      const statusBadge = isPending ?
        `<span style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid #f59e0b; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 999px;">🟡 PENDING REVIEW</span>` :
        (isApproved ?
          `<span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid #10b981; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 999px;">🟢 VERIFIED & LIVE</span>` :
          `<span style="background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid #ef4444; font-weight: 800; font-size: 11px; padding: 3px 10px; border-radius: 999px;">🔴 REJECTED</span>`);

      const vertIcon = req.vertical === 'student_management' ? '🎓 School' :
                       req.vertical === 'movex_booking' ? '🚚 Logistics' :
                       req.vertical === 'hotel_booking' ? '🏨 Hotel' :
                       req.vertical === 'food_order' ? '🍔 Restaurant' : '🛍️ Retail Store';

      const services = Array.isArray(req.services) ? req.services : [];
      const dedicatedLaunchUrl = this.getDeepLaunchUrl(req.slug, req.vertical);

      return `
        <div style="background: var(--admin-card-bg); border: 1.5px solid ${isPending ? 'var(--admin-primary)' : 'var(--admin-border)'}; border-radius: 14px; padding: 22px; margin-bottom: 20px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; border-bottom: 1px solid var(--admin-border); padding-bottom: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
                <h3 style="font-size: 18px; font-weight: 900; color: var(--admin-text-main); margin: 0;">${this.escapeHTML(req.businessName)}</h3>
                <span class="badge-slug" style="font-size: 11px;">/${this.escapeHTML(req.slug)}</span>
                <span style="font-size: 11px; background: var(--admin-primary-light); color: var(--admin-primary); padding: 2px 8px; border-radius: 4px; font-weight: 800;">${vertIcon}</span>
              </div>
              <div style="font-size: 12px; color: var(--admin-text-muted);">
                Tracking ID: <strong>${this.escapeHTML(req.requestId)}</strong> &bull; Submitted: ${new Date(req.timestamp).toLocaleString()}
              </div>
            </div>
            <div>
              ${statusBadge}
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-bottom: 18px;">
            <!-- Applicant Contact Details -->
            <div style="background: var(--admin-bg-secondary); border-radius: 8px; padding: 14px; font-size: 12px;">
              <strong style="color: var(--admin-primary); font-size: 13px; display: block; margin-bottom: 8px;">👤 Owner Contact & Identity</strong>
              <div style="margin-bottom: 4px;"><strong>Owner Name:</strong> ${this.escapeHTML(req.ownerName)}</div>
              <div style="margin-bottom: 4px;">
                <strong>Phone / WhatsApp:</strong>
                <a href="https://wa.me/${encodeURIComponent(req.phone.replace(/[^0-9]/g, ''))}" target="_blank" style="color: #10b981; font-weight: 700; text-decoration: underline; margin-left: 4px;">
                  📱 ${this.escapeHTML(req.phone)}
                </a>
              </div>
              <div style="margin-bottom: 4px;"><strong>Email:</strong> ${this.escapeHTML(req.email)}</div>
              <div style="margin-bottom: 4px;"><strong>Address:</strong> ${this.escapeHTML(req.address || 'N/A')}</div>
              <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--admin-border);">
                <strong>Assigned User ID:</strong> <code>${this.escapeHTML(req.ownerUserId || `owner_${req.slug}`)}</code>
              </div>
            </div>

            <!-- Payment & UPI Standee -->
            <div style="background: var(--admin-bg-secondary); border-radius: 8px; padding: 14px; font-size: 12px;">
              <strong style="color: #10b981; font-size: 13px; display: block; margin-bottom: 8px;">💳 Merchant UPI & Standee QR</strong>
              <div style="margin-bottom: 6px;"><strong>UPI ID:</strong> <code style="font-weight: 800; color: #10b981;">${this.escapeHTML(req.upiId)}</code></div>
              ${req.customQr ? `
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                  <img src="${req.customQr}" style="width: 50px; height: 50px; object-fit: contain; border-radius: 6px; border: 1px solid var(--admin-border); background: #fff;" />
                  <span style="font-size: 11px; color: var(--admin-text-muted);">Verified Merchant Standee QR Attached</span>
                </div>
              ` : `<div style="font-size: 11px; color: var(--admin-text-muted);">Standard UPI ID string provided</div>`}
            </div>

            <!-- Custom Services & Pricing Preview -->
            <div style="background: var(--admin-bg-secondary); border-radius: 8px; padding: 14px; font-size: 12px;">
              <strong style="color: #8b5cf6; font-size: 13px; display: block; margin-bottom: 8px;">🏷️ Custom Services & Catalog (${services.length})</strong>
              ${services.length === 0 ? `<div style="color: var(--admin-text-muted);">Standard vertical defaults will apply.</div>` : `
                <ul style="margin: 0; padding-left: 18px;">
                  ${services.map(s => `
                    <li style="margin-bottom: 3px;"><strong>${this.escapeHTML(s.title)}:</strong> ₹${Number(s.price).toLocaleString()} <span style="color: var(--admin-text-muted); font-size: 11px;">(${this.escapeHTML(s.description || 'Custom')})</span></li>
                  `).join('')}
                </ul>
              `}
            </div>
          </div>

          <!-- Actions Bar -->
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-top: 1px solid var(--admin-border); padding-top: 14px;">
            <div style="display: flex; gap: 8px;">
              <a href="${dedicatedLaunchUrl}" target="_blank" class="btn-admin btn-admin-outline" style="font-size: 12px; text-decoration: none;">
                👁️ Live App Preview
              </a>
            </div>

            <div style="display: flex; gap: 8px;">
              ${isPending ? `
                <button class="btn-admin btn-admin-danger" style="font-size: 12px;" onclick="AdminDashboard.rejectAppRequest('${this.escapeHTML(req.requestId)}')">
                  ❌ Reject
                </button>
                <button class="btn-admin btn-admin-primary" style="font-size: 13px; font-weight: 900; padding: 8px 18px;" onclick="AdminDashboard.verifyAndActivateApp('${this.escapeHTML(req.requestId)}')">
                  ✅ Verify & Activate App →
                </button>
              ` : (isApproved ? `
                <a href="https://wa.me/${encodeURIComponent(req.phone.replace(/[^0-9]/g, ''))}?text=${encodeURIComponent(`🎉 Great news! Your business app for ${req.businessName} has been verified and is LIVE!\n\n👉 Access your portal: ${dedicatedLaunchUrl}\n🔐 Owner User ID: ${req.ownerUserId || `owner_${req.slug}`}`)}" target="_blank" class="btn-admin btn-admin-accent" style="font-size: 12px; text-decoration: none; font-weight: 800;">
                  📲 WhatsApp Live Link to Owner
                </a>
                <button class="btn-admin btn-admin-outline" style="font-size: 12px;" onclick="AdminDashboard.deletePendingRequest('${this.escapeHTML(req.requestId)}')">
                  🗑️ Archive
                </button>
              ` : `
                <button class="btn-admin btn-admin-primary" style="font-size: 12px;" onclick="AdminDashboard.verifyAndActivateApp('${this.escapeHTML(req.requestId)}')">
                  🔄 Re-Approve & Activate
                </button>
                <button class="btn-admin btn-admin-danger" style="font-size: 12px;" onclick="AdminDashboard.deletePendingRequest('${this.escapeHTML(req.requestId)}')">
                  🗑️ Delete
                </button>
              `)}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  async verifyAndActivateApp(requestId) {
    const list = JSON.parse(localStorage.getItem('pending_business_requests') || '[]');
    const reqIndex = list.findIndex(r => r.requestId === requestId);
    if (reqIndex === -1) {
      this.showToast('Request not found.', 'error');
      return;
    }

    const req = list[reqIndex];
    const profiles = this.getSavedProfiles();

    // Theme color presets by vertical
    const defaultThemes = {
      student_management: { theme: "#1e3a8a", accent: "#f59e0b", icon: "🎓" },
      movex_booking: { theme: "#0284c7", accent: "#10b981", icon: "🚚" },
      hotel_booking: { theme: "#4f46e5", accent: "#f59e0b", icon: "🏨" },
      food_order: { theme: "#dc2626", accent: "#f59e0b", icon: "🍔" },
      ecommerce: { theme: "#10b981", accent: "#ec4899", icon: "🛍️" }
    };
    const t = defaultThemes[req.vertical] || { theme: "#1e3a8a", accent: "#f59e0b", icon: "🏢" };

    // Build or update profile
    const profileId = "profile_" + (req.slug || Date.now());
    const existingIndex = profiles.findIndex(p => p.id === profileId || p.slug === req.slug);

    const newProfile = {
      id: profileId,
      slug: req.slug,
      businessName: req.businessName,
      vertical: req.vertical,
      tagline: `Official ${req.businessName} Portal & Booking System`,
      logoIcon: t.icon,
      themeColor: t.theme,
      accentColor: t.accent,
      currency: "₹",
      upiId: req.upiId,
      whatsappNumber: req.phone,
      googleScriptUrl: window.MASTER_CONFIG?.googleScriptUrl || "",
      customLogo: null,
      customQr: req.customQr || null,
      isProductionClientMode: true,
      ownerUserId: req.ownerUserId || `owner_${req.slug}`,
      passwordHash: req.passwordHash,
      status: "active",
      createdAt: req.timestamp || new Date().toISOString()
    };

    if (existingIndex >= 0) {
      profiles[existingIndex] = { ...profiles[existingIndex], ...newProfile };
    } else {
      profiles.unshift(newProfile);
    }

    this.saveProfiles(profiles);

    // Save custom services for this slug if any
    if (Array.isArray(req.services) && req.services.length > 0) {
      if (req.vertical === 'student_management') {
        const fees = req.services.map((s, idx) => ({
          id: `fee_${req.slug}_${idx}`,
          title: s.title,
          grade: "All Classes",
          amount: Number(s.price) || 5000,
          badge: "Academic",
          description: s.description || "Tuition & Institutional Fee"
        }));
        localStorage.setItem(`custom_fees_${req.slug}`, JSON.stringify(fees));
      } else {
        localStorage.setItem(`custom_catalog_${req.slug}`, JSON.stringify(req.services));
      }
    }

    // Mark request as approved
    req.status = 'approved';
    req.approvedAt = new Date().toISOString();
    list[reqIndex] = req;
    localStorage.setItem('pending_business_requests', JSON.stringify(list));

    // Update UI
    this.renderVerificationQueue();
    this.renderRoster();
    this.loadMetrics();
    this.updatePendingCountBadge();

    const dedicatedLaunchUrl = this.getDeepLaunchUrl(req.slug, req.vertical);

    this.showToast(`🎉 Verified & Activated App for ${req.businessName}!`, 'success');

    // Show Confirmation Modal
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay';
    modal.id = 'admin-activation-modal';
    modal.innerHTML = `
      <div class="admin-modal-card" style="max-width: 520px; text-align: center;">
        <div style="font-size: 54px; margin-bottom: 10px;">🚀</div>
        <h3 style="font-size: 22px; font-weight: 900; color: var(--admin-primary); margin-bottom: 6px;">Business App is Now Live!</h3>
        <p style="font-size: 13px; color: var(--admin-text-muted); margin-bottom: 18px;">
          <strong>${this.escapeHTML(req.businessName)}</strong> has been verified. Their dedicated portal is active and ready for customers.
        </p>

        <div style="background: var(--admin-bg-secondary); border: 1.5px solid var(--admin-border); border-radius: 10px; padding: 16px; margin-bottom: 20px; text-align: left; font-size: 12px;">
          <div style="margin-bottom: 8px;">
            <strong>🌐 Live Dedicated Portal:</strong><br/>
            <a href="${dedicatedLaunchUrl}" target="_blank" style="color: var(--admin-primary); font-weight: 800; word-break: break-all;">${dedicatedLaunchUrl}</a>
          </div>
          <div style="margin-bottom: 8px;">
            <strong>👤 Owner Login ID:</strong> <code>${this.escapeHTML(req.ownerUserId || `owner_${req.slug}`)}</code>
          </div>
          <div>
            <strong>🔒 Password:</strong> Encrypted with SHA-256 (Set by owner)
          </div>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="https://wa.me/${encodeURIComponent(req.phone.replace(/[^0-9]/g, ''))}?text=${encodeURIComponent(`🎉 *Congratulations! Your Business App is Verified & LIVE!*\n\n*Business:* ${req.businessName}\n*Dedicated Live URL:* ${dedicatedLaunchUrl}\n*Owner User ID:* ${req.ownerUserId || `owner_${req.slug}`}\n\nYou can now log in to your Owner Control Center and share your official business link with customers!`)}" target="_blank" class="btn-admin btn-admin-accent" style="flex: 1; text-decoration: none; padding: 10px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            📲 WhatsApp Alert to Owner
          </a>
          <a href="${dedicatedLaunchUrl}" target="_blank" class="btn-admin btn-admin-primary" style="flex: 1; text-decoration: none; padding: 10px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
            🚀 Open Live App →
          </a>
          <button class="btn-admin btn-admin-outline" style="padding: 10px 16px;" onclick="document.getElementById('admin-activation-modal').remove()">
            Done
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  rejectAppRequest(requestId) {
    const reason = prompt('Please enter the reason for rejection (optional):', 'Contact details or UPI ID could not be verified.');
    if (reason === null) return;

    const list = JSON.parse(localStorage.getItem('pending_business_requests') || '[]');
    const req = list.find(r => r.requestId === requestId);
    if (!req) return;

    req.status = 'rejected';
    req.rejectionReason = reason;
    req.rejectedAt = new Date().toISOString();
    localStorage.setItem('pending_business_requests', JSON.stringify(list));

    this.renderVerificationQueue();
    this.updatePendingCountBadge();
    this.showToast('Application marked as rejected.', 'error');
  },

  deletePendingRequest(requestId) {
    if (confirm('Are you sure you want to delete this application record?')) {
      let list = JSON.parse(localStorage.getItem('pending_business_requests') || '[]');
      list = list.filter(r => r.requestId !== requestId);
      localStorage.setItem('pending_business_requests', JSON.stringify(list));
      this.renderVerificationQueue();
      this.updatePendingCountBadge();
      this.showToast('Record deleted.', 'info');
    }
  },

  // =========================================================================
  // ⚡ 5-MINUTE RAPID ONBOARDING WIZARD
  // =========================================================================
  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-panel').forEach(p => p.style.display = 'none');

    const btn = document.getElementById(`tab_btn_${tab}`);
    const panel = document.getElementById(`tab_panel_${tab}`);
    if (btn) btn.classList.add('active');
    if (panel) panel.style.display = 'block';

    if (tab === 'verification') {
      this.updatePendingCountBadge();
      this.renderVerificationQueue();
    }
    if (tab === 'roster') this.renderRoster();
    if (tab === 'activity') this.renderActivityFeed();
    if (tab === 'backup') {
      this.loadGitHubConfigInputs();
      this.loadGoogleVerification();
      this.renderIndexingUrlsTable();
    }
    if (tab === 'metrics') this.loadMetrics();
  },

  initWizardDefaults(vertical) {
    this.wizardData.vertical = vertical;
    const presets = {
      student_management: {
        name: "St. Mary's Convent School",
        tagline: "Admissions 2026-27 & Digital Fee Portal",
        icon: "🎓",
        theme: "#1e3a8a",
        accent: "#f59e0b",
        items: [
          { title: "Term 1 Tuition Fee", price: 34500 },
          { title: "Annual Registration & Lab Dues", price: 12500 },
          { title: "Composite Transport Fee", price: 18000 }
        ]
      },
      hotel_booking: {
        name: "Royal Heritage Palace & Resorts",
        tagline: "5-Star Luxury Suites & Fine Dining",
        icon: "🏨",
        theme: "#831843",
        accent: "#f59e0b",
        items: [
          { title: "Deluxe King Palace Suite", price: 6500 },
          { title: "Presidential Royal Suite", price: 14500 }
        ]
      },
      movex_booking: {
        name: "SwiftCargo Logistics Lines",
        tagline: "Reliable Same-Day Freight & Fleet Dispatch",
        icon: "🚚",
        theme: "#0284c7",
        accent: "#10b981",
        items: [
          { title: "Tata Ace (1 Ton Freight)", price: 650 },
          { title: "Pickup 8ft High-Deck (2 Ton)", price: 1200 }
        ]
      },
      food_order: {
        name: "The Royal Biryani & Kebabs",
        tagline: "Authentic Hyderabadi Handi Biryani Delivered Hot",
        icon: "🍔",
        theme: "#b91c1c",
        accent: "#f59e0b",
        items: [
          { title: "Special Dum Mutton Biryani", price: 420 },
          { title: "Chicken Tikka Kebab (8 Pcs)", price: 320 }
        ]
      },
      ecommerce: {
        name: "Apex Electronics & Gadgets",
        tagline: "Premium Audio, Smart Wearables & Accessories",
        icon: "🛍️",
        theme: "#4f46e5",
        accent: "#ec4899",
        items: [
          { title: "Pro ANC Wireless Headphones", price: 3999 },
          { title: "Ultra AMOLED Smartwatch", price: 2499 }
        ]
      }
    };

    const p = presets[vertical];
    if (p) {
      const nameEl = document.getElementById('wiz_name');
      const slugEl = document.getElementById('wiz_slug');
      const taglineEl = document.getElementById('wiz_tagline');
      const iconEl = document.getElementById('wiz_icon');
      const themeEl = document.getElementById('wiz_theme');
      const accentEl = document.getElementById('wiz_accent');

      if (nameEl) nameEl.value = p.name;
      if (taglineEl) taglineEl.value = p.tagline;
      if (iconEl) iconEl.value = p.icon;
      if (themeEl) themeEl.value = p.theme;
      if (accentEl) accentEl.value = p.accent;

      const generatedSlug = this.slugify(p.name);
      if (slugEl) slugEl.value = generatedSlug;

      this.wizardData.businessName = p.name;
      this.wizardData.slug = generatedSlug;
      this.wizardData.catalogItems = [...p.items];
      this.renderWizardCatalogRows();
      this.updateUrlPreview();
    }
  },

  selectVertical(vert) {
    document.querySelectorAll('.vertical-option-card').forEach(c => c.classList.remove('selected'));
    const target = document.getElementById(`vert_opt_${vert}`);
    if (target) target.classList.add('selected');
    this.initWizardDefaults(vert);
  },

  wizardNext(step) {
    if (step === 1) {
      // Move from Step 1 (vertical picker) to Step 2
      this.goToWizardStep(2);
      return;
    }

    if (step === 2) {
      const name = document.getElementById('wiz_name').value.trim();
      if (!name) {
        this.showToast('Please enter a Business Name.', 'error');
        return;
      }
      let slug = (document.getElementById('wiz_slug')?.value || '').trim();
      if (!slug) slug = this.slugify(name);

      this.wizardData.businessName = name;
      this.wizardData.slug = this.slugify(slug);
      this.wizardData.tagline = document.getElementById('wiz_tagline').value.trim();
      this.wizardData.logoIcon = document.getElementById('wiz_icon').value.trim() || '🎓';
      this.wizardData.themeColor = document.getElementById('wiz_theme').value;
      this.wizardData.accentColor = document.getElementById('wiz_accent').value;
      this.wizardData.currency = document.getElementById('wiz_currency').value;
      this.goToWizardStep(3);
      return;
    }

    if (step === 3) {
      this.wizardData.upiId = document.getElementById('wiz_upi').value.trim();
      this.wizardData.googleScriptUrl = document.getElementById('wiz_script').value.trim();
      this.wizardData.whatsappNumber = document.getElementById('wiz_whatsapp').value.trim();
      this.goToWizardStep(4);
      return;
    }

    if (step === 4) {
      this.goToWizardStep(5);
      return;
    }
  },

  wizardPrev(step) {
    this.goToWizardStep(step - 1);
  },

  goToWizardStep(step) {
    this.currentStep = step;
    for (let i = 1; i <= 5; i++) {
      const el = document.getElementById(`wiz_step_${i}`);
      const node = document.getElementById(`wiz_node_${i}`);
      if (el) el.style.display = (i === step) ? 'block' : 'none';
      if (node) {
        node.classList.remove('active', 'completed');
        if (i < step) node.classList.add('completed');
        if (i === step) node.classList.add('active');
      }
    }

    if (step === 5) {
      this.finalizeOnboarding();
    }
  },

  renderWizardCatalogRows() {
    const list = document.getElementById('wiz_catalog_list');
    if (!list) return;
    const items = this.wizardData.catalogItems;
    if (items.length === 0) {
      list.innerHTML = `<div style="text-align: center; color: var(--admin-text-muted); font-size: 13px; padding: 14px;">No items added yet. Click "+ Add Item" above.</div>`;
      return;
    }

    list.innerHTML = items.map((it, idx) => `
      <div style="display: flex; gap: 10px; align-items: center; background: var(--admin-bg-surface); padding: 10px 14px; border-radius: var(--radius-sm); border: 1px solid var(--admin-border); margin-bottom: 8px;">
        <input type="text" class="admin-input" style="flex: 2;" value="${this.escapeHTML(it.title)}" onchange="AdminDashboard.updateCatalogItem(${idx}, 'title', this.value)" placeholder="Item / Fee Title" />
        <input type="number" class="admin-input" style="flex: 1;" value="${Number(it.price || 0)}" onchange="AdminDashboard.updateCatalogItem(${idx}, 'price', this.value)" placeholder="Price" />
        <button type="button" class="btn-admin btn-admin-danger" onclick="AdminDashboard.removeCatalogItem(${idx})">✕</button>
      </div>
    `).join('');
  },

  addCatalogItem() {
    this.wizardData.catalogItems.push({ title: "New Fee / Product Tier", price: 500 });
    this.renderWizardCatalogRows();
  },

  updateCatalogItem(idx, field, val) {
    if (this.wizardData.catalogItems[idx]) {
      this.wizardData.catalogItems[idx][field] = field === 'price' ? Number(val) : val;
    }
  },

  removeCatalogItem(idx) {
    this.wizardData.catalogItems.splice(idx, 1);
    this.renderWizardCatalogRows();
  },

  compressImage(file, maxDimension = 500, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async handleLogoUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showToast('Please upload a valid image file.', 'error');
        return;
      }
      try {
        const compressedBase64 = await this.compressImage(file, 400, 0.85);
        this.wizardData.customLogoData = compressedBase64;
        const prev = document.getElementById('wiz_logo_preview');
        if (prev) {
          prev.style.display = 'block';
          prev.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; background: var(--admin-bg-surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--admin-border); width: fit-content; margin-top: 8px;">
              <img src="${compressedBase64}" style="max-height: 48px; max-width: 140px; object-fit: contain; border-radius: 4px;" alt="Logo Preview" />
              <div>
                <div style="font-size: 12px; font-weight: 800; color: var(--admin-success);">✅ Custom Logo Uploaded (Optimized)</div>
                <div style="font-size: 10px; color: var(--admin-text-muted);">${file.name}</div>
              </div>
              <button type="button" class="btn-admin btn-admin-danger" style="padding: 2px 8px; font-size: 11px; margin-left: 8px;" onclick="AdminDashboard.removeLogoUpload()">✕</button>
            </div>
          `;
        }
        this.showToast('✅ Brand logo uploaded and optimized successfully!', 'success');
      } catch (err) {
        console.error('Logo compression error:', err);
        this.showToast('Error processing logo image', 'error');
      }
    }
  },

  removeLogoUpload() {
    this.wizardData.customLogoData = null;
    const prev = document.getElementById('wiz_logo_preview');
    if (prev) {
      prev.style.display = 'none';
      prev.innerHTML = '';
    }
    const inp = document.getElementById('wiz_logo_file');
    if (inp) inp.value = '';
    this.showToast('Logo removed', 'info');
  },

  async handleQrUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showToast('Please upload a valid image file.', 'error');
        return;
      }
      try {
        const compressedBase64 = await this.compressImage(file, 500, 0.88);
        this.wizardData.customQrData = compressedBase64;
        const prev = document.getElementById('wiz_qr_preview');
        if (prev) {
          prev.style.display = 'block';
          prev.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; background: var(--admin-bg-surface); padding: 10px 14px; border-radius: 8px; border: 1px solid var(--admin-border); width: fit-content; margin-top: 8px;">
              <img src="${compressedBase64}" style="max-height: 80px; max-width: 80px; object-fit: contain; border-radius: 6px; background: #fff; padding: 4px;" alt="QR Standee Preview" />
              <div>
                <div style="font-size: 12px; font-weight: 800; color: var(--admin-success);">✅ Merchant QR Standee Uploaded (Optimized)</div>
                <div style="font-size: 10px; color: var(--admin-text-muted);">${file.name}</div>
              </div>
              <button type="button" class="btn-admin btn-admin-danger" style="padding: 2px 8px; font-size: 11px; margin-left: 8px;" onclick="AdminDashboard.removeQrUpload()">✕</button>
            </div>
          `;
        }
        this.showToast('✅ UPI Standee QR uploaded and optimized successfully!', 'success');
      } catch (err) {
        console.error('QR compression error:', err);
        this.showToast('Error processing QR image', 'error');
      }
    }
  },

  removeQrUpload() {
    this.wizardData.customQrData = null;
    const prev = document.getElementById('wiz_qr_preview');
    if (prev) {
      prev.style.display = 'none';
      prev.innerHTML = '';
    }
    const inp = document.getElementById('wiz_qr_file');
    if (inp) inp.value = '';
    this.showToast('QR standee removed', 'info');
  },

  // =========================================================================
  // 🚀 FINALIZE ONBOARDING & GENERATE DEDICATED LAUNCH ASSETS
  // =========================================================================
  async finalizeOnboarding() {
    // Read directly from DOM inputs as robust fallback
    const domName = document.getElementById('wiz_name')?.value?.trim();
    const domSlug = document.getElementById('wiz_slug')?.value?.trim();
    const domTagline = document.getElementById('wiz_tagline')?.value?.trim();
    const domIcon = document.getElementById('wiz_icon')?.value?.trim();
    const domUpi = document.getElementById('wiz_upi')?.value?.trim();
    const domPhone = document.getElementById('wiz_whatsapp')?.value?.trim();
    const domScript = document.getElementById('wiz_script')?.value?.trim();

    const data = this.wizardData;
    data.businessName = domName || data.businessName || "My New Business";
    data.vertical = data.vertical || "student_management";
    data.slug = this.slugify(domSlug || data.slug || data.businessName);
    data.tagline = domTagline || data.tagline || `Official ${data.businessName} Portal`;
    data.logoIcon = domIcon || data.logoIcon || "🏛️";
    if (domUpi) data.upiId = domUpi;
    if (domPhone) data.whatsappNumber = domPhone;
    if (domScript) data.googleScriptUrl = domScript;

    const slug = data.slug;
    const vendorId = "vendor_" + slug + "_" + Date.now().toString(36);
    const defaultPassword = data.ownerPassword || 'pass1234';
    let ownerPasswordHash = '';
    try {
      ownerPasswordHash = await CryptoSecurity.hashPassword(defaultPassword);
    } catch (e) {
      ownerPasswordHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // pass1234 hash fallback
    }

    const newVendorProfile = {
      id: vendorId,
      slug: slug,
      ownerUserId: data.ownerUserId || `owner_${slug}`,
      ownerPasswordHash: ownerPasswordHash,
      businessName: data.businessName,
      vertical: data.vertical,
      tagline: data.tagline,
      logoIcon: data.logoIcon,
      themeColor: data.themeColor || "#1e3a8a",
      accentColor: data.accentColor || "#f59e0b",
      currency: data.currency || "₹",
      upiId: data.upiId || "payments@upi",
      whatsappNumber: data.whatsappNumber || "+919876543210",
      googleScriptUrl: data.googleScriptUrl || "",
      customLogo: data.customLogoData || null,
      customQr: data.customQrData || null,
      catalogItems: [...data.catalogItems],
      isProductionClientMode: true,
      status: "active",
      createdAt: new Date().toISOString()
    };

    // Save to profiles list (update if same slug, otherwise add to front)
    const profiles = this.getSavedProfiles();
    const existingIdx = profiles.findIndex(p => p.slug === slug || p.id === vendorId);
    if (existingIdx >= 0) {
      profiles[existingIdx] = newVendorProfile;
    } else {
      profiles.unshift(newVendorProfile);
    }
    this.saveProfiles(profiles);

    // Sync active assets for immediate browser testing
    if (data.customQrData) {
      localStorage.setItem('custom_upi_qr', data.customQrData);
    }
    if (data.customLogoData) {
      localStorage.setItem('custom_brand_logo', data.customLogoData);
    }

    // Compute Dedicated URLs
    const dedicatedUrl = this.getDedicatedBusinessUrl(slug);
    const deepLaunchUrl = this.getDeepLaunchUrl(slug, data.vertical);

    // Render Handover Display
    const nameEl = document.getElementById('res_vendor_name');
    const vertEl = document.getElementById('res_vendor_vertical');
    const liveUrlEl = document.getElementById('res_live_portal_url');
    const urlEl = document.getElementById('res_dedicated_url');

    if (nameEl) nameEl.innerText = data.businessName;
    if (vertEl) vertEl.innerText = (data.vertical || 'student_management').replace('_', ' ').toUpperCase();
    if (liveUrlEl) liveUrlEl.value = deepLaunchUrl;
    if (urlEl) urlEl.value = dedicatedUrl;

    // Render Live Verification Badges for Uploaded Assets
    const assetsSummaryEl = document.getElementById('res_assets_summary');
    if (assetsSummaryEl) {
      let html = '';
      if (data.customLogoData) {
        html += `
          <div style="background: var(--admin-bg-surface); border: 1px solid var(--admin-border); padding: 10px 16px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
            <img src="${data.customLogoData}" style="max-height: 40px; max-width: 90px; object-fit: contain;" alt="Logo" />
            <span style="font-size: 12px; font-weight: 800; color: var(--admin-success);">Official Logo Attached</span>
          </div>
        `;
      }
      if (data.customQrData) {
        html += `
          <div style="background: var(--admin-bg-surface); border: 1px solid var(--admin-border); padding: 10px 16px; border-radius: 8px; display: flex; align-items: center; gap: 10px;">
            <img src="${data.customQrData}" style="max-height: 40px; max-width: 40px; object-fit: contain; background: #fff; padding: 2px; border-radius: 4px;" alt="QR" />
            <span style="font-size: 12px; font-weight: 800; color: var(--admin-success);">Merchant QR Standee Linked</span>
          </div>
        `;
      }
      assetsSummaryEl.innerHTML = html;
    }

    const waMsg = `🎉 *Congratulations! Your App is Live!* 🎉\n\n*Business:* ${data.businessName}\n*Category:* ${data.vertical.replace('_', ' ').toUpperCase()}\n*Official Live Portal:* ${deepLaunchUrl}\n\nYour app is equipped with Instant zero-fee UPI checkout, real-time Google Sheets sync, and PWA offline capability. Welcome aboard!`;
    const waLink = `https://wa.me/${(data.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`;
    
    const waBtn = document.getElementById('res_whatsapp_btn');
    if (waBtn) waBtn.onclick = () => window.open(waLink, '_blank');
    
    const openBtn = document.getElementById('res_open_portal_btn');
    if (openBtn) openBtn.onclick = () => window.open(deepLaunchUrl, '_blank');

    this.showToast('🚀 New Vendor Successfully Onboarded in 5 Minutes!', 'success');
  },

  copyLivePortalUrl() {
    const input = document.getElementById('res_live_portal_url');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
      this.showToast('📋 Copied Instant Live Portal URL!', 'success');
    }
  },

  copyDedicatedUrl() {
    const input = document.getElementById('res_dedicated_url');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
      this.showToast('📋 Copied Standalone Repository URL!', 'success');
    }
  },

  // =========================================================================
  // 🐙 DIRECT 1-CLICK GITHUB API DEPLOYMENT ENGINE
  // =========================================================================
  async deployToGitHubApi() {
    const p = this.wizardData;
    const slug = this.slugify(p.slug || p.businessName);
    const logEl = document.getElementById('deploy_status_log');
    if (logEl) {
      logEl.style.display = 'block';
      logEl.innerHTML = `<strong>🐙 GitHub Pages Automated Deployer</strong><br>Starting deployment for <em>${this.escapeHTML(p.businessName)}</em> (Repository: <code>${slug}</code>)...`;
    }

    let { username, token } = this.getGitHubConfig();
    if (!token) {
      token = prompt('Enter your GitHub Personal Access Token (PAT) with "repo" scope:');
      if (token) {
        localStorage.setItem('admin_github_token', token.trim());
      } else {
        if (logEl) logEl.innerHTML += `<br><span style="color: var(--admin-danger);">❌ Deployment halted: Personal Access Token required. You can also use "Download deploy.bat" for zero-token deployment.</span>`;
        this.showToast('GitHub Token required for direct API deploy', 'error');
        return;
      }
    }

    try {
      // 1. Verify GitHub Authentication
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!userRes.ok) throw new Error('Failed to authenticate with GitHub. Please check your Personal Access Token.');
      const userData = await userRes.json();
      username = userData.login;
      localStorage.setItem('admin_github_username', username);
      if (logEl) logEl.innerHTML += `<br>✅ Authenticated as GitHub user: <strong>${username}</strong>`;

      // 2. Create Repository (or verify if already exists)
      if (logEl) logEl.innerHTML += `<br>⏳ Provisioning repository <code>${username}/${slug}</code>...`;
      const createRepoRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: slug,
          description: `${p.businessName} - Official Portal powered by OmniSaaS`,
          homepage: `https://${username}.github.io/${slug}/`,
          private: false,
          auto_init: true
        })
      });

      if (createRepoRes.status === 201) {
        if (logEl) logEl.innerHTML += `<br>✅ Repository <code>${slug}</code> created successfully!`;
      } else if (createRepoRes.status === 422) {
        if (logEl) logEl.innerHTML += `<br>ℹ️ Repository <code>${slug}</code> already exists. Syncing contents...`;
      } else {
        const errJson = await createRepoRes.json();
        throw new Error(errJson.message || 'Error creating repository');
      }

      // 3. Generate and Upload Tailored config.js
      if (logEl) logEl.innerHTML += `<br>⏳ Committing tailored client configuration <code>config.js</code>...`;
      const configContent = `/**
 * Standalone Client Configuration for: ${p.businessName}
 * Auto-generated by OmniSaaS GitHub Deployer
 */
window.MASTER_CONFIG = {
  activeAppType: "${p.vertical}",
  isProductionClientMode: true,
  upiId: "${p.upiId || ''}",
  whatsappNumber: "${p.whatsappNumber || ''}",
  googleScriptUrl: "${p.googleScriptUrl || ''}",
  verticals: {
    ${p.vertical}: {
      businessName: "${p.businessName.replace(/"/g, '\\"')}",
      tagline: "${(p.tagline || '').replace(/"/g, '\\"')}",
      logoIcon: "${p.logoIcon || '🏛️'}",
      themeColor: "${p.themeColor || '#1e3a8a'}",
      accentColor: "${p.accentColor || '#f59e0b'}",
      currency: "${p.currency || '₹'}"
    }
  }
};
`;
      await this.commitFileToGitHub(username, slug, 'config.js', configContent, token);

      // 4. Enable GitHub Pages on main branch
      if (logEl) logEl.innerHTML += `<br>⏳ Enabling GitHub Pages on <code>main</code> branch...`;
      try {
        await fetch(`https://api.github.com/repos/${username}/${slug}/pages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            source: { branch: 'main', path: '/' }
          })
        });
      } catch (e) {
        // May already be active
      }

      const dedicatedUrl = `https://${username}.github.io/${slug}/`;
      if (logEl) {
        logEl.innerHTML += `
          <br><br><span style="color: var(--admin-success); font-weight: 800;">🎉 SUCCESS! Dedicated Business Portal is deploying!</span>
          <br>🌐 <strong>Dedicated URL:</strong> <a href="${dedicatedUrl}" target="_blank" style="color: var(--admin-accent); font-weight: 800;">${dedicatedUrl}</a>
          <br><small style="color: var(--admin-text-muted);">Note: GitHub Pages takes ~60 seconds to build the first time.</small>
        `;
      }
      this.showToast('🚀 GitHub Pages Repo Created & Configured!', 'success');

    } catch (err) {
      console.error(err);
      if (logEl) {
        logEl.innerHTML += `<br><span style="color: var(--admin-danger); font-weight: bold;">❌ Error: ${this.escapeHTML(err.message)}</span><br>Tip: You can use "Download deploy.bat" to push with one double-click from your computer.`;
      }
      this.showToast('GitHub API Deploy error: ' + err.message, 'error');
    }
  },

  async commitFileToGitHub(username, repo, path, content, token) {
    let sha = null;
    try {
      const getRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      }
    } catch (e) {}

    const b64 = btoa(unescape(encodeURIComponent(content)));
    const body = {
      message: `Deploy ${path} for ${repo}`,
      content: b64
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      throw new Error(err.message || `Failed to commit ${path}`);
    }
  },

  // =========================================================================
  // 📜 ZERO-TOUCH DEPLOY SCRIPT & CONFIG GENERATORS
  // =========================================================================
  downloadDeployScript(vendorIdOrSlug) {
    const profiles = this.getSavedProfiles();
    const p = profiles.find(v => v.id === vendorIdOrSlug || v.slug === vendorIdOrSlug) || this.wizardData;
    const slug = this.slugify(p.slug || p.businessName);
    const { username } = this.getGitHubConfig();
    const ghUser = username || 'YOUR_GITHUB_USERNAME';

    const batContent = `@echo off
echo =====================================================================
echo  OMNISAAS ENTERPRISE: RAPID CLIENT DEPLOYMENT
echo  Deploying: ${p.businessName}
echo  Target GitHub Repository: https://github.com/${ghUser}/${slug}
echo  Dedicated Live URL: https://${ghUser}.github.io/${slug}/
echo =====================================================================

REM 1. Create deployment staging directory
set DEST_DIR=%~dp0deploy_${slug}
if exist "%DEST_DIR%" rd /s /q "%DEST_DIR%"
mkdir "%DEST_DIR%"
mkdir "%DEST_DIR%\\modules"

REM 2. Copy core platform files
copy "%~dp0index.html" "%DEST_DIR%\\index.html" >nul
copy "%~dp0styles.css" "%DEST_DIR%\\styles.css" >nul
copy "%~dp0app.js" "%DEST_DIR%\\app.js" >nul
if exist "%~dp0404.html" copy "%~dp0404.html" "%DEST_DIR%\\404.html" >nul
if exist "%~dp0sw.js" copy "%~dp0sw.js" "%DEST_DIR%\\sw.js" >nul
if exist "%~dp0manifest.json" copy "%~dp0manifest.json" "%DEST_DIR%\\manifest.json" >nul
copy "%~dp0modules\\*.js" "%DEST_DIR%\\modules\\" >nul

REM 3. Write customized client config.js
(
echo /**
echo  * Dedicated Client Configuration for: ${p.businessName}
echo  * Generated by OmniSaaS Rapid Onboarder
echo  */
echo window.MASTER_CONFIG = {
echo   activeAppType: "${p.vertical}",
echo   isProductionClientMode: true,
echo   upiId: "${p.upiId || ''}",
echo   whatsappNumber: "${p.whatsappNumber || ''}",
echo   googleScriptUrl: "${p.googleScriptUrl || ''}",
echo   verticals: {
echo     ${p.vertical}: {
echo       businessName: "${p.businessName.replace(/"/g, '\\"')}",
echo       tagline: "${(p.tagline || '').replace(/"/g, '\\"')}",
echo       logoIcon: "${p.logoIcon || '🏛️'}",
echo       themeColor: "${p.themeColor || '#1e3a8a'}",
echo       accentColor: "${p.accentColor || '#f59e0b'}",
echo       currency: "${p.currency || '₹'}"
echo     }
echo   }
echo };
) > "%DEST_DIR%\\config.js"

echo Staging complete. Initializing git repository...
cd /d "%DEST_DIR%"
git init >nul
git checkout -b main >nul
git add . >nul
git commit -m "Initial launch of ${p.businessName} on GitHub Pages" >nul

echo.
where gh >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo GitHub CLI detected. Creating remote repository and pushing...
    gh repo create ${ghUser}/${slug} --public --source=. --push
    gh repo edit ${ghUser}/${slug} --enable-pages --pages-branch main
) else (
    echo GitHub CLI not found. Using standard git remote push...
    echo (Make sure you have created the public repo ${slug} on github.com first)
    git remote add origin https://github.com/${ghUser}/${slug}.git
    git push -u origin main --force
)

echo.
echo =====================================================================
echo  DEPLOYMENT COMPLETE!
echo  Your dedicated client portal will be live in 1-2 minutes at:
echo  https://${ghUser}.github.io/${slug}/
echo =====================================================================
pause
`;

    const blob = new Blob([batContent], { type: 'application/bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deploy-${slug}.bat`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast(`📜 Downloaded deploy-${slug}.bat! Run it to push to GitHub Pages in 30s.`, 'success');
  },

  downloadVendorConfig(vendorIdOrSlug) {
    const profiles = this.getSavedProfiles();
    const p = profiles.find(v => v.id === vendorIdOrSlug || v.slug === vendorIdOrSlug) || this.wizardData;
    const vKey = p.vertical;
    const slug = this.slugify(p.slug || p.businessName);

    const fileContent = `/**
 * Standalone Client Configuration for: ${p.businessName}
 * Pre-configured for zero-friction GitHub Pages deployment
 */

window.MASTER_CONFIG = {
  activeAppType: "${vKey}",
  isProductionClientMode: true,
  upiId: "${p.upiId || ''}",
  whatsappNumber: "${p.whatsappNumber || ''}",
  googleScriptUrl: "${p.googleScriptUrl || ''}",
  verticals: {
    ${vKey}: {
      businessName: "${p.businessName.replace(/"/g, '\\"')}",
      tagline: "${(p.tagline || '').replace(/"/g, '\\"')}",
      logoIcon: "${p.logoIcon || '🏛️'}",
      themeColor: "${p.themeColor || '#1e3a8a'}",
      accentColor: "${p.accentColor || '#f59e0b'}",
      currency: "${p.currency || '₹'}"
    }
  }
};
`;

    const blob = new Blob([fileContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-${slug}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('💾 config.js Downloaded for Client Repository!', 'success');
  },

  seedSampleRequest() {
    const sample = {
      requestId: "REQ-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000),
      timestamp: new Date().toISOString(),
      businessName: "Greenwood Valley Academy",
      slug: "greenwood-valley-academy",
      ownerName: "Dr. Arvind Saxena",
      phone: "+919876543210",
      email: "contact@greenwoodvalley.edu",
      address: "Plot 42, Knowledge Park, Noida, UP",
      vertical: "student_management",
      passwordHash: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3",
      ownerUserId: "owner_greenwood-valley-academy",
      upiId: "admissions@greenwoodvalley.edu",
      customQr: null,
      services: [
        { title: "Class 10 Tuition & Smart Lab Fee", price: 4500, description: "Monthly composite academic fee" },
        { title: "Annual Registration & Sports Dues", price: 2500, description: "Annual institutional dues" }
      ],
      status: "pending_verification"
    };

    const list = JSON.parse(localStorage.getItem('pending_business_requests') || '[]');
    list.unshift(sample);
    localStorage.setItem('pending_business_requests', JSON.stringify(list));
    this.renderVerificationQueue();
    this.showToast('🧪 Loaded sample pending application for instant verification testing!', 'success');
  },

  getSavedProfiles() {
    const configGlobal = (window.MASTER_CONFIG && Array.isArray(window.MASTER_CONFIG.vendorProfiles)) ? window.MASTER_CONFIG.vendorProfiles : [];
    const saved = localStorage.getItem('saved_client_profiles');
    if (!saved) return configGlobal;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed];
        for (const bp of configGlobal) {
          if (!merged.some(p => p.id === bp.id || (p.slug && bp.slug && p.slug.toLowerCase() === bp.slug.toLowerCase()))) {
            merged.push(bp);
          }
        }
        return merged;
      }
      return configGlobal;
    } catch(e) {
      return configGlobal;
    }
  },

  saveProfiles(profiles) {
    localStorage.setItem('saved_client_profiles', JSON.stringify(profiles));
    if (window.MASTER_CONFIG) {
      window.MASTER_CONFIG.vendorProfiles = profiles;
    }
  },

  // =========================================================================
  // 📋 MULTI-VENDOR ROSTER MANAGEMENT
  // =========================================================================
  renderRoster() {
    const tbody = document.getElementById('vendor_roster_body');
    if (!tbody) return;

    const profiles = this.getSavedProfiles();
    const search = (document.getElementById('roster_search_input')?.value || '').toLowerCase();
    const filterVert = document.getElementById('roster_vertical_filter')?.value || 'ALL';
    const filterStatus = document.getElementById('roster_status_filter')?.value || 'ALL';

    const filtered = profiles.filter(p => {
      const slug = p.slug || this.slugify(p.businessName);
      const matchSearch = (p.businessName + (p.upiId || '') + (p.tagline || '') + slug).toLowerCase().includes(search);
      const matchVert = (filterVert === 'ALL') || (p.vertical === filterVert);
      const matchStatus = (filterStatus === 'ALL') || ((p.status || 'active') === filterStatus);
      return matchSearch && matchVert && matchStatus;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--admin-text-muted);">No matching business vendors found.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(v => {
      const isSuspended = v.status === 'suspended';
      const slug = v.slug || this.slugify(v.businessName);
      const dedicatedUrl = this.getDedicatedBusinessUrl(slug);
      const deepUrl = this.getDeepLaunchUrl(slug);

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 12px;">
              ${v.customLogo ? 
                `<img src="${v.customLogo}" style="height: 38px; width: 38px; object-fit: contain; border-radius: 6px; border: 1px solid var(--admin-border); background: #fff; padding: 2px;" alt="Logo" />` :
                `<span style="font-size: 24px;">${this.escapeHTML(v.logoIcon || '🏛️')}</span>`
              }
              <div>
                <div style="font-weight: 800; font-size: 14px; color: var(--admin-text-main);">${this.escapeHTML(v.businessName)}</div>
                <div style="font-size: 11px; color: var(--admin-text-muted);">${this.escapeHTML(v.tagline || 'No tagline')}</div>
                <div style="margin-top: 4px;">
                  <span class="badge-slug">/${this.escapeHTML(slug)}</span>
                </div>
              </div>
            </div>
          </td>
          <td>
            <span style="background: rgba(255, 255, 255, 0.05); padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase;">
              ${this.escapeHTML((v.vertical || '').replace('_', ' '))}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <a href="${dedicatedUrl}" target="_blank" style="color: var(--admin-accent); font-weight: 700; font-size: 12px; word-break: break-all;">
                ${dedicatedUrl}
              </a>
              <button class="btn-admin btn-admin-outline" style="padding: 2px 6px; font-size: 10px;" title="Copy Dedicated URL" onclick="navigator.clipboard.writeText('${dedicatedUrl}'); AdminDashboard.showToast('📋 Copied Dedicated URL!', 'success')">
                📋
              </button>
            </div>
            <div style="font-size: 10px; color: var(--admin-text-muted); margin-top: 2px;">
              Direct: <a href="${deepUrl}" target="_blank" style="color: var(--admin-primary);">${deepUrl}</a>
            </div>
          </td>
          <td>
            <div style="font-size: 12px;">UPI: <strong>${this.escapeHTML(v.upiId || 'N/A')}</strong></div>
            <div style="font-size: 11px; color: var(--admin-text-muted);">${this.escapeHTML(v.whatsappNumber || 'No WhatsApp')}</div>
            ${v.customQr ? `<div style="font-size: 10px; color: var(--admin-success); font-weight: 800; margin-top: 3px;">🟢 Standee QR Linked</div>` : `<div style="font-size: 10px; color: var(--admin-text-muted); margin-top: 3px;">⚡ Dynamic UPI QR</div>`}
          </td>
          <td>
            <span class="status-pill ${isSuspended ? 'suspended' : 'active'}">
              ● ${isSuspended ? 'Suspended / Paused' : 'Active Live'}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn-admin btn-admin-primary" style="padding: 5px 10px; font-size: 11px;" onclick="window.open('${deepUrl}', '_blank')">
                🚀 Launch
              </button>
              <button class="btn-admin btn-admin-outline" style="padding: 5px 8px; font-size: 11px;" title="Download deploy.bat" onclick="AdminDashboard.downloadDeployScript('${this.escapeHTML(slug)}')">
                📜
              </button>
              <button class="btn-admin btn-admin-outline" style="padding: 5px 8px; font-size: 11px;" title="Download config.js" onclick="AdminDashboard.downloadVendorConfig('${this.escapeHTML(v.id)}')">
                💾
              </button>
              <button class="btn-admin ${isSuspended ? 'btn-admin-success' : 'btn-admin-accent'}" style="padding: 5px 8px; font-size: 11px;" title="Toggle Status" onclick="AdminDashboard.toggleVendorStatus('${this.escapeHTML(v.id)}')">
                ${isSuspended ? '▶️' : '⏸️'}
              </button>
              <button class="btn-admin btn-admin-danger" style="padding: 5px 8px; font-size: 11px;" title="Delete Vendor" onclick="AdminDashboard.deleteVendor('${this.escapeHTML(v.id)}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  toggleVendorStatus(vendorId) {
    const profiles = this.getSavedProfiles();
    const match = profiles.find(v => v.id === vendorId);
    if (!match) return;

    match.status = match.status === 'suspended' ? 'active' : 'suspended';
    this.saveProfiles(profiles);
    this.renderRoster();
    this.showToast(`Updated status for ${match.businessName} to ${match.status.toUpperCase()}`, 'info');
  },

  deleteVendor(vendorId) {
    if (!confirm('Are you sure you want to remove this vendor from the platform?')) return;
    let profiles = this.getSavedProfiles();
    profiles = profiles.filter(v => v.id !== vendorId);
    this.saveProfiles(profiles);
    this.renderRoster();
    this.showToast('🗑️ Vendor removed successfully', 'info');
  },

  // =========================================================================
  // 📜 CROSS-VENDOR ACTIVITY FEED & AUDIT TRAIL
  // =========================================================================
  renderActivityFeed() {
    const feedBox = document.getElementById('unified_activity_feed');
    if (!feedBox) return;

    const admissions = JSON.parse(localStorage.getItem('student_admissions') || '[]');
    const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
    const movex = JSON.parse(localStorage.getItem('movex_ledger') || '[]');
    const hotels = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
    const orders = JSON.parse(localStorage.getItem('store_orders') || '[]');

    const activities = [];

    admissions.forEach(a => {
      activities.push({
        type: '🎓 Student Admission',
        id: a.orderId,
        title: `${a.studentName} (${a.gradeApplied})`,
        amount: 'N/A',
        date: a.timestamp,
        status: a.status
      });
    });

    fees.forEach(f => {
      activities.push({
        type: '💳 Fee Invoiced',
        id: f.receiptNo,
        title: `${f.studentName} - ${f.particulars}`,
        amount: `${f.currency}${f.amount}`,
        date: f.timestamp,
        status: f.status
      });
    });

    movex.forEach(m => {
      activities.push({
        type: '🚚 Freight Booking',
        id: m.orderId,
        title: `${m.pickupLane} ➔ ${m.dropLane}`,
        amount: `₹${m.finalFare}`,
        date: m.timestamp,
        status: m.tripStatus
      });
    });

    hotels.forEach(h => {
      activities.push({
        type: '🏨 Hotel Reservation',
        id: h.orderId,
        title: `${h.guestName} (${h.roomTitle})`,
        amount: `${h.currency}${h.totalFare}`,
        date: h.timestamp,
        status: h.status
      });
    });

    orders.forEach(o => {
      activities.push({
        type: '🛍️ Store Order',
        id: o.orderId,
        title: `${o.customerName} - ${o.itemsSummary}`,
        amount: `${o.currency}${o.total}`,
        date: o.timestamp,
        status: o.status
      });
    });

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (activities.length === 0) {
      feedBox.innerHTML = `<div style="text-align: center; color: var(--admin-text-muted); padding: 30px;">No platform transactions or bookings logged yet.</div>`;
      return;
    }

    feedBox.innerHTML = activities.slice(0, 50).map(a => `
      <div style="background: var(--admin-bg-surface); border: 1px solid var(--admin-border); padding: 14px 18px; border-radius: var(--radius-sm); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <div>
          <span style="font-size: 11px; font-weight: 800; color: var(--admin-primary); text-transform: uppercase;">${this.escapeHTML(a.type)}</span>
          <div style="font-weight: 800; font-size: 14px; margin: 2px 0;">${this.escapeHTML(a.id)} &bull; ${this.escapeHTML(a.title)}</div>
          <div style="font-size: 11px; color: var(--admin-text-muted);">${new Date(a.date).toLocaleString()}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 16px; font-weight: 900; color: var(--admin-success);">${this.escapeHTML(a.amount)}</div>
          <span class="status-pill active" style="font-size: 10px;">${this.escapeHTML(a.status)}</span>
        </div>
      </div>
    `).join('');
  },

  // =========================================================================
  // 💾 BACKUP, RESTORE & DATA EXPORT
  // =========================================================================
  exportAllVendorsBackup() {
    const profiles = this.getSavedProfiles();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profiles, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `all-vendors-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    this.showToast('📥 Exported All Vendors Backup JSON!', 'success');
  },

  importVendorsJson(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          this.saveProfiles(imported);
          this.renderRoster();
          this.showToast(`✅ Successfully imported ${imported.length} vendor profiles!`, 'success');
        } else {
          this.showToast('❌ Invalid format: Expected JSON array of vendor profiles.', 'error');
        }
      } catch (err) {
        this.showToast('❌ Failed to parse JSON file.', 'error');
      }
    };
    reader.readAsText(input.files[0]);
  },

  resetToDefaultProfiles() {
    if (!confirm('Reset all vendors to the 6 default standard profiles? This cannot be undone.')) return;
    localStorage.removeItem('saved_client_profiles');
    this.loadMetrics();
    this.renderRoster();
    this.renderIndexingUrlsTable();
    this.showToast('🔄 Reset to default 6 vendor profiles.', 'info');
  },

  // =========================================================================
  // 🔍 GOOGLE SEARCH INDEXING & SEO METHODS
  // =========================================================================
  loadGoogleVerification() {
    const code = localStorage.getItem('google_site_verification_code') || '';
    const input = document.getElementById('cfg_google_verification');
    if (input) input.value = code;
  },

  saveGoogleVerification() {
    const input = document.getElementById('cfg_google_verification');
    if (!input) return;
    let val = input.value.trim();
    // If user pasted `<meta name="google-site-verification" content="..." />`, extract the content
    const match = val.match(/content=["']([^"']+)["']/);
    if (match) val = match[1];
    localStorage.setItem('google_site_verification_code', val);
    input.value = val;
    this.showToast('✅ Google Site Verification Code saved!', 'success');
  },

  pingGoogleSitemap() {
    const sitemapUrl = `https://raviattrash-pro.github.io/OmniSaaS/sitemap.xml`;
    const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
    window.open(pingUrl, '_blank', 'width=540,height=360');
    this.showToast('📡 Google Search Console Ping dispatched!', 'success');
  },

  downloadSitemapXml() {
    const profiles = this.getSavedProfiles();
    const today = new Date().toISOString().split('T')[0];
    const baseOrigin = 'https://raviattrash-pro.github.io/OmniSaaS';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n`;
    xml += `  <url>\n    <loc>${baseOrigin}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${baseOrigin}/admin/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;

    profiles.forEach(p => {
      const slug = p.slug || this.slugify(p.businessName);
      xml += `  <url>\n    <loc>${baseOrigin}/?slug=${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>\n`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    this.showToast('🗺️ Generated & downloaded fresh sitemap.xml!', 'success');
  },

  downloadIndexingRunnerScript() {
    window.open('https://github.com/raviattrash-pro/OmniSaaS/blob/main/scripts/google_indexing.js', '_blank');
    this.showToast('📜 Opening Google Indexing Script repository!', 'info');
  },

  renderIndexingUrlsTable() {
    const tbody = document.getElementById('indexing_urls_table_body');
    if (!tbody) return;

    const profiles = this.getSavedProfiles();
    const baseOrigin = 'https://raviattrash-pro.github.io/OmniSaaS';

    const list = [
      { name: 'OmniSaaS Platform Portal (Root)', slug: '/', url: `${baseOrigin}/`, priority: '1.0' },
      { name: 'OmniSaaS Admin Center', slug: '/admin/', url: `${baseOrigin}/admin/`, priority: '0.6' }
    ];

    profiles.forEach(p => {
      const slug = p.slug || this.slugify(p.businessName);
      list.push({
        name: p.businessName,
        slug: `/${slug}`,
        url: `${baseOrigin}/?slug=${slug}`,
        priority: '0.9'
      });
    });

    tbody.innerHTML = list.map(item => `
      <tr>
        <td><strong>${this.escapeHTML(item.name)}</strong></td>
        <td><code>${this.escapeHTML(item.slug)}</code></td>
        <td>
          <a href="${item.url}" target="_blank" style="color: var(--admin-primary); text-decoration: underline; font-size: 11px;">
            ${item.url}
          </a>
        </td>
        <td><span class="badge-slug">${item.priority}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <a href="https://search.google.com/test/rich-results?url=${encodeURIComponent(item.url)}" target="_blank" class="btn-admin btn-admin-outline" style="padding: 3px 8px; font-size: 11px; text-decoration: none;">
              🧪 Rich Results
            </a>
            <a href="https://www.google.com/search?q=site:${encodeURIComponent(item.url)}" target="_blank" class="btn-admin btn-admin-outline" style="padding: 3px 8px; font-size: 11px; text-decoration: none;">
              🔍 Site Search
            </a>
          </div>
        </td>
      </tr>
    `).join('');
  },

  // =========================================================================
  // 🛡️ SECURITY & TOAST UTILITIES
  // =========================================================================
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    if (typeof str !== 'string') str = String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/`/g, '&#96;')
      .replace(/\//g, '&#x2F;');
  },

  sanitizeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/["'<>`]/g, '');
  },

  showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.zIndex = '9999';
    toast.style.background = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#1e293b');
    toast.style.color = '#fff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontWeight = '700';
    toast.style.fontSize = '13px';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }
};

window.AdminDashboard = AdminDashboard;
document.addEventListener('DOMContentLoaded', () => AdminDashboard.init());
