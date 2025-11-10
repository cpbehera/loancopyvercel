// server/index.js - COMPLETE WORKING VERSION WITH AUTHENTICATION
import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "https://loancopyvercel.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));

app.use(express.json());
app.use(express.static("public"));

// Simple route for testing
app.get("/", (req, res) => {
  res.json({ message: "Backend working fine!", timestamp: new Date().toISOString() });
});

// // Database connection
// const dbPromise = open({
// filename: "./db.sqlite",
//   driver: sqlite3.Database,
// });



// Database connection with error handling
let dbPromise;
try {
  dbPromise = open({
    filename: "./database/db.sqlite",
    driver: sqlite3.Database,
  });
  console.log("✅ Database connection initialized");
} catch (error) {
  console.error("❌ Database connection failed:", error);
  // Fallback to in-memory database
  dbPromise = open({
    filename: ":memory:",
    driver: sqlite3.Database,
  });
  console.log("🔄 Using in-memory database as fallback");
}
// ========== AUTHENTICATION TABLES ==========
(async () => {
  try {
    const db = await dbPromise;
    
    // Users table for admin authentication
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'admin',
        is_verified BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME
      )
    `);

    // OTP table for storing verification codes
    await db.exec(`
      CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL,
        otp_code TEXT NOT NULL,
        is_used BOOLEAN DEFAULT 0,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table for maintaining login sessions
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        is_revoked BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log("✅ Authentication tables ready");

    // Check if we have any admin users, if not add default
    const row = await db.get("SELECT COUNT(*) as count FROM users");
    if (row.count === 0) {
      console.log("📝 Adding default admin user...");
      await db.run(
        "INSERT INTO users (phone_number, role, is_verified) VALUES (?, ?, ?)",
        ['9999999999', 'admin', 1]
      );
      console.log("✅ Default admin user added (Phone: 9999999999)");
    }

  } catch (error) {
    console.error("❌ Error setting up authentication tables:", error);
  }
})();

// ========== STATS TABLE ==========
(async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      averageLoan INTEGER,
      approvalRate INTEGER,
      happyCustomers INTEGER
    )
  `);

  // Optional: insert default values if empty
  const row = await db.get("SELECT COUNT(*) as count FROM stats");
  if (row.count === 0) {
    await db.run(
      "INSERT INTO stats (averageLoan, approvalRate, happyCustomers) VALUES (?, ?, ?)",
      [35000, 94, 52000]
    );
  }
})();

// ========== FEATURES TABLE ==========
(async () => {
  const db = await dbPromise;
  await db.exec(`
    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image TEXT
    )
  `);

  // Optional: insert default feature images if empty
  const row = await db.get("SELECT COUNT(*) as count FROM features");
  if (row.count === 0) {
    await db.run("INSERT INTO features (image) VALUES (?), (?), (?), (?)", [
      "/images/feature-1.png",
      "/images/feature-2.png",
      "/images/feature-3.png",
      "/images/feature-4.png",
    ]);
  }
})();

// ========== LOAN APPLICATIONS TABLE ==========
// ========== LOAN APPLICATIONS TABLE ========== (YEH UPDATE KARO)
(async () => {
  try {
    const db = await dbPromise;
    
    // Create loan_applications table with enhanced fields
    await db.exec(`
      CREATE TABLE IF NOT EXISTS loan_applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        loan_type TEXT NOT NULL,
        application_data TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        payment_status TEXT DEFAULT 'pending',
        platform_fee_paid BOOLEAN DEFAULT 0,
        approved_amount INTEGER,
        requested_amount INTEGER,
        cibil_score INTEGER,
        bank_selected TEXT,
        roi_range TEXT,
        processing_time TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log("✅ Loan applications table ready");
    
    // Rest of your existing sample data code...
    // Check if we have any data, if not add sample data
    const row = await db.get("SELECT COUNT(*) as count FROM loan_applications");
    if (row.count === 0) {
      console.log("📝 Adding sample loan applications...");
      
      const sampleApplications = [
        {
          loan_type: "personal",
          application_data: JSON.stringify({
            fullName: "Rahul Sharma",
            email: "rahul.sharma@example.com",
            phone: "9876543210",
            monthlyIncome: "75000",
            incomeType: "Job",
            loanAmount: "500000",
            employmentType: "Salaried",
            companyName: "Tech Solutions Inc",
            timestamp: new Date().toISOString()
          })
        },
        {
          loan_type: "home",
          application_data: JSON.stringify({
            fullName: "Priya Patel",
            email: "priya.patel@example.com", 
            phone: "8765432109",
            annualIncome: "1200000",
            propertyValue: "7500000",
            loanAmount: "5000000",
            employmentType: "Business",
            businessName: "Patel Enterprises",
            timestamp: new Date().toISOString()
          })
        },
        {
          loan_type: "business",
          application_data: JSON.stringify({
            fullName: "Amit Kumar",
            email: "amit.kumar@example.com",
            phone: "7654321098",
            businessIncome: "200000",
            businessType: "Manufacturing",
            businessAge: "5",
            loanAmount: "2000000",
            companyName: "Kumar Manufacturing",
            timestamp: new Date().toISOString()
          })
        }
      ];

      for (const app of sampleApplications) {
        await db.run(
          "INSERT INTO loan_applications (loan_type, application_data, status) VALUES (?, ?, ?)",
          [app.loan_type, app.application_data, "pending"]
        );
      }
      console.log("✅ Sample data added successfully");
    }
    
  } catch (error) {
    console.error("❌ Error setting up loan applications table:", error);
  }
})();

// ========== LOAN PRODUCTS TABLE ==========
(async () => {
  try {
    const db = await dbPromise;
    await db.exec(`
      CREATE TABLE IF NOT EXISTS loan_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        interest_rate TEXT,
        tenure TEXT,
        processing_time TEXT,
        security_type TEXT,
        features TEXT,
        image_path TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const row = await db.get("SELECT COUNT(*) as count FROM loan_products");
    if (row.count === 0) {
      await db.run(`
        INSERT INTO loan_products (name, description, interest_rate, tenure, processing_time, security_type, features, image_path) VALUES
        ('Personal Loan', 'Meet your personal needs with flexible repayment options', '10.5% - 15%', '1-5 years', '2-4 days', 'Unsecured', '["No collateral required","Flexible repayment","Quick disbursal"]', '/images/personal-loan.jpg'),
        ('Home Loan', 'Realize your dream of owning a home with competitive rates', '8.4% - 11.5%', '5-30 years', '7-15 days', 'Secured', '["Low interest rates","Long repayment tenure","Top-up facility"]', '/images/home-loan.jpg'),
        ('Business Loan', 'Fuel your business growth with customized financing', '12.0% - 18.5%', '1-10 years', '5-10 days', 'Both', '["Collateral free options","Business growth support","Customized solutions"]', '/images/business-loan.jpg')
      `);
    }
  } catch (error) {
    console.error("Error setting up loan products:", error);
  }
})();

// ========== TESTIMONIALS TABLE ==========
(async () => {
  try {
    const db = await dbPromise;
    await db.exec(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        location TEXT NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL,
        bgColor TEXT,
        borderColor TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const row = await db.get("SELECT COUNT(*) as count FROM testimonials");
    if (row.count === 0) {
      await db.run(`
        INSERT INTO testimonials (name, role, location, content, rating, bgColor, borderColor) VALUES
        ('Rahul Sharma', 'Business Owner', 'Mumbai', 'FinTrust helped me expand my business with a timely loan. The process was smooth and the interest rates were very competitive. Highly recommended!', 5, 'card-bg-1', 'card-border-1'),
        ('Priya Patel', 'Home Buyer', 'Delhi', 'Got my home loan approved in just 3 days! The team was very supportive throughout the process. Made my dream of owning a home come true.', 5, 'card-bg-2', 'card-border-2'),
        ('Amit Kumar', 'Startup Founder', 'Bangalore', 'As a startup, we needed quick funding. FinTrust understood our needs and provided the perfect business loan with flexible repayment options.', 4, 'card-bg-3', 'card-border-3'),
        ('Sneha Reddy', 'Doctor', 'Hyderabad', 'Excellent service! The personal loan helped me set up my clinic. Low interest rates and minimal documentation made it stress-free.', 5, 'card-bg-4', 'card-border-4'),
        ('Vikram Singh', 'IT Professional', 'Pune', 'Quick approval and disbursement. Used the loan for home renovation. The entire process was digital and very convenient.', 4, 'card-bg-5', 'card-border-5'),
        ('Anjali Mehta', 'Teacher', 'Chennai', 'Great experience with FinTrust. The education loan for my daughter''s studies was processed efficiently with good customer support.', 5, 'card-bg-6', 'card-border-6')
      `);
    }
  } catch (error) {
    console.error("Error setting up testimonials:", error);
  }
})();

// ========== LOAN SERVICES TABLE ==========
(async () => {
  try {
    const db = await dbPromise;
    await db.exec(`
      CREATE TABLE IF NOT EXISTS loan_services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image TEXT
      )
    `);

    const row = await db.get("SELECT COUNT(*) as count FROM loan_services");
    if (row.count === 0) {
      await db.run(`
        INSERT INTO loan_services (name, description, image) VALUES
        ('ITR Filing', 'Easily file your Income Tax Return with expert help.', '/images/itr.jpg'),
        ('GST Registration', 'Register your business under GST in just a few steps.', '/images/gst.jpg'),
        ('UDYAM Registration', 'Get your MSME Udyam certificate hassle-free.', '/images/udayam.webp'),
        ('Balance Sheet Service', 'Accurate and professional financial balance sheet preparation.', '/images/balance-sheet.jpg')
      `);
    }
  } catch (error) {
    console.error("Error setting up loan services:", error);
  }
})();

// ========== AUTHENTICATION MIDDLEWARE ==========
const authenticateToken = async (req, res, next) => {
  // Skip authentication for public routes
// Skip authentication for public routes
const publicRoutes = [
  '/api/auth/send-otp',
  '/api/auth/verify-otp',
  '/api/stats',
  '/api/features',
  '/api/loan-products',
  '/api/testimonials', 
  '/api/loan-services',
  '/api/loans',
  '/api/health',
  '/api/banks',  // YEH ADD KARO
  '/'
];
  
  if (publicRoutes.includes(req.path) || (req.path.startsWith('/api/loan-applications') && req.method === 'POST')) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const db = await dbPromise;
    const session = await db.get(
      "SELECT s.*, u.phone_number, u.role FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.session_token = ? AND s.expires_at > datetime('now') AND s.is_revoked = 0",
      [token]
    );

    if (!session) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.user = {
      id: session.user_id,
      phone_number: session.phone_number,
      role: session.role
    };

    next();
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Apply authentication middleware to protected routes
app.use(['/api/loan-applications', '/api/statistics'], authenticateToken);

// ========== AUTHENTICATION ROUTES ==========

// ✅ Generate and Send OTP
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number || phone_number.length !== 10) {
      return res.status(400).json({ 
        error: "Valid 10-digit phone number is required" 
      });
    }

    const db = await dbPromise;

    // Check if user exists
    let user = await db.get("SELECT * FROM users WHERE phone_number = ?", [phone_number]);
    
    if (!user) {
      // Create new user if doesn't exist
      const result = await db.run(
        "INSERT INTO users (phone_number, role) VALUES (?, ?)",
        [phone_number, 'admin']
      );
      user = { id: result.lastID, phone_number, role: 'admin', is_verified: false };
    }

    // Generate 6-digit OTP
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await db.run(
      "INSERT INTO otps (phone_number, otp_code, expires_at) VALUES (?, ?, ?)",
      [phone_number, otp_code, expires_at.toISOString()]
    );

    // In production, integrate with SMS service like Twilio, Msg91, etc.
    console.log(`📱 OTP for ${phone_number}: ${otp_code} (Expires: ${expires_at.toLocaleTimeString()})`);

    res.json({
      message: "OTP sent successfully",
      phone_number: phone_number,
      expires_in: "10 minutes",
      debug_otp: otp_code // Remove this in production
    });

  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ 
      error: "Failed to send OTP",
      details: error.message 
    });
  }
});

// ✅ Verify OTP and Login
app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { phone_number, otp_code } = req.body;

    if (!phone_number || !otp_code) {
      return res.status(400).json({ 
        error: "Phone number and OTP code are required" 
      });
    }

    const db = await dbPromise;

    // Find valid OTP
    const otpRecord = await db.get(
      "SELECT * FROM otps WHERE phone_number = ? AND otp_code = ? AND is_used = 0 AND expires_at > datetime('now')",
      [phone_number, otp_code]
    );

    if (!otpRecord) {
      return res.status(400).json({ 
        error: "Invalid or expired OTP" 
      });
    }

    // Mark OTP as used
    await db.run("UPDATE otps SET is_used = 1 WHERE id = ?", [otpRecord.id]);

    // Get user
    const user = await db.get("SELECT * FROM users WHERE phone_number = ?", [phone_number]);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user as verified
    await db.run("UPDATE users SET is_verified = 1 WHERE id = ?", [user.id]);

    // Generate session token
    const session_token = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store session
    await db.run(
      "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)",
      [user.id, session_token, expires_at.toISOString()]
    );

    // Update last login
    await db.run("UPDATE users SET last_login = datetime('now') WHERE id = ?", [user.id]);

    console.log(`✅ User ${phone_number} logged in successfully`);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        phone_number: user.phone_number,
        role: user.role
      },
      access_token: session_token,
      expires_at: expires_at.toISOString()
    });

  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ 
      error: "Failed to verify OTP",
      details: error.message 
    });
  }
});

// ✅ Logout
app.post("/api/auth/logout", authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];

    const db = await dbPromise;
    await db.run("UPDATE sessions SET is_revoked = 1 WHERE session_token = ?", [token]);

    console.log(`✅ User ${req.user.phone_number} logged out`);

    res.json({
      message: "Logout successful"
    });

  } catch (error) {
    console.error("❌ Error during logout:", error);
    res.status(500).json({ 
      error: "Failed to logout",
      details: error.message 
    });
  }
});

// ✅ Get Current User
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error("❌ Error fetching user data:", error);
    res.status(500).json({ 
      error: "Failed to fetch user data",
      details: error.message 
    });
  }
});

// ========== API ROUTES ==========

// ✅ GET Stats
app.get("/api/stats", async (req, res) => {
  try {
    const db = await dbPromise;
    const stats = await db.get("SELECT * FROM stats LIMIT 1");
    res.json(stats || {});
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// ✅ GET Features
app.get("/api/features", async (req, res) => {
  try {
    const db = await dbPromise;
    const features = await db.all("SELECT * FROM features");
    res.json(features);
  } catch (error) {
    console.error("Error fetching features:", error);
    res.status(500).json({ message: "Error fetching features" });
  }
});

// ✅ GET All Loan Applications
app.get("/api/loan-applications", async (req, res) => {
  try {
    console.log("📥 Fetching loan applications...");
    const db = await dbPromise;
    const applications = await db.all("SELECT * FROM loan_applications ORDER BY created_at DESC");
    
    console.log(`📊 Found ${applications.length} applications`);
    
    // Parse JSON data
    const parsedApplications = applications.map(app => {
      try {
        return {
          ...app,
          application_data: app.application_data ? JSON.parse(app.application_data) : {}
        };
      } catch (parseError) {
        console.error("Error parsing application data:", parseError);
        return {
          ...app,
          application_data: {}
        };
      }
    });
    
    res.json(parsedApplications);
  } catch (error) {
    console.error("❌ Error fetching loan applications:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  }
});

// ✅ POST New Loan Application
app.post("/api/loan-applications", async (req, res) => {
  try {
    console.log("📨 Received new loan application:", req.body);
    
    const { loan_type, application_data } = req.body;
    
    if (!loan_type || !application_data) {
      return res.status(400).json({ 
        error: "Loan type and application data are required" 
      });
    }

    const db = await dbPromise;
    const result = await db.run(
      "INSERT INTO loan_applications (loan_type, application_data) VALUES (?, ?)",
      [loan_type, JSON.stringify(application_data)]
    );

    console.log("✅ Application saved with ID:", result.lastID);
    
    res.json({ 
      id: result.lastID, 
      message: "Loan application submitted successfully",
      status: "pending"
    });
  } catch (error) {
    console.error("❌ Error submitting loan application:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  }
});

// ✅ UPDATE Application Status
app.put("/api/loan-applications/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Updating application ${id} to status: ${status}`);
    
    const db = await dbPromise;
    const result = await db.run(
      "UPDATE loan_applications SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    res.json({ 
      message: "Application status updated successfully",
      id: id,
      newStatus: status
    });
  } catch (error) {
    console.error("❌ Error updating application:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  }
});

// ✅ GET Loan Products
app.get("/api/loan-products", async (req, res) => {
  try {
    const db = await dbPromise;
    const products = await db.all("SELECT * FROM loan_products WHERE is_active = 1 ORDER BY id");
    
    const parsedProducts = products.map(product => ({
      ...product,
      features: product.features ? JSON.parse(product.features) : []
    }));
    
    res.json(parsedProducts);
  } catch (error) {
    console.error("Error fetching loan products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ GET Testimonials
app.get("/api/testimonials", async (req, res) => {
  try {
    const db = await dbPromise;
    const testimonials = await db.all("SELECT * FROM testimonials ORDER BY created_at DESC");
    res.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ POST New Testimonial
app.post("/api/testimonials", async (req, res) => {
  try {
    const { name, role, location, content, rating, bgColor, borderColor } = req.body;
    
    if (!name || !role || !location || !content || !rating) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const db = await dbPromise;
    const result = await db.run(
      "INSERT INTO testimonials (name, role, location, content, rating, bgColor, borderColor) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, role, location, content, rating, bgColor, borderColor]
    );

    res.json({ 
      id: result.lastID, 
      message: "Testimonial added successfully" 
    });
  } catch (error) {
    console.error("Error adding testimonial:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ========== BANKS TABLE ========== (YEH COMPLETE REPLACE KARO)
(async () => {
  try {
    const db = await dbPromise;
    
    // Pehle existing table drop karo (agar exist karti hai)
    await db.exec(`DROP TABLE IF EXISTS banks`);
    
    // Naya table create karo with correct columns
    await db.exec(`
      CREATE TABLE IF NOT EXISTS banks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        logo TEXT,
        roi_min DECIMAL(4,2),
        roi_max DECIMAL(4,2),
        processing_time TEXT,
        features TEXT,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Banks table created successfully");

    // Ab data insert karo
    console.log("📝 Adding banks data...");
    
    await db.run(`
      INSERT INTO banks (name, logo, roi_min, roi_max, processing_time, features) VALUES
      ('State Bank of India (SBI)', '🏦', 9.5, 12.0, '2-4 days', '["Lowest ROI","Government Bank","Wide Branch Network"]'),
      ('HDFC Bank', '🏦', 10.5, 13.5, '1-3 days', '["Quick Processing","Digital Services","Good Customer Support"]'),
      ('ICICI Bank', '🏦', 10.8, 13.8, '1-2 days', '["Fast Approval","Online Services","Easy Documentation"]'),
      ('Bank of India (BOI)', '🏦', 9.8, 12.5, '3-5 days', '["Government Security","Low Processing Fee","Stable Rates"]'),
      ('Punjab National Bank (PNB)', '🏦', 9.6, 12.2, '3-6 days', '["Trusted Bank","Low Interest Rates","Wide Reach"]'),
      ('UCO Bank', '🏦', 10.2, 13.0, '4-7 days', '["Government Backed","Stable Operations","Low Charges"]'),
      ('Canara Bank', '🏦', 9.9, 12.8, '3-5 days', '["Reputed Bank","Good Customer Service","Competitive Rates"]'),
      ('IDFC First Bank', '🏦', 11.0, 14.5, '1-2 days', '["Quick Disbursal","Digital Process","Customer Friendly"]'),
      ('Union Bank of India', '🏦', 10.0, 12.8, '3-5 days', '["Government Bank","Secure Banking","Low Rates"]'),
      ('Axis Bank', '🏦', 10.7, 13.9, '2-4 days', '["Quick Processing","Good Service","Flexible Options"]')
    `);
    
    console.log("✅ Banks data added successfully");
    
    // Verify data
    const banks = await db.all("SELECT * FROM banks");
    console.log(`📊 Total banks in database: ${banks.length}`);
    
  } catch (error) {
    console.error("❌ Error setting up banks table:", error);
  }
})();
// ========== BANKS ROUTES ==========
app.get("/api/banks", async (req, res) => {
  try {
    console.log("📋 Fetching banks data...");
    const db = await dbPromise;
    
    // Test database connection
    await db.get("SELECT 1 as test");
    console.log("✅ Database connection test passed");
    
    const banks = await db.all("SELECT * FROM banks WHERE is_active = 1 ORDER BY roi_min ASC");
    console.log(`✅ Found ${banks.length} banks`);
    
    const parsedBanks = banks.map(bank => ({
      ...bank,
      features: bank.features ? JSON.parse(bank.features) : []
    }));
    
    res.json(parsedBanks);
    
  } catch (error) {
    console.error("❌ Error in /api/banks:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});
// SELECT Bank for Application
app.post("/api/loan-applications/:id/select-bank", async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_id } = req.body;
    
    if (!bank_id) {
      return res.status(400).json({ error: "Bank ID is required" });
    }
    
    const db = await dbPromise;
    
    // Get bank details
    const bank = await db.get("SELECT * FROM banks WHERE id = ?", [bank_id]);
    if (!bank) {
      return res.status(404).json({ error: "Bank not found" });
    }
    
    // Update application with bank selection
    const result = await db.run(
      "UPDATE loan_applications SET bank_selected = ?, roi_range = ?, processing_time = ?, status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [bank.name, `${bank.roi_min}% - ${bank.roi_max}%`, bank.processing_time, id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    
    res.json({ 
      message: "Bank selected successfully",
      application_id: id,
      bank: bank.name,
      roi_range: `${bank.roi_min}% - ${bank.roi_max}%`,
      processing_time: bank.processing_time,
      status: "approved"
    });
    
  } catch (error) {
    console.error("❌ Error selecting bank:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  }
});

// ✅ GET Loan Services
app.get("/api/loan-services", async (req, res) => {
  try {
    const db = await dbPromise;
    const services = await db.all("SELECT * FROM loan_services");
    res.json(services);
  } catch (error) {
    console.error("Error fetching loan services:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ GET Simple Loan Offers (for compatibility)
app.get("/api/loans", (req, res) => {
  const loanOffers = [
    { id: 1, name: "Personal Loan" },
    { id: 2, name: "Home Loan" },
    { id: 3, name: "Business Loan" },
    { id: 4, name: "Mortage Loan" },
    { id: 5, name: "OD Loan" },
    { id: 6, name: "CC Limit Loan" },
  ];
  res.json(loanOffers);
});

// ✅ Health Check
app.get("/api/health", async (req, res) => {
  try {
    const db = await dbPromise;
    await db.get("SELECT 1");
    res.json({ 
      status: "OK", 
      database: "Connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: "Error", 
      database: "Disconnected",
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/send-otp`);
  console.log(`📊 Admin API: http://localhost:${PORT}/api/loan-applications`);
  console.log(`💬 Testimonials API: http://localhost:${PORT}/api/testimonials`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`\n📋 Default Admin Credentials:`);
  console.log(`   Phone: 9999999999`);
  console.log(`   OTP: Check console when testing`);
});
