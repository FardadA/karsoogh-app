const express = require('express');
const {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup,
  deleteGroup
} = require('../controllers/groupController');
const studentController = require('../controllers/studentController');
const ensureAuth = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(ensureAuth);

// Global lookup and update by QR / ID
router.get('/students/qr/:qr',        studentController.getByQr);
router.put('/students/:studentId',    studentController.updateGlobal);

// Group endpoints
router.get('/groups',                 getGroups);
router.post('/groups',                createGroup);
router.get('/groups/:id',             getGroupById);
router.put('/groups/:id',             updateGroup);
router.delete('/groups/:id',          deleteGroup);

// Student-in-group endpoints
router.get('/groups/:id/students',              studentController.listByGroup);
router.get('/groups/:id/students/:studentId',   studentController.getForGroup);
router.post('/groups/:id/students',             studentController.createForGroup);
router.put('/groups/:id/students/:studentId',   studentController.updateForGroup);
router.delete('/groups/:id/students/:studentId',studentController.deleteForGroup);

module.exports = router;
