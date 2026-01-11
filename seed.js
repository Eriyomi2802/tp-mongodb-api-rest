require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Category = require('./models/Category');
const Comment = require('./models/Comment');

const seedDatabase = async () => {
  try {
    console.log("🌱 Connexion à MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("🧹 Nettoyage de la base...");
    await User.deleteMany({});
    await Post.deleteMany({});
    await Category.deleteMany({});
    await Comment.deleteMany({});

    console.log("📁 Création des catégories...");
    const categories = await Category.create([
      { name: 'Technology', slug: 'technology', color: '#3B82F6' },
      { name: 'Design', slug: 'design', color: '#8B5CF6' },
      { name: 'Business', slug: 'business', color: '#10B981' }
    ]);

    console.log("👤 Création des utilisateurs...");
    const users = await User.create([
      {
        username: 'john_doe',
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin'
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith'
      }
    ]);

    console.log("📝 Création des posts...");
    const posts = await Post.create([
      {
        title: 'Getting Started with MongoDB',
        content: 'MongoDB is a powerful NoSQL database...',
        author: users[0]._id,
        category: categories[0]._id,
        status: 'published',
        tags: ['mongodb', 'database', 'nosql']
      },
      {
        title: 'Modern Web Design Trends',
        content: 'In 2024, web design continues to evolve...',
        author: users[1]._id,
        category: categories[1]._id,
        status: 'published',
        tags: ['design', 'ui', 'ux']
      }
    ]);

    console.log("💬 Création des commentaires...");
    await Comment.create([
      {
        content: 'Great article! Very helpful.',
        author: users[1]._id,
        post: posts[0]._id
      },
      {
        content: 'Thanks for sharing!',
        author: users[0]._id,
        post: posts[1]._id
      }
    ]);

    console.log("✅ Base de données peuplée avec succès !");
    process.exit(0);

  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  }
};

seedDatabase();
