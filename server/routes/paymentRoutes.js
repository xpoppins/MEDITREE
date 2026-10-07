const router = require('express').Router();
const { protect, managerOnly } = require('../middleware/auth');
const c = require('../controllers/paymentController');

router.get('/status', protect, c.status);
router.post('/create-order', protect, managerOnly, c.createOrder);
router.post('/verify', protect, c.verify);

module.exports = router;