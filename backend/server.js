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

const app = express();

console.log('🚀 [SERVER] Starting Clean Auth Server...');

// Middleware
app.use(cors({
  origin: ['https://vijayg.dev', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

console.log('✅ [SERVER] Middleware configured');

// Database Connection Pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Email Transporter
const emailTransporter = nodemailer.createTransporter({
  host: 'smtp.zoho.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('✅ [SERVER] Database and Email configured');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  console.log('🔍 [GOOGLE] OAuth callback received:', profile.emails[0].value);

  try {
    const email = profile.emails[0].value;
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length > 0) {
      console.log('✅ [GOOGLE] Existing user found:', email);
      return done(null, rows[0]);
    } else {
      console.log('❌ [GOOGLE] User not registered:', email);
      return done(null, false, { message: 'User not registered. Please sign up first.' });
    }
  } catch (error) {
    console.error('❌ [GOOGLE] OAuth error:', error);
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

console.log('✅ [SERVER] Google OAuth configured');

// Utility Functions
const generateJWT = (userId) => {
  console.log('🔑 [JWT] Generating token for user:', userId);
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log('🔢 [OTP] Generated OTP:', otp);
  return otp;
};

const sendEmail = async (to, subject, text) => {
  console.log('📧 [EMAIL] Sending to:', to);
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log('✅ [EMAIL] Sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('❌ [EMAIL] Failed:', error.message);
    return false;
  }
};

// Routes

// 1. EMAIL + PASSWORD LOGIN
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 [LOGIN] Email/Password attempt:', req.body.email);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ [LOGIN] Missing credentials');
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      console.log('❌ [LOGIN] User not found:', email);
      return res.status(401).json({ success: false, message: 'User not registered. Please sign up first.' });
    }

    const user = rows[0];

    if (!user.password) {
      console.log('❌ [LOGIN] No password set for user:', email);
      return res.status(401).json({ success: false, message: 'Please use Google login or set a password' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      console.log('❌ [LOGIN] Invalid password for:', email);
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }
    
    const token = generateJWT(user.id);
    console.log('✅ [LOGIN] Success for:', email);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token
    });
    
  } catch (error) {
    console.error('❌ [LOGIN] Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 2. EMAIL OTP - SEND
app.post('/api/auth/send-otp', async (req, res) => {
  console.log('📨 [OTP] Send request for:', req.body.email);
  
  try {
    const { email } = req.body;
    
    if (!email) {
      console.log('❌ [OTP] Missing email');
      return res.status(400).json({ success: false, message: 'Email required' });
    }
    
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Store OTP
    await db.execute(
      'INSERT INTO otps (email, otp, expiresAt) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp = ?, expiresAt = ?',
      [email, otp, expiresAt, otp, expiresAt]
    );
    
    const emailSent = await sendEmail(
      email,
      'Your Login OTP',
      `Your OTP code is: ${otp}\n\nThis code expires in 10 minutes.`
    );
    
    if (emailSent) {
      console.log('✅ [OTP] Sent successfully to:', email);
      res.json({ success: true, message: 'OTP sent to your email' });
    } else {
      console.log('❌ [OTP] Failed to send to:', email);
      res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
    
  } catch (error) {
    console.error('❌ [OTP] Send error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 3. EMAIL OTP - VERIFY
app.post('/api/auth/verify-otp', async (req, res) => {
  console.log('🔍 [OTP] Verify request for:', req.body.email);
  
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      console.log('❌ [OTP] Missing email or OTP');
      return res.status(400).json({ success: false, message: 'Email and OTP required' });
    }
    
    const [otpRows] = await db.execute(
      'SELECT * FROM otps WHERE email = ? AND otp = ? AND expiresAt > NOW()',
      [email, otp]
    );
    
    if (otpRows.length === 0) {
      console.log('❌ [OTP] Invalid or expired OTP for:', email);
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    // Check if user exists
    let [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (userRows.length === 0) {
      console.log('🆕 [OTP] Creating new user:', email);
      await db.execute(
        'INSERT INTO users (id, firstName, lastName, email, isActive, emailVerified) VALUES (UUID(), ?, ?, ?, 1, 1)',
        ['User', 'Name', email]
      );
      [userRows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    }
    
    const user = userRows[0];
    
    // Delete used OTP
    await db.execute('DELETE FROM otps WHERE email = ?', [email]);
    
    const token = generateJWT(user.id);
    console.log('✅ [OTP] Login success for:', email);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token
    });
    
  } catch (error) {
    console.error('❌ [OTP] Verify error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 4. GOOGLE OAUTH ROUTES
app.get('/api/auth/google', (req, res, next) => {
  console.log('🔄 [GOOGLE] Initiating OAuth flow');
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

app.get('/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('❌ [GOOGLE] OAuth error:', err);
      return res.redirect('http://localhost:3000/authstack?error=oauth_failed');
    }

    if (!user) {
      const message = info?.message || 'User not registered. Please sign up first.';
      return res.redirect(`http://localhost:3000/authstack?error=${encodeURIComponent(message)}`);
    }

    console.log('✅ [GOOGLE] OAuth success for:', user.email);
    const token = generateJWT(user.id);
    res.redirect(`http://localhost:3000/authstack/dashboard?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    }))}`);
  })(req, res, next);
});

// 5. USER REGISTRATION (Email + Password)
app.post('/api/auth/register', async (req, res) => {
  console.log('📝 [REGISTER] New user registration:', req.body.email);
  
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      console.log('❌ [REGISTER] Missing required fields');
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    
    // Check if user exists
    const [existing] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      console.log('❌ [REGISTER] User already exists:', email);
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    await db.execute(
      'INSERT INTO users (id, firstName, lastName, email, password, isActive, emailVerified) VALUES (UUID(), ?, ?, ?, ?, 1, 1)',
      [firstName, lastName, email, hashedPassword]
    );
    
    const [newUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    const token = generateJWT(newUser[0].id);
    
    console.log('✅ [REGISTER] Success for:', email);
    
    res.json({
      success: true,
      user: {
        id: newUser[0].id,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        email: newUser[0].email
      },
      token
    });
    
  } catch (error) {
    console.error('❌ [REGISTER] Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health Check
app.get('/api/health', (req, res) => {
  console.log('💓 [HEALTH] Check requested');
  res.json({ success: true, message: 'Clean Auth Server Running', timestamp: new Date().toISOString() });
});

// Start Server
const PORT = process.env.PORT || 8001;
app.listen(PORT, async () => {
  console.log(`🌟 [SERVER] Clean Auth running on port ${PORT}`);

  try {
    await db.execute('SELECT 1');
    console.log('✅ [DATABASE] Connection successful');
  } catch (error) {
    console.error('❌ [DATABASE] Connection failed:', error);
  }
});