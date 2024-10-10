const express = require('express');
const router = express.Router();

const { delete_client_account, delete_distributor_account, delete_manufacturer_account, delete_salesperson_account } = require('../controllers/account_deletion.controller');
const SCHEMA_VALIDATOR = require('../middleware/schema.validator.js');
const { HANDLE_USER_ACCOUNT_DELETION, HANDLE_USER_ACCOUNT_DELETION_CRON_FUNCTION } = require('../controllers/auth/auth.user.handler.controller');
const { FLAG_USER_DELETION_VALIDATION_SCHEMA } = require('../config/SchemaValidator.js');
const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware.js");
// V2
router.delete('/flag', AUTHENTICATE_TOKEN, SCHEMA_VALIDATOR(FLAG_USER_DELETION_VALIDATION_SCHEMA),HANDLE_USER_ACCOUNT_DELETION);
router.delete('/execute', AUTHENTICATE_TOKEN ,SCHEMA_VALIDATOR(FLAG_USER_DELETION_VALIDATION_SCHEMA),HANDLE_USER_ACCOUNT_DELETION_CRON_FUNCTION);

// V1
router.post('/client', delete_client_account);
router.post('/distributor', delete_distributor_account);
router.post('/manufacturer', delete_manufacturer_account);
router.post('/salesperson', delete_salesperson_account);

module.exports = router;
