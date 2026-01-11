module.exports = function monitorQuery(next) {
  // Vérifier que "this" est bien une requête Mongoose
  if (typeof this.on === 'function') {
    const start = Date.now();

    this.on('complete', () => {
      const duration = Date.now() - start;
      console.log(`🔍 Query ${this.op} sur ${this.model.modelName} exécutée en ${duration}ms`);
    });
  }

  // Appeler next UNIQUEMENT si Mongoose l'a fourni
  if (typeof next === 'function') {
    next();
  }
};
