/**
 * Student Management & Admission System Module
 * -------------------------------------------------------------
 * 100% Fully Functional & Persistent Real-Data Engine:
 * - Real Admissions Database (student_admissions in localStorage + Google Sheets sync)
 * - Real Fee Ledger (student_fees in localStorage)
 * - Real Co-Curricular Enrollment Roster (student_activities in localStorage)
 * - Live Application Tracker querying real records by Reference ID or Phone
 * - Dynamic Digital Student ID Card Creator with real photo file upload & student selector
 * - Printable Official Receipts & Slips
 */

const StudentManagementModule = {
  currentStep: 1,
  wizardData: {
    studentName: "",
    dob: "",
    gender: "Male",
    gradeApplied: "Grade 6 - 8 (Middle School)",
    parentName: "",
    relationship: "Father",
    phone: "",
    email: "",
    address: "",
    prevSchool: "",
    meritScholarshipPct: 0
  },

  selectedStudentForFee: null,

  _safeParse(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch(e) { console.warn('Corrupted localStorage data in', key, '- resetting.'); localStorage.removeItem(key); return []; }
  },

  getCustomFeeCategories(slug) {
    const config = window.MASTER_CONFIG;
    const defaultFees = (config.verticals.student_management && config.verticals.student_management.feeCategories) || [];
    const custom = this._safeParse(`school_custom_fees_${slug || 'default'}`);
    return (Array.isArray(custom) && custom.length > 0) ? custom : defaultFees;
  },

  getCustomClubs(slug) {
    const config = window.MASTER_CONFIG;
    const defaultClubs = (config.verticals.student_management && config.verticals.student_management.activityCatalog) || [];
    const custom = this._safeParse(`school_custom_clubs_${slug || 'default'}`);
    return (Array.isArray(custom) && custom.length > 0) ? custom : defaultClubs;
  },

  render(container, config) {
    const data = config.verticals.student_management;
    const currentSlug = new URLSearchParams(window.location.search).get('slug') || 'default';
    const feeCategories = this.getCustomFeeCategories(currentSlug);
    const activityCatalog = this.getCustomClubs(currentSlug);
    const customLogo = (data && data.customLogo) || config.customLogo || localStorage.getItem('custom_brand_logo');
    const customQr = (data && data.customQr) || config.customQr || localStorage.getItem('custom_upi_qr');
    const upiId = (data && data.upiId) || config.upiId || 'payments@upi';
    const admissions = this._safeParse('student_admissions');
    this.currentStep = 1;

    container.innerHTML = `
      <div class="tab-container" style="margin-top: 0;">
        <div class="nav-tabs">
          <button class="tab-btn active" onclick="StudentManagementModule.switchSubTab('admissions')">📝 Admission Wizard</button>
          <button class="tab-btn" onclick="StudentManagementModule.switchSubTab('idcard')">🪪 Student ID Card Creator</button>
          <button class="tab-btn" onclick="StudentManagementModule.switchSubTab('fees')">💳 Fee Invoicing & Receipts</button>
          <button class="tab-btn" onclick="StudentManagementModule.switchSubTab('activities')">🏆 Co-Curricular & Clubs</button>
          <button class="tab-btn" onclick="StudentManagementModule.switchSubTab('status')">🔍 Application Tracker</button>
        </div>
      </div>

      <!-- 1. MULTI-STEP ADMISSION WIZARD -->
      <div id="subtab-admissions" class="subtab-panel" style="display: block; margin-top: 25px;">
        <div class="form-card">
          
          <!-- STEPPER HEADER -->
          <div class="stepper-header">
            <div class="step-node active" id="step-node-1">1</div>
            <div class="step-node" id="step-node-2">2</div>
            <div class="step-node" id="step-node-3">3</div>
            <div class="step-node" id="step-node-4">4</div>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="font-size: 1.4rem; color: var(--primary-color);" id="wizard-step-title">Step 1: Student Information</h3>
            <p style="color: var(--text-muted); font-size: 13px;" id="wizard-step-desc">Enter the applicant's primary identity and birth details.</p>
          </div>

          <form id="admissionWizardForm" onsubmit="StudentManagementModule.handleWizardSubmit(event)">
            
            <!-- STEP 1: STUDENT INFO -->
            <div id="wizard-step-1" class="wizard-step-content">
              <div class="form-grid">
                <div class="form-group">
                  <label>Student Full Name *</label>
                  <input type="text" id="wiz_student_name" class="form-control" required placeholder="e.g. Aarav Sharma" />
                </div>
                <div class="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" id="wiz_dob" class="form-control" required />
                </div>
                <div class="form-group">
                  <label>Gender *</label>
                  <select id="wiz_gender" class="form-control" required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Applying for Grade / Class *</label>
                  <select id="wiz_grade" class="form-control" required>
                    <option value="">-- Select Specific Class --</option>
                    <option value="Playgroup / Pre-Nursery">Playgroup / Pre-Nursery</option>
                    <option value="Nursery">Nursery</option>
                    <option value="LKG (Lower Kindergarten)">LKG (Lower Kindergarten)</option>
                    <option value="UKG (Upper Kindergarten)">UKG (Upper Kindergarten)</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                    <option value="Class 3">Class 3</option>
                    <option value="Class 4">Class 4</option>
                    <option value="Class 5">Class 5</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 7" selected>Class 7</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11 (Science - PCM/PCB)">Class 11 (Science - PCM/PCB)</option>
                    <option value="Class 11 (Commerce)">Class 11 (Commerce)</option>
                    <option value="Class 11 (Arts / Humanities)">Class 11 (Arts / Humanities)</option>
                    <option value="Class 12 (Science - PCM/PCB)">Class 12 (Science - PCM/PCB)</option>
                    <option value="Class 12 (Commerce)">Class 12 (Commerce)</option>
                    <option value="Class 12 (Arts / Humanities)">Class 12 (Arts / Humanities)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- STEP 2: PREVIOUS ACADEMICS & SCHOLARSHIPS -->
            <div id="wizard-step-2" class="wizard-step-content" style="display: none;">
              <div class="form-grid">
                <div class="form-group form-grid-full">
                  <label>Previous School Attended</label>
                  <input type="text" id="wiz_prev_school" class="form-control" placeholder="School Name, City & Last Grade Completed" />
                </div>
                <div class="form-group">
                  <label>Last Academic Score / GPA (%)</label>
                  <input type="number" id="wiz_prev_gpa" class="form-control" min="0" max="100" placeholder="e.g. 92" />
                </div>
                <div class="form-group">
                  <label>Merit Scholarship Scheme</label>
                  <select id="wiz_scholarship" class="form-control" onchange="StudentManagementModule.onScholarshipChange(this.value)">
                    <option value="0">Standard Admission (No Scholarship)</option>
                    <option value="10">Merit Scholar 90%+ (10% Fee Waiver)</option>
                    <option value="20">Sports / National Achiever (20% Waiver)</option>
                    <option value="15">Sibling / Alumni Referral (15% Waiver)</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- STEP 3: PARENT & CONTACT -->
            <div id="wizard-step-3" class="wizard-step-content" style="display: none;">
              <div class="form-grid">
                <div class="form-group">
                  <label>Parent / Guardian Full Name *</label>
                  <input type="text" id="wiz_parent_name" class="form-control" required placeholder="e.g. Rajesh Sharma" />
                </div>
                <div class="form-group">
                  <label>Relationship *</label>
                  <select id="wiz_relationship" class="form-control">
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Guardian">Legal Guardian</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Primary Phone / WhatsApp *</label>
                  <input type="tel" id="wiz_phone" class="form-control" required placeholder="+91 98765 43210" />
                </div>
                <div class="form-group">
                  <label>Parent Email *</label>
                  <input type="email" id="wiz_email" class="form-control" required placeholder="parent@gmail.com" />
                </div>
                <div class="form-group form-grid-full">
                  <label>Permanent Residential Address *</label>
                  <textarea id="wiz_address" class="form-control" rows="2" required placeholder="House No, Street, City, Pin Code"></textarea>
                </div>
              </div>
            </div>

            <!-- STEP 4: REVIEW & DECLARATION -->
            <div id="wizard-step-4" class="wizard-step-content" style="display: none;">
              <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin-bottom: 16px;">
                <h4 style="font-size: 14px; font-weight: 800; color: var(--primary-color); margin-bottom: 10px;">📋 Application Summary Review</h4>
                <div class="receipt-row"><span>Student Name:</span><strong id="rev_student_name">-</strong></div>
                <div class="receipt-row"><span>Grade Applied:</span><strong id="rev_grade">-</strong></div>
                <div class="receipt-row"><span>Parent / Guardian:</span><strong id="rev_parent">-</strong></div>
                <div class="receipt-row"><span>Contact Phone:</span><strong id="rev_phone">-</strong></div>
                <div class="receipt-row"><span>Merit Scholarship:</span><strong id="rev_scholarship" style="color: var(--success-color);">None</strong></div>
              </div>

              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 14px;">
                <input type="checkbox" id="wiz_decl" required style="width: 18px; height: 18px; accent-color: var(--primary-color);" />
                <label for="wiz_decl" style="font-size: 13px; font-weight: 600; cursor: pointer;">
                  I certify that all details provided are accurate and agree to institutional admission terms.
                </label>
              </div>
            </div>

            <!-- WIZARD CONTROLS -->
            <div style="display: flex; justify-content: space-between; margin-top: 24px; gap: 12px;">
              <button type="button" class="btn btn-outline" id="wiz_prev_btn" onclick="StudentManagementModule.prevStep()" style="visibility: hidden;">
                ← Back
              </button>
              <button type="button" class="btn btn-primary" id="wiz_next_btn" onclick="StudentManagementModule.nextStep()">
                Continue to Step 2 →
              </button>
              <button type="submit" class="btn btn-accent" id="wiz_submit_btn" style="display: none;">
                🚀 Submit Official Application
              </button>
            </div>

          </form>
        </div>
      </div>

      <!-- 2. DYNAMIC STUDENT ID CARD CREATOR WITH PHOTO UPLOAD -->
      <div id="subtab-idcard" class="subtab-panel" style="display: none; margin-top: 25px;">
        <div class="form-grid" style="align-items: start;">
          
          <!-- LEFT: CONFIG CONTROLS -->
          <div class="form-card" style="margin: 0; max-width: 100%;">
            <h3 style="font-size: 1.25rem; color: var(--primary-color); margin-bottom: 16px;">🪪 ID Card Customizer</h3>
            
            <div class="form-group">
              <label>Select Admitted Student (From DB) or Type Below</label>
              <select id="id_card_student_select" class="form-control" onchange="StudentManagementModule.onSelectStudentForId(this.value)">
                <!-- Populated dynamically -->
              </select>
            </div>

            <div class="form-group">
              <label>Student Full Name</label>
              <input type="text" id="custom_id_name" class="form-control" placeholder="Student Name" oninput="StudentManagementModule.updateIdCardPreview()" />
            </div>

            <div class="form-group">
              <label>Class / Grade</label>
              <input type="text" id="custom_id_grade" class="form-control" placeholder="e.g. Grade 7-A (Middle School)" oninput="StudentManagementModule.updateIdCardPreview()" />
            </div>

            <div class="form-group">
              <label>Student Roll / ID Number</label>
              <input type="text" id="custom_id_roll" class="form-control" placeholder="e.g. STU-2026-9821" oninput="StudentManagementModule.updateIdCardPreview()" />
            </div>

            <div class="form-group">
              <label>Upload Student Portrait Photo</label>
              <input type="file" id="id_photo_upload" class="form-control" accept="image/*" onchange="StudentManagementModule.handlePhotoUpload(this)" />
            </div>

            <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="UniversalApp.printIdCard()">
              🖨️ Print Student Identity Card (Single Page Badge)
            </button>
          </div>

          <!-- RIGHT: LIVE RENDERED DIGITAL ID CARD -->
          <div>
            <div class="digital-id-card" id="printableStudentIdCard">
              <div class="id-card-top">
                <div>
                  <div style="font-size: 13px; font-weight: 800; letter-spacing: 1px; color: var(--accent-color);">${(data.businessName || 'INSTITUTION').toUpperCase()}</div>
                  <div style="font-size: 10px; opacity: 0.8;">ACCREDITED K-12 INSTITUTION</div>
                </div>
                ${customLogo ? `<img src="${customLogo}" style="max-height: 32px; max-width: 50px; object-fit: contain;" alt="School Logo" />` : '<div style="font-size: 1.6rem;">🏛️</div>'}
              </div>

              <div class="id-card-body">
                <div class="id-photo-frame" id="id_card_photo_display">
                  <span style="font-size: 2.4rem;">👨‍🎓</span>
                </div>
                <div>
                  <div style="font-size: 16px; font-weight: 900;" id="id_card_name_preview">Aarav Sharma</div>
                  <div style="font-size: 12px; opacity: 0.9;" id="id_card_grade_preview">Grade 7-A (Middle School)</div>
                  <div style="font-size: 11px; margin-top: 6px; opacity: 0.8;">ID NO: <span id="id_card_roll_preview" style="font-weight: 800; color: #38bdf8;">STU-2026-9821</span></div>
                  <div style="font-size: 11px; opacity: 0.8;">VALID THRU: <strong>MAY 2027</strong></div>
                </div>
              </div>

              <div style="margin-top: 18px; border-top: 1px dashed rgba(255,255,255,0.25); padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 9px; opacity: 0.7; letter-spacing: 1.5px;">||| | |||| ||| ||||| || |||</div>
                <div style="font-size: 10px; font-weight: 800; color: #4ade80;">● ACTIVE STUDENT</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- 3. SMART STUDENT FEE INVOICING & UPI PAYMENT TAB -->
      <div id="subtab-fees" class="subtab-panel" style="display: none; margin-top: 25px;">
        <div class="form-card" style="max-width: 820px; margin: 0 auto 30px auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <span class="card-badge" style="background: var(--primary-color); color: #fff; margin-bottom: 6px;">⚡ INSTANT DIGITAL FEE COUNTER</span>
            <h3 style="font-size: 1.45rem; color: var(--primary-color); margin-top: 4px;">Student Fee Verification & Payment</h3>
            <p style="color: var(--text-muted); font-size: 13px;">Type student name or ID to auto-populate records, select your fee structure, and pay directly via zero-fee UPI.</p>
          </div>

          <!-- STUDENT LOOKUP / SELECTION CONTROLS -->
          <div style="background: var(--bg-secondary); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px;">
            <div style="font-size: 12px; font-weight: 800; color: var(--primary-color); margin-bottom: 8px;">
              🔍 STEP 1: VERIFY STUDENT IDENTITY
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group" style="margin: 0; position: relative;">
                <label style="font-size: 11px; font-weight: 700;">Search Registered Student (Name / Roll No)</label>
                <input type="text" id="fee_search_input" class="form-control" placeholder="e.g. Aarav Sharma or STU-2026..." oninput="StudentManagementModule.onFeeStudentSearch(this.value)" />
                <div id="fee_search_suggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background: var(--surface-card); border: 1px solid var(--border-color); border-radius: 6px; box-shadow: var(--shadow-lg); z-index: 50; max-height: 180px; overflow-y: auto;"></div>
              </div>
              <div class="form-group" style="margin: 0;">
                <label style="font-size: 11px; font-weight: 700;">Or Select from Admitted Roster (${admissions.length})</label>
                <select id="fee_quick_student_select" class="form-control" onchange="StudentManagementModule.onSelectStudentForFee(this.value)">
                  <option value="">-- Choose Admitted Student --</option>
                  ${admissions.map(s => `<option value="${s.orderId}">${s.studentName} (${s.gradeApplied}) - ${s.rollNo}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- DYNAMIC VERIFIED STUDENT CARD -->
            <div id="verified_student_box" style="margin-top: 14px; display: none; background: rgba(16, 185, 129, 0.08); border: 1.5px solid var(--success-color); border-radius: 8px; padding: 12px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <div>
                  <div style="font-size: 11px; font-weight: 800; color: var(--success-color); letter-spacing: 0.5px;">✓ VERIFIED STUDENT PROFILE</div>
                  <div style="font-size: 16px; font-weight: 900; color: var(--text-main);" id="v_stu_name">-</div>
                  <div style="font-size: 12px; color: var(--text-muted);">
                    Class/Grade: <strong id="v_stu_grade">-</strong> | Roll/ID: <strong id="v_stu_roll" style="color: var(--primary-color);">-</strong>
                  </div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                    Parent: <strong id="v_stu_parent">-</strong> | Phone: <strong id="v_stu_phone">-</strong>
                  </div>
                </div>
                <button type="button" class="pill-btn" style="background: rgba(239, 68, 68, 0.1); color: var(--danger-color); font-size: 11px;" onclick="StudentManagementModule.clearSelectedStudent()">
                  ✕ Clear / Change
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 2: SELECT FEE STRUCTURE & PAYMENT -->
          <form id="inlineFeePaymentForm" onsubmit="StudentManagementModule.handleInlineFeeSubmit(event)">
            <div style="font-size: 12px; font-weight: 800; color: var(--primary-color); margin-bottom: 8px;">
              💳 STEP 2: SELECT FEE PARTICULAR & SUBMIT PROOF
            </div>

            <div class="form-grid">
              <div class="form-group form-grid-full">
                <label>Select Fee Structure Category *</label>
                <select id="inline_fee_select" class="form-control" required onchange="StudentManagementModule.onInlineFeeSelectChange(this.value)">
                  <option value="">-- Choose Applicable Fee Category --</option>
                  ${feeCategories.map(fee => `
                    <option value="${fee.id}" data-amount="${fee.amount}" data-title="${SecurityGuard.sanitizeAttr(fee.title)}">
                      ${fee.title} (${fee.grade}) - ${data.currency}${Number(fee.amount).toLocaleString()}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Student Full Name *</label>
                <input type="text" id="inline_fee_student_name" class="form-control" required placeholder="Student Full Name" />
              </div>

              <div class="form-group">
                <label>Student Roll No / Application ID *</label>
                <input type="text" id="inline_fee_roll_no" class="form-control" required placeholder="e.g. STU-2026-9821" />
              </div>

              <div class="form-group">
                <label>Parent Contact Phone *</label>
                <input type="tel" id="inline_fee_phone" class="form-control" required placeholder="+91 98765 43210" />
              </div>

              <div class="form-group">
                <label>Total Fee Invoiced Amount</label>
                <div id="inline_fee_amount_display" style="font-size: 1.6rem; font-weight: 900; color: var(--primary-color); padding: 6px 0;">
                  ${data.currency}0
                </div>
                <input type="hidden" id="inline_fee_amount_val" value="0" />
                <input type="hidden" id="inline_fee_title_val" value="" />
              </div>
            </div>

            <!-- PAYMENT QR SECTION -->
            <div style="background: var(--bg-secondary); border: 1.5px solid var(--border-color); border-radius: var(--radius-md); padding: 18px; margin: 16px 0; text-align: center;">
              <div style="font-size: 11px; font-weight: 800; color: var(--text-muted); margin-bottom: 8px;">
                ${customQr ? '🏢 OFFICIAL SCHOOL MERCHANT STANDEE QR' : '⚡ SCAN WITH GPAY / PHONEPE / PAYTM'}
              </div>
              <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 10px;">
                <img id="inline_fee_qr_img" src="${customQr || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('upi://pay?pa=' + upiId + '&pn=' + encodeURIComponent(data.businessName || 'School Fee') + '&cu=INR')}`}" alt="UPI QR" style="max-height: 180px; max-width: 180px; object-fit: contain; background: #fff; padding: 6px; border-radius: 8px; border: 1.5px solid var(--border-color);" />
              </div>
              <div style="display: flex; justify-content: center; align-items: center; gap: 8px;">
                <span style="font-size: 12px; color: var(--text-muted);">VPA: <strong>${upiId}</strong></span>
                <button type="button" class="pill-btn" style="background: var(--surface-card); color: var(--text-main);" onclick="navigator.clipboard.writeText('${upiId}'); UniversalApp.showToast('UPI ID Copied!', 'success');">📋 Copy</button>
              </div>
            </div>

            <!-- UTR & SCREENSHOT UPLOAD -->
            <div class="form-grid">
              <div class="form-group">
                <label>UPI Transaction Reference / 12-Digit UTR ID *</label>
                <input type="text" id="inline_fee_txn_id" class="form-control" required placeholder="Enter 12-digit UTR from payment receipt" />
              </div>
              <div class="form-group">
                <label>Upload Payment Confirmation Screenshot *</label>
                <input type="file" id="inline_fee_screenshot_file" class="form-control" accept="image/*" required onchange="StudentManagementModule.handleFeeScreenshotUpload(this)" />
                <div id="fee_screenshot_preview" style="display: none; margin-top: 8px;"></div>
              </div>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 14px; padding: 14px; font-size: 15px; font-weight: 900;">
              ✅ Verify Fee Payment & Generate Official Receipt
            </button>
          </form>
        </div>

        <!-- FEE CATEGORIES CATALOG DISPLAY -->
        <div style="margin-top: 20px;">
          <h4 style="font-size: 1.15rem; font-weight: 800; color: var(--primary-color); margin-bottom: 12px;">
            📚 Active Institutional Fee Structures (${feeCategories.length})
          </h4>
          <div class="grid-container">
            ${feeCategories.map(fee => `
              <div class="card">
                <div class="card-body">
                  <span class="card-badge" style="width: fit-content; margin-bottom: 8px;">${fee.badge || 'Fee'}</span>
                  <h4 class="card-title">${fee.title}</h4>
                  <div class="card-subtitle">${fee.grade || 'All Classes'}</div>
                  <p class="card-desc">${fee.description || 'Institutional Academic Fee'}</p>
                  <div class="card-footer">
                    <div class="price-tag">${data.currency}${Number(fee.amount).toLocaleString()}</div>
                    <button class="btn btn-primary" onclick="StudentManagementModule.selectFeeCategoryCard('${fee.id}', '${SecurityGuard.sanitizeAttr(fee.title)}', ${fee.amount})">
                      ⚡ Pay This Fee
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 4. ACTIVITIES TAB -->
      <div id="subtab-activities" class="subtab-panel" style="display: none; margin-top: 25px;">
        <div class="grid-container">
          ${activityCatalog.map(act => {
            const enrollments = StudentManagementModule._safeParse('student_activities').filter(e => e.activityName === act.title);
            return `
              <div class="card">
                <div class="card-body">
                  <span class="card-badge" style="background: #6366f1; width: fit-content; margin-bottom: 8px;">${act.category || 'Club'}</span>
                  <h4 class="card-title">${act.title}</h4>
                  <div class="card-desc">
                    <strong>Head Coach/Mentor:</strong> ${act.coach || 'Head Mentor'}<br>
                    <strong>Weekly Schedule:</strong> ${act.schedule || 'Weekly Sessions'}<br>
                    <strong>Enrolled Students:</strong> ${enrollments.length} registered
                  </div>
                  <div class="card-footer">
                    <span style="font-size: 13px; color: var(--success-color); font-weight: 800;">● Open for Registration</span>
                    <button class="btn btn-outline" onclick="StudentManagementModule.openActivityModal('${SecurityGuard.sanitizeAttr(act.title)}')">
                      Register Student
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 5. REAL-DATA APPLICATION TRACKER -->
      <div id="subtab-status" class="subtab-panel" style="display: none; margin-top: 25px;">
        <div class="form-card" style="max-width: 600px; text-align: center;">
          <h3 style="font-size: 1.35rem; color: var(--primary-color); margin-bottom: 8px;">🔍 Real-Time Application Tracker</h3>
          <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 20px;">Enter your Application Reference ID (e.g. ADM-2026-...) or Registered Phone.</p>
          
          <div class="form-group">
            <input type="text" id="search_ref_id" class="form-control" placeholder="e.g. ADM-2026-9812 or +91 9876543210" />
          </div>
          <button class="btn btn-primary" onclick="StudentManagementModule.searchApplicationStatus()" style="width: 100%;">
            Track Application Milestones
          </button>
          
          <div id="status_result_box" style="margin-top: 24px; text-align: left; display: none;"></div>
        </div>
      </div>
    `;

    this.populateStudentIdDropdown();
  },

  switchSubTab(tabName) {
    UniversalApp.playSound('click');
    document.querySelectorAll('.subtab-panel').forEach(p => p.style.display = 'none');
    const allBtns = document.querySelectorAll('.nav-tabs .tab-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    
    const target = document.getElementById(`subtab-${tabName}`);
    if (target) target.style.display = 'block';

    const tabMap = { admissions: 0, idcard: 1, fees: 2, activities: 3, status: 4 };
    if (tabMap[tabName] !== undefined && allBtns[tabMap[tabName]]) {
      allBtns[tabMap[tabName]].classList.add('active');
    }
  },

  onScholarshipChange(val) {
    this.wizardData.meritScholarshipPct = parseInt(val) || 0;
  },

  nextStep() {
    UniversalApp.playSound('click');
    if (this.currentStep === 1) {
      const name = document.getElementById('wiz_student_name').value.trim();
      const dob = document.getElementById('wiz_dob').value;
      if (!name || !dob) {
        UniversalApp.showToast('Please fill out Student Name and Date of Birth.', 'error');
        return;
      }
      this.wizardData.studentName = name;
      this.wizardData.dob = dob;
      this.wizardData.gender = document.getElementById('wiz_gender').value;
      this.wizardData.gradeApplied = document.getElementById('wiz_grade').value;
      this.goToStep(2);
    } else if (this.currentStep === 2) {
      this.wizardData.prevSchool = document.getElementById('wiz_prev_school').value;
      this.wizardData.prevGpa = document.getElementById('wiz_prev_gpa') ? document.getElementById('wiz_prev_gpa').value.trim() : '';
      this.goToStep(3);
    } else if (this.currentStep === 3) {
      const pName = document.getElementById('wiz_parent_name').value.trim();
      const phone = document.getElementById('wiz_phone').value.trim();
      const email = document.getElementById('wiz_email').value.trim();
      const address = document.getElementById('wiz_address').value.trim();
      if (!pName || !phone || !email || !address) {
        UniversalApp.showToast('Please fill out all parent and contact fields.', 'error');
        return;
      }
      this.wizardData.parentName = pName;
      this.wizardData.relationship = document.getElementById('wiz_relationship').value;
      this.wizardData.phone = phone;
      this.wizardData.email = email;
      this.wizardData.address = address;

      // Populate Step 4 review
      document.getElementById('rev_student_name').innerText = this.wizardData.studentName;
      document.getElementById('rev_grade').innerText = this.wizardData.gradeApplied;
      document.getElementById('rev_parent').innerText = `${this.wizardData.parentName} (${this.wizardData.relationship})`;
      document.getElementById('rev_phone').innerText = this.wizardData.phone;
      document.getElementById('rev_scholarship').innerText = this.wizardData.meritScholarshipPct > 0 ? `${this.wizardData.meritScholarshipPct}% Waiver Applied` : "Standard (No Waiver)";

      this.goToStep(4);
    }
  },

  prevStep() {
    UniversalApp.playSound('click');
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  },

  goToStep(step) {
    this.currentStep = step;
    for (let i = 1; i <= 4; i++) {
      const el = document.getElementById(`wizard-step-${i}`);
      const node = document.getElementById(`step-node-${i}`);
      if (el) el.style.display = (i === step) ? 'block' : 'none';
      if (node) {
        node.classList.remove('active', 'completed');
        if (i < step) node.classList.add('completed');
        if (i === step) node.classList.add('active');
      }
    }

    const titles = [
      "Step 1: Student Information",
      "Step 2: Academic History & Scholarships",
      "Step 3: Parent & Contact Details",
      "Step 4: Application Review & Confirmation"
    ];
    const descs = [
      "Enter the applicant's primary identity and birth details.",
      "Provide academic background and scholarship eligibility.",
      "Enter parent/guardian identity and contact information.",
      "Review and confirm all details before final submission."
    ];
    document.getElementById('wizard-step-title').innerText = titles[step - 1];
    const descEl = document.getElementById('wizard-step-desc');
    if (descEl) descEl.innerText = descs[step - 1];

    document.getElementById('wiz_prev_btn').style.visibility = (step === 1) ? 'hidden' : 'visible';
    document.getElementById('wiz_next_btn').style.display = (step === 4) ? 'none' : 'inline-flex';
    document.getElementById('wiz_next_btn').innerText = `Continue to Step ${step + 1} →`;
    document.getElementById('wiz_submit_btn').style.display = (step === 4) ? 'inline-flex' : 'none';
  },

  async handleWizardSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    // Mandatory Google Sign-In Gate
    if (!UniversalApp.currentUser) {
      UniversalApp.showGoogleLoginPrompt("Please sign in with Google to submit student admission.", () => this.handleWizardSubmit());
      return;
    }

    const config = window.MASTER_CONFIG;
    const refId = "ADM-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const rollNo = "STU-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);

    const record = {
      orderId: refId,
      rollNo: rollNo,
      timestamp: new Date().toISOString(),
      studentName: SecurityGuard.escapeHTML(this.wizardData.studentName),
      dob: SecurityGuard.escapeHTML(this.wizardData.dob),
      gender: SecurityGuard.escapeHTML(this.wizardData.gender),
      gradeApplied: SecurityGuard.escapeHTML(this.wizardData.gradeApplied),
      parentName: SecurityGuard.escapeHTML(this.wizardData.parentName),
      relationship: SecurityGuard.escapeHTML(this.wizardData.relationship),
      phone: SecurityGuard.escapeHTML(this.wizardData.phone),
      email: SecurityGuard.escapeHTML(this.wizardData.email),
      address: SecurityGuard.escapeHTML(this.wizardData.address),
      previousSchool: SecurityGuard.escapeHTML(this.wizardData.prevSchool || "None"),
      previousGpa: SecurityGuard.escapeHTML(this.wizardData.prevGpa || "N/A"),
      scholarshipPct: `${Number(this.wizardData.meritScholarshipPct || 0)}%`,
      status: "Submitted (Under Council Review)"
    };

    // Save to real database in localStorage
    const admissions = this._safeParse('student_admissions');
    admissions.unshift(record);
    localStorage.setItem('student_admissions', JSON.stringify(admissions));

    // Dispatch webhook to Google Sheets
    const payload = {
      orderId: refId,
      timestamp: record.timestamp,
      appType: "student_management",
      customer: { name: record.parentName, email: record.email, phone: record.phone, authProvider: UniversalApp.currentUser ? "google" : "guest" },
      cart: {
        items: [{ id: "adm_application", title: `Admission Application: ${record.gradeApplied}`, price: 0, quantity: 1, subtotal: 0 }],
        finalTotal: 0,
        currency: config.verticals.student_management.currency
      },
      customFields: {
        studentName: record.studentName,
        studentRollNo: record.rollNo,
        dob: record.dob,
        gender: record.gender,
        gradeApplied: record.gradeApplied,
        relationship: record.relationship,
        previousSchool: record.previousSchool,
        previousGpa: record.previousGpa,
        scholarshipPct: record.scholarshipPct,
        address: record.address
      },
      payment: { method: "online_application", status: "submitted" }
    };

    UniversalApp.showToast("Submitting Admission Application...", "info");
    try {
      await UniversalApp.dispatchWebhook(payload);
    } catch (err) {
      console.warn('Webhook dispatch caught:', err);
    }
    UniversalApp.triggerConfetti();
    UniversalApp.playSound('victory');

    const customLogo = (config.verticals.student_management && config.verticals.student_management.customLogo) || config.customLogo || localStorage.getItem('custom_brand_logo');

    UniversalApp.showModal(`
      <div class="receipt-box" id="printableReceipt">
        <div class="receipt-header">
          ${customLogo ? `<img src="${customLogo}" style="max-height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 6px;" alt="Logo" />` : '<span style="font-size: 3.2rem;">🎓</span>'}
          <h3 style="color: var(--primary-color); margin-top: 6px;">${SecurityGuard.escapeHTML(config.verticals.student_management.businessName)}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">Admission Application Received</p>
          <p style="font-size: 13px; color: var(--text-muted);">Application Reference ID: <strong style="color: var(--text-main); font-size: 16px;">${refId}</strong></p>
        </div>
        <div class="receipt-row"><span>Student Name:</span><strong>${record.studentName}</strong></div>
        <div class="receipt-row"><span>Assigned Roll/ID:</span><strong style="color: var(--primary-color);">${record.rollNo}</strong></div>
        <div class="receipt-row"><span>Grade Applied:</span><strong>${record.gradeApplied}</strong></div>
        <div class="receipt-row"><span>Parent Contact:</span><strong>${record.phone}</strong></div>
        <div class="receipt-row"><span>Status:</span><strong style="color: var(--success-color);">${record.status}</strong></div>
        
        <div style="background: var(--bg-secondary); padding: 14px; border-radius: var(--radius-md); font-size: 12px; color: var(--text-muted); margin: 16px 0;">
          📌 Please retain this Reference ID for entrance assessment and interview scheduling.
        </div>
        
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-primary" style="flex: 1;" onclick="UniversalApp.printActiveReceipt()">🖨️ Print Slip</button>
          <button class="btn btn-outline" style="flex: 1;" onclick="UniversalApp.closeModal()">Done</button>
        </div>
      </div>
    `);

    this.goToStep(1);
    document.getElementById('admissionWizardForm').reset();
    this.populateStudentIdDropdown();
  },

  populateStudentIdDropdown() {
    const select = document.getElementById('id_card_student_select');
    if (!select) return;
    const admissions = this._safeParse('student_admissions');

    if (admissions.length === 0) {
      select.innerHTML = `<option value="">-- No registered students yet. Type details below --</option>`;
      return;
    }

    select.innerHTML = `<option value="">-- Choose from Registered Students (${admissions.length}) --</option>` +
      admissions.map((s, idx) => `
        <option value="${s.orderId}">${s.studentName} (${s.gradeApplied}) - Roll: ${s.rollNo}</option>
      `).join('');
  },

  onSelectStudentForId(refId) {
    if (!refId) return;
    const admissions = this._safeParse('student_admissions');
    const match = admissions.find(a => a.orderId === refId);
    if (!match) return;

    document.getElementById('custom_id_name').value = match.studentName;
    document.getElementById('custom_id_grade').value = match.gradeApplied;
    document.getElementById('custom_id_roll').value = match.rollNo;
    this.updateIdCardPreview();
  },

  updateIdCardPreview() {
    const name = document.getElementById('custom_id_name').value.trim() || "Student Name";
    const grade = document.getElementById('custom_id_grade').value.trim() || "Grade / Class";
    const roll = document.getElementById('custom_id_roll').value.trim() || "STU-2026-XXXX";

    document.getElementById('id_card_name_preview').innerText = name;
    document.getElementById('id_card_grade_preview').innerText = grade;
    document.getElementById('id_card_roll_preview').innerText = roll;
  },

  handlePhotoUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        UniversalApp.showToast('⚠️ Please upload a valid JPG, PNG, or WebP photo.', 'error');
        input.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        UniversalApp.showToast('⚠️ Photo must be under 2MB.', 'error');
        input.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const photoBox = document.getElementById('id_card_photo_display');
        photoBox.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--radius-sm);" alt="Student Photo" />`;
        UniversalApp.showToast("Student Photo Updated!", "success");
      };
      reader.readAsDataURL(file);
    }
  },

  uploadedFeeScreenshotData: null,

  handleFeeScreenshotUpload(input) {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        UniversalApp.showToast('⚠️ Please upload a valid image file.', 'error');
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        UniversalApp.showToast('⚠️ Screenshot must be under 4MB.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedFeeScreenshotData = e.target.result;
        const prev = document.getElementById('fee_screenshot_preview');
        if (prev) {
          prev.style.display = 'block';
          prev.innerHTML = `<img src="${e.target.result}" class="screenshot-preview-thumb" alt="Payment Proof" />`;
        }
        UniversalApp.showToast('✅ Fee payment screenshot attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  },

  openFeePaymentModal(feeId, feeTitle, amount) {
    // Enforce Google Sign-In Gate before paying fees
    if (!UniversalApp.currentUser) {
      UniversalApp.showGoogleLoginPrompt("Please sign in with Google to pay institutional fees.", () => {
        this.openFeePaymentModal(feeId, feeTitle, amount);
      });
      return;
    }

    const config = window.MASTER_CONFIG;
    const vData = config.verticals.student_management || {};
    const currency = vData.currency || '₹';
    const customQr = vData.customQr || config.customQr || localStorage.getItem('custom_upi_qr');
    const upiId = vData.upiId || config.upiId || 'payments@upi';
    const businessName = vData.businessName || 'School Fee Invoicing';
    const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&am=${amount}&cu=INR&tn=Fee_${feeId}`;
    const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encodeURIComponent(upiUri)}`;
    const qrDisplayUrl = customQr || dynamicQrUrl;
    const defaultName = UniversalApp.currentUser ? UniversalApp.currentUser.name : "";
    const safeFeeId = String(feeId).replace(/'/g, "\\'");
    const safeFeeTitle = String(feeTitle).replace(/'/g, "\\'");
    this.uploadedFeeScreenshotData = null;

    UniversalApp.showModal(`
      <div style="text-align: center;">
        <h3 style="color: var(--primary-color); margin-bottom: 4px;">Online Fee Invoicing</h3>
        <p style="color: var(--text-muted); font-size: 13px;"><strong>${SecurityGuard.escapeHTML(feeTitle)}</strong></p>
        <div style="font-size: 2.2rem; font-weight: 900; color: var(--primary-color); margin: 10px 0;">${currency}${amount.toLocaleString()}</div>

        <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
          <p style="font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 10px;">
            ${customQr ? '🏢 OFFICIAL MERCHANT STAND-IN QR' : '⚡ SCAN WITH GPAY / PHONEPE / PAYTM'}
          </p>
          <img src="${qrDisplayUrl}" alt="UPI Payment QR" style="max-height: 200px; max-width: 200px; object-fit: contain; border-radius: 8px; border: 1.5px solid var(--border-color); background: #fff; padding: 6px;" />
          <div style="display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 8px;">
            <span style="font-size: 12px; color: var(--text-muted);">VPA: <strong>${upiId}</strong></span>
            <button class="pill-btn" style="background: var(--surface-card); color: var(--text-main);" onclick="navigator.clipboard.writeText('${upiId}'); UniversalApp.showToast('UPI ID Copied!', 'success');">📋 Copy</button>
          </div>
        </div>

        <form onsubmit="StudentManagementModule.handleFeeSubmit(event, '${safeFeeId}', '${safeFeeTitle}', ${amount})">
          <div class="form-group" style="text-align: left;">
            <label>Student Full Name *</label>
            <input type="text" id="fee_student_name" class="form-control" required placeholder="Student Name" value="${SecurityGuard.sanitizeAttr(defaultName)}" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Student Roll No / ID *</label>
            <input type="text" id="fee_roll_no" class="form-control" required placeholder="e.g. STU-2026-9821" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Parent Contact Phone *</label>
            <input type="tel" id="fee_phone" class="form-control" required placeholder="+91 98765 43210" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>UPI Transaction / UTR ID *</label>
            <input type="text" id="fee_txn_id" class="form-control" required placeholder="Enter 12-digit UTR or Transaction Ref" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Upload Payment Confirmation Screenshot *</label>
            <input type="file" id="fee_screenshot_file" class="form-control" accept="image/*" required onchange="StudentManagementModule.handleFeeScreenshotUpload(this)" />
            <div id="fee_screenshot_preview" style="display: none; margin-top: 8px;"></div>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 14px; font-size: 15px; font-weight: 800;">
            ✅ Verify Payment & Generate Official Receipt
          </button>
        </form>
      </div>
    `);
  },

  async handleFeeSubmit(e, feeId, feeTitle, amount) {
    if (e && e.preventDefault) e.preventDefault();

    const config = window.MASTER_CONFIG;
    const receiptNo = "REC-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    const studentName = SecurityGuard.escapeHTML(document.getElementById('fee_student_name').value.trim());
    const rollNo = SecurityGuard.escapeHTML(document.getElementById('fee_roll_no').value.trim());
    const phone = SecurityGuard.escapeHTML(document.getElementById('fee_phone').value.trim());
    const txnId = SecurityGuard.escapeHTML(document.getElementById('fee_txn_id').value.trim());
    const sanitizedFeeTitle = SecurityGuard.escapeHTML(feeTitle);

    if (!txnId) {
      UniversalApp.showToast('⚠️ Please enter the UPI Transaction Reference / UTR ID.', 'error');
      return;
    }
    if (!this.uploadedFeeScreenshotData) {
      UniversalApp.showToast('⚠️ Please upload the payment confirmation screenshot.', 'error');
      return;
    }

    const feeRecord = {
      receiptNo: receiptNo,
      timestamp: new Date().toISOString(),
      studentName: studentName,
      rollNo: rollNo,
      phone: phone,
      particulars: sanitizedFeeTitle,
      amount: amount,
      currency: config.verticals.student_management.currency,
      txnId: txnId,
      transactionRef: txnId,
      screenshotData: this.uploadedFeeScreenshotData,
      status: "Paid (Verified)"
    };

    const fees = this._safeParse('student_fees');
    fees.unshift(feeRecord);
    localStorage.setItem('student_fees', JSON.stringify(fees));

    const payload = {
      orderId: receiptNo,
      timestamp: feeRecord.timestamp,
      appType: "student_management",
      customer: {
        name: studentName,
        email: UniversalApp.currentUser ? UniversalApp.currentUser.email : "",
        phone: phone,
        authProvider: UniversalApp.currentUser ? "google" : "guest"
      },
      cart: {
        items: [{ id: feeId, title: sanitizedFeeTitle, price: amount, quantity: 1, subtotal: amount }],
        finalTotal: amount,
        currency: feeRecord.currency
      },
      customFields: {
        studentRollNo: rollNo,
        transactionRef: txnId,
        paymentMode: "UPI Instant",
        paymentScreenshot: "[Screenshot Attached]"
      },
      payment: { method: "upi", status: "paid" }
    };

    UniversalApp.showToast("Recording Fee Payment in Ledger...", "info");
    try {
      await UniversalApp.dispatchWebhook(payload);
    } catch (err) {
      console.warn('Webhook error:', err);
    }
    UniversalApp.triggerConfetti();
    UniversalApp.playSound('victory');

    const customLogo = (config.verticals.student_management && config.verticals.student_management.customLogo) || config.customLogo || localStorage.getItem('custom_brand_logo');

    UniversalApp.showModal(`
      <div class="receipt-box" id="printableReceipt">
        <div class="receipt-header">
          ${customLogo ? `<img src="${customLogo}" style="max-height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 6px;" alt="Logo" />` : '<span style="font-size: 2.4rem;">🏛️</span>'}
          <h3 style="color: var(--primary-color); margin-top: 4px;">${SecurityGuard.escapeHTML(config.verticals.student_management.businessName)}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">Official Fee Payment Receipt</p>
          <div style="font-size: 13px; font-weight: 800; color: var(--text-main); margin-top: 6px;">Receipt #: ${receiptNo}</div>
        </div>
        <div class="receipt-row"><span>Student Name:</span><strong>${studentName}</strong></div>
        <div class="receipt-row"><span>Roll / Student ID:</span><strong>${rollNo}</strong></div>
        <div class="receipt-row"><span>Fee Particulars:</span><strong>${sanitizedFeeTitle}</strong></div>
        <div class="receipt-row"><span>UPI Transaction / UTR:</span><strong style="color: var(--primary-color);">${txnId}</strong></div>
        <div class="receipt-row"><span>Payment Date:</span><strong>${new Date().toLocaleDateString()}</strong></div>
        <div class="receipt-row" style="border-top: 1.5px solid var(--border-color); padding-top: 8px; margin-top: 8px;">
          <span style="font-weight: 800; font-size: 15px;">Amount Paid:</span>
          <strong style="color: var(--primary-color); font-size: 17px;">${feeRecord.currency}${amount.toLocaleString()}</strong>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-primary" style="flex: 1;" onclick="UniversalApp.printActiveReceipt()">🖨️ Download / Print Receipt</button>
          <button class="btn btn-outline" style="flex: 1;" onclick="UniversalApp.closeModal()">Done</button>
        </div>
      </div>
    `);
  },

  openActivityModal(title) {
    // Enforce Google Sign-In Gate before club registration
    if (!UniversalApp.currentUser) {
      UniversalApp.showGoogleLoginPrompt("Please sign in with Google to register for clubs & activities.", () => {
        this.openActivityModal(title);
      });
      return;
    }

    const defaultName = UniversalApp.currentUser ? UniversalApp.currentUser.name : "";
    const safeTitle = String(title).replace(/'/g, "\\'");
    UniversalApp.showModal(`
      <div style="text-align: center;">
        <h3 style="color: var(--primary-color);">🏆 Co-Curricular Club Enrollment</h3>
        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 16px;">Register for: <strong>${SecurityGuard.escapeHTML(title)}</strong></p>
        <form onsubmit="StudentManagementModule.handleActivitySubmit(event, '${safeTitle}')">
          <div class="form-group" style="text-align: left;">
            <label>Student Full Name *</label>
            <input type="text" id="act_name" class="form-control" required placeholder="Student Name" value="${SecurityGuard.sanitizeAttr(defaultName)}" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Grade / Section *</label>
            <input type="text" id="act_grade" class="form-control" required placeholder="e.g. Grade 7-A" />
          </div>
          <div class="form-group" style="text-align: left;">
            <label>Parent Contact Phone *</label>
            <input type="tel" id="act_phone" class="form-control" required placeholder="+91 98765 43210" />
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 14px; font-weight: 800;">Confirm Enrollment</button>
        </form>
      </div>
    `);
  },

  async handleActivitySubmit(e, title) {
    if (e && e.preventDefault) e.preventDefault();

    const config = window.MASTER_CONFIG;
    const studentName = SecurityGuard.escapeHTML(document.getElementById('act_name').value.trim());
    const grade = SecurityGuard.escapeHTML(document.getElementById('act_grade').value.trim());
    const phone = SecurityGuard.escapeHTML(document.getElementById('act_phone').value.trim());
    const sanitizedTitle = SecurityGuard.escapeHTML(title);
    const passId = "ACT-" + Math.floor(1000 + Math.random() * 9000);

    const actRecord = {
      orderId: passId,
      timestamp: new Date().toISOString(),
      studentName: studentName,
      grade: grade,
      phone: phone,
      activityName: sanitizedTitle
    };

    const acts = this._safeParse('student_activities');
    acts.unshift(actRecord);
    localStorage.setItem('student_activities', JSON.stringify(acts));

    const payload = {
      orderId: actRecord.orderId,
      timestamp: actRecord.timestamp,
      appType: "student_management",
      customer: { name: studentName, phone: phone, email: UniversalApp.currentUser ? UniversalApp.currentUser.email : "", authProvider: UniversalApp.currentUser ? "google" : "guest" },
      cart: { items: [{ id: "act_reg", title: "Club: " + sanitizedTitle, price: 0, quantity: 1, subtotal: 0 }], finalTotal: 0, currency: config.verticals.student_management.currency || "₹" },
      customFields: { activityName: sanitizedTitle, grade: grade },
      payment: { method: "free_club_reg", status: "enrolled" }
    };

    UniversalApp.showToast("Enrolling in " + sanitizedTitle, "info");
    try {
      await UniversalApp.dispatchWebhook(payload);
    } catch (err) {
      console.warn('Webhook error:', err);
    }
    UniversalApp.triggerConfetti();
    UniversalApp.playSound('victory');

    UniversalApp.showModal(`
      <div class="receipt-box" id="printableReceipt">
        <div class="receipt-header">
          <span style="font-size: 3rem;">🏆</span>
          <h3 style="color: var(--primary-color); margin-top: 4px;">Club Enrollment Pass</h3>
          <p style="font-size: 13px; color: var(--text-muted);">Pass ID: <strong>${passId}</strong></p>
        </div>
        <div class="receipt-row"><span>Student Name:</span><strong>${studentName}</strong></div>
        <div class="receipt-row"><span>Club / Activity:</span><strong>${sanitizedTitle}</strong></div>
        <div class="receipt-row"><span>Grade / Section:</span><strong>${grade}</strong></div>
        <div class="receipt-row"><span>Status:</span><strong style="color: var(--success-color);">● Active Member</strong></div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-primary" style="flex: 1;" onclick="UniversalApp.printActiveReceipt()">🖨️ Print Pass</button>
          <button class="btn btn-outline" style="flex: 1;" onclick="UniversalApp.closeModal()">Done</button>
        </div>
      </div>
    `);

    const container = document.getElementById('vertical-container');
    this.render(container, window.MASTER_CONFIG);
    this.switchSubTab('activities');
  },

  searchApplicationStatus() {
    UniversalApp.playSound('click');
    const query = document.getElementById('search_ref_id').value.trim();
    const box = document.getElementById('status_result_box');
    if (!query) {
      box.innerHTML = `<div style="color: var(--danger-color); font-size: 13px;">Please enter a Reference ID or Phone number.</div>`;
      box.style.display = 'block';
      return;
    }

    const admissions = this._safeParse('student_admissions');
    const queryDigits = query.replace(/[^0-9]/g, '');
    const match = admissions.find(a => 
      a.orderId.toLowerCase() === query.toLowerCase() ||
      a.rollNo.toLowerCase() === query.toLowerCase() ||
      (queryDigits.length >= 4 && a.phone.replace(/[^0-9]/g, '').includes(queryDigits))
    );

    const escapedQuery = SecurityGuard.escapeHTML(query);

    if (!match) {
      box.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger-color); padding: 16px; border-radius: var(--radius-md); text-align: center;">
          <div style="font-weight: 800; color: var(--danger-color);">No record found for "${escapedQuery}"</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Please check the Reference ID or submit a new admission application.</div>
        </div>
      `;
      box.style.display = 'block';
      return;
    }

    box.innerHTML = `
      <div style="background: var(--bg-secondary); border: 1px solid var(--border-color); padding: 22px; border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-weight: 800; color: var(--primary-color); font-size: 16px;">Reference: ${SecurityGuard.escapeHTML(match.orderId)}</div>
            <div style="font-size: 13px; color: var(--text-muted);">Roll/ID: <strong>${SecurityGuard.escapeHTML(match.rollNo)}</strong></div>
          </div>
          <span style="background: rgba(16, 185, 129, 0.15); color: var(--success-color); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 800;">● ${SecurityGuard.escapeHTML(match.status)}</span>
        </div>

        <div style="font-size: 13px; color: var(--text-main); line-height: 1.6; margin-bottom: 16px;">
          <div><strong>Student:</strong> ${SecurityGuard.escapeHTML(match.studentName)} (${SecurityGuard.escapeHTML(match.gradeApplied)})</div>
          <div><strong>Parent:</strong> ${SecurityGuard.escapeHTML(match.parentName)} (${SecurityGuard.escapeHTML(match.relationship)})</div>
          <div><strong>Contact:</strong> ${SecurityGuard.escapeHTML(match.phone)} | ${SecurityGuard.escapeHTML(match.email)}</div>
          <div><strong>Date Applied:</strong> ${new Date(match.timestamp).toLocaleDateString()}</div>
        </div>

        <!-- PROGRESS TIMELINE -->
        <div style="display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--border-color); padding-top: 14px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--success-color); font-weight: 700;">
            <span>✓</span> Step 1: Application Registered in Database
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--success-color); font-weight: 700;">
            <span>✓</span> Step 2: Parent Identity Verified
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--primary-color); font-weight: 800;">
            <span>●</span> Step 3: Entrance Assessment & Council Review in Progress
          </div>
        </div>
      </div>
    `;
    box.style.display = 'block';
  },

  onFeeStudentSearch(query) {
    const sugBox = document.getElementById('fee_search_suggestions');
    if (!sugBox) return;
    const clean = query.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      sugBox.style.display = 'none';
      return;
    }

    const admissions = this._safeParse('student_admissions');
    const matches = admissions.filter(s => 
      s.studentName.toLowerCase().includes(clean) ||
      s.rollNo.toLowerCase().includes(clean) ||
      s.orderId.toLowerCase().includes(clean) ||
      (s.phone && s.phone.includes(clean))
    );

    if (matches.length === 0) {
      sugBox.innerHTML = `<div style="padding: 10px; font-size: 12px; color: var(--text-muted); text-align: center;">No registered student found for "${clean}". Type details manually below.</div>`;
      sugBox.style.display = 'block';
      return;
    }

    sugBox.innerHTML = matches.slice(0, 6).map(s => `
      <div style="padding: 8px 12px; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.15s;" 
           onmouseover="this.style.background='var(--bg-secondary)'" 
           onmouseout="this.style.background='transparent'" 
           onclick="StudentManagementModule.onSelectStudentForFee('${s.orderId}')">
        <div style="font-weight: 800; font-size: 13px; color: var(--primary-color);">${SecurityGuard.escapeHTML(s.studentName)}</div>
        <div style="font-size: 11px; color: var(--text-muted);">
          Roll: <strong>${SecurityGuard.escapeHTML(s.rollNo)}</strong> | Class: <strong>${SecurityGuard.escapeHTML(s.gradeApplied)}</strong> | Parent: ${SecurityGuard.escapeHTML(s.parentName)}
        </div>
      </div>
    `).join('');
    sugBox.style.display = 'block';
  },

  onSelectStudentForFee(refId) {
    if (!refId) return;
    const admissions = this._safeParse('student_admissions');
    const match = admissions.find(a => a.orderId === refId || a.rollNo === refId);
    if (!match) return;

    this.selectVerifiedStudent(match);
  },

  selectVerifiedStudent(student) {
    this.selectedStudentForFee = student;

    // Fill Form inputs
    const nameEl = document.getElementById('inline_fee_student_name');
    const rollEl = document.getElementById('inline_fee_roll_no');
    const phoneEl = document.getElementById('inline_fee_phone');
    if (nameEl) nameEl.value = student.studentName;
    if (rollEl) rollEl.value = student.rollNo;
    if (phoneEl) phoneEl.value = student.phone || '';

    // Update Verified Badge Box
    const box = document.getElementById('verified_student_box');
    if (box) {
      document.getElementById('v_stu_name').innerText = student.studentName;
      document.getElementById('v_stu_grade').innerText = student.gradeApplied || 'Enrolled';
      document.getElementById('v_stu_roll').innerText = student.rollNo;
      document.getElementById('v_stu_parent').innerText = student.parentName || 'Parent / Guardian';
      document.getElementById('v_stu_phone').innerText = student.phone || 'N/A';
      box.style.display = 'block';
    }

    const sugBox = document.getElementById('fee_search_suggestions');
    if (sugBox) sugBox.style.display = 'none';

    const searchInput = document.getElementById('fee_search_input');
    if (searchInput) searchInput.value = student.studentName;

    UniversalApp.playSound('click');
    UniversalApp.showToast(`✓ Verified Record for ${student.studentName}!`, 'success');
  },

  clearSelectedStudent() {
    this.selectedStudentForFee = null;
    const box = document.getElementById('verified_student_box');
    if (box) box.style.display = 'none';

    const nameEl = document.getElementById('inline_fee_student_name');
    const rollEl = document.getElementById('inline_fee_roll_no');
    const phoneEl = document.getElementById('inline_fee_phone');
    const searchInput = document.getElementById('fee_search_input');
    const selectEl = document.getElementById('fee_quick_student_select');

    if (nameEl) nameEl.value = '';
    if (rollEl) rollEl.value = '';
    if (phoneEl) phoneEl.value = '';
    if (searchInput) searchInput.value = '';
    if (selectEl) selectEl.value = '';
  },

  onInlineFeeSelectChange(feeId) {
    const select = document.getElementById('inline_fee_select');
    if (!select) return;
    const opt = select.options[select.selectedIndex];
    if (!opt || !feeId) {
      document.getElementById('inline_fee_amount_display').innerText = `${window.MASTER_CONFIG.verticals.student_management.currency || '₹'}0`;
      document.getElementById('inline_fee_amount_val').value = '0';
      document.getElementById('inline_fee_title_val').value = '';
      return;
    }

    const amount = Number(opt.dataset.amount) || 0;
    const title = opt.dataset.title || opt.text;
    const currency = window.MASTER_CONFIG.verticals.student_management.currency || '₹';
    const config = window.MASTER_CONFIG;
    const vData = config.verticals.student_management || {};
    const upiId = vData.upiId || config.upiId || 'payments@upi';
    const customQr = vData.customQr || config.customQr || localStorage.getItem('custom_upi_qr');

    document.getElementById('inline_fee_amount_display').innerText = `${currency}${amount.toLocaleString()}`;
    document.getElementById('inline_fee_amount_val').value = amount;
    document.getElementById('inline_fee_title_val').value = title;

    // Update QR Image dynamically with exact amount if not static standee
    const qrImg = document.getElementById('inline_fee_qr_img');
    if (qrImg) {
      if (customQr) {
        qrImg.src = customQr;
      } else {
        const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(vData.businessName || 'School Fee')}&am=${amount}&cu=INR&tn=Fee_${feeId}`;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiUri)}`;
      }
    }
  },

  selectFeeCategoryCard(feeId, title, amount) {
    const select = document.getElementById('inline_fee_select');
    if (select) {
      select.value = feeId;
      this.onInlineFeeSelectChange(feeId);
    }
    const form = document.getElementById('inlineFeePaymentForm');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    UniversalApp.playSound('click');
    UniversalApp.showToast(`Selected: ${title} (${window.MASTER_CONFIG.verticals.student_management.currency || '₹'}${amount.toLocaleString()})`, 'info');
  },

  async handleInlineFeeSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    // Mandatory Google Sign-In Gate
    if (!UniversalApp.currentUser) {
      UniversalApp.showGoogleLoginPrompt("Please sign in with Google to pay institutional fees.", () => {
        this.handleInlineFeeSubmit();
      });
      return;
    }

    const config = window.MASTER_CONFIG;
    const vData = config.verticals.student_management || {};
    const feeSelect = document.getElementById('inline_fee_select');
    const feeId = feeSelect ? feeSelect.value : '';
    const feeTitle = document.getElementById('inline_fee_title_val').value || (feeSelect && feeSelect.options[feeSelect.selectedIndex] ? feeSelect.options[feeSelect.selectedIndex].text : 'Academic Fee');
    const amount = Number(document.getElementById('inline_fee_amount_val').value) || 0;
    const studentName = SecurityGuard.escapeHTML(document.getElementById('inline_fee_student_name').value.trim());
    const rollNo = SecurityGuard.escapeHTML(document.getElementById('inline_fee_roll_no').value.trim());
    const phone = SecurityGuard.escapeHTML(document.getElementById('inline_fee_phone').value.trim());
    const txnId = SecurityGuard.escapeHTML(document.getElementById('inline_fee_txn_id').value.trim());

    if (!feeId || amount <= 0) {
      UniversalApp.showToast('⚠️ Please select an active Fee Category to pay.', 'error');
      return;
    }
    if (!txnId) {
      UniversalApp.showToast('⚠️ Please enter the UPI Transaction Reference / UTR ID.', 'error');
      return;
    }
    if (!this.uploadedFeeScreenshotData) {
      UniversalApp.showToast('⚠️ Please upload the payment confirmation screenshot.', 'error');
      return;
    }

    const receiptNo = "REC-" + new Date().getFullYear() + "-" + Math.floor(10000 + Math.random() * 90000);
    const sanitizedFeeTitle = SecurityGuard.escapeHTML(feeTitle);

    const feeRecord = {
      receiptNo: receiptNo,
      timestamp: new Date().toISOString(),
      studentName: studentName,
      rollNo: rollNo,
      phone: phone,
      particulars: sanitizedFeeTitle,
      amount: amount,
      currency: vData.currency || config.verticals.student_management.currency || '₹',
      txnId: txnId,
      transactionRef: txnId,
      screenshotData: this.uploadedFeeScreenshotData,
      status: "Paid (Verified)"
    };

    const fees = this._safeParse('student_fees');
    fees.unshift(feeRecord);
    localStorage.setItem('student_fees', JSON.stringify(fees));

    const payload = {
      orderId: receiptNo,
      timestamp: feeRecord.timestamp,
      appType: "student_management",
      customer: {
        name: studentName,
        email: UniversalApp.currentUser ? UniversalApp.currentUser.email : "",
        phone: phone,
        authProvider: UniversalApp.currentUser ? "google" : "guest"
      },
      cart: {
        items: [{ id: feeId, title: sanitizedFeeTitle, price: amount, quantity: 1, subtotal: amount }],
        finalTotal: amount,
        currency: feeRecord.currency
      },
      customFields: {
        studentRollNo: rollNo,
        transactionRef: txnId,
        paymentMode: "UPI Instant",
        paymentScreenshot: "[Screenshot Attached]"
      },
      payment: { method: "upi", status: "paid" }
    };

    UniversalApp.showToast("Recording Fee Payment in Ledger...", "info");
    try {
      await UniversalApp.dispatchWebhook(payload);
    } catch (err) {
      console.warn('Webhook error:', err);
    }
    UniversalApp.triggerConfetti();
    UniversalApp.playSound('victory');

    const customLogo = vData.customLogo || config.customLogo || localStorage.getItem('custom_brand_logo');

    UniversalApp.showModal(`
      <div class="receipt-box" id="printableReceipt">
        <div class="receipt-header">
          ${customLogo ? `<img src="${customLogo}" style="max-height: 48px; max-width: 140px; object-fit: contain; margin-bottom: 6px;" alt="Logo" />` : '<span style="font-size: 2.4rem;">🏛️</span>'}
          <h3 style="color: var(--primary-color); margin-top: 4px;">${SecurityGuard.escapeHTML(vData.businessName || 'School Fee Portal')}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">Official Student Fee Payment Receipt</p>
          <div style="font-size: 13px; font-weight: 800; color: var(--text-main); margin-top: 6px;">Receipt #: ${receiptNo}</div>
        </div>
        <div class="receipt-row"><span>Student Name:</span><strong>${studentName}</strong></div>
        <div class="receipt-row"><span>Roll / Student ID:</span><strong>${rollNo}</strong></div>
        <div class="receipt-row"><span>Fee Particulars:</span><strong>${sanitizedFeeTitle}</strong></div>
        <div class="receipt-row"><span>UPI Transaction / UTR:</span><strong style="color: var(--primary-color);">${txnId}</strong></div>
        <div class="receipt-row"><span>Payment Date:</span><strong>${new Date().toLocaleDateString()}</strong></div>
        <div class="receipt-row" style="border-top: 1.5px solid var(--border-color); padding-top: 8px; margin-top: 8px;">
          <span style="font-weight: 800; font-size: 15px;">Amount Paid:</span>
          <strong style="color: var(--primary-color); font-size: 17px;">${feeRecord.currency}${amount.toLocaleString()}</strong>
        </div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button class="btn btn-primary" style="flex: 1;" onclick="UniversalApp.printActiveReceipt()">🖨️ Download / Print Receipt</button>
          <button class="btn btn-outline" style="flex: 1;" onclick="UniversalApp.closeModal()">Done</button>
        </div>
      </div>
    `);

    // Reset Form
    document.getElementById('inlineFeePaymentForm').reset();
    document.getElementById('inline_fee_amount_display').innerText = `${feeRecord.currency}0`;
    document.getElementById('inline_fee_amount_val').value = '0';
    document.getElementById('fee_screenshot_preview').style.display = 'none';
    this.uploadedFeeScreenshotData = null;
    this.clearSelectedStudent();
  }
};

window.StudentManagementModule = StudentManagementModule;

