// config/db.js
const { Low }      = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path         = require('path');
const fs           = require('fs').promises;
const { Mutex }    = require('async-mutex');
const writeFile    = require('write-file-atomic');

// ← وارد کردن ماژول بک‌آپ که قبلاً ساختیم
const { backupToDrive } = require('./driveBackup');

const filePath = path.resolve(__dirname, '../data.json');

const mutex   = new Mutex();

// ─── مرحلهٔ ۰: بک‌آپ اولیه در استارت پروژه ───
(async () => {
  try {
    console.log('⏳ Running initial Drive backup…');
    await backupToDrive();
    console.log('✅ Initial Drive backup completed');
  } catch (err) {
    console.error('❌ Initial Drive backup failed:', err);
  }
})();

// ─── مقداردهی اولیه‌ی غیرهم‌زمان اگر فایل وجود نداشته باشد ───
;(async () => {
  try {
    await fs.access(filePath);
    // فایل وجود دارد؛ کاری نمی‌کنیم
  } catch {
    // فایل وجود ندارد؛ ایجادش کن
    const initData = JSON.stringify(
      { users: [], groups: [], students: [] },
      null,
      2
    );
    await fs.writeFile(filePath, initData, 'utf-8');
  }
})().catch(err => {
  console.error('Error initializing data.json:', err);
});

const adapter = new JSONFile(filePath);
const db      = new Low(adapter);

/**
 * safeRead:
 *  - خواندن دیتابیس را به‌صورت اتمیک انجام می‌دهد
 *  - اگر data خالی یا ناقص باشد، کلیدهای مورد نیاز را اضافه می‌کند
 */
db.safeRead = async () => {
  await mutex.runExclusive(async () => {
    try {
      await db.read();
      db.data = db.data || {};
      db.data.users    = Array.isArray(db.data.users)    ? db.data.users    : [];
      db.data.groups   = Array.isArray(db.data.groups)   ? db.data.groups   : [];
      db.data.students = Array.isArray(db.data.students) ? db.data.students : [];
    } catch (err) {
      console.error('safeRead error:', err);
      db.data = { users: [], groups: [], students: [] };
    }
  });
};

/**
 * safeWrite:
 *  - قبل از هر نوشتن، بک‌آپ می‌گیره
 *  - نوشتن دیتابیس را به‌صورت اتمیک و درون یک mutex انجام می‌دهد
 */
db.safeWrite = async () => {
  await mutex.runExclusive(async () => {
    try {
      // ─── مرحلهٔ ۱: بک‌آپ قبل از نوشتن ───
      console.log('⏳ Running pre-write Drive backup…');
      await backupToDrive();
      console.log('✅ Pre-write Drive backup completed');

      // ─── مرحلهٔ ۲: نوشتن اصلی ───
      const tmp = JSON.stringify(db.data, null, 2);
      await writeFile(filePath, tmp, { encoding: 'utf-8' });
    } catch (err) {
      console.error('safeWrite error:', err);
    }
  });
};

module.exports = db;
