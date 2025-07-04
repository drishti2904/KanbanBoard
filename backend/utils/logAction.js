const Action = require('../models/Action');

async function logAction(userId, actionType, taskId, details = {}) {
  try {
    await Action.create({
      user: userId,
      actionType,
      taskId,
      details
    });
  } catch (err) {
    console.error('Error logging action:', err);
  }
}

module.exports = logAction;
