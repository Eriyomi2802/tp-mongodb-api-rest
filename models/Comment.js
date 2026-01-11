const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
    validate: {
      validator: function(v) {
        // Anti-spam : max 3 liens
        const links = v.match(/https?:\/\/\S+/g);
        return !links || links.length <= 3;
      },
      message: 'Le commentaire contient trop de liens (max 3)'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 🟦 PARTIE 5 — Middleware pre-find
commentSchema.pre(/^find/, function() {
  // Filtrer automatiquement les commentaires soft-deleted
  this.where({ isDeleted: { $ne: true } });
});

// Index pour accélérer les requêtes
commentSchema.index({ post: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ createdAt: -1 });

// Middleware de monitoring des requêtes
const monitorQuery = require('../middleware/monitoring');

commentSchema.pre('find', monitorQuery);
commentSchema.pre('findOne', monitorQuery);
commentSchema.pre('findOneAndUpdate', monitorQuery);


module.exports = mongoose.model('Comment', commentSchema);
