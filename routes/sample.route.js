const express = require('express');
const { new_sample, get_samples_by_requester,get_samples_by_product_lister, UpdateSample } = require('../controllers/sample.controller');
const router = express.Router();

router.post('/new', new_sample);
router.get('/requester', get_samples_by_requester);
router.get('/lister', get_samples_by_product_lister);
router.put('/update', UpdateSample);

module.exports = router;