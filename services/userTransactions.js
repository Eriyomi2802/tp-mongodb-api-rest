const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');

const deleteUserWithReassign = async (userId, deletedUserId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // 1️⃣ Vérifier que l’utilisateur existe
    const user = await User.findById(userId).session(session);
    if (!user) throw new Error("Utilisateur introuvable");

    // 2️⃣ Réassigner ses posts à l’utilisateur "deleted"
    await Post.updateMany(
      { author: userId },
      { author: deletedUserId },
      { session }
    );

    // 3️⃣ Supprimer ses commentaires
    await Comment.deleteMany(
      { author: userId },
      { session }
    );

    // 4️⃣ Mettre à jour les stats (exemple : compteur)
    await User.findByIdAndUpdate(
      deletedUserId,
      { $inc: { reassignedPosts: 1 } },
      { session }
    );

    // 5️⃣ Supprimer l’utilisateur
    await User.findByIdAndDelete(userId).session(session);

    // Valider la transaction
    await session.commitTransaction();
    console.log("✅ Transaction réussie");

  } catch (error) {
    // Annuler la transaction
    await session.abortTransaction();
    console.error("❌ Transaction échouée :", error);
    throw error;

  } finally {
    session.endSession();
  }
};

module.exports = deleteUserWithReassign;
