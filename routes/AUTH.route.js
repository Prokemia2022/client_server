
/****************************UTILS*************************************/
const express = require("express");

/****************************MIDDLEWARES*******************************/
const SCHEMA_VALIDATOR = require("../middleware/schema.validator.js");
const { AUTHENTICATE_TOKEN, VERIFY_TOKEN } = require('../middleware/token.verifier.middleware.js');
const { USER_API_AUTHORIZATION } = require('../middleware/user.handler.middleware.js');
/****************************CONTROLLERS*******************************/
const { NEW_USER_ACCOUNT } = require("../controllers/auth/auth.signup.controller.js");
const { SIGN_IN_USER } = require("../controllers/auth/auth.signin.controller.js");
const { 
	HANDLE_USER_ACCOUNT_DELETION, 
	HANDLE_USER_ACCOUNT_DELETION_CRON_FUNCTION 
} = require('../controllers/auth/auth.user.handler.controller.js');
const { 
	SEND_OTP_TO_USER, 
	HANDLE_RESET_PASSWORD 
} = require("../controllers/auth/auth.password.controller.js");
const { 
	GET_VERIFICATION_CODE_EMAIL, 
	VERIFY_USER_ACCOUNT 
} = require("../controllers/auth/auth.verify.controller.js");
const REFRESH_USER_TOKEN = require("../controllers/auth/auth.refreshToken.controller.js");
/****************************CONFIGS***********************************/
const { 
	SIGNUP_VALIDATION_SCHEMA, 
	SIGNIN_VALIDATION_SCHEMA, 
	FLAG_USER_DELETION_VALIDATION_SCHEMA, 
	PASSWORD_RESET_VALIDATION_SCHEMA, 
	NEW_PASSWORD_RESET_VALIDATION_SCHEMA, 
	VERIFY_USER_ACCOUNT_VALIDATION_SCHEMA
} = require("../config/SchemaValidator.js");

const router = express.Router();

/****************************ENDPOINTS*********************************/
router.post('/signup',
	SCHEMA_VALIDATOR(SIGNUP_VALIDATION_SCHEMA), 
	NEW_USER_ACCOUNT
);

router.post('/signin',
	SCHEMA_VALIDATOR(SIGNIN_VALIDATION_SCHEMA),
	USER_API_AUTHORIZATION,
	SIGN_IN_USER
);

router.put('/refresh/sesion', REFRESH_USER_TOKEN);

// Password
router.get('/password/code',
	SCHEMA_VALIDATOR(PASSWORD_RESET_VALIDATION_SCHEMA),
	SEND_OTP_TO_USER
);

router.put('/password/new', 
	VERIFY_TOKEN,
	SCHEMA_VALIDATOR(NEW_PASSWORD_RESET_VALIDATION_SCHEMA),
	HANDLE_RESET_PASSWORD
);

// Verify
router.get('/verify/code', 
	SCHEMA_VALIDATOR(VERIFY_USER_ACCOUNT_VALIDATION_SCHEMA),
	GET_VERIFICATION_CODE_EMAIL
);

router.get('/verify', 
	SCHEMA_VALIDATOR(VERIFY_USER_ACCOUNT_VALIDATION_SCHEMA),
	VERIFY_USER_ACCOUNT
);

// Delete
router.delete('/delete/flag', 
	AUTHENTICATE_TOKEN ,
	SCHEMA_VALIDATOR(FLAG_USER_DELETION_VALIDATION_SCHEMA),
	USER_API_AUTHORIZATION,
	HANDLE_USER_ACCOUNT_DELETION
);

router.delete('/delete/execute',
	AUTHENTICATE_TOKEN,
	USER_API_AUTHORIZATION,
	SCHEMA_VALIDATOR(FLAG_USER_DELETION_VALIDATION_SCHEMA),
	HANDLE_USER_ACCOUNT_DELETION_CRON_FUNCTION
);


module.exports = router;
