const router = require('express').Router();
const { getEntities, getEntityById, createEntity, updateEntityStatus } = require('../controllers/entity.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', getEntities);
router.get('/:id', getEntityById);
router.post('/', authorize('CENTRAL_ADMIN','CENTRAL_REVIEWER','STATE_ADMIN'), createEntity);
router.patch('/:id/status', authorize('CENTRAL_ADMIN'), updateEntityStatus);
module.exports = router;
