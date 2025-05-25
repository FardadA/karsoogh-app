// models/Student.js
const { customAlphabet } = require('nanoid');
const db                  = require('../config/db');
const nanoid8             = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  8
);

async function getStudents() {
  await db.safeRead();
  return db.data.students || [];
}

class Student {
  /**
   * برمی‌گرداند همه دانش‌آموزان
   */
  static async findAll() {
    return await getStudents();
  }

  /**
   * جستجو بر اساس شناسه ۸ حرفی
   */
  static async findById(id) {
    const students = await getStudents();
    return students.find(s => s.id === id) || null;
  }

  /**
   * فهرست دانش‌آموزان یک گروه
   */
  static async findByGroupId(groupId) {
    const students = await getStudents();
    return students.filter(s => s.groupId === groupId);
  }

  /**
   * جستجو بر اساس QR در کل مدل دانش‌آموزان
   */
  static async findByQr(qrIdentifier) {
    const students = await getStudents();
    return students.find(s => s.qrIdentifier === qrIdentifier) || null;
  }

  /**
   * جستجو بر اساس QR و گروه (برای تشخیص تکراری داخل همان گروه)
   */
  static async findByQrAndGroup(qrIdentifier, groupId) {
    const students = await getStudents();
    return students.find(s =>
      s.qrIdentifier === qrIdentifier && s.groupId === groupId
    ) || null;
  }

  /**
   * ایجاد دانش‌آموز جدید
   * data باید شامل:
   *   qrIdentifier, groupId, gender, firstName, lastName
   */
  static async create(data) {
    const students = await getStudents();

    // بررسی تکراری نبودن QR در کل مدل
    if (students.some(s => s.qrIdentifier === data.qrIdentifier)) {
      throw new Error('این QR قبلاً در سیستم ثبت شده است.');
    }

    const newStudent = {
      id: nanoid8(),                    // شناسه ۸ حرفی
      qrIdentifier: data.qrIdentifier,  // متن QR
      groupId: data.groupId,            // شناسه گروه
      gender: data.gender,              // 'male' یا 'female'
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: new Date().toISOString()
    };

    students.push(newStudent);
    db.data.students = students;
    await db.safeWrite();

    return newStudent;
  }

  /**
   * به‌روزرسانی اطلاعات دانش‌آموز (قابل انتقال بین گروه‌ها)
   * data می‌تواند شامل: qrIdentifier, groupId, gender, firstName, lastName
   */
  static async updateById(id, data) {
    const students = await getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) {
      throw new Error('دانش‌آموز یافت نشد.');
    }

    // اگر QR در data بود، بررسی تکراری نبودن آن در کل مدل
    if (data.qrIdentifier) {
      const duplicate = students.find(s =>
        s.qrIdentifier === data.qrIdentifier &&
        s.id !== id
      );
      if (duplicate) {
        throw new Error('این QR قبلاً در سیستم ثبت شده است.');
      }
    }

    // اعمال آپدیت‌ها (شامل تغییر groupId)
    const updated = {
      ...students[idx],
      ...data,
      id: students[idx].id,               // شناسه تغییر نکند
      createdAt: students[idx].createdAt  // createdAt حفظ شود
    };
    students[idx] = updated;
    db.data.students = students;
    await db.safeWrite();

    return updated;
  }

  /**
   * حذف دانش‌آموز
   */
  static async delete(id) {
    let students = await getStudents();
    const lenBefore = students.length;
    students = students.filter(s => s.id !== id);
    if (students.length === lenBefore) {
      throw new Error('دانش‌آموز یافت نشد.');
    }

    db.data.students = students;
    await db.safeWrite();
    return true;
  }
}

module.exports = Student;
