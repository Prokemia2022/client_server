const express = require("express");
const router = express.Router();
const { 
	CREATE_NEW_PRODUCT, 
	FETCH_PRODUCTS_BY_OWNER,
	FETCH_PRODUCT_DATA_BY_OWNER,
	UPDATE_PRODUCT_DATA,
	DELETE_PRODUCT_BY_OWNER,
	FETCH_PRODUCTS,
	FETCH_PRODUCT_DATA_USER,
	FETCH_ALL_PRODUCTS_FOR_ADMIN
} = require("../controllers/products/product.controller.js");
const {AUTHENTICATE_TOKEN} = require("../middleware/token.verifier.middleware.js");
const { USER_API_AUTHORIZATION } = require("../middleware/user.handler.middleware.js");

router.post('/create', AUTHENTICATE_TOKEN , USER_API_AUTHORIZATION, CREATE_NEW_PRODUCT);
router.get('/owner/all', AUTHENTICATE_TOKEN, USER_API_AUTHORIZATION, FETCH_PRODUCTS_BY_OWNER);
router.get('/owner/product/data', AUTHENTICATE_TOKEN, USER_API_AUTHORIZATION, FETCH_PRODUCT_DATA_BY_OWNER);

router.get('/product/data', FETCH_PRODUCT_DATA_USER);
router.put('/update', AUTHENTICATE_TOKEN, UPDATE_PRODUCT_DATA);
router.delete('/delete', AUTHENTICATE_TOKEN, DELETE_PRODUCT_BY_OWNER);

router.get('/all', FETCH_PRODUCTS);
router.get('/admin/all', AUTHENTICATE_TOKEN, USER_API_AUTHORIZATION, FETCH_ALL_PRODUCTS_FOR_ADMIN);

module.exports = router;
