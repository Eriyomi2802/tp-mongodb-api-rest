const express = require('express');
const Comment = require('../models/Comment');
const router = express.Router();

// CREATE — POST /api/comments
router.post('/', async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL — GET /api/comments
router.get('/', async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('author', 'username avatar')
      .populate('post', 'title');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ ONE — GET /api/comments/:id
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .select('content author post createdAt') 
      .lean()
      .populate('author', 'username avatar')
      .populate('post', 'title');
    res.json(comment);
  } catch (error) {
    res.status(404).json({ error: 'Commentaire introuvable' });
  }
});

// UPDATE — PUT /api/comments/:id
router.put('/:id', async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE (soft delete) — DELETE /api/comments/:id
router.delete('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    comment.isDeleted = true;
    await comment.save();

    res.json({ message: 'Commentaire supprimé (soft delete)' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟦 EXERCICE 3.1 — Routes relationnelles
// GET /api/posts/:id/comments
router.get('/post/:id', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts/:id/comments
router.post('/post/:id', async (req, res) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      author: req.body.author,
      post: req.params.id
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
