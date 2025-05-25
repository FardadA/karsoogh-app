// config/db.js
const { Low }      = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path         = require('path');
const fs           = require('fs').promises;      // ← Promise-based FS
const { Mutex }    = require('async-mutex');
const writeFile    = require('write-file-atomic');

const filePath = path.resolve(__dirname, '../data.json');

// مقداردهی اولیه‌ی غیرهم‌زمان اگر فایل وجود نداشته باشد
(async () => {
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
const mutex   = new Mutex();

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
 *  - نوشتن دیتابیس را به‌صورت اتمیک و درون یک mutex انجام می‌دهد
 *  - از write-file-atomic برای جلوگیری از corruption استفاده می‌کند
 */
db.safeWrite = async () => {
  await mutex.runExclusive(async () => {
    try {
      const tmp = JSON.stringify(db.data, null, 2);
      await writeFile(filePath, tmp, { encoding: 'utf-8' });
    } catch (err) {
      console.error('safeWrite error:', err);
    }
  });
};

module.exports = db;
