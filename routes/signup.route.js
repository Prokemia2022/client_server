const express = require('express');
const router = express.Router();

const  { 
    create_client_account,
    create_distributor_account,
    create_manufacturer_account,
    create_salesperson_account
} = require('../controllers/auth.signup.controller');
const { NEW_USER_ACCOUNT } = require('../controllers/auth/auth.signup.controller');
const { SIGNUP_VALIDATION_SCHEMA } = require('../config/SchemaValidator.js')
const SCHEMA_VALIDATOR = require('../middleware/schema.validator.js');
// v2
router.post('/v2', SCHEMA_VALIDATOR(SIGNUP_VALIDATION_SCHEMA) , NEW_USER_ACCOUNT);

// v1
router.post('/client', create_client_account);
router.post('/distributor', create_distributor_account);
router.post('/manufacturer', create_manufacturer_account);
router.post('/salesperson', create_salesperson_account);

module.exports = router;
