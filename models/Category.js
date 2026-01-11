const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  color: {
    type: String,
    default: '#000000'
  }
}, {
  timestamps: true
});

// Index pour les recherches rapides
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });

// Middleware de monitoring
const monitorQuery = require('../middleware/monitoring');
categorySchema.pre('find', monitorQuery);
categorySchema.pre('findOne', monitorQuery);
categorySchema.pre('findOneAndUpdate', monitorQuery);

module.exports = mongoose.model('Category', categorySchema);
