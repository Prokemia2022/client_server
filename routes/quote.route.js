const express = require('express');
const { new_quote, get_quotes_by_lister } = require('../controllers/quotation.controller');
const router = express.Router();

router.post('/new', new_quote);
router.get('/requester', get_quotes_by_lister);

module.exports = router;