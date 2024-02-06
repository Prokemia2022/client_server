const express = require('express');
const router = express.Router();

const signin = require('../controllers/auth.signin.controller');

router.post('/', signin);

module.exports = router;