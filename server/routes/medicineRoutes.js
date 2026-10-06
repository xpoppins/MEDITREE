const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/medicineController');

router.use(protect);
router.get('/', c.getMedicines);
router.post('/', c.addMedicine);
router.put('/:id', c.updateMedicine);
router.delete('/:id', c.deleteMedicine);
router.patch('/:id/toggle', c.toggleTaken);

module.exports = router;