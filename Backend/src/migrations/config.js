const config = {
  mongodb: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/code-review-app',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: 'src/migrations',
  changelogCollectionName: 'changelog',
  migrationFileExtension: '.js',
  useFileHash: false
};

module.exports = config;
