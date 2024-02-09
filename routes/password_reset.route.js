const express = require('express');
const router = express.Router();
const { handle_reset } = require('../controllers/password_reset.controller');

router.put('/', handle_reset);

module.exports = router;