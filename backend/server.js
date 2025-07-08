require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const actionRoutes = require('./routes/actionRoutes');

// ===========================
// Create Express app & HTTP server
// ===========================
const app = express();
const server = http.createServer(app);

// ===========================
// Socket.IO setup
// ===========================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// ===========================
// CORS setup (fix for preflight)
// ===========================
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Enable CORS for all routes
app.use(cors(corsOptions));
// Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

// ===========================
// Middleware
// ===========================
app.use(express.json());

// ===========================
// Health check route
// ===========================
app.get('/', (req, res) => {
  res.send('API is running');
});

// Remove accidental double slashes
app.use((req, res, next) => {
  req.url = req.url.replace(/\/{2,}/g, '/');
  next();
});


// ===========================
// Routes
// ===========================
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/actions', actionRoutes);

// ===========================
// Connect to MongoDB and start server
// ===========================
mongoose.connect(process.env.MONGO_URL, {
  dbName: 'todo_board_db'
})
  .then(() => {
    console.log('MongoDB connected to todo_board_db');
    server.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
