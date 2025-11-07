# Clean Auth - Authentication System

A personal project demonstrating a multi-method authentication system with JWT tokens, email OTP, and Google OAuth integration.

**Live Demo:** [https://vijayg.dev/authstack](https://vijayg.dev/authstack)

---

## What This Project Does

This is a full-stack authentication system that allows users to sign in using three different methods:

1. **Email + Password** - Traditional registration and login
2. **Email OTP** - One-time password sent via email
3. **Google OAuth** - Sign in with Google account

Once authenticated, users receive a JWT token valid for 24 hours.

---

## Tech Stack

**Backend:**
- Node.js + Express
- MySQL database
- JWT for authentication
- Passport.js for Google OAuth
- Nodemailer for email delivery
- Bcrypt for password hashing

**Frontend:**
- React
- React Router
- Axios for API calls
- Tailwind CSS

**Security:**
- Helmet.js for security headers
- Rate limiting on auth endpoints
- httpOnly cookies for token storage
- Input validation with Joi
- CORS protection

---

## Features Implemented

✅ User registration with email/password
✅ Email/password login
✅ OTP generation and email delivery
✅ OTP verification for passwordless login
✅ Google OAuth 2.0 integration
✅ JWT token generation (24h expiry)
✅ Password hashing with bcrypt
✅ Rate limiting (5 attempts per 15 minutes)
✅ Input validation on all endpoints
✅ Security headers (Helmet.js)
✅ Connection pooling for database
✅ httpOnly cookie for token security

---

## Project Structure

```
clean-auth/
├── backend/
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── .env               # Environment variables (not in git)
│
└── frontend/
    ├── src/
    │   ├── App.js         # Main React component
    │   ├── Login.js       # Login/Register UI
    │   └── Dashboard.js   # Protected dashboard
    └── package.json        # Frontend dependencies
```

---

## Database Schema

**users table:**
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NULL,  
    isActive BOOLEAN DEFAULT TRUE,
    emailVerified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**otps table:**
```sql
CREATE TABLE otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('email','mobile') NOT NULL,
    value VARCHAR(255) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose ENUM('login','password_reset','verification') DEFAULT 'login',
    expiresAt DATETIME NOT NULL,
    isUsed BOOLEAN DEFAULT FALSE,
    usedAt DATETIME NULL,
    attempts INT DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);
```

---

## API Endpoints

### Authentication

**POST** `/api/auth/register`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**POST** `/api/auth/send-otp`
```json
{
  "email": "john@example.com"
}
```

**POST** `/api/auth/verify-otp`
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**GET** `/api/auth/google`
Redirects to Google OAuth consent screen

**GET** `/auth/google/callback`
Google OAuth callback endpoint

**GET** `/api/health`
Health check endpoint

---

## Local Development Setup

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- Gmail/Zoho SMTP account for emails
- Google OAuth credentials (optional)

### Installation

1. **Clone the repository**
```bash
cd /path/to/clean-auth
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure database**
```bash
mysql -u root -p
CREATE DATABASE authstack;
```

Run the schema:
```bash
mysql -u root -p authstack < backend/fix-database.sql
```

5. **Configure environment variables**

Copy `.env.example` to `.env` and update:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your values:
- Database credentials
- JWT secrets (use strong random strings)
- Email SMTP settings
- Google OAuth credentials (if using)

6. **Start development servers**

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm start
```

Access at `http://localhost:3000`

---

## Production Deployment

Current deployment on vijayg.dev:

**Backend:**
- Managed by PM2 on port 8001
- Nginx reverse proxy at `/authstack/api`
- Environment: `NODE_ENV=production`

**Frontend:**
- Built React app served by Nginx
- Located at `/authstack`

**Database:**
- MySQL 8.0 with connection pooling
- Database name: `authstack`

---

## Environment Variables

Required variables in `.env`:

```bash
# Server
PORT=8001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=authstack

# Security
JWT_SECRET=your_jwt_secret_min_32_chars
SESSION_SECRET=your_session_secret_min_32_chars

# Email (for OTP delivery)
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:8001/auth/google/callback
```

---

## Security Features

- **Password Hashing:** Bcrypt with 12 salt rounds
- **JWT Tokens:** 24-hour expiry, stored in httpOnly cookies
- **Rate Limiting:** 5 attempts per 15 minutes on auth endpoints
- **Input Validation:** Joi schema validation on all inputs
- **CORS:** Restricted to specific origins
- **Security Headers:** Helmet.js for XSS, clickjacking protection
- **OTP Security:** Cryptographically secure random generation
- **SQL Injection:** Parameterized queries via mysql2
- **Session Security:** Separate secrets for JWT and sessions

---

## Password Requirements

When registering:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---


## Testing

**Test Account:**
- Email: `demo@authstackpro.com`
- Password: `Demo@12345`

Try it at: [https://vijayg.dev/authstack](https://vijayg.dev/authstack)

---

## License

MIT License - Free to use for learning and personal projects

---

## Author

**Vijay G**

This project demonstrates:
- Full-stack JavaScript development
- Secure authentication patterns
- RESTful API design
- Database design and integration
- OAuth 2.0 implementation
- Production deployment experience

---
