const express = require('express');
const router = express.Router();

const  { 
    create_client_account,
    create_distributor_account,
    create_manufacturer_account,
    create_salesperson_account
} = require('../controllers/auth.signup.controller');

router.post('/client', create_client_account);
router.post('/distributor', create_distributor_account);
router.post('/manufacturer', create_manufacturer_account);
router.post('/salesperson', create_salesperson_account);

module.exports = router;