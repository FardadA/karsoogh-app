// controllers/groupController.js
const Group = require('../models/Group');

async function getGroups(req, res) {
  try {
    const groups = await Group.findAll();
    return res.json(groups);
  } catch (err) {
    console.error('groupController.getGroups error:', err);
    return res.status(500).json({ error: 'Error fetching groups' });
  }
}

async function createGroup(req, res) {
  try {
    const { name, score } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }
    const group = await Group.create({ name, score });
    return res.status(201).json(group);
  } catch (err) {
    console.error('groupController.createGroup error:', err);
    return res.status(500).json({ error: 'Error creating group' });
  }
}

async function getGroupById(req, res) {
  try {
    const group = await Group.findOne(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'not found' });
    }
    return res.json(group);
  } catch (err) {
    console.error('groupController.getGroupById error:', err);
    return res.status(500).json({ error: 'Error fetching group' });
  }
}

async function updateGroup(req, res) {
  try {
    const { name, score } = req.body;
    const group = await Group.update(req.params.id, { name, score });
    if (!group) {
      return res.status(404).json({ error: 'not found' });
    }
    return res.json(group);
  } catch (err) {
    console.error('groupController.updateGroup error:', err);
    return res.status(500).json({ error: 'Error updating group' });
  }
}

module.exports = {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup
};
