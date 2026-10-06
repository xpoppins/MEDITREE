const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/readingController');

router.use(protect);
router.post('/', c.addReading);
router.get('/', c.listReadings);
router.put('/:id', c.updateReading);
router.delete('/:id', c.deleteReading);

module.exports = router;