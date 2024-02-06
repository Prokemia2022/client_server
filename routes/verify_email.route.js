const express = require('express');
const { handle_verify } = require('../controllers/verify_email.controller');
const router = express.Router();

router.put('/', handle_verify);

module.exports = router;