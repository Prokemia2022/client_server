const express = require("express");
const router = express.Router();
const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware.js");
const { 
	CREATE_REQUEST, 
	FETCH_ALL_REQUESTS, 
	FETCH_REQUEST_DATA, 
	UPDATE_REQUEST,
	DELETE_REQUEST,
	HANDLE_REQUEST_STATUS,
	FETCH_ALL_ADMIN_REQUESTS
} = require("../controllers/requests/request.controller.js");
const { USER_API_AUTHORIZATION } = require("../middleware/user.handler.middleware.js");

router.post('/create', AUTHENTICATE_TOKEN , USER_API_AUTHORIZATION, CREATE_REQUEST);
router.get('/details', AUTHENTICATE_TOKEN, FETCH_REQUEST_DATA);
router.get('/data', AUTHENTICATE_TOKEN, FETCH_ALL_REQUESTS);
router.get('/admin/data', AUTHENTICATE_TOKEN, FETCH_ALL_ADMIN_REQUESTS);
router.put('/update', AUTHENTICATE_TOKEN, UPDATE_REQUEST);
router.put('/update/status', AUTHENTICATE_TOKEN, HANDLE_REQUEST_STATUS);
router.delete('/delete', AUTHENTICATE_TOKEN, DELETE_REQUEST);

module.exports = router;
