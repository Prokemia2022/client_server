const express = require("express");
const router = express.Router();
const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware.js");
const { 
	CREATE_ORDER, 
	FETCH_ALL_ORDERS, 
	FETCH_ORDER_DATA,
	UPDATE_ORDER,
	DELETE_ORDER
} = require("../controllers/sales/sale.controller.js");
const { USER_API_AUTHORIZATION } = require("../middleware/user.handler.middleware.js");

router.post('/create', AUTHENTICATE_TOKEN , USER_API_AUTHORIZATION, CREATE_ORDER);
router.get('/all', AUTHENTICATE_TOKEN, FETCH_ALL_ORDERS);
router.get('/data', AUTHENTICATE_TOKEN, FETCH_ORDER_DATA);
router.put('/update', AUTHENTICATE_TOKEN, UPDATE_ORDER);
router.delete('/delete', AUTHENTICATE_TOKEN, DELETE_ORDER);

module.exports = router;