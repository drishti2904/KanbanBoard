require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const actionRoutes = require('./routes/actionRoutes');

//  Create Express app
const app = express();
const server = http.createServer(app);

// Import routes *after* app exists
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// ===========================
// Socket.IO setup
// ===========================
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});
app.set('io', io);

// ===========================
// Middleware
// ===========================
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// ===========================
// Health check route
// ===========================
app.get('/', (req, res) => {
  res.send('API is running');
});

// ===========================
// Routes
// ===========================
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/actions', actionRoutes);
// You can add /actions route later here

// ===========================
// Connect to MongoDB and start server
// ===========================
mongoose.connect(process.env.MONGO_URL, {
  dbName: 'todo_board_db'
})
.then(() => {
  console.log('MongoDB connected to todo_board_db');
  server.listen(process.env.PORT, () => {
    console.log(` Server running on port ${process.env.PORT}`);
  });
})
.catch(err => {
  console.error(' MongoDB connection error:', err);
});
