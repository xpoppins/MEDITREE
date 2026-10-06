const router = require('express').Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/appointmentController');

router.use(protect);
router.get('/', c.getAppointments);
router.post('/', c.addAppointment);
router.delete('/:id', c.deleteAppointment);

module.exports = router;