const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  smartAssign
} = require('../controllers/taskController');

const { protect } = require('../middlewares/authMiddleware');

// Apply authentication middleware to all task routes
router.use(protect);

// Create a new task
router.post('/', createTask);

// Get all tasks
router.get('/', getTasks);

// Update a task (including conflict handling)
router.put('/:id', updateTask);

// Smart Assign a task to the user with fewest active tasks
router.put('/:id/smart-assign', smartAssign);

// Delete a task
router.delete('/:id', deleteTask);

module.exports = router;
