const express = require('express');
const router = express.Router();
const { 
	FETCH_USER_DATA, 
	LIST_SUPPLIERS_ACCOUNTS_DATA, 
	FETCH_ACCOUNT_DATA, 
	FETCH_ACCOUNTS_DATA,
	FETCH_SUPPLIER_ACCOUNT_FOR_PAGE
} = require("../controllers/user/user.details.controller");
const { 
	UPDATE_USER_DETAILS, 
	UPDATE_USER_ACCOUNT_DETAILS 
} = require("../controllers/user/user.update.controller.js");

const SCHEMA_VALIDATOR = require('../middleware/schema.validator.js');
const { 
	FETCH_USER_DETAILS_VALIDATION_SCHEMA, 
	UPDATE_USER_DETAILS_VALIDATION_SCHEMA, 
	UPDATE_USER_ACCOUNT_DETAILS_VALIDATION_SCHEMA 
} = require("../config/SchemaValidator.js");

const {AUTHENTICATE_TOKEN} = require('../middleware/token.verifier.middleware.js');

router.get('/details', AUTHENTICATE_TOKEN, SCHEMA_VALIDATOR(FETCH_USER_DETAILS_VALIDATION_SCHEMA),FETCH_USER_DATA);

router.put('/update/details', AUTHENTICATE_TOKEN, SCHEMA_VALIDATOR(UPDATE_USER_DETAILS_VALIDATION_SCHEMA), UPDATE_USER_DETAILS);

router.put('/update/account/details',AUTHENTICATE_TOKEN ,SCHEMA_VALIDATOR(UPDATE_USER_ACCOUNT_DETAILS_VALIDATION_SCHEMA), UPDATE_USER_ACCOUNT_DETAILS);

router.get('/list/suppliers', LIST_SUPPLIERS_ACCOUNTS_DATA);

router.get('/account', FETCH_ACCOUNT_DATA);

router.get('/accounts', FETCH_ACCOUNTS_DATA);

router.get('/supplier', FETCH_SUPPLIER_ACCOUNT_FOR_PAGE);


module.exports = router;
