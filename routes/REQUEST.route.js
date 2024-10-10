const express = require("express");
const router = express.Router();
const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware.js");
const { 
	CREATE_REQUEST, 
	FETCH_ALL_REQUESTS, 
	FETCH_REQUEST_DATA, 
	UPDATE_REQUEST,
	DELETE_REQUEST
} = require("../controllers/requests/request.controller.js");

router.post('/create', AUTHENTICATE_TOKEN , CREATE_REQUEST);
router.get('/data', AUTHENTICATE_TOKEN, FETCH_ALL_REQUESTS);
router.get('/details', AUTHENTICATE_TOKEN, FETCH_REQUEST_DATA);
router.put('/update', AUTHENTICATE_TOKEN, UPDATE_REQUEST);
router.delete('/delete', AUTHENTICATE_TOKEN, DELETE_REQUEST)
module.exports = router;
