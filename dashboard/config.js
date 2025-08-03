module.exports = {
  db: {
    uri: 'mongodb://localhost:27017/dashboard',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  port: process.env.PORT || 3000,
  origin: process.env.ORIGIN || 'http://localhost:3000',
  apiPrefix: '/api',
  secret: 'your-secret-key-here',
  cors: {
    enabled: true,
    origin: 'http://localhost:3000',
    credentials: true
  }
};