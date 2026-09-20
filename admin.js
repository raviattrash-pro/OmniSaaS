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
    googleScriptUrl: '',
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
    this.loadMetrics();
    this.renderRoster();
    this.initWizardDefaults('student_management');
  },

  checkAuth() {
    const isAuthed = sessionStorage.getItem('admin_authenticated') === 'true';
    const overlay = document.getElementById('admin-login-overlay');
    if (overlay) {
      overlay.style.display = isAuthed ? 'none' : 'flex';
    }
  },

  handleLogin(e) {
    e.preventDefault();
    const pinInput = document.getElementById('admin_pin_input');
    const pin = pinInput.value.trim();
    const savedPin = localStorage.getItem('admin_master_pin') || '1234';

    if (pin === savedPin) {
      sessionStorage.setItem('admin_authenticated', 'true');
      document.getElementById('admin-login-overlay').style.display = 'none';
      this.loadMetrics();
      this.showToast('✅ Welcome to Admin Control Center', 'success');
    } else {
      const errEl = document.getElementById('login_error_msg');
      if (errEl) {
        errEl.innerText = '❌ Incorrect PIN. (Default is 1234)';
        errEl.style.display = 'block';
      }
    }
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

  getDeepLaunchUrl(slug) {
    const cleanSlug = this.slugify(slug || this.wizardData.slug || 'my-business');
    const { username } = this.getGitHubConfig();
    return `https://${username}.github.io/OmniSaaS/?slug=${cleanSlug}`;
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
    const saved = localStorage.getItem('saved_client_profiles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Guarantee every profile has a dedicated slug
          let updated = false;
          parsed.forEach(p => {
            if (!p.slug) {
              p.slug = this.slugify(p.businessName || p.id);
              updated = true;
            }
          });
          if (updated) localStorage.setItem('saved_client_profiles', JSON.stringify(parsed));
          return parsed;
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

  saveProfiles(profiles) {
    localStorage.setItem('saved_client_profiles', JSON.stringify(profiles));
    this.loadMetrics();
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

    if (tab === 'roster') this.renderRoster();
    if (tab === 'activity') this.renderActivityFeed();
    if (tab === 'backup') this.loadGitHubConfigInputs();
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

  handleLogoUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showToast('Please upload a valid image file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.wizardData.customLogoData = e.target.result;
        this.showToast('✅ Brand logo uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  },

  handleQrUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.showToast('Please upload a valid image file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.wizardData.customQrData = e.target.result;
        this.showToast('✅ UPI Standee QR uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  },

  // =========================================================================
  // 🚀 FINALIZE ONBOARDING & GENERATE DEDICATED LAUNCH ASSETS
  // =========================================================================
  finalizeOnboarding() {
    const data = this.wizardData;
    const slug = this.slugify(data.slug || data.businessName);
    const vendorId = "vendor_" + slug + "_" + Date.now().toString(36);

    const newVendorProfile = {
      id: vendorId,
      slug: slug,
      businessName: data.businessName,
      vertical: data.vertical,
      tagline: data.tagline,
      logoIcon: data.logoIcon,
      themeColor: data.themeColor,
      accentColor: data.accentColor,
      currency: data.currency,
      upiId: data.upiId,
      whatsappNumber: data.whatsappNumber,
      googleScriptUrl: data.googleScriptUrl,
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

    // Compute Dedicated URLs
    const dedicatedUrl = this.getDedicatedBusinessUrl(slug);
    const deepLaunchUrl = this.getDeepLaunchUrl(slug);

    // Render Handover Display
    const nameEl = document.getElementById('res_vendor_name');
    const vertEl = document.getElementById('res_vendor_vertical');
    const urlEl = document.getElementById('res_dedicated_url');

    if (nameEl) nameEl.innerText = data.businessName;
    if (vertEl) vertEl.innerText = data.vertical.replace('_', ' ').toUpperCase();
    if (urlEl) urlEl.value = dedicatedUrl;

    const waMsg = `🎉 *Congratulations! Your App is Live!* 🎉\n\n*Business:* ${data.businessName}\n*Category:* ${data.vertical.replace('_', ' ').toUpperCase()}\n*Official Portal:* ${dedicatedUrl}\n*Direct Link:* ${deepLaunchUrl}\n\nYour app is equipped with Instant zero-fee UPI checkout, real-time Google Sheets sync, and PWA offline capability. Welcome aboard!`;
    const waLink = `https://wa.me/${(data.whatsappNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`;
    
    const waBtn = document.getElementById('res_whatsapp_btn');
    if (waBtn) waBtn.onclick = () => window.open(waLink, '_blank');
    
    const openBtn = document.getElementById('res_open_portal_btn');
    if (openBtn) openBtn.onclick = () => window.open(deepLaunchUrl, '_blank');

    this.showToast('🚀 New Vendor Successfully Onboarded in 5 Minutes!', 'success');
  },

  copyDedicatedUrl() {
    const input = document.getElementById('res_dedicated_url');
    if (input) {
      input.select();
      navigator.clipboard.writeText(input.value);
      this.showToast('📋 Copied Dedicated Business URL!', 'success');
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
              <span style="font-size: 24px;">${this.escapeHTML(v.logoIcon || '🏛️')}</span>
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
    this.showToast('🔄 Reset to default 6 vendor profiles.', 'info');
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
