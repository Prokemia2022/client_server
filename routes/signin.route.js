const express = require('express');
const router = express.Router();

const signin = require('../controllers/auth.signin.controller');
const {SIGNIN_VALIDATION_SCHEMA} = require('../config/SchemaValidator');

const { SIGN_IN_USER } = require("../controllers/auth/auth.signin.controller.js");
const SCHEMA_VALIDATOR = require('../middleware/schema.validator');
// V2
router.post('/v2',SCHEMA_VALIDATOR(SIGNIN_VALIDATION_SCHEMA),SIGN_IN_USER);
// v1
//
router.post('/', signin);


module.exports = router;
