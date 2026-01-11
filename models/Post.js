const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9\s.,!?'-]+$/.test(v);
      },
      message: 'Le titre contient des caractères non autorisés'
    }
  },
  content: {
    type: String,
    required: true,
    minlength: 10
  },
  excerpt: {
    type: String,
    maxlength: 300
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false
  },
  tags: {
    type: [String],
    validate: [
      {
        validator: function(arr) {
          return arr.length <= 10;
        },
        message: 'Maximum 10 tags autorisés'
      },
      {
        validator: function(arr) {
          return arr.every(tag => tag.length <= 20);
        },
        message: 'Chaque tag doit faire maximum 20 caractères'
      }
    ]
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  publishedAt: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});


// 🟦 PARTIE 5 — Middleware pre-save
postSchema.pre('save', function() {
  // Générer excerpt automatiquement
  if (this.content) {
    this.excerpt = this.content.substring(0, 100);
  }

  // Définir publishedAt si status = published
  if (this.isModified('status') && this.status === 'published') {
    this.publishedAt = new Date();
  }
});


// 🟦 PARTIE 5 — Middleware post-remove
postSchema.post('remove', async function(doc) {
  const Comment = require('./Comment');
  const Category = require('./Category');

  // Supprimer les commentaires liés
  await Comment.deleteMany({ post: doc._id });

  // Décrémenter postCount
  if (doc.category) {
    await Category.findByIdAndUpdate(doc.category, {
      $inc: { postCount: -1 }
    });
  }
});


// 🟦 PARTIE 3.2 — Middleware de population automatique
postSchema.pre(/^find/, function() {
  this.populate('author', 'username avatar')
      .populate('category', 'name');
});

// Index pour les filtres fréquents
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ status: 1 });
postSchema.index({ createdAt: -1 });

// Index textuel pour la recherche
postSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
});
// Middleware de monitoring des requêtes
const monitorQuery = require('../middleware/monitoring');

postSchema.pre('find', monitorQuery);
postSchema.pre('findOne', monitorQuery);
postSchema.pre('findOneAndUpdate', monitorQuery);


module.exports = mongoose.model('Post', postSchema);
