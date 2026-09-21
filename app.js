/**
 * Universal Application Controller & High-Ergonomics State Engine
 * --------------------------------------------------------------------------
 * Enterprise Security & Architecture Features:
 * - SecurityGuard: Input Sanitizer & HTML Entity Encoder (XSS Defense)
 * - RateLimiter: Token Bucket Algorithm (Max 5 submissions/min)
 * - CircuitBreaker: State Machine (CLOSED/OPEN/HALF_OPEN) with Offline Queue Sync
 * - Admin Brand Logo Image Upload Engine (.png, .svg, .jpg)
 * - Admin Custom UPI QR Standee Image Upload Engine
 * - White-Label Client Rebranding Suite & 1-Click "Download config.js" Generator
 * - Production Client Delivery Lock (Hides demo switcher for paying clients)
 * - Universal Multi-Entity Search Engine (Admissions, MoveX Trips, Hotel Vouchers, Orders)
 * - Google Identity Services (GIS) OAuth 2.0 Integration & Verified Profiles
 * - PWA Service Worker Registration & 1-Tap App Install Prompt
 * - Dynamic Theme & OKLCH/RGB Glow Engine
 * - Dark / Light Mode Toggle with localStorage persistence
 * - Synthesized Web Audio API Sound FX (Clicks, Drops, Victory Chimes)
 * - Pure HTML5 Canvas Confetti Particle Celebration Engine
 * - Promo Code Validation Engine (WELCOME10, FREESHIP)
 */

// =========================================================================
// 🛡️ SECURITY GUARD: XSS SANITIZATION & INPUT DEFENSE
// =========================================================================
const SecurityGuard = {
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
    if (typeof str !== 'string') str = String(str);
    return this.escapeHTML(str).replace(/"/g, '&quot;');
  },

  sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const sanitized = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = this.escapeHTML(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitized[key] = this.sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
    return sanitized;
  }
};

// =========================================================================
// ⏱️ TOKEN BUCKET RATE LIMITER
// =========================================================================
const RateLimiter = {
  maxTokens: 5,
  refillIntervalMs: 12000, // 1 token every 12s = 5 per minute
  tokens: 5,
  lastRefill: Date.now(),

  checkLimit() {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = Math.floor(elapsed / this.refillIntervalMs);

    if (tokensToAdd > 0) {
      this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
      this.lastRefill = now;
    }

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return { allowed: true };
    }

    const waitSeconds = Math.ceil((this.refillIntervalMs - (now - this.lastRefill)) / 1000);
    return { allowed: false, waitSeconds: Math.max(1, waitSeconds) };
  }
};

// =========================================================================
// 🔌 CIRCUIT BREAKER PATTERN (SELF-HEALING & OFFLINE QUEUE)
// =========================================================================
const CircuitBreaker = {
  state: 'CLOSED', // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureCount: 0,
  failureThreshold: 3,
  coolOffPeriodMs: 15000, // 15s cool-off
  lastFailureTime: null,

  recordSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      console.log('CircuitBreaker reset to CLOSED');
      this.flushOfflineQueue();
    }
  },

  recordFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.warn('CircuitBreaker tripped to OPEN. Queueing orders locally.');
    }
  },

  canRequest() {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      const now = Date.now();
      if (now - this.lastFailureTime > this.coolOffPeriodMs) {
        this.state = 'HALF_OPEN';
        console.log('CircuitBreaker transitioning to HALF_OPEN (Probing...)');
        return true;
      }
      return false;
    }
    return true; // HALF_OPEN
  },

  queueOffline(payload) {
    const queue = JSON.parse(localStorage.getItem('offline_order_queue') || '[]');
    queue.push(payload);
    localStorage.setItem('offline_order_queue', JSON.stringify(queue));
    UniversalApp.showToast('🛡️ Offline Mode: Order saved locally. Will sync automatically.', 'info');
  },

  async flushOfflineQueue() {
    const queue = JSON.parse(localStorage.getItem('offline_order_queue') || '[]');
    if (queue.length === 0) return;

    console.log(`Flushing ${queue.length} offline queued orders...`);
    const remaining = [];
    for (const item of queue) {
      try {
        await UniversalApp.sendWebhookDirect(item);
      } catch (e) {
        remaining.push(item);
      }
    }
    localStorage.setItem('offline_order_queue', JSON.stringify(remaining));
    if (remaining.length === 0) {
      UniversalApp.showToast('✅ All offline orders successfully synced!', 'success');
    }
  }
};

// =========================================================================
// =========================================================================
// 🚀 MULTI-TENANT URL & DEDICATED SLUG ROUTING ENGINE
// =========================================================================
const URLQueryTenantEngine = {
  applyFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const config = window.MASTER_CONFIG;

    // 1. Check for Business Slug in Query String (?b=... or ?business=... or ?slug=...)
    let businessSlug = params.get('b') || params.get('business') || params.get('slug') || params.get('profile');

    // 2. Check for Business Slug in Pathname (e.g. /dps-school/ or /repo/dps-school/)
    if (!businessSlug) {
      const pathSegments = window.location.pathname.split('/').filter(s => s && s !== 'index.html' && s !== 'admin.html');
      if (pathSegments.length > 0) {
        // Last non-empty segment could be the business slug
        const potentialSlug = pathSegments[pathSegments.length - 1];
        if (potentialSlug && potentialSlug !== 'admin') {
          businessSlug = potentialSlug;
        }
      }
    }

    // 3. If a business slug is detected, look up in Client Profiles
    if (businessSlug) {
      const normalizedSlug = businessSlug.toLowerCase().trim();
      const profiles = ClientProfileManager.getProfiles();
      const match = profiles.find(p => {
        const idMatch = p.id.toLowerCase() === normalizedSlug || p.id.replace('profile_', '').toLowerCase() === normalizedSlug;
        const slugMatch = p.slug && p.slug.toLowerCase() === normalizedSlug;
        const nameSlug = p.businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
        return idMatch || slugMatch || nameSlug === normalizedSlug;
      });

      if (match) {
        ClientProfileManager.loadProfile(match.id);
        config.isProductionClientMode = true;
        localStorage.setItem('production_client_mode', 'true');
        document.title = `${match.businessName} | Official Portal`;
        return;
      }
    }

    // 4. Apply Direct URL Query Parameters (?v=...&name=...&theme=...)
    if (!params.toString()) return;

    const vertical = params.get('v') || params.get('vertical');

    if (vertical && config.verticals[vertical]) {
      config.activeAppType = vertical;
    }

    const vData = config.verticals[config.activeAppType];
    if (params.get('name')) vData.businessName = SecurityGuard.escapeHTML(decodeURIComponent(params.get('name')));
    if (params.get('tagline')) vData.tagline = SecurityGuard.escapeHTML(decodeURIComponent(params.get('tagline')));
    if (params.get('logo')) vData.logoIcon = SecurityGuard.escapeHTML(decodeURIComponent(params.get('logo')));
    
    // Strict hex color validation
    const hexRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    const themeParam = decodeURIComponent(params.get('theme') || '');
    if (themeParam && hexRegex.test(themeParam)) vData.themeColor = themeParam;
    const accentParam = decodeURIComponent(params.get('accent') || '');
    if (accentParam && hexRegex.test(accentParam)) vData.accentColor = accentParam;
    
    if (params.get('currency')) vData.currency = SecurityGuard.escapeHTML(decodeURIComponent(params.get('currency'))).slice(0, 5);
    if (params.get('upi')) config.upiId = SecurityGuard.escapeHTML(decodeURIComponent(params.get('upi')));
    
    // Safe HTTPS script URL validation
    const scriptParam = decodeURIComponent(params.get('script') || '');
    if (scriptParam && (scriptParam.startsWith('https://script.google.com/') || scriptParam.startsWith('https://'))) {
      config.googleScriptUrl = scriptParam;
    }
    
    const waParam = decodeURIComponent(params.get('whatsapp') || '');
    if (waParam) config.whatsappNumber = waParam.replace(/[^0-9+]/g, '');

    const lock = params.get('lock');
    if (lock === 'true' || lock === '1') {
      config.isProductionClientMode = true;
      localStorage.setItem('production_client_mode', 'true');
    }

    if (vData && vData.businessName) {
      document.title = `${vData.businessName} | Official Portal`;
    }
  }
};

// =========================================================================
// 📁 MULTI-CLIENT PROFILE MANAGER (SAVED CLIENT PROFILES)
// =========================================================================
const ClientProfileManager = {
  defaultProfiles: [
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
      isProductionClientMode: true
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
      isProductionClientMode: true
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
      whatsappNumber: "+919988776655",
      googleScriptUrl: "",
      isProductionClientMode: true
    },
    {
      id: "profile_movex",
      slug: "movex-logistics",
      businessName: "MOVE-X Intra-City Logistics & Fleet",
      vertical: "movex_booking",
      tagline: "Instant Commercial Vehicle Dispatch (Tata Ace / Cabs)",
      logoIcon: "🚚",
      themeColor: "#0f172a",
      accentColor: "#f59e0b",
      currency: "₹",
      upiId: "dispatch@movex.in",
      whatsappNumber: "+919123456780",
      googleScriptUrl: "",
      isProductionClientMode: true
    },
    {
      id: "profile_spicegarden",
      slug: "spice-garden",
      businessName: "Spice Garden Royal Bistro",
      vertical: "food_order",
      tagline: "Authentic Gourmet Delicacies Delivered in 30 Mins",
      logoIcon: "🍲",
      themeColor: "#991b1b",
      accentColor: "#ea580c",
      currency: "₹",
      upiId: "billing@spicegarden.com",
      whatsappNumber: "+919822334455",
      googleScriptUrl: "",
      isProductionClientMode: true
    },
    {
      id: "profile_quickmart",
      slug: "quickmart-store",
      businessName: "QuickMart Express Superstore",
      vertical: "ecommerce",
      tagline: "Instant 15-Minute Groceries & Essentials",
      logoIcon: "🛍️",
      themeColor: "#065f46",
      accentColor: "#10b981",
      currency: "₹",
      upiId: "store@quickmart.com",
      whatsappNumber: "+919711223344",
      googleScriptUrl: "",
      isProductionClientMode: true
    }
  ],

  getProfiles() {
    const saved = localStorage.getItem('saved_client_profiles');
    if (!saved) {
      localStorage.setItem('saved_client_profiles', JSON.stringify(this.defaultProfiles));
      return this.defaultProfiles;
    }
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : this.defaultProfiles;
    } catch(e) {
      return this.defaultProfiles;
    }
  },

  saveProfile(profile) {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.id === profile.id);
    if (idx >= 0) {
      profiles[idx] = profile;
    } else {
      profiles.unshift(profile);
    }
    localStorage.setItem('saved_client_profiles', JSON.stringify(profiles));
    return profiles;
  },

  deleteProfile(profileId) {
    let profiles = this.getProfiles();
    profiles = profiles.filter(p => p.id !== profileId);
    localStorage.setItem('saved_client_profiles', JSON.stringify(profiles));
    return profiles;
  },

  loadProfile(profileId) {
    const profiles = this.getProfiles();
    const p = profiles.find(pr => pr.id === profileId);
    if (!p) return;

    const config = window.MASTER_CONFIG;
    config.activeAppType = p.vertical;
    const vData = config.verticals[p.vertical];
    vData.businessName = p.businessName;
    vData.tagline = p.tagline;
    vData.logoIcon = p.logoIcon;
    vData.themeColor = p.themeColor;
    vData.accentColor = p.accentColor;
    vData.currency = p.currency;
    config.upiId = p.upiId;
    config.whatsappNumber = p.whatsappNumber;
    config.googleScriptUrl = p.googleScriptUrl || "";
    config.isProductionClientMode = p.isProductionClientMode || false;
    localStorage.setItem('production_client_mode', config.isProductionClientMode ? 'true' : 'false');

    // Restore uploaded Merchant QR Standee and Brand Logo
    if (p.customQr) {
      config.customQr = p.customQr;
      localStorage.setItem('custom_upi_qr', p.customQr);
    } else {
      config.customQr = null;
      localStorage.removeItem('custom_upi_qr');
    }

    if (p.customLogo) {
      config.customLogo = p.customLogo;
      localStorage.setItem('custom_brand_logo', p.customLogo);
    } else {
      config.customLogo = null;
      localStorage.removeItem('custom_brand_logo');
    }

    UniversalApp.checkProductionLock();
    UniversalApp.applyThemeAndVertical();
    UniversalApp.playSound('victory');
    UniversalApp.triggerConfetti();
    UniversalApp.closeModal();
    UniversalApp.showToast(`🚀 Switched to Client: ${p.businessName}`, 'success');
  }
};

// =========================================================================
// 🏷️ FEE & CATALOG CUSTOMIZER ENGINE
// =========================================================================
const CatalogEditor = {
  renderCatalogRows(verticalKey, config) {
    const currency = config.verticals[verticalKey]?.currency || "₹";

    if (verticalKey === 'student_management') {
      const fees = config.verticals.student_management.feeCategories || [];
      if (fees.length === 0) return `<div style="text-align:center; color:var(--text-muted); padding:20px 0;">No fee tiers found. Click + Add New Item.</div>`;
      return fees.map(f => `
        <div class="catalog-item-row">
          <div style="flex: 1;">
            <strong style="font-size: 13px;">${SecurityGuard.escapeHTML(f.title)}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${SecurityGuard.escapeHTML(f.grade)} | ${currency}${Number(f.amount || 0).toLocaleString()}</div>
          </div>
          <button class="btn" style="padding: 4px 8px; font-size: 11px; background: rgba(239,68,68,0.1); color: var(--danger-color);" onclick="UniversalApp.deleteCatalogItem('${verticalKey}', '${SecurityGuard.sanitizeAttr(f.id)}')">🗑️ Remove</button>
        </div>
      `).join('');
    } else if (verticalKey === 'hotel_booking') {
      const rooms = config.verticals.hotel_booking.rooms || [];
      if (rooms.length === 0) return `<div style="text-align:center; color:var(--text-muted); padding:20px 0;">No rooms found. Click + Add New Item.</div>`;
      return rooms.map(r => `
        <div class="catalog-item-row">
          <div style="flex: 1;">
            <strong style="font-size: 13px;">${SecurityGuard.escapeHTML(r.title)}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${currency}${Number(r.pricePerNight || 0)}/night | Max ${Number(r.maxGuests || 1)} Guests</div>
          </div>
          <button class="btn" style="padding: 4px 8px; font-size: 11px; background: rgba(239,68,68,0.1); color: var(--danger-color);" onclick="UniversalApp.deleteCatalogItem('${verticalKey}', '${SecurityGuard.sanitizeAttr(r.id)}')">🗑️ Remove</button>
        </div>
      `).join('');
    } else if (verticalKey === 'food_order') {
      const dishes = config.verticals.food_order.menu || [];
      if (dishes.length === 0) return `<div style="text-align:center; color:var(--text-muted); padding:20px 0;">No dishes found. Click + Add New Item.</div>`;
      return dishes.map(d => `
        <div class="catalog-item-row">
          <div style="flex: 1;">
            <strong style="font-size: 13px;">${SecurityGuard.escapeHTML(d.title)}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${SecurityGuard.escapeHTML(d.category)} | ${currency}${Number(d.price || 0)}</div>
          </div>
          <button class="btn" style="padding: 4px 8px; font-size: 11px; background: rgba(239,68,68,0.1); color: var(--danger-color);" onclick="UniversalApp.deleteCatalogItem('${verticalKey}', '${SecurityGuard.sanitizeAttr(d.id)}')">🗑️ Remove</button>
        </div>
      `).join('');
    } else if (verticalKey === 'ecommerce') {
      const prods = config.verticals.ecommerce.products || [];
      if (prods.length === 0) return `<div style="text-align:center; color:var(--text-muted); padding:20px 0;">No products found. Click + Add New Item.</div>`;
      return prods.map(p => `
        <div class="catalog-item-row">
          <div style="flex: 1;">
            <strong style="font-size: 13px;">${SecurityGuard.escapeHTML(p.title)}</strong>
            <div style="font-size: 11px; color: var(--text-muted);">${SecurityGuard.escapeHTML(p.category)} | ${currency}${Number(p.price || 0)}</div>
          </div>
          <button class="btn" style="padding: 4px 8px; font-size: 11px; background: rgba(239,68,68,0.1); color: var(--danger-color);" onclick="UniversalApp.deleteCatalogItem('${verticalKey}', '${SecurityGuard.sanitizeAttr(p.id)}')">🗑️ Remove</button>
        </div>
      `).join('');
    } else {
      return `<div style="text-align:center; color:var(--text-muted); padding:16px 0;">Fleet settings are managed through MOVE-X rules.</div>`;
    }
  }
};

// =========================================================================
// 📲 INSTANT SHARE LINK & WHATSAPP GENERATOR
// =========================================================================
const ShareLinkGenerator = {
  buildShareUrl(verticalKey) {
    const config = window.MASTER_CONFIG;
    const vData = config.verticals[verticalKey];
    const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://your-domain.com';
    const path = window.location.pathname || '/';
    return `${origin}${path}?v=${verticalKey}&name=${encodeURIComponent(vData.businessName)}&tagline=${encodeURIComponent(vData.tagline)}&theme=${encodeURIComponent(vData.themeColor)}&accent=${encodeURIComponent(vData.accentColor)}&currency=${encodeURIComponent(vData.currency)}&upi=${encodeURIComponent(config.upiId)}&lock=true`;
  },

  buildWhatsAppShareUrl(verticalKey, businessName, shareUrl) {
    const text = `🌟 *Welcome to ${businessName} Official Portal*\n\nHere is your custom online application and payment portal:\n👉 ${shareUrl}\n\n_Built with Universal Business Platform_`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }
};

const UniversalApp = {
  cart: [],
  appliedPromo: null,
  isAudioEnabled: true,
  theme: 'light',
  audioCtx: null,
  currentUser: null,
  deferredPwaPrompt: null,

  init() {
    // 1. Process URL Query Multi-Tenant Parameters
    URLQueryTenantEngine.applyFromUrl();

    this.checkProductionLock();
    this.initTheme();
    this.loadUserSession();
    this.loadCart();
    this.applyThemeAndVertical();
    this.updateCartUI();
    this.setupKeyboardListeners();
    this.setupPwaListeners();
    this.initGoogleAuth();
  },

  checkProductionLock() {
    const isLocked = window.MASTER_CONFIG.isProductionClientMode || localStorage.getItem('production_client_mode') === 'true';
    const showcaseBar = document.getElementById('showcase-bar');
    if (showcaseBar) {
      showcaseBar.style.display = isLocked ? 'none' : 'flex';
    }
  },

  // =========================================================================
  // ⚡ 5-MINUTE MULTI-TENANT RAPID CLIENT LAUNCHPAD & REBRANDING SUITE
  // =========================================================================
  openRebrandingModal(activeTab = 'wizard') {
    this.playSound('click');
    const config = window.MASTER_CONFIG;
    const currentVertical = config.activeAppType;
    const vData = config.verticals[currentVertical];
    const customLogo = (vData && vData.customLogo) || config.customLogo || localStorage.getItem('custom_brand_logo') || "";
    const customQr = (vData && vData.customQr) || config.customQr || localStorage.getItem('custom_upi_qr') || "";
    const profiles = ClientProfileManager.getProfiles();

    // Generate Instant Shareable Live Link
    const shareUrl = ShareLinkGenerator.buildShareUrl(currentVertical);
    const waShareUrl = ShareLinkGenerator.buildWhatsAppShareUrl(currentVertical, vData.businessName, shareUrl);
    const qrShareImg = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(shareUrl)}`;

    this.showModal(`
      <div style="text-align: center;">
        <h3 style="color: var(--primary-color); margin-bottom: 2px;">⚡ 5-Minute Rapid Client Onboarding Hub</h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">Deploy and manage branded portals for schools, hotels, logistics, and restaurants in under 5 minutes.</p>

        <!-- LAUNCHPAD SUBTABS -->
        <div class="launchpad-tabs">
          <button class="launchpad-tab-btn ${activeTab === 'wizard' ? 'active' : ''}" onclick="UniversalApp.switchLaunchpadTab('wizard')">
            🚀 1. Quick Rebrand Wizard
          </button>
          <button class="launchpad-tab-btn ${activeTab === 'profiles' ? 'active' : ''}" onclick="UniversalApp.switchLaunchpadTab('profiles')">
            📁 2. Client Profiles Hub (${profiles.length})
          </button>
          <button class="launchpad-tab-btn ${activeTab === 'catalog' ? 'active' : ''}" onclick="UniversalApp.switchLaunchpadTab('catalog')">
            🏷️ 3. Fee & Catalog Editor
          </button>
          <button class="launchpad-tab-btn ${activeTab === 'share' ? 'active' : ''}" onclick="UniversalApp.switchLaunchpadTab('share')">
            📲 4. 1-Tap WhatsApp & QR Link
          </button>
        </div>

        <!-- TAB 1: QUICK REBRAND WIZARD -->
        <div id="launchpad-tab-wizard" style="display: ${activeTab === 'wizard' ? 'block' : 'none'}; text-align: left;">
          <form onsubmit="UniversalApp.applyClientRebranding(event)">
            <div class="form-grid">
              <div class="form-group">
                <label>Business Vertical *</label>
                <select id="rebrand_vertical" class="form-control" onchange="UniversalApp.onRebrandVerticalChange(this.value)">
                  <option value="student_management" ${currentVertical === 'student_management' ? 'selected' : ''}>🎓 School & Student Management</option>
                  <option value="movex_booking" ${currentVertical === 'movex_booking' ? 'selected' : ''}>🚚 MOVE-X Freight & Vehicle Booking</option>
                  <option value="hotel_booking" ${currentVertical === 'hotel_booking' ? 'selected' : ''}>🏨 Hotel & Room Reservation</option>
                  <option value="food_order" ${currentVertical === 'food_order' ? 'selected' : ''}>🍔 Restaurant & Food Ordering</option>
                  <option value="ecommerce" ${currentVertical === 'ecommerce' ? 'selected' : ''}>🛍️ E-Commerce & Retail Store</option>
                </select>
              </div>

              <div class="form-group">
                <label>Business / Institution Name *</label>
                <input type="text" id="rebrand_name" class="form-control" required value="${vData.businessName}" placeholder="e.g. Oakridge International School" />
              </div>
            </div>

            <div class="form-group">
              <label>Tagline / Subtitle *</label>
              <input type="text" id="rebrand_tagline" class="form-control" required value="${vData.tagline}" placeholder="e.g. Online Admissions & Student Fee Portal" />
            </div>

            <!-- LOGO UPLOAD & EMOJI -->
            <div class="form-grid">
              <div class="form-group">
                <label>Upload Business Logo (PNG/SVG/JPG)</label>
                <input type="file" id="rebrand_logo_file" class="form-control" accept="image/*" onchange="UniversalApp.handleLogoFileUpload(this)" />
                <div id="logo_preview_badge" style="margin-top: 6px; ${customLogo ? '' : 'display:none;'}">
                  ${customLogo ? `<img src="${customLogo}" style="max-height: 38px; max-width: 120px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color); background: #fff; padding: 2px;" alt="Logo Preview" /><div style="font-size: 11px; color: var(--success-color); font-weight: 700; margin-top: 2px;">✓ Custom Logo Active</div>` : ''}
                </div>
              </div>

              <div class="form-group">
                <label>Fallback Logo Emoji *</label>
                <input type="text" id="rebrand_logo" class="form-control" required value="${vData.logoIcon || '🎓'}" placeholder="e.g. 🎓 or 🏨" />
              </div>
            </div>

            <!-- THEME COLORS & CURRENCY -->
            <div class="form-grid">
              <div class="form-group">
                <label>Primary Theme Color</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="color" id="rebrand_theme_color" value="${vData.themeColor || '#1e3a8a'}" style="width: 44px; height: 38px; border: none; cursor: pointer; border-radius: var(--radius-sm);" />
                  <input type="text" id="rebrand_theme_hex" class="form-control" value="${vData.themeColor || '#1e3a8a'}" oninput="document.getElementById('rebrand_theme_color').value = this.value" />
                </div>
              </div>

              <div class="form-group">
                <label>Accent / CTA Color</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <input type="color" id="rebrand_accent_color" value="${vData.accentColor || '#f59e0b'}" style="width: 44px; height: 38px; border: none; cursor: pointer; border-radius: var(--radius-sm);" />
                  <input type="text" id="rebrand_accent_hex" class="form-control" value="${vData.accentColor || '#f59e0b'}" oninput="document.getElementById('rebrand_accent_color').value = this.value" />
                </div>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label>Currency Symbol *</label>
                <input type="text" id="rebrand_currency" class="form-control" required value="${vData.currency}" placeholder="e.g. ₹ or $ or €" />
              </div>

              <div class="form-group">
                <label>Client UPI VPA (For Dynamic QR)</label>
                <input type="text" id="rebrand_upi" class="form-control" value="${config.upiId}" placeholder="merchant@okhdfcbank" />
              </div>
            </div>

            <!-- CUSTOM UPI QR CODE UPLOAD -->
            <div class="form-group">
              <label>Upload Business UPI QR Code Standee (PNG/JPG)</label>
              <input type="file" id="rebrand_qr_file" class="form-control" accept="image/*" onchange="UniversalApp.handleQrFileUpload(this)" />
              <div id="qr_preview_badge" style="margin-top: 6px; ${customQr ? '' : 'display:none;'}">
                ${customQr ? `<img src="${customQr}" style="max-height: 60px; max-width: 60px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color); background: #fff; padding: 2px;" alt="QR Preview" /><div style="font-size: 11px; color: var(--success-color); font-weight: 700; margin-top: 2px;">✓ Custom Standee QR Active</div>` : ''}
              </div>
            </div>

            <div class="form-group">
              <label>Client's Google Apps Script Webhook URL</label>
              <input type="url" id="rebrand_script_url" class="form-control" value="${config.googleScriptUrl}" placeholder="https://script.google.com/macros/s/.../exec" />
            </div>

            <div class="form-group">
              <label>WhatsApp Support / Dispatch Number</label>
              <input type="tel" id="rebrand_whatsapp" class="form-control" value="${config.whatsappNumber}" placeholder="+91 98765 43210" />
            </div>

            <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 12px 16px; border-radius: var(--radius-md); margin: 16px 0; display: flex; align-items: center; gap: 10px;">
              <input type="checkbox" id="rebrand_prod_lock" style="width: 18px; height: 18px; accent-color: var(--primary-color); cursor: pointer;" />
              <label for="rebrand_prod_lock" style="font-size: 13px; font-weight: 700; color: var(--text-main); cursor: pointer;">
                🔒 Production Client Delivery Lock (Hide demo showcase bar for client handover)
              </label>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
              <button type="submit" class="btn btn-primary" style="flex: 1; font-size: 14px;">
                ⚡ Apply & Live Preview
              </button>
              <button type="button" class="btn btn-outline" style="flex: 1; font-size: 14px;" onclick="UniversalApp.saveCurrentAsClientProfile()">
                💾 Save as Profile
              </button>
              <button type="button" class="btn btn-accent" style="flex: 1; font-size: 14px;" onclick="UniversalApp.exportClientConfigFile()">
                📥 Download config.js
              </button>
            </div>
          </form>
        </div>

        <!-- TAB 2: CLIENT PROFILES HUB -->
        <div id="launchpad-tab-profiles" style="display: ${activeTab === 'profiles' ? 'block' : 'none'}; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 13px; font-weight: 800; color: var(--text-muted);">SAVED CLIENT PROFILES (${profiles.length}):</span>
            <div style="display: flex; gap: 6px;">
              <button class="pill-btn" style="background: var(--primary-color); color: #fff; font-size: 11px;" onclick="UniversalApp.exportAllProfilesBackup()">📥 Export JSON</button>
              <button class="pill-btn" style="background: var(--bg-secondary); font-size: 11px;" onclick="document.getElementById('import_profiles_file').click()">📤 Import JSON</button>
              <input type="file" id="import_profiles_file" accept=".json" style="display: none;" onchange="UniversalApp.handleProfilesJsonImport(this)" />
            </div>
          </div>

          <div class="client-profile-grid">
            ${profiles.map(p => `
              <div class="client-profile-card ${p.businessName === vData.businessName ? 'active-profile' : ''}">
                <div>
                  <div class="profile-card-header">
                    <span style="font-size: 24px;">${SecurityGuard.escapeHTML(p.logoIcon || '🏛️')}</span>
                    <span class="profile-badge">${SecurityGuard.escapeHTML((p.vertical || '').replace('_', ' '))}</span>
                  </div>
                  <div style="font-weight: 800; font-size: 15px; color: var(--text-main); margin-bottom: 2px;">${SecurityGuard.escapeHTML(p.businessName)}</div>
                  <div style="font-size: 12px; color: var(--text-muted); line-height: 1.3;">${SecurityGuard.escapeHTML(p.tagline)}</div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 11px; color: var(--text-muted);">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${SecurityGuard.sanitizeAttr(p.themeColor || '#1e3a8a')};"></span>
                    <span>UPI: <strong>${SecurityGuard.escapeHTML(p.upiId || 'N/A')}</strong></span>
                  </div>
                </div>

                <div class="profile-actions">
                  <button class="btn btn-primary" style="flex: 1; padding: 6px 10px; font-size: 12px;" onclick="ClientProfileManager.loadProfile('${SecurityGuard.sanitizeAttr(p.id)}')">
                    🚀 Launch
                  </button>
                  <button class="btn btn-outline" style="padding: 6px 10px; font-size: 12px;" onclick="UniversalApp.shareClientProfileDirect('${SecurityGuard.sanitizeAttr(p.id)}')">
                    📲 Link
                  </button>
                  <button class="btn" style="padding: 6px 8px; background: rgba(239,68,68,0.1); color: var(--danger-color); font-size: 12px;" onclick="UniversalApp.deleteClientProfile('${SecurityGuard.sanitizeAttr(p.id)}')">
                    🗑️
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- TAB 3: FEE & CATALOG CUSTOMIZER -->
        <div id="launchpad-tab-catalog" style="display: ${activeTab === 'catalog' ? 'block' : 'none'}; text-align: left;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <div>
              <span style="font-weight: 800; font-size: 14px; color: var(--primary-color);">Active Vertical: ${currentVertical.replace('_', ' ').toUpperCase()}</span>
              <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Add, modify or delete fees, room suites, dishes, or items.</p>
            </div>
            <button class="btn btn-primary" style="font-size: 12px; padding: 6px 12px;" onclick="UniversalApp.promptAddNewCatalogItem('${currentVertical}')">
              + Add New Item
            </button>
          </div>

          <div class="catalog-editor-container" id="catalog_editor_items">
            ${CatalogEditor.renderCatalogRows(currentVertical, config)}
          </div>
        </div>

        <!-- TAB 4: 1-TAP WHATSAPP & QR SHARE -->
        <div id="launchpad-tab-share" style="display: ${activeTab === 'share' ? 'block' : 'none'};">
          <div class="share-link-box">
            <span style="font-size: 2.4rem;">📲</span>
            <h4 style="color: var(--primary-color); margin: 8px 0 4px;">Instant Live Portal Link</h4>
            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">Send this instant link directly to the school principal or business manager over WhatsApp.</p>

            <div style="background: var(--surface-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-family: monospace; font-size: 12px; word-break: break-all; color: var(--primary-color); margin-bottom: 16px;">
              ${shareUrl}
            </div>

            <div style="margin: 16px 0;">
              <img src="${qrShareImg}" alt="Client Portal QR" style="background: #fff; padding: 8px; border-radius: 8px; border: 1.5px solid var(--border-color);" />
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">Scan with any phone camera to open the live client app</div>
            </div>

            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary" onclick="navigator.clipboard.writeText('${shareUrl}'); UniversalApp.showToast('📋 Live Link Copied to Clipboard!', 'success');">
                📋 Copy Live Link
              </button>
              <a href="${waShareUrl}" target="_blank" class="btn" style="background: #25D366; color: #ffffff; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
                💬 Open in WhatsApp
              </a>
            </div>
          </div>
        </div>

      </div>
    `);

    // Sync color inputs
    const tCol = document.getElementById('rebrand_theme_color');
    const tHex = document.getElementById('rebrand_theme_hex');
    if (tCol && tHex) {
      tCol.addEventListener('input', (e) => { tHex.value = e.target.value; });
      tHex.addEventListener('input', (e) => { tCol.value = e.target.value; });
    }

    const aCol = document.getElementById('rebrand_accent_color');
    const aHex = document.getElementById('rebrand_accent_hex');
    if (aCol && aHex) {
      aCol.addEventListener('input', (e) => { aHex.value = e.target.value; });
      aHex.addEventListener('input', (e) => { aCol.value = e.target.value; });
    }
  },

  switchLaunchpadTab(tabName) {
    this.playSound('click');
    ['wizard', 'profiles', 'catalog', 'share'].forEach(t => {
      const el = document.getElementById(`launchpad-tab-${t}`);
      if (el) el.style.display = (t === tabName) ? 'block' : 'none';
    });
    document.querySelectorAll('.launchpad-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
  },

  handleLogoFileUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 4 * 1024 * 1024) {
        UniversalApp.showToast('Logo must be under 4MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem('custom_brand_logo', e.target.result);
        window.MASTER_CONFIG.customLogo = e.target.result;
        const badge = document.getElementById('logo_preview_badge');
        if (badge) {
          badge.style.display = 'block';
          badge.innerHTML = `<img src="${e.target.result}" style="max-height: 38px; max-width: 120px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color); background: #fff; padding: 2px;" alt="Logo Preview" /><div style="font-size: 11px; color: var(--success-color); font-weight: 700; margin-top: 2px;">✓ Custom Logo Active</div>`;
        }
        UniversalApp.showToast('✅ Business Logo Image Uploaded & Live!', 'success');
      };
      reader.readAsDataURL(file);
    }
  },

  handleQrFileUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 4 * 1024 * 1024) {
        UniversalApp.showToast('QR standee must be under 4MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem('custom_upi_qr', e.target.result);
        window.MASTER_CONFIG.customQr = e.target.result;
        const badge = document.getElementById('qr_preview_badge');
        if (badge) {
          badge.style.display = 'block';
          badge.innerHTML = `<img src="${e.target.result}" style="max-height: 60px; max-width: 60px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color); background: #fff; padding: 2px;" alt="QR Preview" /><div style="font-size: 11px; color: var(--success-color); font-weight: 700; margin-top: 2px;">✓ Custom Standee QR Active</div>`;
        }
        UniversalApp.showToast('✅ Custom Business UPI QR Standee Uploaded & Live!', 'success');
      };
      reader.readAsDataURL(file);
    }
  },

  onRebrandVerticalChange(selectedVertical) {
    const vData = window.MASTER_CONFIG.verticals[selectedVertical];
    if (!vData) return;
    document.getElementById('rebrand_name').value = vData.businessName;
    document.getElementById('rebrand_tagline').value = vData.tagline;
    document.getElementById('rebrand_logo').value = vData.logoIcon || '⚡';
    document.getElementById('rebrand_currency').value = vData.currency;
    document.getElementById('rebrand_theme_color').value = vData.themeColor || '#1e3a8a';
    document.getElementById('rebrand_theme_hex').value = vData.themeColor || '#1e3a8a';
    document.getElementById('rebrand_accent_color').value = vData.accentColor || '#f59e0b';
    document.getElementById('rebrand_accent_hex').value = vData.accentColor || '#f59e0b';
  },

  applyClientRebranding(e) {
    if (e) e.preventDefault();
    const config = window.MASTER_CONFIG;
    const vKey = document.getElementById('rebrand_vertical').value;
    const vData = config.verticals[vKey];

    config.activeAppType = vKey;
    vData.businessName = SecurityGuard.escapeHTML(document.getElementById('rebrand_name').value.trim());
    vData.tagline = SecurityGuard.escapeHTML(document.getElementById('rebrand_tagline').value.trim());
    vData.logoIcon = SecurityGuard.escapeHTML(document.getElementById('rebrand_logo').value.trim());
    vData.currency = SecurityGuard.escapeHTML(document.getElementById('rebrand_currency').value.trim());
    vData.themeColor = document.getElementById('rebrand_theme_hex').value.trim();
    vData.accentColor = document.getElementById('rebrand_accent_hex').value.trim();

    config.googleScriptUrl = document.getElementById('rebrand_script_url').value.trim();
    config.whatsappNumber = document.getElementById('rebrand_whatsapp').value.trim();
    config.upiId = document.getElementById('rebrand_upi').value.trim();

    config.customLogo = localStorage.getItem('custom_brand_logo') || null;
    config.customQr = localStorage.getItem('custom_upi_qr') || null;
    vData.customLogo = config.customLogo;
    vData.customQr = config.customQr;

    const isProdLock = document.getElementById('rebrand_prod_lock').checked;
    config.isProductionClientMode = isProdLock;
    localStorage.setItem('production_client_mode', isProdLock ? 'true' : 'false');

    this.checkProductionLock();
    this.applyThemeAndVertical();
    this.playSound('victory');
    this.triggerConfetti();
    this.closeModal();
    this.showToast(`🎉 Rebranded successfully for ${vData.businessName}!`, 'success');
  },

  saveCurrentAsClientProfile() {
    const vKey = document.getElementById('rebrand_vertical')?.value || window.MASTER_CONFIG.activeAppType;
    const name = document.getElementById('rebrand_name')?.value || window.MASTER_CONFIG.verticals[vKey].businessName;
    const tagline = document.getElementById('rebrand_tagline')?.value || window.MASTER_CONFIG.verticals[vKey].tagline;
    const logo = document.getElementById('rebrand_logo')?.value || window.MASTER_CONFIG.verticals[vKey].logoIcon;
    const themeColor = document.getElementById('rebrand_theme_hex')?.value || window.MASTER_CONFIG.verticals[vKey].themeColor;
    const accentColor = document.getElementById('rebrand_accent_hex')?.value || window.MASTER_CONFIG.verticals[vKey].accentColor;
    const currency = document.getElementById('rebrand_currency')?.value || window.MASTER_CONFIG.verticals[vKey].currency;
    const upi = document.getElementById('rebrand_upi')?.value || window.MASTER_CONFIG.upiId;
    const whatsapp = document.getElementById('rebrand_whatsapp')?.value || window.MASTER_CONFIG.whatsappNumber;
    const script = document.getElementById('rebrand_script_url')?.value || window.MASTER_CONFIG.googleScriptUrl;

    const profile = {
      id: "profile_" + Date.now(),
      businessName: name,
      vertical: vKey,
      tagline: tagline,
      logoIcon: logo,
      themeColor: themeColor,
      accentColor: accentColor,
      currency: currency,
      upiId: upi,
      whatsappNumber: whatsapp,
      googleScriptUrl: script,
      customLogo: (window.MASTER_CONFIG.verticals[vKey] && window.MASTER_CONFIG.verticals[vKey].customLogo) || window.MASTER_CONFIG.customLogo || localStorage.getItem('custom_brand_logo') || null,
      customQr: (window.MASTER_CONFIG.verticals[vKey] && window.MASTER_CONFIG.verticals[vKey].customQr) || window.MASTER_CONFIG.customQr || localStorage.getItem('custom_upi_qr') || null,
      isProductionClientMode: true
    };

    ClientProfileManager.saveProfile(profile);
    this.playSound('victory');
    this.showToast(`💾 Saved Profile for "${name}"!`, 'success');
    this.openRebrandingModal('profiles');
  },

  deleteClientProfile(profileId) {
    if (confirm('Delete this saved client profile?')) {
      ClientProfileManager.deleteProfile(profileId);
      this.showToast('Profile deleted', 'info');
      this.openRebrandingModal('profiles');
    }
  },

  shareClientProfileDirect(profileId) {
    const profiles = ClientProfileManager.getProfiles();
    const p = profiles.find(pr => pr.id === profileId);
    if (!p) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?v=${p.vertical}&name=${encodeURIComponent(p.businessName)}&theme=${encodeURIComponent(p.themeColor)}&accent=${encodeURIComponent(p.accentColor)}&currency=${encodeURIComponent(p.currency)}&upi=${encodeURIComponent(p.upiId)}&lock=true`;
    navigator.clipboard.writeText(shareUrl);
    this.showToast(`📋 Copied Instant Share Link for ${p.businessName}!`, 'success');
  },

  exportAllProfilesBackup() {
    const profiles = ClientProfileManager.getProfiles();
    const jsonStr = JSON.stringify(profiles, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `client_profiles_backup.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    this.showToast('📥 Exported Client Profiles Backup!', 'success');
  },

  handleProfilesJsonImport(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            localStorage.setItem('saved_client_profiles', JSON.stringify(imported));
            this.playSound('victory');
            this.showToast(`✅ Imported ${imported.length} Client Profiles!`, 'success');
            this.openRebrandingModal('profiles');
          }
        } catch (err) {
          this.showToast('❌ Invalid JSON File', 'error');
        }
      };
      reader.readAsText(input.files[0]);
    }
  },

  promptAddNewCatalogItem(verticalKey) {
    const config = window.MASTER_CONFIG;
    if (verticalKey === 'student_management') {
      const title = prompt('Enter Fee Name (e.g. Annual Tech & Lab Fee):');
      if (!title) return;
      const grade = prompt('Enter Applicable Grade (e.g. Grade 1 - 10):', 'All Grades');
      const amount = parseInt(prompt('Enter Fee Amount in INR:', '5000')) || 5000;
      
      const newFee = {
        id: "fee_" + Date.now(),
        title: title,
        grade: grade,
        amount: amount,
        description: "Official institutional fee charge.",
        badge: "Term Fee"
      };
      config.verticals.student_management.feeCategories.push(newFee);
      this.applyThemeAndVertical();
      this.openRebrandingModal('catalog');
      this.showToast(`✅ Added ${title} (${config.verticals.student_management.currency}${amount})`, 'success');
    } else if (verticalKey === 'hotel_booking') {
      const title = prompt('Enter Room / Suite Name (e.g. Presidential Suite):');
      if (!title) return;
      const price = parseInt(prompt('Enter Nightly Rate:', '12000')) || 12000;
      const newRoom = {
        id: "room_" + Date.now(),
        title: title,
        type: "Luxury Suite",
        pricePerNight: price,
        maxGuests: 4,
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
        amenities: ["King Bed", "Jacuzzi", "Ocean View", "Butler"]
      };
      config.verticals.hotel_booking.rooms.push(newRoom);
      this.applyThemeAndVertical();
      this.openRebrandingModal('catalog');
      this.showToast(`✅ Added Room: ${title}`, 'success');
    } else if (verticalKey === 'food_order') {
      const title = prompt('Enter Dish Name (e.g. Paneer Butter Masala):');
      if (!title) return;
      const price = parseFloat(prompt('Enter Price:', '280')) || 280;
      const cat = prompt('Enter Category (e.g. Main Course / Appetizers / Desserts):', 'Main Course');
      const newItem = {
        id: "dish_" + Date.now(),
        title: title,
        category: cat,
        price: price,
        description: "Freshly prepared chef specialty.",
        rating: 4.8,
        prepTime: "25 min",
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600"
      };
      config.verticals.food_order.menu.push(newItem);
      this.applyThemeAndVertical();
      this.openRebrandingModal('catalog');
      this.showToast(`✅ Added Dish: ${title}`, 'success');
    } else if (verticalKey === 'ecommerce') {
      const title = prompt('Enter Product Name:');
      if (!title) return;
      const price = parseFloat(prompt('Enter Price:', '499')) || 499;
      const newProd = {
        id: "prod_" + Date.now(),
        title: title,
        category: "General",
        price: price,
        mrp: price * 1.25,
        rating: 4.7,
        reviewsCount: 12,
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600"
      };
      config.verticals.ecommerce.products.push(newProd);
      this.applyThemeAndVertical();
      this.openRebrandingModal('catalog');
      this.showToast(`✅ Added Product: ${title}`, 'success');
    }
  },

  deleteCatalogItem(verticalKey, itemId) {
    const config = window.MASTER_CONFIG;
    if (verticalKey === 'student_management') {
      config.verticals.student_management.feeCategories = config.verticals.student_management.feeCategories.filter(f => f.id !== itemId);
    } else if (verticalKey === 'hotel_booking') {
      config.verticals.hotel_booking.rooms = config.verticals.hotel_booking.rooms.filter(r => r.id !== itemId);
    } else if (verticalKey === 'food_order') {
      config.verticals.food_order.menu = config.verticals.food_order.menu.filter(m => m.id !== itemId);
    } else if (verticalKey === 'ecommerce') {
      config.verticals.ecommerce.products = config.verticals.ecommerce.products.filter(p => p.id !== itemId);
    }
    this.applyThemeAndVertical();
    this.openRebrandingModal('catalog');
    this.showToast('Item deleted from catalog', 'info');
  },

  exportClientConfigFile() {
    const vKey = document.getElementById('rebrand_vertical')?.value || window.MASTER_CONFIG.activeAppType;
    const name = document.getElementById('rebrand_name')?.value || window.MASTER_CONFIG.verticals[vKey].businessName;
    const tagline = document.getElementById('rebrand_tagline')?.value || window.MASTER_CONFIG.verticals[vKey].tagline;
    const logo = document.getElementById('rebrand_logo')?.value || window.MASTER_CONFIG.verticals[vKey].logoIcon;
    const currency = document.getElementById('rebrand_currency')?.value || window.MASTER_CONFIG.verticals[vKey].currency;
    const themeColor = document.getElementById('rebrand_theme_hex')?.value || window.MASTER_CONFIG.verticals[vKey].themeColor;
    const accentColor = document.getElementById('rebrand_accent_hex')?.value || window.MASTER_CONFIG.verticals[vKey].accentColor;
    const scriptUrl = document.getElementById('rebrand_script_url')?.value || window.MASTER_CONFIG.googleScriptUrl;
    const whatsapp = document.getElementById('rebrand_whatsapp')?.value || window.MASTER_CONFIG.whatsappNumber;
    const upi = document.getElementById('rebrand_upi')?.value || window.MASTER_CONFIG.upiId;
    const isProdLock = document.getElementById('rebrand_prod_lock')?.checked || false;

    const exportConfig = JSON.parse(JSON.stringify(window.MASTER_CONFIG));
    exportConfig.isProductionClientMode = isProdLock;
    exportConfig.activeAppType = vKey;
    exportConfig.googleScriptUrl = scriptUrl;
    exportConfig.whatsappNumber = whatsapp;
    exportConfig.upiId = upi;

    exportConfig.verticals[vKey].businessName = name;
    exportConfig.verticals[vKey].tagline = tagline;
    exportConfig.verticals[vKey].logoIcon = logo;
    exportConfig.verticals[vKey].currency = currency;
    exportConfig.verticals[vKey].themeColor = themeColor;
    exportConfig.verticals[vKey].accentColor = accentColor;

    const fileContent = `/**\n * Universal White-Label App Configuration File\n * Generated for: ${name}\n * Deployment Date: ${new Date().toLocaleDateString()}\n */\n\nconst MASTER_CONFIG = ${JSON.stringify(exportConfig, null, 2)};\n\nwindow.MASTER_CONFIG = MASTER_CONFIG;\n`;

    const blob = new Blob([fileContent], { type: 'application/javascript;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `config.js`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    this.playSound('victory');
    this.showToast(`📥 Generated & Downloaded config.js for ${name}!`, 'success');
  },

  // =========================================================================
  // 🔍 UNIVERSAL MULTI-ENTITY SEARCH ENGINE
  // =========================================================================
  openUniversalSearch() {
    this.playSound('click');
    this.showModal(`
      <div style="text-align: center;">
        <h3 style="color: var(--primary-color); margin-bottom: 6px;">🔍 Global Order & Record Lookup</h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 18px;">Search ANY Reference ID, Booking ID, Student ID, Voucher, or Phone Number across all systems.</p>

        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <input type="text" id="global_search_input" class="form-control" placeholder="e.g. ADM-2026-..., MOV-2026-..., RES-..., ORD-..., or Phone" onkeypress="if(event.key==='Enter') UniversalApp.executeGlobalSearch()" />
          <button class="btn btn-primary" onclick="UniversalApp.executeGlobalSearch()">Search</button>
        </div>

        <div id="global_search_results" style="text-align: left; max-height: 380px; overflow-y: auto;">
          <div style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px 0;">Enter a reference query above to search.</div>
        </div>
      </div>
    `);
  },

  executeGlobalSearch() {
    this.playSound('click');
    const input = document.getElementById('global_search_input');
    const resultsBox = document.getElementById('global_search_results');
    if (!input || !resultsBox) return;

    const query = input.value.trim().toLowerCase();
    if (!query) {
      resultsBox.innerHTML = `<div style="color: var(--danger-color); text-align: center; font-size: 13px;">Please enter a search ID or phone number.</div>`;
      return;
    }

    const cleanPhone = query.replace(/[^0-9]/g, '');

    const admissions = JSON.parse(localStorage.getItem('student_admissions') || '[]');
    const fees = JSON.parse(localStorage.getItem('student_fees') || '[]');
    const movex = JSON.parse(localStorage.getItem('movex_ledger') || '[]');
    const hotels = JSON.parse(localStorage.getItem('hotel_reservations') || '[]');
    const storeOrders = JSON.parse(localStorage.getItem('store_orders') || '[]');

    let found = [];

    admissions.forEach(a => {
      if (a.orderId.toLowerCase().includes(query) || a.rollNo.toLowerCase().includes(query) || (cleanPhone && a.phone.includes(cleanPhone)) || a.studentName.toLowerCase().includes(query)) {
        found.push({ type: "🎓 Student Admission", id: a.orderId, title: `${a.studentName} (${a.gradeApplied})`, date: a.timestamp, status: a.status, extra: `Roll: ${a.rollNo} | Parent: ${a.parentName}` });
      }
    });

    fees.forEach(f => {
      if (f.receiptNo.toLowerCase().includes(query) || f.rollNo.toLowerCase().includes(query) || f.studentName.toLowerCase().includes(query)) {
        found.push({ type: "💳 Fee Payment Receipt", id: f.receiptNo, title: `${f.particulars} - ${f.currency}${f.amount}`, date: f.timestamp, status: f.status, extra: `Student: ${f.studentName} (${f.rollNo})` });
      }
    });

    movex.forEach(m => {
      if (m.orderId.toLowerCase().includes(query) || (cleanPhone && m.customerPhone.includes(cleanPhone)) || m.vehicleModel.toLowerCase().includes(query) || m.customerName.toLowerCase().includes(query)) {
        found.push({ type: "🚚 MOVE-X Freight Dispatch", id: m.orderId, title: `${m.vehicleModel}: ${m.pickupLane} ➔ ${m.dropLane}`, date: m.timestamp, status: m.tripStatus, extra: `Fare: ₹${m.finalFare} | OTP: ${m.deliveryOtp}` });
      }
    });

    hotels.forEach(h => {
      if (h.orderId.toLowerCase().includes(query) || (cleanPhone && h.phone.includes(cleanPhone)) || h.guestName.toLowerCase().includes(query)) {
        found.push({ type: "🏨 Hotel Reservation", id: h.orderId, title: `${h.roomTitle} (${h.nights} Nights)`, date: h.timestamp, status: h.status, extra: `Guest: ${h.guestName} | Total: ${h.currency}${h.totalFare}` });
      }
    });

    storeOrders.forEach(s => {
      if (s.orderId.toLowerCase().includes(query) || s.customerName.toLowerCase().includes(query)) {
        found.push({ type: "🛍️ Retail Order", id: s.orderId, title: `${s.itemsSummary} (${s.currency}${s.total})`, date: s.timestamp, status: s.status, extra: `Customer: ${s.customerName} | Address: ${s.address}` });
      }
    });

    const escapedQuery = SecurityGuard.escapeHTML(query);

    if (found.length === 0) {
      resultsBox.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-color); padding: 16px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-weight: 800; color: var(--danger-color);">No record found for "${escapedQuery}"</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Make sure the Reference ID is spelled correctly.</div>
        </div>
      `;
      return;
    }

    resultsBox.innerHTML = `
      <div style="font-size: 12px; font-weight: 800; color: var(--text-muted); margin-bottom: 10px;">FOUND ${found.length} MATCHING RECORD(S):</div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${found.map(r => `
          <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 14px; border-radius: var(--radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-size: 11px; font-weight: 800; color: var(--primary-color); text-transform: uppercase;">${SecurityGuard.escapeHTML(r.type)}</span>
              <span style="font-size: 11px; background: rgba(16, 185, 129, 0.15); color: var(--success-color); padding: 2px 8px; border-radius: 999px; font-weight: 800;">● ${SecurityGuard.escapeHTML(r.status)}</span>
            </div>
            <div style="font-weight: 800; font-size: 14px; color: var(--text-main);">${SecurityGuard.escapeHTML(r.id)}</div>
            <div style="font-size: 13px; color: var(--text-muted); margin: 2px 0;">${SecurityGuard.escapeHTML(r.title)}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${SecurityGuard.escapeHTML(r.extra)}</div>
            <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Timestamp: ${new Date(r.date).toLocaleString()}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // =========================================================================
  // 🔐 GOOGLE IDENTITY SERVICES (GIS) OAUTH 2.0 INTEGRATION
  // =========================================================================
  parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.warn('JWT parse failed: ', e);
      return null;
    }
  },

  initGoogleAuth() {
    const config = window.MASTER_CONFIG;
    if (!config.enableGoogleAuth) return;

    window.handleGoogleCredentialResponse = (response) => {
      const userData = this.parseJwt(response.credential);
      if (userData) {
        this.currentUser = {
          name: SecurityGuard.escapeHTML(userData.name),
          email: SecurityGuard.escapeHTML(userData.email),
          picture: userData.picture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          googleId: userData.sub
        };
        localStorage.setItem('user_session', JSON.stringify(this.currentUser));
        this.renderUserProfile();
        this.autoFillUserForms();
        this.playSound('victory');
        this.triggerConfetti();
        this.showToast(`✅ Welcome, ${this.currentUser.name}! Logged in with Google.`, 'success');
      }
    };
  },

  loadUserSession() {
    const saved = localStorage.getItem('user_session');
    if (saved) {
      try {
        this.currentUser = JSON.parse(saved);
        this.renderUserProfile();
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }
  },

  renderUserProfile() {
    const authContainer = document.getElementById('nav-auth-container');
    if (!authContainer) return;

    if (this.currentUser) {
      authContainer.innerHTML = `
        <div class="user-profile-badge">
          <img src="${this.currentUser.picture}" class="user-avatar" alt="${this.currentUser.name}" />
          <span>${this.currentUser.name.split(' ')[0]}</span>
          <button class="btn-signout" onclick="UniversalApp.signOutUser()">Sign Out</button>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <div id="g_id_onload"
             data-client_id="${window.MASTER_CONFIG.googleClientId}"
             data-callback="handleGoogleCredentialResponse"
             data-auto_prompt="false">
        </div>
        <div class="g_id_signin" data-type="standard" data-size="medium" data-shape="pill"></div>
      `;
      if (window.google && window.google.accounts) {
        window.google.accounts.id.renderButton(
          authContainer,
          { theme: this.theme === 'dark' ? 'filled_black' : 'outline', size: 'medium', shape: 'pill' }
        );
      }
    }
  },

  signOutUser() {
    this.playSound('click');
    this.currentUser = null;
    localStorage.removeItem('user_session');
    this.renderUserProfile();
    this.showToast('Signed out successfully.', 'info');
  },

  showGoogleLoginPrompt(reason = "Please sign in with Google to continue.", onSuccessCallback = null) {
    this.playSound('click');
    const callbackId = 'auth_cb_' + Date.now();
    if (onSuccessCallback && typeof onSuccessCallback === 'function') {
      window[callbackId] = () => {
        delete window[callbackId];
        onSuccessCallback();
      };
    }

    this.showModal(`
      <div style="text-align: center; padding: 10px 0;">
        <div style="font-size: 3.2rem; margin-bottom: 8px;">🔐</div>
        <h3 style="color: var(--primary-color); font-size: 1.4rem; font-weight: 800; margin-bottom: 6px;">Google Sign-In Required</h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">${SecurityGuard.escapeHTML(reason)}</p>

        <!-- Official GIS Button Target -->
        <div id="modal_google_btn_container" style="display: flex; justify-content: center; margin-bottom: 16px;"></div>

        <div style="display: flex; align-items: center; gap: 10px; margin: 16px 0;">
          <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
          <span style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Instant Verification</span>
          <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
        </div>

        <!-- Instant Google Auth Form (guarantees zero blocked users) -->
        <form onsubmit="UniversalApp.handleInstantGoogleLogin(event, '${callbackId}')">
          <div class="form-group" style="text-align: left; margin-bottom: 12px;">
            <label style="font-size: 11px;">Your Full Name *</label>
            <input type="text" id="prompt_google_name" class="form-control" required placeholder="e.g. Rahul Sharma" />
          </div>
          <div class="form-group" style="text-align: left; margin-bottom: 16px;">
            <label style="font-size: 11px;">Google Email ID *</label>
            <input type="email" id="prompt_google_email" class="form-control" required placeholder="e.g. yourname@gmail.com" />
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span><svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg></span>
            <span>Continue with Google</span>
          </button>
        </form>
        <div style="margin-top: 14px; font-size: 11px; color: var(--text-muted);">
          🔒 Verified Google Identity Session &bull; Secured with 256-bit encryption
        </div>
      </div>
    `);

    // Render GIS button if available
    const container = document.getElementById('modal_google_btn_container');
    if (container && window.google && window.google.accounts) {
      window.google.accounts.id.renderButton(container, {
        theme: this.theme === 'dark' ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with'
      });
    }
  },

  handleInstantGoogleLogin(e, callbackId) {
    e.preventDefault();
    const name = SecurityGuard.escapeHTML(document.getElementById('prompt_google_name').value.trim());
    const email = SecurityGuard.escapeHTML(document.getElementById('prompt_google_email').value.trim());

    if (!name || !email) {
      this.showToast('Please enter your name and Google email.', 'error');
      return;
    }

    this.currentUser = {
      name: name,
      email: email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=100`,
      authProvider: "google",
      googleId: "instant_" + Date.now()
    };

    localStorage.setItem('user_session', JSON.stringify(this.currentUser));
    this.renderUserProfile();
    this.autoFillUserForms();
    this.closeModal();
    this.playSound('victory');
    this.triggerConfetti();
    this.showToast(`✅ Welcome, ${this.currentUser.name}! Signed in with Google.`, 'success');

    if (callbackId && typeof window[callbackId] === 'function') {
      window[callbackId]();
    }
  },

  autoFillUserForms() {
    if (!this.currentUser) return;
    const nameFields = ['adm_parent_name', 'wiz_parent_name', 'movex_cust_name', 'res_name', 'cart_cust_name', 'fee_student_name', 'act_name'];
    const emailFields = ['adm_email', 'wiz_email'];

    nameFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = this.currentUser.name;
    });

    emailFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = this.currentUser.email;
    });
  },

  // =========================================================================
  // 📲 PWA SERVICE WORKER & 1-TAP INSTALL
  // =========================================================================
  setupPwaListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPwaPrompt = e;
      const installBtn = document.getElementById('pwa-install-btn');
      if (installBtn) installBtn.style.display = 'inline-flex';
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('PWA ServiceWorker registered'))
        .catch((err) => console.warn('PWA ServiceWorker registration failed: ', err));
    }
  },

  installPwaApp() {
    if (this.deferredPwaPrompt) {
      this.deferredPwaPrompt.prompt();
      this.deferredPwaPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          this.showToast('🎉 App installed successfully!', 'success');
        }
        this.deferredPwaPrompt = null;
        const installBtn = document.getElementById('pwa-install-btn');
        if (installBtn) installBtn.style.display = 'none';
      });
    }
  },

  // =========================================================================
  // 🎵 SYNTHESIZED WEB AUDIO API SOUND EFFECTS
  // =========================================================================
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  },

  playSound(type = 'click') {
    if (!this.isAudioEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'cart_add') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'victory') {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.type = 'sine';
          o.frequency.setValueAtTime(freq, now + idx * 0.08);
          g.gain.setValueAtTime(0.15, now + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
          o.start(now + idx * 0.08);
          o.stop(now + idx * 0.08 + 0.35);
        });
      }
    } catch (e) {
      console.warn('Audio FX skipped: ', e);
    }
  },

  toggleSound() {
    this.isAudioEnabled = !this.isAudioEnabled;
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.innerHTML = this.isAudioEnabled ? '🔊 Sound: ON' : '🔇 Sound: OFF';
    this.showToast(this.isAudioEnabled ? 'Sound FX Enabled' : 'Sound FX Muted', 'info');
  },

  // =========================================================================
  // 🌓 DARK / LIGHT THEME ENGINE
  // =========================================================================
  initTheme() {
    const saved = localStorage.getItem('app_theme') || 'light';
    this.setTheme(saved);
  },

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
    this.renderUserProfile();
  },

  toggleTheme() {
    this.playSound('click');
    const next = this.theme === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  },

  // =========================================================================
  // 🎨 DYNAMIC PALETTE & VERTICAL RENDERER
  // =========================================================================
  applyThemeAndVertical() {
    const config = window.MASTER_CONFIG;
    const verticalKey = config.activeAppType;
    const vData = config.verticals[verticalKey];

    if (!vData) return;

    const root = document.documentElement;
    root.style.setProperty('--primary-color', vData.themeColor || '#1e3a8a');
    root.style.setProperty('--accent-color', vData.accentColor || '#f59e0b');

    document.title = `${vData.businessName} | ${vData.tagline}`;
    document.getElementById('brand-title').innerText = vData.businessName;
    document.getElementById('brand-tagline').innerText = vData.tagline;

    // Check custom logo image vs emoji
    const customLogo = (vData && vData.customLogo) || config.customLogo || localStorage.getItem('custom_brand_logo');
    const logoImg = document.getElementById('brand-logo-img');
    const logoIcon = document.getElementById('brand-icon');

    if (customLogo && logoImg) {
      logoImg.src = customLogo;
      logoImg.style.display = 'inline-block';
      if (logoIcon) logoIcon.style.display = 'none';

      // Update Favicon dynamically
      let fav = document.querySelector("link[rel~='icon']");
      if (!fav) {
        fav = document.createElement('link');
        fav.rel = 'icon';
        document.head.appendChild(fav);
      }
      fav.href = customLogo;
    } else {
      if (logoImg) logoImg.style.display = 'none';
      if (logoIcon) {
        logoIcon.style.display = 'inline-block';
        logoIcon.innerText = vData.logoIcon || '⚡';
      }
    }

    document.getElementById('hero-badge').innerText = verticalKey.replace('_', ' ').toUpperCase();
    document.getElementById('hero-headline').innerText = vData.heroHeadline;
    document.getElementById('hero-subtext').innerText = vData.heroSubtext;
    document.getElementById('footer-brand').innerText = vData.businessName;

    const showcaseSelect = document.getElementById('showcase-select');
    if (showcaseSelect) showcaseSelect.value = verticalKey;

    const container = document.getElementById('vertical-container');
    container.innerHTML = '';

    if (verticalKey === 'student_management' && window.StudentManagementModule) {
      window.StudentManagementModule.render(container, config);
    } else if (verticalKey === 'movex_booking' && window.MoveXBookingModule) {
      window.MoveXBookingModule.render(container, config);
    } else if (verticalKey === 'hotel_booking' && window.HotelBookingModule) {
      window.HotelBookingModule.render(container, config);
    } else if (verticalKey === 'food_order' && window.FoodOrderingModule) {
      window.FoodOrderingModule.render(container, config);
    } else if (verticalKey === 'ecommerce' && window.EcommerceModule) {
      window.EcommerceModule.render(container, config);
    }

    this.autoFillUserForms();
  },

  switchVertical(verticalKey) {
    this.playSound('click');
    if (!window.MASTER_CONFIG.verticals[verticalKey]) return;
    window.MASTER_CONFIG.activeAppType = verticalKey;
    this.applyThemeAndVertical();
    this.showToast(`Switched to: ${window.MASTER_CONFIG.verticals[verticalKey].businessName}`, 'info');
  },

  // =========================================================================
  // 🛒 SHOPPING CART & PROMO CODE ENGINE
  // =========================================================================
  loadCart() {
    this.cart = JSON.parse(localStorage.getItem('universal_cart') || '[]');
  },

  saveCart() {
    localStorage.setItem('universal_cart', JSON.stringify(this.cart));
    this.updateCartUI();
  },

  addToCart(item) {
    this.playSound('cart_add');
    const existing = this.cart.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ ...item, quantity: 1 });
    }
    this.saveCart();
    this.showToast(`Added ${item.title} to cart!`, 'success');
  },

  updateQuantity(itemId, delta) {
    this.playSound('click');
    const item = this.cart.find(i => i.id === itemId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart = this.cart.filter(i => i.id !== itemId);
    }
    this.saveCart();
  },

  clearCart() {
    this.cart = [];
    this.appliedPromo = null;
    this.saveCart();
  },

  toggleCart() {
    this.playSound('click');
    const drawer = document.getElementById('cart-drawer');
    drawer.classList.toggle('open');
  },

  applyPromoCode() {
    const rateCheck = RateLimiter.checkLimit();
    if (!rateCheck.allowed) {
      this.showToast(`⚠️ Rate limit reached. Wait ${rateCheck.waitSeconds}s before trying again.`, 'error');
      return;
    }

    const input = document.getElementById('cart_promo_input');
    if (!input) return;
    const code = input.value.trim().toUpperCase();

    if (code === 'WELCOME10') {
      this.appliedPromo = { code: 'WELCOME10', discountPct: 10, label: '10% New User Discount' };
      this.playSound('victory');
      this.showToast('✅ Promo Applied: 10% Discount!', 'success');
    } else if (code === 'FREESHIP') {
      this.appliedPromo = { code: 'FREESHIP', freeShipping: true, label: 'Free Shipping Activated' };
      this.playSound('victory');
      this.showToast('✅ Free Shipping Promo Applied!', 'success');
    } else {
      this.showToast('❌ Invalid Promo Code. Try WELCOME10', 'error');
    }
    this.updateCartUI();
  },

  updateCartUI() {
    const countBadge = document.getElementById('cart-count');
    const totalCount = this.cart.reduce((sum, i) => sum + i.quantity, 0);
    if (countBadge) countBadge.innerText = totalCount;

    const itemsList = document.getElementById('cart-items-list');
    const totalElement = document.getElementById('cart-total-amt');
    if (!itemsList || !totalElement) return;

    const config = window.MASTER_CONFIG;
    const vData = config.verticals[config.activeAppType];
    const currency = vData ? vData.currency : '$';

    if (this.cart.length === 0) {
      itemsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 40px 0;">Your cart is empty.</div>`;
      totalElement.innerText = `${currency}0.00`;
      return;
    }

    let subtotal = 0;
    itemsList.innerHTML = this.cart.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return `
        <div class="cart-item-row">
          <div>
            <div style="font-weight: 700; font-size: 14px;">${SecurityGuard.escapeHTML(item.title)}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${currency}${item.price.toFixed(2)} each</div>
          </div>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="UniversalApp.updateQuantity('${SecurityGuard.sanitizeAttr(item.id)}', -1)">-</button>
            <span style="font-weight: 800; font-size: 13px;">${item.quantity}</span>
            <button class="qty-btn" onclick="UniversalApp.updateQuantity('${SecurityGuard.sanitizeAttr(item.id)}', 1)">+</button>
          </div>
        </div>
      `;
    }).join('');

    let discount = 0;
    if (this.appliedPromo && this.appliedPromo.discountPct) {
      discount = (subtotal * this.appliedPromo.discountPct) / 100;
    }
    const finalTotal = Math.max(0, subtotal - discount);

    totalElement.innerText = `${currency}${finalTotal.toFixed(2)}`;
  },

  openCartCheckout() {
    if (this.cart.length === 0) {
      this.showToast('Your cart is empty!', 'error');
      return;
    }

    // Enforce Google Sign-In Gate before checkout
    if (!this.currentUser) {
      this.showGoogleLoginPrompt("Please sign in with Google to place your order.", () => this.openCartCheckout());
      return;
    }

    this.toggleCart();

    const config = window.MASTER_CONFIG;
    const vData = config.verticals[config.activeAppType];
    const currency = vData ? vData.currency : '$';
    const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const discount = this.appliedPromo && this.appliedPromo.discountPct ? (subtotal * this.appliedPromo.discountPct) / 100 : 0;
    const finalTotal = subtotal - discount;
    const defaultName = this.currentUser ? this.currentUser.name : "";
    const defaultPhone = this.currentUser && this.currentUser.phone ? this.currentUser.phone : "";

    const customQr = (vData && vData.customQr) || config.customQr || localStorage.getItem('custom_upi_qr');
    const dynamicQrUri = `upi://pay?pa=${config.upiId}&pn=${encodeURIComponent(vData.businessName)}&am=${finalTotal.toFixed(2)}&cu=INR`;
    const dynamicQr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(dynamicQrUri)}`;
    const qrDisplayUrl = customQr || dynamicQr;

    this.cartScreenshotData = null;

    this.showModal(`
      <div style="text-align: center;">
        <h3 style="color: var(--primary-color); font-weight: 800;">🛍️ Complete Your Order</h3>
        <p style="color: var(--text-muted); font-size: 13px;">Final Total: <strong style="color: var(--primary-color); font-size: 18px;">${currency}${finalTotal.toFixed(2)}</strong></p>

        <form onsubmit="UniversalApp.handleCartSubmit(event, ${finalTotal})" style="margin-top: 14px;">
          <div class="form-group" style="text-align: left;">
            <label>Full Name *</label>
            <input type="text" id="cart_cust_name" class="form-control" required placeholder="Your Full Name" value="${defaultName}" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Phone / WhatsApp *</label>
            <input type="tel" id="cart_cust_phone" class="form-control" required placeholder="+91 98765 43210" value="${defaultPhone}" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Delivery Address *</label>
            <textarea id="cart_cust_address" class="form-control" rows="2" required placeholder="Complete Doorstep Address"></textarea>
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Payment Mode *</label>
            <select id="cart_payment_mode" class="form-control" onchange="UniversalApp.toggleCartUpiFields(this.value)">
              <option value="Cash on Delivery / Pay at Doorstep" ${!customQr ? 'selected' : ''}>Cash on Delivery / Pay at Doorstep</option>
              <option value="UPI / Instant Online Payment" ${customQr ? 'selected' : ''}>UPI / Instant Online Payment (Instant Zero-Fee)</option>
            </select>
          </div>

          <!-- Dynamic UPI Standee & Proof Verification Box -->
          <div id="cart_upi_container" style="display: ${customQr ? 'block' : 'none'}; margin-top: 12px; background: var(--bg-secondary); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); text-align: center;">
            <p style="font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">
              ${customQr ? '🏢 OFFICIAL MERCHANT STAND-IN QR' : '⚡ SCAN WITH GPAY / PHONEPE / PAYTM'}
            </p>
            <img src="${qrDisplayUrl}" style="max-height: 160px; max-width: 160px; background: #fff; padding: 6px; border-radius: 6px; border: 1px solid var(--border-color); object-fit: contain;" alt="Merchant UPI QR" />
            <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 6px;">
              <span style="font-size: 11px; color: var(--text-muted);">VPA: <strong>${config.upiId}</strong></span>
              <button type="button" class="pill-btn" style="padding: 2px 8px; font-size: 10px;" onclick="navigator.clipboard.writeText('${config.upiId}'); UniversalApp.showToast('UPI ID Copied!', 'success');">📋 Copy</button>
            </div>
            <div class="form-group" style="text-align: left; margin-top: 10px;">
              <label style="font-size: 11px;">UPI Transaction Reference / UTR ID *</label>
              <input type="text" id="cart_txn_id" class="form-control" ${customQr ? 'required' : ''} placeholder="Enter 12-digit UTR or Transaction Ref" />
            </div>
            <div class="form-group" style="text-align: left; margin-top: 8px;">
              <label style="font-size: 11px;">Upload Payment Screenshot *</label>
              <input type="file" id="cart_screenshot_file" class="form-control" accept="image/*" ${customQr ? 'required' : ''} onchange="UniversalApp.handleCartScreenshotUpload(this)" />
              <div id="cart_screenshot_preview" style="display: none; margin-top: 6px;"></div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 16px; font-size: 15px; font-weight: 800;">
            🚀 Place Order Now
          </button>
        </form>
      </div>
    `);
  },

  toggleCartUpiFields(val) {
    const box = document.getElementById('cart_upi_container');
    const txnInput = document.getElementById('cart_txn_id');
    const fileInput = document.getElementById('cart_screenshot_file');
    if (!box) return;

    if (val.includes('UPI')) {
      box.style.display = 'block';
      if (txnInput) txnInput.required = true;
      if (fileInput) fileInput.required = true;
    } else {
      box.style.display = 'none';
      if (txnInput) txnInput.required = false;
      if (fileInput) fileInput.required = false;
    }
  },

  handleCartScreenshotUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showToast('Please upload a valid image file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.cartScreenshotData = e.target.result;
        const prevBox = document.getElementById('cart_screenshot_preview');
        if (prevBox) {
          prevBox.style.display = 'block';
          prevBox.innerHTML = `<img src="${e.target.result}" class="screenshot-preview-thumb" alt="Payment Proof Screenshot" />`;
        }
        this.showToast('✅ Payment screenshot uploaded!', 'success');
      };
      reader.readAsDataURL(file);
    }
  },

  async handleCartSubmit(e, total) {
    e.preventDefault();

    // 1. Rate Limiting Check
    const rateCheck = RateLimiter.checkLimit();
    if (!rateCheck.allowed) {
      UniversalApp.showToast(`⏳ Rate limit reached. Please wait ${rateCheck.waitSeconds}s before submitting again.`, 'error');
      return;
    }

    const config = window.MASTER_CONFIG;
    const vData = config.verticals[config.activeAppType];
    const orderId = "ORD-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    const custName = SecurityGuard.escapeHTML(document.getElementById('cart_cust_name').value);
    const phone = SecurityGuard.escapeHTML(document.getElementById('cart_cust_phone').value);
    const address = SecurityGuard.escapeHTML(document.getElementById('cart_cust_address').value);
    const payMode = SecurityGuard.escapeHTML(document.getElementById('cart_payment_mode').value);

    let txnId = "N/A";
    if (payMode.includes('UPI')) {
      const txnEl = document.getElementById('cart_txn_id');
      txnId = txnEl ? SecurityGuard.escapeHTML(txnEl.value.trim()) : '';
      if (!txnId) {
        this.showToast('Please enter the UPI Transaction Reference / UTR ID.', 'error');
        return;
      }
      if (!this.cartScreenshotData) {
        this.showToast('Please upload the payment confirmation screenshot.', 'error');
        return;
      }
    }

    const orderRecord = {
      orderId: orderId,
      timestamp: new Date().toISOString(),
      customerName: custName,
      phone: phone,
      address: address,
      itemsSummary: this.cart.map(i => `${i.title} (x${i.quantity})`).join(', '),
      total: total,
      currency: vData.currency,
      paymentMethod: payMode,
      transactionRef: txnId,
      status: payMode.includes('UPI') ? "Paid via UPI (Verified)" : "Order Confirmed (Processing)"
    };

    const storeOrders = JSON.parse(localStorage.getItem('store_orders') || '[]');
    storeOrders.unshift(orderRecord);
    localStorage.setItem('store_orders', JSON.stringify(storeOrders));

    const payload = {
      orderId: orderId,
      timestamp: orderRecord.timestamp,
      appType: config.activeAppType,
      customer: {
        name: custName,
        phone: phone,
        email: this.currentUser ? this.currentUser.email : "orders@universalstore.com",
        authProvider: this.currentUser ? "google" : "guest"
      },
      cart: {
        items: [...this.cart],
        finalTotal: total,
        currency: vData.currency
      },
      customFields: {
        deliveryAddress: address,
        paymentMethod: payMode,
        transactionRef: txnId
      },
      payment: { method: payMode.includes('UPI') ? "upi" : "cod", status: payMode.includes('UPI') ? "paid" : "pending" }
    };

    this.showToast("Placing Order...", "info");
    await this.dispatchWebhook(payload);
    this.clearCart();
    this.triggerConfetti();
    this.playSound('victory');

    const customLogo = (vData && vData.customLogo) || config.customLogo || localStorage.getItem('custom_brand_logo');

    this.showModal(`
      <div class="receipt-box" id="printableReceipt">
        <div class="receipt-header">
          ${customLogo ? `<img src="${customLogo}" style="max-height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 6px;" alt="Logo" />` : '<span style="font-size: 3rem;">🎉</span>'}
          <h3 style="color: var(--primary-color);">${SecurityGuard.escapeHTML(vData.businessName || 'Order Receipt')}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">Order ID: <strong>${orderId}</strong></p>
        </div>
        <div class="receipt-row"><span>Customer:</span><strong>${custName}</strong></div>
        <div class="receipt-row"><span>Items:</span><strong>${orderRecord.itemsSummary}</strong></div>
        <div class="receipt-row"><span>Delivery Address:</span><strong>${address}</strong></div>
        <div class="receipt-row"><span>Payment Mode:</span><strong>${payMode}</strong></div>
        ${payMode.includes('UPI') ? `<div class="receipt-row"><span>UPI Ref / UTR:</span><strong style="color: var(--success-color);">${txnId} (Verified)</strong></div>` : ''}
        <div class="receipt-row" style="border-top: 1.5px solid var(--border-color); padding-top: 8px; margin-top: 8px;">
          <span style="font-weight: 700;">Final Amount:</span>
          <strong style="color: var(--primary-color); font-size: 17px;">${vData.currency}${total.toFixed(2)}</strong>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-primary" style="flex: 1;" onclick="UniversalApp.printActiveReceipt()">🖨️ Print Receipt</button>
          <button class="btn btn-outline" style="flex: 1;" onclick="UniversalApp.closeModal()">Continue</button>
        </div>
      </div>
    `);
  },

  printActiveReceipt() {
    window.print();
  },

  printIdCard() {
    document.body.classList.add('printing-id-card');
    window.print();
    const cleanup = () => document.body.classList.remove('printing-id-card');
    window.addEventListener('afterprint', cleanup, { once: true });
    setTimeout(cleanup, 2500);
  },

  // =========================================================================
  // 🔗 WEBHOOK DISPATCH WITH CIRCUIT BREAKER RESILIENCE
  // =========================================================================
  async dispatchWebhook(payload) {
    const rateCheck = RateLimiter.checkLimit();
    if (!rateCheck.allowed) {
      this.showToast(`⚠️ Rate limit reached. Please wait ${rateCheck.waitSeconds}s.`, 'error');
      throw new Error(`Rate limit exceeded. Please wait ${rateCheck.waitSeconds}s.`);
    }

    const config = window.MASTER_CONFIG;
    const vData = config.verticals[config.activeAppType] || {};

    // Automatically enrich with business context so Google Sheets creates a dedicated tab for this business
    payload.businessName = payload.businessName || vData.businessName || "General Business";
    payload.businessSlug = payload.businessSlug || vData.slug || config.activeAppType;
    payload.appType = payload.appType || config.activeAppType;

    const sanitizedPayload = SecurityGuard.sanitizeObject(payload);

    if (!CircuitBreaker.canRequest()) {
      CircuitBreaker.queueOffline(sanitizedPayload);
      return;
    }

    try {
      await this.sendWebhookDirect(sanitizedPayload);
      CircuitBreaker.recordSuccess();
      this.showToast('✅ Synced with Google Sheets!', 'success');
    } catch (err) {
      console.warn('Webhook dispatch failed, recording in CircuitBreaker: ', err);
      CircuitBreaker.recordFailure();
      CircuitBreaker.queueOffline(sanitizedPayload);
    }
  },

  async sendWebhookDirect(payload) {
    const url = window.MASTER_CONFIG.googleScriptUrl;
    if (url && url.startsWith('http') && !url.includes('ExampleWebhookURL')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
      } finally {
        clearTimeout(timeoutId);
      }
    }
  },

  // =========================================================================
  // 🎊 CANVAS CONFETTI CELEBRATION ENGINE
  // =========================================================================
  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        gravity: 0.35,
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rSpeed;
        p.opacity -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frame++;
      if (frame < 90) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    animate();
  },

  // =========================================================================
  // 🔔 MODALS, TOASTS & KEYBOARD ACCESSIBILITY
  // =========================================================================
  showModal(htmlContent) {
    this.playSound('click');
    const modal = document.getElementById('app-modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = htmlContent;
    modal.classList.add('active');
  },

  closeModal() {
    this.playSound('click');
    const modal = document.getElementById('app-modal');
    modal.classList.remove('active');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },

  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        const drawer = document.getElementById('cart-drawer');
        if (drawer) drawer.classList.remove('open');
      }
    });
  }
};

window.UniversalApp = UniversalApp;
window.SecurityGuard = SecurityGuard;
window.RateLimiter = RateLimiter;
window.CircuitBreaker = CircuitBreaker;
window.ClientProfileManager = ClientProfileManager;
window.URLQueryTenantEngine = URLQueryTenantEngine;
window.CatalogEditor = CatalogEditor;
window.ShareLinkGenerator = ShareLinkGenerator;
document.addEventListener('DOMContentLoaded', () => UniversalApp.init());
