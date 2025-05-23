const express = require('express');
const {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup
} = require('../controllers/groupController');
const ensureAuth = require('../middlewares/auth.middleware');
const router = express.Router();

router.use(ensureAuth);

router.get('/groups',    getGroups);
router.post('/groups',   createGroup);
router.get('/groups/:id', getGroupById);
router.put('/groups/:id', updateGroup);

module.exports = router;
