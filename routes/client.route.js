const express = require('express');
const { get_client_data, update_client_data, password_reset } = require('../controllers/client.controller');

const router = express.Router();

router.get('/user', get_client_data);
router.put('/update', update_client_data);
router.post('/password_reset', password_reset);

module.exports = router;