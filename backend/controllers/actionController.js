const Action = require('../models/Action');

exports.getRecentActions = async (req, res) => {
  try {
    const actions = await Action.find()
      .sort({ timestamp: -1 })
      .limit(20)
      .populate('user', 'username email')
      .populate('taskId', 'title');

    res.json(actions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching actions' });
  }
};
