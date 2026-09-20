/**
 * UNIVERSAL MULTI-BUSINESS GOOGLE APPS SCRIPT WEBHOOK ENGINE
 * --------------------------------------------------------------------------
 * Platform: OmniSaaS Multi-Vendor Operating System
 *
 * MAPPED SPREADSHEETS:
 * - School / College:    1z1K_O8vl9ftwTlJmnLMzLrjC5V7sfhEMbToWjPuCL-w
 * - MOVE-X Logistics:    1Mnb-CnvAhb8bTr5dulfzHZTEoD1rs2BbwgwkGKZxnnY
 * - Ecommerce Retail:    1G1Z3GKyzP9Y_s8av1GSHj1UKwctlwhLuvW9L8FO0zGk
 * - Hotel & Resort:      1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k
 * - Food & Restaurant:   1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k
 *
 * MULTI-BUSINESS SEPARATE TAB ENGINE:
 * For every business (e.g. 5 different schools or 10 different hotels),
 * the script automatically creates a dedicated sheet tab named after that business!
 * All transactions, admissions, and orders for that business go directly into their tab.
 *
 * INSTRUCTIONS FOR DEPLOYMENT:
 * 1. Open Google Apps Script (script.google.com) or in any of the above sheets -> Extensions -> Apps Script.
 * 2. Paste this entire Code.gs.
 * 3. Click "Deploy" -> "New deployment" -> Select "Web app".
 * 4. Set Description: "OmniSaaS Multi-Business Sync".
 * 5. Execute as: "Me" (your Google account).
 * 6. Who has access: "Anyone".
 * 7. Click Deploy, authorize permissions, and copy the Web app URL.
 * 8. Paste into `config.js` (`googleScriptUrl`).
 */

// Central Pre-Mapped Google Spreadsheet IDs
const DEFAULT_SPREADSHEET_IDS = {
  student_management: "1z1K_O8vl9ftwTlJmnLMzLrjC5V7sfhEMbToWjPuCL-w",
  movex_booking: "1Mnb-CnvAhb8bTr5dulfzHZTEoD1rs2BbwgwkGKZxnnY",
  ecommerce: "1G1Z3GKyzP9Y_s8av1GSHj1UKwctlwhLuvW9L8FO0zGk",
  hotel_booking: "1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k",
  food_order: "1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k"
};

/**
 * GET Handler - Health check and configuration lookup
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    platform: "OmniSaaS Universal Multi-Business Engine",
    connectedSpreadsheets: DEFAULT_SPREADSHEET_IDS,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * POST Handler - Multi-Business Tab Creation & Transaction Recording
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const acquired = lock.tryLock(15000); // 15 second mutex timeout for high concurrency

  if (!acquired) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Server busy. Please try again."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const payload = JSON.parse(e.postData.contents);
    const appType = payload.appType || payload.vertical || "student_management";
    const businessName = payload.businessName || payload.businessSlug || "General";
    const businessSlug = payload.businessSlug || sanitizeSlug(businessName);

    // 1. Resolve Target Spreadsheet
    let ss = null;
    let targetSpreadsheetId = payload.spreadsheetId || DEFAULT_SPREADSHEET_IDS[appType];

    if (targetSpreadsheetId) {
      try {
        ss = SpreadsheetApp.openById(targetSpreadsheetId);
      } catch (errOpen) {
        Logger.log("Could not open spreadsheet by ID " + targetSpreadsheetId + ": " + errOpen.toString());
      }
    }

    // Fallback to active spreadsheet if running as container-bound script
    if (!ss) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!ss) {
      throw new Error("Unable to locate or open target Google Spreadsheet for " + appType);
    }

    // 2. Resolve or Create Dedicated Sheet Tab for this Business
    const tabName = sanitizeTabName(businessName);
    const headers = getHeadersForVertical(appType);

    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      // Auto-create dedicated tab named after this business
      sheet = ss.insertSheet(tabName);
      sheet.appendRow(headers);
      
      // Professional styling for header row
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground(getHeaderColorForVertical(appType));
      headerRange.setFontColor("#ffffff");
      sheet.setFrozenRows(1);

      // Auto-size columns
      for (let c = 1; c <= headers.length; c++) {
        sheet.setColumnWidth(c, 160);
      }

      // Record business in _Master_Directory tab
      recordInDirectory(ss, businessName, businessSlug, appType);
    }

    // If this was just an onboarding registration ping, return success
    if (payload.action === "register_business") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Business sheet created successfully",
        tabName: tabName,
        spreadsheetName: ss.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. Prepare Cleaned Data & Populate Business Sheet Tab
    const cf = payload.customFields || {};
    const customer = payload.customer || {};
    const cart = payload.cart || { items: [], finalTotal: 0, currency: "₹" };
    const items = cart.items || [];
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    if (appType === "student_management") {
      sheet.appendRow([
        timestamp,
        cleanCell(payload.orderId),
        cleanCell(items[0] ? items[0].title : "Admission"),
        cleanCell(cf.studentName || customer.name),
        cleanCell(cf.studentRollNo || payload.orderId),
        cleanCell(cf.gradeApplied || cf.grade || "N/A"),
        cleanCell(customer.name),
        cleanCell(customer.phone),
        cleanCell(items.map(i => i.title).join(", ")),
        cleanCell(`${cart.currency}${cart.finalTotal}`),
        cleanCell(cf.transactionRef || "UPI / Direct"),
        cleanCell(cf.status || "Verified")
      ]);
    } else if (appType === "movex_booking") {
      sheet.appendRow([
        timestamp,
        cleanCell(payload.orderId),
        cleanCell(cf.vehicleModel || "Tata Ace"),
        cleanCell(cf.pickupLane || "Origin"),
        cleanCell(cf.dropLane || "Destination"),
        Number(cf.distanceKm || 0),
        cleanCell(customer.name),
        cleanCell(customer.phone),
        cleanCell(`₹${cart.finalTotal}`),
        cleanCell(cf.driverNetPayout || "N/A"),
        Number(cf.helpers || 0),
        cleanCell(cf.returnLoadPairing || "No"),
        cleanCell(cf.deliveryOtp || "N/A"),
        cleanCell(cf.tripStatus || "Dispatched")
      ]);
    } else if (appType === "hotel_booking") {
      sheet.appendRow([
        timestamp,
        cleanCell(payload.orderId),
        cleanCell(customer.name),
        cleanCell(customer.phone),
        cleanCell(items[0] ? items[0].title : "Room"),
        cleanCell(cf.checkInDate || ""),
        cleanCell(cf.checkOutDate || ""),
        cleanCell(cf.specialRequests || "None"),
        cleanCell(`${cart.currency}${cart.finalTotal}`),
        cleanCell(cf.status || "Confirmed")
      ]);
    } else if (appType === "food_order") {
      sheet.appendRow([
        timestamp,
        cleanCell(payload.orderId),
        cleanCell(customer.name),
        cleanCell(customer.phone),
        cleanCell(items.map(i => `${i.title} (x${i.quantity})`).join(", ")),
        cleanCell(`${cart.currency}${cart.finalTotal}`),
        cleanCell(cf.deliveryAddress || "Dine-in / Takeaway"),
        cleanCell(cf.paymentMethod || "UPI"),
        cleanCell(cf.status || "Kitchen Preparing")
      ]);
    } else {
      sheet.appendRow([
        timestamp,
        cleanCell(payload.orderId),
        cleanCell(customer.name),
        cleanCell(customer.phone),
        cleanCell(items.map(i => `${i.title} (x${i.quantity})`).join(", ")),
        cleanCell(`${cart.currency}${cart.finalTotal}`),
        cleanCell(cf.deliveryAddress || "Standard Delivery"),
        cleanCell(cf.paymentMethod || "COD"),
        cleanCell(cf.status || "Order Confirmed")
      ]);
    }

    // 4. Send Email Confirmation Receipt if valid email provided
    if (customer.email && customer.email.includes("@") && !customer.email.includes("example.com")) {
      sendEmailReceipt(payload, businessName);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      orderId: payload.orderId,
      business: businessName,
      tab: tabName,
      spreadsheet: ss.getName()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Record Onboarded Business in Master Directory tab
 */
function recordInDirectory(ss, businessName, businessSlug, vertical) {
  try {
    let dirSheet = ss.getSheetByName("_Master_Directory");
    if (!dirSheet) {
      dirSheet = ss.insertSheet("_Master_Directory");
      dirSheet.appendRow(["Onboarding Date", "Business Name", "URL Slug", "Vertical Category", "Dedicated Tab"]);
      dirSheet.getRange(1, 1, 1, 5).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
      dirSheet.setFrozenRows(1);
    }
    dirSheet.appendRow([
      new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      businessName,
      businessSlug,
      vertical,
      sanitizeTabName(businessName)
    ]);
  } catch (e) {
    Logger.log("Directory update skipped: " + e.toString());
  }
}

/**
 * Helper to prevent Spreadsheet Formula Injection (=, +, -, @)
 */
function cleanCell(val) {
  if (val === null || val === undefined) return "";
  let str = String(val);
  if (/^[=+\-@]/.test(str)) {
    return "'" + str;
  }
  return str;
}

/**
 * Sanitize Tab Name for Google Sheets (Max 95 chars, no prohibited characters)
 */
function sanitizeTabName(name) {
  if (!name) return "General_Orders";
  return name.toString().replace(/[\/\\?*:\[\]]/g, '').trim().slice(0, 95) || "General_Orders";
}

function sanitizeSlug(name) {
  if (!name) return "business";
  return name.toString().toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s_]+/g, '-').slice(0, 60);
}

/**
 * Vertical Column Headers
 */
function getHeadersForVertical(appType) {
  if (appType === "student_management") {
    return [
      "Timestamp", "Ref / Receipt ID", "Record Type", "Student Name", "Roll / App ID",
      "Grade / Class", "Parent Name", "Contact Phone", "Particulars", "Amount Paid",
      "Payment Ref / Mode", "Status"
    ];
  } else if (appType === "movex_booking") {
    return [
      "Timestamp", "Booking ID", "Vehicle Model", "Pickup Lane", "Drop Lane",
      "Distance (km)", "Customer Name", "Phone", "All-In Fare", "Driver Payout (85%)",
      "Helpers", "Return Load Pairing", "Delivery OTP", "Trip Status"
    ];
  } else if (appType === "hotel_booking") {
    return [
      "Timestamp", "Voucher ID", "Guest Name", "Contact Phone", "Room / Suite",
      "Check-In Date", "Check-Out Date", "Special Requests", "Total Amount", "Status"
    ];
  } else if (appType === "food_order") {
    return [
      "Timestamp", "Order ID", "Customer Name", "Phone", "Items Ordered",
      "Total Amount", "Delivery Address", "Payment Mode", "Status"
    ];
  } else {
    return [
      "Timestamp", "Order ID", "Customer Name", "Phone", "Items Ordered",
      "Total Amount", "Delivery Address", "Payment Method", "Status"
    ];
  }
}

function getHeaderColorForVertical(appType) {
  const colors = {
    student_management: "#047857", // Emerald Green
    hotel_booking: "#831843",      // Rose/Wine
    movex_booking: "#0284c7",      // Sky Blue
    food_order: "#b91c1c",         // Crimson
    ecommerce: "#4f46e5"           // Indigo
  };
  return colors[appType] || "#1e3a8a";
}

function escapeHtmlGs(str) {
  if (!str) return "";
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function sendEmailReceipt(payload, businessName) {
  try {
    const cust = payload.customer || {};
    const cart = payload.cart || { items: [], finalTotal: 0, currency: "₹" };
    const firstItemTitle = (cart.items && cart.items[0]) ? cart.items[0].title : 'Transaction';
    const subject = `${businessName}: Confirmation for ${escapeHtmlGs(payload.orderId)}`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 10px; background: #ffffff;">
        <h2 style="color: #1e3a8a; margin-top: 0;">${escapeHtmlGs(businessName)}</h2>
        <div style="padding: 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 16px;">
          <p style="margin: 4px 0;"><strong>Reference ID:</strong> ${escapeHtmlGs(payload.orderId)}</p>
          <p style="margin: 4px 0;"><strong>Customer Name:</strong> ${escapeHtmlGs(cust.name)}</p>
          <p style="margin: 4px 0;"><strong>Item / Service:</strong> ${escapeHtmlGs(firstItemTitle)}</p>
          <p style="margin: 4px 0; font-size: 16px; color: #047857;"><strong>Total Paid:</strong> ${escapeHtmlGs(cart.currency)}${escapeHtmlGs(cart.finalTotal)}</p>
        </div>
        <p style="color: #64748b; font-size: 13px;">Your request has been logged in our official records. Thank you for choosing ${escapeHtmlGs(businessName)}!</p>
      </div>
    `;
    MailApp.sendEmail({
      to: cust.email,
      subject: subject,
      htmlBody: htmlBody
    });
  } catch (e) {
    Logger.log("Email dispatch skipped: " + e.toString());
  }
}
