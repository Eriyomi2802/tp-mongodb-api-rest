const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const router = express.Router();


// CREATE — POST /api/users
router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// READ ALL — GET /api/users
// Pagination, tri, filtrage par role
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'createdAt', role } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('username email role isActive createdAt') 
      .lean()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// READ ONE — GET /api/users/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'Utilisateur introuvable' });
  }
});


// UPDATE — PUT /api/users/:id
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// DELETE — DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// PATCH — /api/users/:id/toggle-active
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: 'Statut mis à jour', isActive: user.isActive });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// GET /api/users/:id/stats
router.get('/:id/stats', async (req, res) => {
  const userId = req.params.id;

  try {
    const stats = await Post.aggregate([
      { $match: { author: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$author',
          totalPosts: { $sum: 1 },
          totalViews: { $sum: '$viewCount' },
          totalLikes: { $sum: { $size: '$likes' } }
        }
      }
    ]);

    const totalComments = await Comment.countDocuments({ author: userId });

    res.json({
      totalPosts: stats[0]?.totalPosts || 0,
      totalComments,
      totalViews: stats[0]?.totalViews || 0,
      totalLikes: stats[0]?.totalLikes || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const deleteUserWithReassign = require('../services/userTransactions');

router.delete('/:id/transaction', async (req, res) => {
  try {
    const deletedUserId = "ID_DU_USER_DELETED"; // à remplacer par ton user "deleted"
    await deleteUserWithReassign(req.params.id, deletedUserId);

    res.json({ message: "Utilisateur supprimé via transaction" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;
