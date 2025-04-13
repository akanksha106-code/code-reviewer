module.exports = {
  async up(db) {
    await db.createCollection('reviews');
    await db.collection('reviews').createIndex({ author: 1 });
    await db.collection('reviews').createIndex({ createdAt: -1 });
    
    // Validate existing documents
    const reviews = await db.collection('reviews').find({}).toArray();
    for (const review of reviews) {
      if (!review.code || !review.review || !review.author) {
        await db.collection('reviews').deleteOne({ _id: review._id });
      }
    }
  },

  async down(db) {
    await db.collection('reviews').drop();
  }
};
