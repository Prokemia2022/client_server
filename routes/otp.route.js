const express = require('express');
const { send_otp, send_email_otp } = require('../controllers/email.controller');

const router = express.Router();

router.post('/send/password_reset', send_otp);
router.post('/send/verify_email', send_email_otp);

module.exports = router;