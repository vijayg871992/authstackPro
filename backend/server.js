require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');
const crypto = require('crypto');

const app = express();

// Trust proxy for nginx
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// CORS Configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://vijayg.dev'
    : ['http://localhost:3000', 'https://vijayg.dev'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Session Configuration with separate secret
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Database Connection Pool (FIXED)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

// // Email Transporter
// const emailTransporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST || 'smtp.zoho.com',
//   port: process.env.EMAIL_PORT || 587,
//   secure: false,
//   requireTLS: true,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS
//   },
//   tls: {
//     rejectUnauthorized: true
//   }
// });

// Email transporter configuration
const createTransporter = () => {
  const emailPass = process.env.EMAIL_PASS || 'VijjuProMax@871992';
  
  const zohoConfig = {
    host: 'smtp.zoho.in',  
    port: 465,
    secure: true, 
    auth: {
      user: process.env.EMAIL_USER || 'admin@vijayg.dev',
      pass: emailPass  
    },
    tls: {
      rejectUnauthorized: false
    }
  };
  
  console.log('Creating Zoho email transporter with config:', {
    host: zohoConfig.host,
    port: zohoConfig.port,
    user: zohoConfig.auth.user,
    passLength: emailPass.length
  });
  
  return nodemailer.createTransport(zohoConfig);
};

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      return done(null, rows[0]);
    } else {
      await db.execute(
        'INSERT INTO users (id, firstName, lastName, email, password, isActive, emailVerified, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NULL, 1, 1, NOW(), NOW())',
        [profile.name.givenName, profile.name.familyName, email]
      );

      const [newUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return done(null, newUser[0]);
    }
  } catch (error) {
    return done(error, null);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Validation Schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(1).required()
  }),

  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      })
  }),

  sendOtp: Joi.object({
    email: Joi.string().email().required()
  }),

  verifyOtp: Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required()
  })
};

// Utility Functions
const generateJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// FIXED: Use cryptographically secure random
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendEmail = async (to, subject, text) => {
  try {
    await createTransporter().sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { success: false, message: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Routes

// 1. EMAIL + PASSWORD LOGIN
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { error } = schemas.login.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, password } = req.body;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Please use Google login' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateJWT(user.id);

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token // Still send in response for compatibility
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. EMAIL OTP - SEND
app.post('/api/auth/send-otp', authLimiter, async (req, res) => {
  try {
    const { error } = schemas.sendOtp.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email } = req.body;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // FIXED: Match actual database schema
    await db.execute(
      `INSERT INTO otps (type, value, otp, purpose, expiresAt, createdAt, updatedAt)
       VALUES ('email', ?, ?, 'login', ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE otp = ?, expiresAt = ?, updatedAt = NOW()`,
      [email, otp, expiresAt, otp, expiresAt]
    );

    const emailResult = await sendEmail(
      email,
      'Your Login OTP',
      `Your OTP code is: ${otp}\n\nThis code expires in 10 minutes.`
    );

    if (emailResult.success) {
      res.json({ success: true, message: 'OTP sent to your email' });
    } else {
      res.status(500).json({ success: false, message: `Failed to send OTP: ${emailResult.error}` });
    }

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. EMAIL OTP - VERIFY
app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
  try {
    const { error } = schemas.verifyOtp.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { email, otp } = req.body;

    // FIXED: Match actual database schema
    const [otpRows] = await db.execute(
      'SELECT * FROM otps WHERE value = ? AND otp = ? AND expiresAt > NOW() AND isUsed = 0',
      [email, otp]
    );

    if (otpRows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Check if user exists
    let [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (userRows.length === 0) {
      await db.execute(
        'INSERT INTO users (id, firstName, lastName, email, password, isActive, emailVerified, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NULL, 1, 1, NOW(), NOW())',
        ['User', 'Name', email]
      );
      [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    }

    const user = userRows[0];

    // Mark OTP as used
    await db.execute('UPDATE otps SET isUsed = 1, usedAt = NOW() WHERE value = ? AND otp = ?', [email, otp]);

    const token = generateJWT(user.id);

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token // Still send in response for compatibility
    });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 4. GOOGLE OAUTH ROUTES
app.get('/api/auth/google', (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// FIXED: Use httpOnly cookie instead of URL param
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/authstack/#/login?error=oauth_failed' }),
  (req, res) => {
    const token = generateJWT(req.user.id);

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    // Also set user data cookie (not sensitive)
    res.cookie('userData', JSON.stringify({
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect('/authstack/#/dashboard?auth=success');
  }
);

// 5. USER REGISTRATION (Email + Password)
app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const { error } = schemas.register.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const { firstName, lastName, email, password } = req.body;

    // Check if user exists
    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.execute(
      'INSERT INTO users (id, firstName, lastName, email, password, isActive, emailVerified, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, 1, 1, NOW(), NOW())',
      [firstName, lastName, email, hashedPassword]
    );

    const [newUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const token = generateJWT(newUser[0].id);

    // Set httpOnly cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      user: {
        id: newUser[0].id,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        email: newUser[0].email
      },
      token // Still send in response for compatibility
    });

  } catch (error) {
    console.error('❌ Registration Error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    await db.execute('SELECT 1');
    res.json({
      success: true,
      message: 'Server running',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      database: 'disconnected'
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

// Start Server
const PORT = process.env.PORT || 8001;
app.listen(PORT, async () => {
  try {
    await db.execute('SELECT 1');
  } catch (error) {
    process.exit(1);
  }
});
