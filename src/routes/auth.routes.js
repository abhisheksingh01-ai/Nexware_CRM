const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth.controller');
const developerOnly = require('../middleware/developerOnly');
const { loginLimiter } = require("../middleware/rateLimiter");

router.post("/login",loginLimiter, authCtrl.login);
router.post("/register-secret", developerOnly, authCtrl.register);

module.exports = router;
