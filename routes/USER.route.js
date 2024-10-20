/****************************UTILS**************************************/
const express = require('express');
/****************************MIDDLEWARES********************************/
const SCHEMA_VALIDATOR = require('../middleware/schema.validator.js');
const { AUTHENTICATE_TOKEN, CHECK_ADMIN_REFERER } = require('../middleware/token.verifier.middleware.js');
/****************************MODELS*************************************/
/****************************CONTROLLERS********************************/
const { 
	FETCH_USER_DATA, 
	LIST_SUPPLIERS_ACCOUNTS_DATA, 
	FETCH_ACCOUNT_DATA, 
	FETCH_SUPPLIER_ACCOUNT_FOR_PAGE,
	FETCH_ALL_SUPPLIERS_FOR_ADMIN,
	FETCH_SUPPLIER_ACCOUNT_FOR_ADMIN,
//	HANDLE_ACCOUNT_DELETION,
	FETCH_ALL_CLIENTS_FOR_ADMIN,
	FETCH_CLIENT_ACCOUNT_FOR_ADMIN
} = require("../controllers/user/user.details.controller");
const { 
	UPDATE_USER_DETAILS, 
	UPDATE_USER_ACCOUNT_DETAILS 
} = require("../controllers/user/user.update.controller.js");
const { NEW_USER_ACCOUNT } = require('../controllers/auth/auth.signup.controller.js')
const { HANDLE_FLAG_ACCOUNT_DELETION, HANDLE_ACCOUNT_DELETION } = require('../controllers/user/user.delete.controller.js')
/****************************CONFIGS************************************/
const router = express.Router();

const { 
	FETCH_USER_DETAILS_VALIDATION_SCHEMA, 
	UPDATE_USER_DETAILS_VALIDATION_SCHEMA, 
	UPDATE_USER_ACCOUNT_DETAILS_VALIDATION_SCHEMA 
} = require("../config/SchemaValidator.js");
const {USER_API_AUTHORIZATION} = require('../middleware/user.handler.middleware.js');

/****************************FUNCTIONS**********************************/

router.get('/details', 
	AUTHENTICATE_TOKEN, 
	USER_API_AUTHORIZATION,
	FETCH_USER_DATA
);

router.put(
	'/update/details', 
	AUTHENTICATE_TOKEN, 
	USER_API_AUTHORIZATION,
	SCHEMA_VALIDATOR(UPDATE_USER_DETAILS_VALIDATION_SCHEMA), 
	UPDATE_USER_DETAILS
);

router.put(
	'/update/account/details',
	AUTHENTICATE_TOKEN ,
	USER_API_AUTHORIZATION,
	UPDATE_USER_ACCOUNT_DETAILS
);

router.get('/list/suppliers', LIST_SUPPLIERS_ACCOUNTS_DATA);

router.get('/account', FETCH_ACCOUNT_DATA);

router.get('/supplier', FETCH_SUPPLIER_ACCOUNT_FOR_PAGE);

router.delete('/delete/account', 
	AUTHENTICATE_TOKEN,
	USER_API_AUTHORIZATION,
	HANDLE_ACCOUNT_DELETION
);
router.put('/flag/delete/account', 
	AUTHENTICATE_TOKEN,
	USER_API_AUTHORIZATION,
	HANDLE_FLAG_ACCOUNT_DELETION
);
router.get('/cron/delete/account', 
	HANDLE_FLAG_ACCOUNT_DELETION
);
/***********************ADMIN******************************************/
router.post('/create', 
	AUTHENTICATE_TOKEN, 
	CHECK_ADMIN_REFERER, 
	USER_API_AUTHORIZATION, 
	NEW_USER_ACCOUNT
)

router.get('/suppliers/all', FETCH_ALL_SUPPLIERS_FOR_ADMIN );
router.get('/supplier/admin', FETCH_SUPPLIER_ACCOUNT_FOR_ADMIN);
router.get('/clients/all', FETCH_ALL_CLIENTS_FOR_ADMIN);
router.get('/client/admin', FETCH_CLIENT_ACCOUNT_FOR_ADMIN);

module.exports = router;
