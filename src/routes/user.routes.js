const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');

// ADMIN ONLY
router.post('/', auth, role(['admin']), userCtrl.createUser);

// VIEW USERS
router.get('/', auth, role(['admin', 'subadmin', 'teamhead']), userCtrl.getUsers);

// UPDATE USER
router.put('/:id', auth, userCtrl.updateUser);

// DELETE USER (ADMIN ONLY)
router.delete('/:id', auth, role(['admin']), userCtrl.deleteUser);

// ACTIVE / INACTIVE (ADMIN ONLY)
router.put('/status', auth, role(['admin']), userCtrl.updateStatus);

module.exports = router;
