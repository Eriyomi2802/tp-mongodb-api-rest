const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
      },
      message: 'Email invalide'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  age: {
    type: Number,
    min: 13,
    max: 120,
    validate: {
      validator: Number.isInteger,
      message: "L'âge doit être un nombre entier"
    }
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },

  // 🔵 VERSION 2 — Validation avatar compatible DiceBear + SVG
  avatar: {
    type: String,
    default: null,
    validate: {
      validator: function(url) {
        if (!url) return true; // accepte vide
        // Accepte .jpg, .jpeg, .png, .gif, .webp, .svg + paramètres
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
      },
      message: "URL d'avatar invalide"
    }
  },

  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// 🔵 Virtual
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// 🔵 Méthode d'instance
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// 🔵 Middleware pre-save
userSchema.pre('save', function() {
  if (this.firstName) this.firstName = this.firstName.trim();
  if (this.lastName) this.lastName = this.lastName.trim();

  // Générer un avatar DiceBear si non fourni
  if (!this.avatar) {
    this.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${this.firstName}+${this.lastName}`;
  }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });

// Monitoring
const monitorQuery = require('../middleware/monitoring');
userSchema.pre('find', monitorQuery);
userSchema.pre('findOne', monitorQuery);
userSchema.pre('findOneAndUpdate', monitorQuery);

const User = mongoose.model('User', userSchema);
module.exports = User;
