/**
 * Universal White-Label App Configuration File
 * -------------------------------------------------------------
 * To re-brand and deploy this app for a new client in under 5 minutes:
 * 1. Change `activeAppType` to the client's business model.
 * 2. Update `businessName`, `tagline`, `logoIcon`, and theme colors.
 * 3. Update `googleScriptUrl` with the client's Google Apps Script Webhook.
 * 4. Set `isProductionClientMode: true` to lock for final client delivery (hides demo bars).
 */

const MASTER_CONFIG = {
  // 🔒 PRODUCTION CLIENT MODE:
  // Set to `true` when delivering to a paying client (hides top demo switcher bar)
  isProductionClientMode: false,

  // 🎯 ACTIVE APP TYPE:
  // Options: "student_management" | "movex_booking" | "hotel_booking" | "food_order" | "ecommerce"
  activeAppType: "student_management",

  // 🔗 GOOGLE APPS SCRIPT WEBHOOK URL (Deploy backend/Code.gs and paste URL here)
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbybFqjzb480F0xfDD9CxUyblL5750FqT3x143HikFypoFXCFrJMgmyekaNq7G4_Zzo2/exec",

  // 📊 LIVE GOOGLE SPREADSHEETS (Pre-Mapped by Vertical):
  googleSheets: {
    student_management: "https://docs.google.com/spreadsheets/d/1z1K_O8vl9ftwTlJmnLMzLrjC5V7sfhEMbToWjPuCL-w/edit?usp=sharing",
    movex_booking: "https://docs.google.com/spreadsheets/d/1Mnb-CnvAhb8bTr5dulfzHZTEoD1rs2BbwgwkGKZxnnY/edit?usp=sharing",
    ecommerce: "https://docs.google.com/spreadsheets/d/1G1Z3GKyzP9Y_s8av1GSHj1UKwctlwhLuvW9L8FO0zGk/edit?usp=sharing",
    hotel_booking: "https://docs.google.com/spreadsheets/d/1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k/edit?usp=sharing",
    food_order: "https://docs.google.com/spreadsheets/d/1YYurMFHrew8GZtfXsoJetuAEjd58t58LSVb6QogrW1k/edit?usp=sharing"
  },

  // 🐙 GITHUB PAGES REPO CONFIG
  githubOwner: "raviattrash-pro",
  githubRepo: "OmniSaaS",
  githubPagesUrl: "https://raviattrash-pro.github.io/OmniSaaS/",

  // 💳 PAYMENT & COMMUNICATION SETTINGS
  whatsappNumber: "+919876543210",
  upiId: "payments@upi", // e.g. "school@okhdfcbank" or "movex@okaxis"
  supportEmail: "support@universalplatform.com",

  // 🔐 GOOGLE OAUTH CLIENT ID (Optional for 1-click Google Sign-in)
  enableGoogleAuth: true,
  googleClientId: "939865483008-0uas0dhk55a1a0ppefo8svilqfe6a5qj.apps.googleusercontent.com",

  // =========================================================================
  // 🏢 VERTICAL CONFIGURATIONS & PRESETS
  // =========================================================================
  verticals: {
    // -----------------------------------------------------------------------
    // 1. STUDENT MANAGEMENT & ADMISSIONS PORTAL
    // -----------------------------------------------------------------------
    student_management: {
      businessName: "BrightStar Academy & Collegiate",
      tagline: "Empowering Next-Gen Leaders | Online Admissions & Fee Portal",
      logoIcon: "🎓",
      themeColor: "#1e3a8a", // Navy Blue
      accentColor: "#f59e0b", // Warm Amber
      currency: "₹",
      heroHeadline: "Admissions & Student Activity Portal",
      heroSubtext: "Apply online for new admissions, pay term fees securely, and track academic & co-curricular activity milestones.",
      feeCategories: [
        {
          id: "adm_fee",
          title: "New Admission Registration Fee",
          grade: "All Grades (K-12)",
          amount: 2500,
          description: "One-time registration, entrance assessment & welcome kit",
          badge: "Admission"
        },
        {
          id: "tuition_q1",
          title: "Quarter 1 Tuition & Academic Fee",
          grade: "Grade 1 - 5",
          amount: 18500,
          description: "Covers Q1 classroom coaching, smart lab access & library",
          badge: "Tuition"
        },
        {
          id: "tuition_q1_senior",
          title: "Quarter 1 Tuition & STEM Labs",
          grade: "Grade 6 - 10",
          amount: 24000,
          description: "Advanced STEM coaching, robotics lab, computer science",
          badge: "Tuition"
        },
        {
          id: "bus_fee_annual",
          title: "Annual GPS Bus Transport Fee",
          grade: "Route Zone A & B",
          amount: 14000,
          description: "Doorstep air-conditioned pickup & drop with real-time GPS",
          badge: "Transport"
        },
        {
          id: "sports_club_fee",
          title: "Elite Sports & Co-Curricular Club",
          grade: "All Grades",
          amount: 6500,
          description: "Professional coaching for Swimming, Football, Chess, and Music",
          badge: "Activities"
        }
      ],
      activityCatalog: [
        { id: "act_robotics", title: "Robotics & AI Club", category: "STEM", coach: "Dr. K. Raman", schedule: "Tue & Thu 4:00 PM" },
        { id: "act_swimming", title: "Olympic Swimming Squad", category: "Sports", coach: "Coach Vikram", schedule: "Mon, Wed, Fri 6:30 AM" },
        { id: "act_debate", title: "Model United Nations & Debate", category: "Literary", coach: "Ms. S. Sen", schedule: "Every Saturday 10:00 AM" },
        { id: "act_music", title: "Symphony & Classical Vocal", category: "Arts", coach: "Pt. A. Joshi", schedule: "Wed & Sat 4:30 PM" }
      ]
    },

    // -----------------------------------------------------------------------
    // 2. MOVE-X LOGISTICS & VEHICLE BOOKING (Based on MOVE-X-V0-Validation-Plan)
    // -----------------------------------------------------------------------
    movex_booking: {
      businessName: "MOVE X Fast Dispatch",
      tagline: "Transparent, High-Reliability Urban Logistics & Vehicle Booking",
      logoIcon: "🚚",
      themeColor: "#0f172a", // Slate Dark
      accentColor: "#22c55e", // Electric Green
      currency: "₹",
      heroHeadline: "Dependable Urban Freight & Cab Dispatch",
      heroSubtext: "Guaranteed vehicle allocation in 15 mins. Transparent pricing: zero hidden surge, instant driver net payout disclosure.",
      pricingRules: {
        helperCostPerUnit: 350,
        stairsCostPerFloor: 100,
        tollEstimateFixed: 120,
        returnLoadDiscountPct: 15
      },
      vehicles: [
        {
          id: "v_3wheeler",
          title: "3-Wheeler Cargo (Piaggio Ape)",
          category: "V0 Core Anchor",
          payload: "500 kg Payload",
          dimensions: "5.5 x 4.5 x 4 ft",
          basePrice: 280,
          baseKm: 3,
          perKmRate: 22,
          perMinRate: 2.5,
          badge: "Best for Quick Hops",
          image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400"
        },
        {
          id: "v_tata_ace",
          title: "Tata Ace / Chota Hathi",
          category: "V0 Anchor Workhorse",
          payload: "750 kg Payload",
          dimensions: "7 x 4.8 x 4.5 ft",
          basePrice: 420,
          baseKm: 4,
          perKmRate: 28,
          perMinRate: 3.0,
          badge: "Most Popular",
          image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400"
        },
        {
          id: "v_8ft_pickup",
          title: "8ft Bolero Maxi Truck",
          category: "B2B Mid Logistics",
          payload: "1200 kg Payload",
          dimensions: "8.5 x 5 x 5 ft",
          basePrice: 650,
          baseKm: 5,
          perKmRate: 36,
          perMinRate: 4.0,
          badge: "Heavy Furniture & Cartons",
          image: "https://images.unsplash.com/photo-1586191582056-a60032b4b470?w=400"
        },
        {
          id: "v_cab_sedan",
          title: "MOVE-X Sedan / SUV Cab",
          category: "Passenger & Executive",
          payload: "4-6 Passengers",
          dimensions: "AC Sedan / Ertiga",
          basePrice: 350,
          baseKm: 4,
          perKmRate: 20,
          perMinRate: 2.0,
          badge: "City Ride & Outstation",
          image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400"
        }
      ]
    },

    // -----------------------------------------------------------------------
    // 3. HOTEL & SEAT / ROOM RESERVATION
    // -----------------------------------------------------------------------
    hotel_booking: {
      businessName: "Grand Horizon Suites & Lounge",
      tagline: "Luxury Stays, Rooftop Dining & Conference Reservations",
      logoIcon: "🏨",
      themeColor: "#4338ca", // Indigo
      accentColor: "#ec4899", // Rose Pink
      currency: "$",
      heroHeadline: "Book Your Luxury Stay & Private Table",
      heroSubtext: "Experience premier hospitality with seamless online room bookings and fine-dining reservations.",
      rooms: [
        {
          id: "room_deluxe",
          title: "Deluxe Ocean-View Suite",
          capacity: "2 Adults, 1 Child",
          pricePerNight: 160,
          description: "King bed, private balcony with sea view, complimentary breakfast & high-speed Wi-Fi.",
          badge: "Ocean Front",
          image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400"
        },
        {
          id: "room_presidential",
          title: "Presidential Penthouse",
          capacity: "4 Adults",
          pricePerNight: 350,
          description: "2 Master bedrooms, jacuzzi, private terrace, 24/7 personal butler service.",
          badge: "Luxury VIP",
          image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400"
        },
        {
          id: "table_rooftop",
          title: "Rooftop Starlight Dining Table",
          capacity: "2-6 Guests",
          pricePerNight: 40,
          description: "Reserved candlelit table with sunset skyline views and priority chef menu.",
          badge: "Fine Dining",
          image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400"
        }
      ]
    },

    // -----------------------------------------------------------------------
    // 4. FOOD ORDERING & CLOUD KITCHEN
    // -----------------------------------------------------------------------
    food_order: {
      businessName: "Artisan Kitchen & Grill",
      tagline: "Wood-Fired Gourmet & Fresh Comfort Food Delivered Fast",
      logoIcon: "🍔",
      themeColor: "#b91c1c", // Deep Red
      accentColor: "#f97316", // Flame Orange
      currency: "$",
      heroHeadline: "Craving Something Delicious?",
      heroSubtext: "Handcrafted artisan burgers, wood-fired pizzas, and gourmet desserts delivered hot in 30 minutes.",
      categories: ["All", "Pizzas", "Burgers", "Beverages", "Desserts"],
      menu: [
        {
          id: "food_truffle_burger",
          title: "Smoked Truffle Beast Burger",
          category: "Burgers",
          price: 14.5,
          description: "Double Angus beef, aged cheddar, black truffle aioli, brioche bun.",
          badge: "Chef's Special",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400"
        },
        {
          id: "food_margherita_pizza",
          title: "Wood-Fired Neapolitan Margherita",
          category: "Pizzas",
          price: 16.0,
          description: "San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil.",
          badge: "Authentic",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400"
        },
        {
          id: "food_bbq_wings",
          title: "Sticky Honey-Chipotle Wings",
          category: "Burgers",
          price: 11.0,
          description: "Crispy chicken wings glazed in honey chipotle BBQ sauce.",
          badge: "Popular",
          image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400"
        },
        {
          id: "food_tiramisu",
          title: "Classic Venetian Tiramisu",
          category: "Desserts",
          price: 8.5,
          description: "Espresso-soaked savoiardi, mascarpone cream, dark cocoa dust.",
          badge: "Sweet Treat",
          image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400"
        }
      ]
    },

    // -----------------------------------------------------------------------
    // 5. QUICK COMMERCE & E-COMMERCE STORE
    // -----------------------------------------------------------------------
    ecommerce: {
      businessName: "NovaMart Express Retail",
      tagline: "Electronics, Daily Essentials & Lifestyle Delivered in 15 Mins",
      logoIcon: "🛍️",
      themeColor: "#047857", // Emerald Green
      accentColor: "#3b82f6", // Royal Blue
      currency: "$",
      heroHeadline: "Lightning Fast Shopping",
      heroSubtext: "Premium tech accessories, smart home gear, and lifestyle products with doorstep express delivery.",
      categories: ["All", "Audio", "Wearables", "Accessories"],
      products: [
        {
          id: "prod_anc_headphones",
          title: "NovaSound Pro ANC Headphones",
          category: "Audio",
          price: 79.99,
          description: "Active Noise Cancelling, 40h battery, ultra-plush memory foam earcups.",
          badge: "Top Rated",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
        },
        {
          id: "prod_smartwatch",
          title: "NovaFit GPS Smartwatch Pro",
          category: "Wearables",
          price: 119.0,
          description: "AMOLED Always-on Display, SpO2 & Heart Rate tracking, 5ATM water resistance.",
          badge: "Best Seller",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400"
        },
        {
          id: "prod_magsafe_charger",
          title: "3-in-1 Magnetic Fast Wireless Pad",
          category: "Accessories",
          price: 39.5,
          description: "Simultaneously charge Phone, Watch & Earbuds with 15W Qi fast charging.",
          badge: "Trending",
          image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400"
        }
      ]
    }
  }
};

window.MASTER_CONFIG = MASTER_CONFIG;
