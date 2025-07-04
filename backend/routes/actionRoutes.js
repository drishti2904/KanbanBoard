const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getRecentActions } = require('../controllers/actionController');

router.use(protect);
router.get('/', getRecentActions);

module.exports = router;
