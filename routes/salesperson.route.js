const express = require('express');
const { get_data, edit_data } = require('../controllers/salesperson.controller');
const router = express.Router();

router.get('/user', get_data)
router.put('/edit', edit_data)

module.exports = router;