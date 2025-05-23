// models/Student.js
const { customAlphabet } = require('nanoid');
const db                  = require('../config/db');
const nanoid8             = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  8
);

async function getStudents() {
  await db.safeRead();
  return db.data.students;
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
    return students.find(s => s.id === id);
  }

  /**
   * فهرست دانش‌آموزان یک گروه
   */
  static async findByGroupId(groupId) {
    const students = await getStudents();
    return students.filter(s => s.groupId === groupId);
  }

  /**
   * ایجاد دانش‌آموز جدید
   * data باید شامل:
   *   qrIdentifier, groupId, gender, firstName, lastName
   */
  static async create(data) {
    const students = await getStudents();

    // هر دانش‌آموز فقط می‌تونه در یک گروه باشه
    if (students.some(s => s.id !== data.id && s.groupId === data.groupId && s.id === data.id)) {
      throw new Error('این دانش‌آموز قبلاً در این گروه عضو است.');
    }

    const newStudent = {
      id: nanoid8(),                    // شناسه ۸ حرفی
      qrIdentifier: data.qrIdentifier,  // متن QR
      groupId: data.groupId,            // شناسه ۱۶ حرفی گروه
      gender: data.gender,              // 'male' یا 'female'
      firstName: data.firstName,
      lastName: data.lastName,
      createdAt: new Date().toISOString()
    };

    // افزودن به آرایه‌ی students و ذخیره
    students.push(newStudent);
    db.data.students = students;
    await db.safeWrite();

    return newStudent;
  }

  /**
   * به‌روزرسانی اطلاعات دانش‌آموز
   */
  static async update(id, data) {
    const students = await getStudents();
    const idx = students.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Student not found.');

    // اگر groupId تغییر کرده، چک کن که در گروه دیگری عضو نیست
    if (data.groupId && students.some((s, i) => i !== idx && s.groupId === data.groupId)) {
      throw new Error('این دانش‌آموز قبلاً در گروه دیگری عضو است.');
    }

    const updated = { ...students[idx], ...data, id: students[idx].id };
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
    if (students.length === lenBefore) throw new Error('Student not found.');

    db.data.students = students;
    await db.safeWrite();
    return true;
  }
}

module.exports = Student;
