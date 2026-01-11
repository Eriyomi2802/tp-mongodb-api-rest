const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// CREATE — POST /api/posts
router.post('/', async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// READ ALL — GET /api/posts
// Pagination, tri, filtrage
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt', author, category, status } = req.query;

    const filter = {};
    if (author) filter.author = author;
    if (category) filter.category = category;
    if (status) filter.status = status;

    const posts = await Post.find(filter)
      .select('title author category createdAt status viewCount')
      .lean()
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username avatar')
      .populate('category', 'name');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ ONE — GET /api/posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .select('-__v')
      .lean()
      .populate('author', 'username avatar')
      .populate('category', 'name');

    res.json(post);
  } catch (error) {
    res.status(404).json({ error: 'Post introuvable' });
  }
});

// UPDATE — PUT /api/posts/:id
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE — DELETE /api/posts/:id
// Utilise remove() pour déclencher le middleware post-remove
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    await post.remove();

    res.json({ message: 'Post supprimé' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟦 EXERCICE 3.1 — Relations
// GET /api/posts/user/:id — Tous les posts d’un utilisateur
router.get('/user/:id', async (req, res) => {
  try {
    const posts = await Post.find({ author: req.params.id });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/category/:id — Tous les posts d’une catégorie
router.get('/category/:id', async (req, res) => {
  try {
    const posts = await Post.find({ category: req.params.id });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟦 EXERCICE 2 — Routes manquantes
// PATCH /api/posts/:id/publish
router.patch('/:id/publish', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.status = 'published';
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/posts/:id/view
router.patch('/:id/view', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.viewCount++;
    await post.save();

    res.json({ viewCount: post.viewCount });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /api/posts/:id/like
router.patch('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const userId = req.body.userId;

    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 🟦 EXERCICE 4.1 — Search
router.get('/search', async (req, res) => {
  const { q } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .skip(skip)
      .limit(limit);

    res.json({
      page,
      limit,
      results: posts.length,
      posts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🟦 EXERCICE 4.2 — Trending
router.get('/trending', async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  try {
    const trending = await Post.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ['$viewCount', 0.3] },
              { $multiply: [{ $size: '$likes' }, 0.7] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 10 }
    ]);

    res.json(trending);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
