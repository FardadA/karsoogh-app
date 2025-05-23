// config/db.js
const { Low }      = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path         = require('path');
const fs           = require('fs');
const { Mutex }    = require('async-mutex');
const writeFile    = require('write-file-atomic');

const filePath = path.resolve(__dirname, '../data.json');
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(
    filePath,
    JSON.stringify({ users: [], groups: [] }, null, 2),
    'utf-8'
  );
}

const adapter = new JSONFile(filePath);
const db      = new Low(adapter);

// یک mutex سراسری برای هم‌زمان‌سازی همه عملیات
const mutex = new Mutex();

// پوشش دادن خواندن
db.safeRead = async () => {
  await mutex.runExclusive(async () => {
    await db.read();
    db.data = db.data || { users: [], groups: [] };
  });
};

// پوشش دادن نوشتن (اتمیک)
db.safeWrite = async () => {
  await mutex.runExclusive(async () => {
    // از write-file-atomic برای جلوگیری از corruption استفاده می‌کنیم
    const tmp = JSON.stringify(db.data, null, 2);
    await writeFile(filePath, tmp, { encoding: 'utf-8' });
  });
};

module.exports = db;
