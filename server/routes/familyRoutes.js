const router = require('express').Router();
const { protect, managerOnly } = require('../middleware/auth');
const c = require('../controllers/familyController');

router.use(protect);
router.get('/', c.getFamily);
router.post('/regenerate-code', managerOnly, c.regenerateCode);
router.get('/members', c.getMembers);
router.post('/members', managerOnly, c.addMember);
router.put('/members/:id', c.updateMember);
router.delete('/members/:id', managerOnly, c.deleteMember);
router.post('/members/:id/create-login', managerOnly, c.createMemberLogin);
router.post('/members/:id/reset-password', managerOnly, c.resetPassword);
router.get('/alerts', c.getAlerts);
router.delete('/alerts/:id', c.dismissAlert);

module.exports = router;