// routes/group.routes.js
const express = require('express');
const {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup
} = require('../controllers/groupController');
const router = express.Router();

router.get('/groups',    getGroups);
router.post('/groups',   createGroup);
router.get('/groups/:id', getGroupById);
router.put('/groups/:id', updateGroup);

module.exports = router;
