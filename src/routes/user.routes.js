const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

router.post('/', auth, role(['admin']), userCtrl.createUser);
router.get('/', auth, role(['admin', 'subadmin', 'teamhead']), userCtrl.getUsers);
router.put('/status', auth, role(['admin']), userCtrl.updateStatus);
router.put('/:id', auth, userCtrl.updateUser);
router.delete('/:id', auth, role(['admin']), userCtrl.deleteUser);


module.exports = router;
