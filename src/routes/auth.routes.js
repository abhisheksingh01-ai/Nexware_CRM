const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller');
const developerOnly = require('../middleware/developerOnly');

router.post("/login", authCtrl.login);
router.post("/register-secret", developerOnly, authCtrl.register);

module.exports = router;
