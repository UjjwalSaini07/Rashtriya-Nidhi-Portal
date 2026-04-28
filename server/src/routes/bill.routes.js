const router = require('express').Router();
const { createBill, getBills, getBillById, reviewBill, signBill, disburseBill } = require('../controllers/bill.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.post('/', authorize('STATE_OFFICER','STATE_ADMIN','CENTRAL_ADMIN'), createBill);
router.get('/', getBills);
router.get('/:id', getBillById);
router.patch('/:id/review', authorize('CENTRAL_REVIEWER','CENTRAL_ADMIN'), reviewBill);
router.post('/:id/sign', authorize('STATE_ADMIN','CENTRAL_ADMIN'), signBill);
router.post('/:id/disburse', authorize('CENTRAL_ADMIN'), disburseBill);
module.exports = router;
