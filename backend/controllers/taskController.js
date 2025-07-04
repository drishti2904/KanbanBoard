const Task = require('../models/Task');
const User = require('../models/User');
const logAction = require('../utils/logAction');

const COLUMN_NAMES = ['Todo', 'In Progress', 'Done'];

// ✅ Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, priority } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (COLUMN_NAMES.includes(title)) {
      return res.status(400).json({ message: 'Title cannot match column name' });
    }

    const existing = await Task.findOne({ title });
    if (existing) {
      return res.status(400).json({ message: 'Task title must be unique' });
    }

    const task = await Task.create({
      title,
      description,
      assignedTo,
      status,
      priority
    });

    req.app.get('io').emit('taskCreated', task);
    await logAction(req.user._id, 'CREATE_TASK', task._id, { title });

    res.status(201).json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Get All Tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate('assignedTo', 'username email');
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Update Task with Conflict Handling
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { lastKnownUpdatedAt, ...updateData } = req.body;

    if (updateData.title && COLUMN_NAMES.includes(updateData.title)) {
      return res.status(400).json({ message: 'Title cannot match column name' });
    }

    const existing = await Task.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Conflict Detection
    if (
      lastKnownUpdatedAt &&
      new Date(lastKnownUpdatedAt).getTime() !== new Date(existing.updatedAt).getTime()
    ) {
      return res.status(409).json({
        message: 'Conflict detected',
        serverVersion: existing
      });
    }

    // No conflict: Update
    Object.assign(existing, updateData);
    await existing.save();

    req.app.get('io').emit('taskUpdated', existing);
    await logAction(req.user._id, 'UPDATE_TASK', existing._id, updateData);

    res.json(existing);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Task not found' });
    }

    req.app.get('io').emit('taskDeleted', deleted._id);
    await logAction(req.user._id, 'DELETE_TASK', deleted._id, { title: deleted.title });

    res.json({ message: 'Task deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ Smart Assign (updated)
const smartAssign = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const users = await User.find({});
    if (!users.length) {
      return res.status(400).json({ message: 'No users available' });
    }

    const assignments = await Task.aggregate([
      { $match: { status: { $ne: 'Done' }, assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', count: { $sum: 1 } } }
    ]);

    const countMap = new Map();
    assignments.forEach(a => countMap.set(a._id.toString(), a.count));

    let minUser = null;
    let minCount = Infinity;
    users.forEach(u => {
      const count = countMap.get(u._id.toString()) || 0;
      if (count < minCount) {
        minCount = count;
        minUser = u;
      }
    });

    task.assignedTo = minUser._id;
    await task.save();

    // Repopulate assignedTo before emitting / returning
    await task.populate('assignedTo', 'username email');

    req.app.get('io').emit('taskUpdated', task);
    await logAction(req.user._id, 'SMART_ASSIGN', task._id, { assignedTo: minUser.username });

    res.json(task);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  smartAssign
};
