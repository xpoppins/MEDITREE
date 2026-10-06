const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/authController');

router.post('/register-manager', c.registerManager);
router.post('/join', c.joinFamily);
router.post('/login', c.login);
router.post('/google-login', c.googleLogin);
router.get('/me', protect, c.me);

module.exports = router;