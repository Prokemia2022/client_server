const express = require('express');
const { create_consultancy_form } = require('../controllers/consultations.controller');

const router = express.Router();

router.post('/create', create_consultancy_form);

module.exports = router;