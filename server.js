// server.js
require('dotenv').config();
const path    = require('path');
const express = require('express');
const session = require('express-session');
const http    = require('http');

const db           = require('./config/db');           // Lowdb instance with safeRead/safeWrite
const authRoutes   = require('./routes/auth.routes');
const groupRoutes  = require('./routes/group.routes');

const app    = express();
const server = http.createServer(app);

// Middleware عمومی برای JSON و URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// تنظیمات express-session با گزینه‌های مستحکم‌تر
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,    // در صورت HTTPS این را true کنید
      sameSite: true
    }
  })
);

// Middleware احراز هویت برای صفحات (ری‌دایرکت به لاگین)
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.redirect('/login');
};

// --- بخش API Routes ---
// مسیرهای احراز هویت و ثبت‌نام
app.use('/api', authRoutes);   
// مسیرهای کار با گروه‌ها (همه باید لاگین کرده باشند، درون routes هم می‌توانید ensureAuth بگذارید)
app.use('/api', groupRoutes);

// --- بخش Page Routes ---
// صفحه اصلی
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// صفحه لاگین
app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// صفحه ثبت‌نام
app.get('/signup', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
// صفحه گروه (مثال)
app.get('/group.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'group.html'));
});
// خروج (Logout)
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// Static Files (برای فایل‌های CSS، JS، تصاویر و غیره)
app.use(express.static(path.join(__dirname, 'public')));

// --- Initialization و استارت سرور ---
// چون Node.js اجازه await در سطح بالا را نمی‌دهد، از IIFE استفاده می‌کنیم
(async () => {
  try {
    // یک‌بار دیتابیس JSON را می‌خوانیم و مقداردهی اولیه می‌کنیم
    await db.safeRead();
    console.log('✅ JSON database initialized');

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize JSON database:', err);
    process.exit(1);
  }
})();
