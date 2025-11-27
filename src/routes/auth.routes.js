const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const userCtrl = require('../controllers/user.controller');

const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// LOGIN
router.post("/login", authCtrl.login);
router.post("/register", auth, adminOnly, authCtrl.register);
router.post("/developer", userCtrl.createUser);

module.exports = router;
