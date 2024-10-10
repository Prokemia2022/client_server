const express = require('express');
const { CREATE_DEMO_REQUEST, CREATE_CONTACT_REQUEST } = require('../controllers/support/support.controller.js')

const router = express.Router();

router.post('/demo/create',CREATE_DEMO_REQUEST)
router.post('/contact/create', CREATE_CONTACT_REQUEST);

module.exports = router
