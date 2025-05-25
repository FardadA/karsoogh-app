// routes/group.routes.js
const express = require('express');
const {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup
} = require('../controllers/groupController');
const {
  listByGroup,
  createForGroup
} = require('../controllers/studentController');
const ensureAuth = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(ensureAuth);

router.get('/groups',             getGroups);
router.post('/groups',            createGroup);
router.get('/groups/:id',         getGroupById);
router.put('/groups/:id',         updateGroup);

// Routes for managing students in a group
router.get('/groups/:id/students', listByGroup);
router.post('/groups/:id/students', createForGroup);

module.exports = router;
