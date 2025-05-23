require('dotenv').config();
const fs      = require('fs');
const path    = require('path');
const express = require('express');
const session = require('express-session');
const http    = require('http');
const https   = require('https');

const db           = require('./config/db');           // Lowdb instance with safeRead/safeWrite
const authRoutes   = require('./routes/auth.routes');
const groupRoutes  = require('./routes/group.routes');

const app    = express();

// --- Middleware عمومی برای JSON و URL-encoded ---
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --- تنظیمات express-session با گزینه‌های مستحکم‌تر ---
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

// --- Middleware احراز هویت برای صفحات (ری‌دایرکت به لاگین) ---
const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) return next();
  return res.redirect('/login');
};

// --- بخش API Routes ---
// مسیرهای احراز هویت و ثبت‌نام
app.use('/api', authRoutes);
// مسیرهای کار با گروه‌ها (همه باید لاگین کرده باشند)
app.use('/api', requireAuth, groupRoutes);

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
// صفحه گروه
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

// --- Static Files (برای فایل‌های CSS، JS، تصاویر و غیره) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Initialization و استارت سرور ---
(async () => {
  try {
    // یک‌بار دیتابیس JSON را می‌خوانیم و مقداردهی اولیه می‌کنیم
    await db.safeRead();
    console.log('✅ JSON database initialized');

    // اگر می‌خواهید HTTPS با گواهی self-signed داشته باشید،
    // key.pem و cert.pem را در ریشه‌ی پروژه قرار دهید و
    // متغیر USE_HTTPS=true را در .env تنظیم کنید.
    const useHttps = process.env.USE_HTTPS === 'true';
    const port     = process.env.PORT || (useHttps ? 3443 : 3000);

    if (useHttps) {
      // HTTPS Server
      const sslOptions = {
        key:  fs.readFileSync(path.join(__dirname, 'key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'cert.pem'))
      };
      https.createServer(sslOptions, app).listen(port, () => {
        console.log(`🚀 HTTPS Server running at https://localhost:${port}`);
      });
    } else {
      // HTTP Server
      const server = http.createServer(app);
      server.listen(port, () => {
        console.log(`🚀 HTTP Server running at http://localhost:${port}`);
      });
    }

  } catch (err) {
    console.error('❌ Failed to initialize JSON database or SSL:', err);
    process.exit(1);
  }
})();
