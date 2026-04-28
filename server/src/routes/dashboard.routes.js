const router = require('express').Router();
const { getStats, getStatsByState } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/stats', getStats);
router.get('/by-state', getStats);
module.exports = router;
