const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Security middlewares
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Additional security
const helmetOptions = {
  frameguard: { enabled: true },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000 },
  ieNoOpenInNewWindow: true,
  dnsPrefetchControl: true,
  noSniff: true,
  contentTypeOptions: { nosniff: true }
};

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 300 // 300 requests per hour per IP
});

// Morgan logging configuration
morgan.token('remote-addr', (req) => {
  return req.ip || req.connection.remoteAddress;
});

// Database and config
const config = require('./config');
const db = require('./db');

// Routes
const apiRouter = express.Router();

// Get lists endpoint
// Modello Mongoose per le liste
const ListSchema = new mongoose.Schema({
  name: String,
  items: [String],
  createdAt: { type: Date, default: Date.now }
});
const List = mongoose.model('List', ListSchema);

apiRouter.get('/get_lists', async (req, res) => {
  try {
    const lists = await List.find().sort({ createdAt: -1 });
    res.status(200).json(lists);
  } catch (error) {
    console.error('Error in /get_lists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware per mobile detection
apiRouter.use((req, res, next) => {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(req.headers['user-agent']);
  req.isMobile = isMobile;
  next();
});

// Middleware
const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(helmetOptions);

// CORS middleware
app.use(cors());

// Body-parser middleware
app.use(express.json());

// Morgan logging
app.use(morgan('combined'));

// Rate limiting
app.use(limiter);

// Routes
app.use('/api', apiRouter);

// Static files
app.use(express.static('public'));

// Database connection
db.connect();

// Avvio del server con logging
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('Visit http://localhost:${port}/ per accedere alla dashboard');
});