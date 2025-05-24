const Student = require('../models/Student');
const Group   = require('../models/Group');

// لیست دانش‌آموزان یک گروه
exports.listByGroup = async (req, res) => {
  try {
    const students = await Student.findByGroupId(req.params.id);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// جست‌وجوی سراسری بر اساس QR
exports.getByQr = async (req, res) => {
  try {
    const qr = req.params.qr;
    const student = await Student.findByQr(qr);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// به‌روزرسانی سراسری اطلاعات دانش‌آموز (انتقال بین گروه‌ها هم انجام می‌شود)
exports.updateGlobal = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { firstName, lastName, gender, groupId } = req.body;

    let student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // اگر گروه تغییر کرده، حذف از گروه قبلی و افزودن به گروه جدید
    if (groupId && student.groupId !== groupId) {
      await Group.removeMember(student.groupId, student.id);
      student = await Student.updateById(student.id, { groupId });
      await Group.addMember(groupId, student.id);
    }

    // آپدیت سایر فیلدها
    const updated = await Student.updateById(student.id, { firstName, lastName, gender });
    res.json(updated);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// دریافت یک دانش‌آموز برای ویرایش در یک گروه
exports.getForGroup = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student || student.groupId !== req.params.id) {
      return res.status(404).json({ error: 'Student not found in this group' });
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ایجاد دانش‌آموز جدید یا انتقال سراسری به گروه
exports.createForGroup = async (req, res) => {
  try {
    const { qrIdentifier, firstName, lastName, gender } = req.body;
    const newGroupId = req.params.id;

    // جست‌وجوی اولیه در مدل سراسری
    let student = await Student.findByQr(qrIdentifier);

    if (student) {
      // انتقال اگر گروه تغییر کرده
      if (student.groupId !== newGroupId) {
        await Group.removeMember(student.groupId, student.id);
        student = await Student.updateById(student.id, { groupId: newGroupId });
        await Group.addMember(newGroupId, student.id);
      }
      return res.json(student);
    }

    // اگر دانش‌آموز جدید است، ایجاد و افزودن به گروه
    const data = { qrIdentifier, firstName, lastName, gender, groupId: newGroupId };
    student = await Student.create(data);
    await Group.addMember(newGroupId, student.id);
    res.status(201).json(student);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// به‌روزرسانی اطلاعات دانش‌آموز در یک گروه
exports.updateForGroup = async (req, res) => {
  try {
    const groupId   = req.params.id;
    const studentId = req.params.studentId;
    const { firstName, lastName, gender } = req.body;

    const student = await Student.findById(studentId);
    if (!student || student.groupId !== groupId) {
      return res.status(404).json({ error: 'Student not found in this group' });
    }

    const updated = await Student.updateById(studentId, { firstName, lastName, gender });
    res.json(updated);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// حذف دانش‌آموز از گروه و مدل
exports.deleteForGroup = async (req, res) => {
  try {
    const groupId   = req.params.id;
    const studentId = req.params.studentId;
    const student   = await Student.findById(studentId);

    if (!student || student.groupId !== groupId) {
      return res.status(404).json({ error: 'Student not found in this group' });
    }

    await Student.delete(studentId);
    await Group.removeMember(groupId, studentId);
    res.sendStatus(204);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
