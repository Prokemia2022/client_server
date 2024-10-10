const express = require('express');
const { CUSTOMER_OUTREACH_EMAIL } = require('../controllers/email.controller');
const router = express.Router();

router.post('/outreach',CUSTOMER_OUTREACH_EMAIL);


module.exports = router;