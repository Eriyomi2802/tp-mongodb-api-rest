const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// GET — toutes les catégories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST — créer une catégorie
router.post('/', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.json({ message: 'Category created', category });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
