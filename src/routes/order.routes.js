const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/order.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.post('/', auth, role(['admin','subadmin']), orderCtrl.createOrder);
router.get('/', auth, role(['admin','subadmin','teamhead','agent']), orderCtrl.getOrders);
router.get('/:id', auth, role(['admin','subadmin','teamhead','agent']), orderCtrl.getOrder);
router.put('/:id', auth, role(['admin','subadmin','teamhead','agent']), orderCtrl.updateOrder);

module.exports = router;