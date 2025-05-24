// models/Group.js
const { customAlphabet } = require('nanoid');
const db                  = require('../config/db');
const nanoid              = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  16
);

class Group {
  /**
   * برمی‌گرداند لیست همه گروه‌ها
   */
  static async findAll() {
    await db.safeRead();
    // همیشه اطمینان می‌دهیم که آرایه‌ی groups موجود است
    db.data.groups = db.data.groups || [];
    return db.data.groups;
  }

  /**
   * پیدا کردن یک گروه با شناسه
   * @param {string} id
   */
  static async findOne(id) {
    if (!id) throw new Error('Group ID is required');
    await db.safeRead();
    db.data.groups = db.data.groups || [];
    return db.data.groups.find(g => g.id === id) || null;
  }

  /**
   * ایجاد یک گروه جدید
   * @param {{name: string, score?: number}} param0
   */
  static async create({ name, score = 0 }) {
    // اعتبارسنجی ورودی
    if (typeof name !== 'string' || name.trim() === '') {
      throw new Error('Group name must be a non-empty string');
    }
    const numericScore = Number(score);
    if (isNaN(numericScore)) {
      throw new Error('Score must be a valid number');
    }

    await db.safeRead();
    db.data.groups = db.data.groups || [];

    const group = {
      id: nanoid(),
      name: name.trim(),
      score: numericScore,
      members: []
    };

    db.data.groups.push(group);
    await db.safeWrite();

    return group;
  }

  /**
   * به‌روزرسانی یک گروه
   * @param {string} id
   * @param {{name?: string, score?: number}} param1
   */
  static async update(id, { name, score }) {
    if (!id) throw new Error('Group ID is required');
    await db.safeRead();
    db.data.groups = db.data.groups || [];

    const idx = db.data.groups.findIndex(g => g.id === id);
    if (idx === -1) return null;

    // اعتبارسنجی و اعمال تغییرات
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        throw new Error('Group name must be a non-empty string');
      }
      db.data.groups[idx].name = name.trim();
    }
    if (score !== undefined) {
      const numericScore = Number(score);
      if (isNaN(numericScore)) {
        throw new Error('Score must be a valid number');
      }
      db.data.groups[idx].score = numericScore;
    }

    await db.safeWrite();
    return db.data.groups[idx];
  }

  /**
   * اضافه کردن یک عضو (دانش‌آموز) به گروه
   * @param {string} id
   * @param {string} memberId
   */
  static async addMember(id, memberId) {
    if (!id) throw new Error('Group ID is required');
    if (!memberId) throw new Error('Member ID is required');

    await db.safeRead();
    db.data.groups = db.data.groups || [];

    const idx = db.data.groups.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Group not found');

    // مقداردهی اولیه members اگر لازم باشد
    if (!Array.isArray(db.data.groups[idx].members)) {
      db.data.groups[idx].members = [];
    }

    // جلوگیری از اضافه شدن تکراری
    if (!db.data.groups[idx].members.includes(memberId)) {
      db.data.groups[idx].members.push(memberId);
      await db.safeWrite();
    }

    return db.data.groups[idx];
  }

  /**
   * حذف یک عضو (دانش‌آموز) از گروه
   * @param {string} id
   * @param {string} memberId
   */
  static async removeMember(id, memberId) {
    if (!id) throw new Error('Group ID is required');
    if (!memberId) throw new Error('Member ID is required');

    await db.safeRead();
    db.data.groups = db.data.groups || [];

    const idx = db.data.groups.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Group not found');

    // حذف memberId از آرایه‌ی members
    db.data.groups[idx].members = (db.data.groups[idx].members || [])
      .filter(m => m !== memberId);

    await db.safeWrite();
    return db.data.groups[idx];
  }

  /**
   * حذف یک گروه
   * @param {string} id
   */
  static async delete(id) {
    if (!id) throw new Error('Group ID is required');
    await db.safeRead();
    db.data.groups = db.data.groups || [];

    const idx = db.data.groups.findIndex(g => g.id === id);
    if (idx === -1) throw new Error('Group not found');

    db.data.groups.splice(idx, 1);
    await db.safeWrite();
  }
}

module.exports = Group;
