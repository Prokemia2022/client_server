const express = require('express');
const router = express.Router();

const { delete_client_account, delete_distributor_account, delete_manufacturer_account, delete_salesperson_account } = require('../controllers/account_deletion.controller');


router.post('/client', delete_client_account);
router.post('/distributor', delete_distributor_account);
router.post('/manufacturer', delete_manufacturer_account);
router.post('/salesperson', delete_salesperson_account);

module.exports = router;