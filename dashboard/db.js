const mongoose = require('mongoose');
const config = require('./config');

// Connessione al database MongoDB
mongoose.connect(config.db.uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ...config.db.options
})
.then(() => console.log('Connesso al database'))
.catch(err => console.error('Impossibile connettersi al database:', err));