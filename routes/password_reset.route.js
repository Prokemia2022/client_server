const express = require('express');
const router = express.Router();
const { handle_reset } = require('../controllers/password_reset.controller');
const SCHEMA_VALIDATOR = require('../middleware/schema.validator.js');
const { PASSWORD_RESET_VALIDATION_SCHEMA, NEW_PASSWORD_RESET_VALIDATION_SCHEMA } = require("../config/SchemaValidator.js");
const { SEND_OTP_TO_USER, HANDLE_RESET_PASSWORD } = require("../controllers/auth/auth.password.controller.js");
const { VERIFY_TOKEN } = require("../middleware/token.verifier.middleware.js");

//V2
router.get('/code', SCHEMA_VALIDATOR(PASSWORD_RESET_VALIDATION_SCHEMA), SEND_OTP_TO_USER);
router.put('/new', VERIFY_TOKEN , SCHEMA_VALIDATOR(NEW_PASSWORD_RESET_VALIDATION_SCHEMA), HANDLE_RESET_PASSWORD);

//V1
router.put('/', handle_reset);

module.exports = router;
