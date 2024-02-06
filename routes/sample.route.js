const express = require('express');
const { new_sample, get_samples_by_lister } = require('../controllers/sample.controller');
const router = express.Router();

router.post('/new', new_sample);
router.get('/requester', get_samples_by_lister);

module.exports = router;