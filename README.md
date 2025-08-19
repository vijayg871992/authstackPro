# 🚀 AuthStackPro – Enterprise-Grade Authentication System

A robust, production-ready, multi-factor authentication system built with security, scalability, and ease of integration in mind.  
🔒 **Used in production at** [vijayg.dev/authstack](https://vijayg.dev/authstack)

## 📌 Overview

AuthStackPro is a modular, full-stack authentication and user management system offering:

- 🔐 **Multiple Auth Methods**: Email/Password, Email OTP, Google OAuth 2.0
- 🔁 **Multi-Factor Authentication (MFA)**: Optional OTP-based second factor
- 🎫 **JWT Auth with Refresh Tokens**: Secure session lifecycle handling
- 👤 **User Role Management**: Role-based access and permission control
- 📜 **Activity Logging**: Full audit trails for login/signup events
- 🛡️ **Advanced Security**: Bcrypt hashing, account lockout, email verification
- 📧 **Transactional Emails**: Nodemailer integration with SMTP support

## 🧠 Why Use AuthStackPro?

| Feature | Description |
|---------|-------------|
| 🏭 **Production-Ready** | Live at vijayg.dev, tested under real load |
| 🔒 **Security-First Design** | Implements OWASP and industry auth best practices |
| 🧩 **Modular REST APIs** | Plug-and-play API architecture, frontend agnostic |
| ⚙️ **Scalable Stack** | Built using Node.js, MySQL, React, Sequelize ORM |
| 🧾 **GDPR Compliance** | Supports user data handling and logging transparency |
| 💰 **Cost-Effective** | Self-hosted, open-source, reduces SaaS dependency |
| 📡 **Real-Time Monitoring** | Easily integratable with logging tools for session/activity tracking |
| 📦 **Ideal for SaaS MVPs** | Easily extendable into any commercial-grade auth system |

## 🧱 Tech Stack & Architecture

- **Frontend**: React + TypeScript
- **Backend**: Express.js + Node.js + Sequelize ORM
- **Database**: MySQL 8+
- **Authentication**: Passport.js (Local, Google), JWT, OTP via Email
- **Email Services**: Nodemailer (Zoho Mail / any SMTP)
- **Hosting & Deployment**: Nginx + PM2 on VPS

## 🔗 System Modules

- **Auth Module** – Handles login/signup via various methods
- **OTP Module** – Triggers and verifies email OTP for MFA
- **Session Module** – Issues and refreshes JWT tokens
- **User Module** – Role-based user profiles
- **Admin Module** – Manages users and activity logs (planned feature)
- **Error & Log Tracker** – Logs all major events securely

## ⚡ Quick Start (Local Setup)

### ✅ Prerequisites

- Node.js 16+
- MySQL 8.0+
- Google OAuth credentials (optional)
- SMTP credentials (Zoho/Gmail/etc.)

### 📦 Installation

```bash
git clone https://github.com/yourusername/authstackpro.git
cd authstackpro
```

**Install Dependencies**

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**Setup Database**

```sql
CREATE DATABASE authstack;
USE authstack;
-- Execute backend/schema.sql
```

**.env Configuration**

```env
# Server
PORT=8001

# DB
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=authstack

# JWT
JWT_SECRET=super_secret_key
JWT_REFRESH_SECRET=super_refresh_key

# Email
EMAIL_USER=your@domain.com
EMAIL_PASS=your_password

# OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/auth/google/callback

# Frontend
CLIENT_URL=https://yourdomain.com
```

**Run Servers**

```bash
# Development
cd backend && npm run dev
cd frontend && npm start

# Production
cd backend && npm start
cd frontend && npm run build
```

## 🌐 Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8001
- **Production**: [vijayg.dev/authstack](https://vijayg.dev/authstack)

## 🧪 Postman & Testing

- Postman collection available in `/docs/postman`
- Unit and integration tests planned for all endpoints (Jest/Mocha)

## 🔍 Common Errors & Fixes

| Problem | Fix |
|---------|-----|
| MySQL connection fails | Check .env DB credentials, ensure MySQL is running |
| Emails not sent | Verify SMTP settings, app password, and firewall |
| OAuth callback fails | Ensure Google Console redirect URI matches frontend path |
| CORS errors | Add your domain to CORS config in server.js |

## 🙋‍♂️ Get Help

- 📖 **Docs**: `/docs` folder
- 🐛 **Issues**: [GitHub Issues](https://github.com/yourusername/authstackpro/issues)
- 💬 **Email**: admin@vijayg.dev
- 🧪 **Live Demo**: [vijayg.dev/authstack](https://vijayg.dev/authstack)

## 👨‍💻 Project Maintainer

**Vijay G** – Full-Stack Developer & Product Owner  
🔗 [vijayg.dev](https://vijayg.dev) | 📧 admin@vijayg.dev

## 🤝 Contributing

We welcome contributions and ideas:

```bash
# Fork → Branch → Commit → PR
git checkout -b feature/yourFeature
git commit -m "Added new feature"
git push origin feature/yourFeature
```

Please ensure your code adheres to our eslint and folder structure.

## 📄 License

**MIT License** – Free to use, modify, and distribute.

## 🙌 Acknowledgments

- **Express, React, Sequelize** for core stack
- **Passport.js** for pluggable auth
- **Nodemailer** for email verification
- **PM2 & Nginx** for reliable production deployment

## ✅ Status

| Environment | Status | URL |
|-------------|--------|-----|
| Live | ✅ Active | https://vijayg.dev/authstack |
| Local | 🛠️ Development | http://localhost:3000 (Frontend) & :8001 (API) |