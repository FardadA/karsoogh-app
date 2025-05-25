// get-token.js
const { getNewToken } = require('./config/driveBackup');

(async () => {
  try {
    // آرگومان اول پس از node get-token.js همان کدی است
    // که از صفحهٔ احراز هویت گوگل دریافت می‌کنی
    const code = process.argv[2];
    await getNewToken(code);
  } catch (err) {
    console.error(err);
  }
})();
