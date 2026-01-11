const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');

router.get('/dashboard', async (req, res) => {
  try {
    const stats = await Post.aggregate([
      {
        $facet: {
          // 1️⃣ Nombre d’utilisateurs actifs
          activeUsers: [
            {
              $lookup: {
                from: 'users',
                pipeline: [
                  { $match: { isActive: true } },
                  { $count: 'count' }
                ],
                as: 'active'
              }
            },
            { $project: { count: { $arrayElemAt: ['$active.count', 0] } } }
          ],

          // 2️⃣ Posts par statut
          postsByStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],

          // 3️⃣ Top 5 catégories
          topCategories: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'categories',
                localField: '_id',
                foreignField: '_id',
                as: 'category'
              }
            },
            { $unwind: '$category' },
            {
              $project: {
                _id: 0,
                name: '$category.name',
                count: 1
              }
            }
          ],

          // 4️⃣ Top 5 posts les plus commentés
          mostCommented: [
            {
              $lookup: {
                from: 'comments',
                localField: '_id',
                foreignField: 'post',
                as: 'comments'
              }
            },
            { $addFields: { commentCount: { $size: '$comments' } } },
            { $sort: { commentCount: -1 } },
            { $limit: 5 },
            {
              $project: {
                title: 1,
                commentCount: 1
              }
            }
          ],

          // 5️⃣ Posts créés sur les 30 derniers jours
          last30days: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
              }
            },
            {
              $group: {
                _id: { $dayOfMonth: '$createdAt' },
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]
        }
      }
    ]);

    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
