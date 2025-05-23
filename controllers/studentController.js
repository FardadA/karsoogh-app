// controllers/studentController.js
const Student = require('../models/Student');
const Group   = require('../models/Group');

exports.listByGroup = async (req, res) => {
  try {
    const students = await Student.findByGroupId(req.params.id);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createForGroup = async (req, res) => {
  try {
    const data = {
      qrIdentifier: req.body.qrIdentifier,
      firstName:    req.body.firstName,
      lastName:     req.body.lastName,
      gender:       req.body.gender,
      groupId:      req.params.id
    };
    const student = await Student.create(data);
    await Group.addMember(req.params.id, student.id);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
