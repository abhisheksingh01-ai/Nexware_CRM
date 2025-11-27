const express = require('express');
const router = express.Router();
const leadCtrl = require('../controllers/lead.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.post('/', auth, role(['admin','subadmin','teamhead']), leadCtrl.createLead);
router.get('/', auth, role(['admin','subadmin','teamhead','agent']), leadCtrl.getLeads);
router.get('/:id', auth, role(['admin','subadmin','teamhead','agent']), leadCtrl.getLead);
router.put('/:id', auth, role(['admin','subadmin','teamhead','agent']), leadCtrl.updateLead);

module.exports = router;