// controllers/authController.js
const bcrypt                  = require('bcrypt');
const db                      = require('../config/db');
const UserModel               = require('../models/User');
const { sendVerificationEmail } = require('../config/email');

// STEP 1: فقط بررسی یکتا بودن و ارسال کد
exports.signupStep1 = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;
    if (!firstName || !lastName || !phone || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // خواندن دیتابیس Lowdb
    await db.read();
    const users = db.data.users || [];

    // چک تکراری بودن تلفن یا ایمیل
    const existing = users.find(u => u.phone === phone || u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'Phone or Email already in use.' });
    }

    // یکتاست → تولید کد و ذخیره در سشن
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = await bcrypt.hash(password, 12);

    // ذخیرهٔ اطلاعات pending در سشن (حاوی plain password برای پر کردن خودکار فرمِ لاگین)
    req.session.pendingSignup = {
      firstName,
      lastName,
      phone,
      email,
      passwordHash,
      passwordPlain: password,       // **ذخیرهٔ رمز عبور خام**
      verificationCode: code,
      createdAt: Date.now()
    };

    await sendVerificationEmail(email, code);
    return res.json({ status: 'code-sent' });
  } catch (err) {
    console.error('signupStep1 error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// STEP 2: ورود کد و تکمیل ثبت‌نام
exports.signupStep2 = async (req, res) => {
  try {
    const { code } = req.body;
    const pending = req.session.pendingSignup;
    if (!pending) {
      return res.status(400).json({ error: 'No pending signup.' });
    }
    // بررسی تطابق کد
    if (pending.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid code.' });
    }

    // خواندن دیتابیس
    await db.read();
    db.data.users = db.data.users || [];

    // تولید شناسهٔ جدید
    const existingIds = db.data.users.map(u => u.id);
    const newId = existingIds.length ? Math.max(...existingIds) + 1 : 1;

    // تولید friendCode تصادفی
    const friendCode = Math.random().toString(36).slice(2, 10).toUpperCase();

    // ایجاد کاربر با فیلد active=false (نیاز به فعالسازی دستی از طرف ادمین)
    const newUser = {
      id: newId,
      firstName: pending.firstName,
      lastName: pending.lastName,
      phone: pending.phone,
      email: pending.email,
      passwordHash: pending.passwordHash,
      isVerified: true,
      friendCode,
      active: false,                  // **فیلد جدید** (غیر فعال)
      createdAt: Date.now()
    };

    // ذخیره در دیتابیس و نوشتن
    db.data.users.push(newUser);
    await db.write();

    // پاک کردن pendingSignup
    const phone = pending.phone;
    const passPlain = pending.passwordPlain; // دستیابی به رمز خام برای ارسال به Login
    delete req.session.pendingSignup;

    // **به جای لاگین مستقیم**: پاسخ بدهد که حساب «فعال نیست» و شماره/رمز را برای پر کردن فرم لاگین اتوماتیک بفرستد
    return res.json({
      status: 'pendingActivation',
      phone,
      password: passPlain
    });
  } catch (err) {
    console.error('signupStep2 error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // خواندن دیتابیس
    await db.read();
    const users = db.data.users || [];

    // پیدا کردن کاربر با شمارهٔ موبایل
    const user = users.find(u => u.phone === phone);
    if (!user || !user.isVerified) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // چک فعال بودن
    if (!user.active) {
      return res.status(403).json({
        error: 'Your account is not active. Please contact the administrator.'
      });
    }

    // مقایسهٔ رمز عبور
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    // ست کردن سشن
    req.session.userId = user.id;
    req.session.save(err => {
      if (err) console.error('session save error:', err);
    });

    return res.json({ status: 'ok' });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// GET /api/me
exports.me = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not logged in.' });
    }

    await db.read();
    const users = db.data.users || [];
    const user = users.find(u => u.id === req.session.userId);
    if (!user) {
      return res.status(500).json({ error: 'User not found.' });
    }

    // پاسخ JSON شامل اطلاعات عمومی
    const { id, firstName, lastName, phone, email, friendCode } = user;
    return res.json({ user: { id, firstName, lastName, phone, email, friendCode } });
  } catch (err) {
    console.error('me error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};
