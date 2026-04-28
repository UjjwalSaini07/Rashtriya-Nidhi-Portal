const router = require('express').Router();
const { getLogs, verifyChain } = require('../controllers/audit.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('CENTRAL_ADMIN','CENTRAL_REVIEWER','AUDITOR'));
router.get('/logs', getLogs);
router.get('/verify-chain', verifyChain);
module.exports = router;
