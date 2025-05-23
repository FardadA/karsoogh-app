// routes/auth.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');

// مرحلهٔ اول ثبت‌نام: ارسال کد
router.post('/signup', ctrl.signupStep1);
// مرحلهٔ دوم ثبت‌نام: بررسی کد
router.post('/verify', ctrl.signupStep2);
// لاگین
router.post('/login', ctrl.login);
// دریافت اطلاعات کاربر
router.get('/me', ctrl.me);

module.exports = router;
