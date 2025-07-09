const express = require("express");
const router = express.Router();

const { 
//	FETCH_ALL_DOCUMENTS, 
	FETCH_DOCUMENTS_LISTER, 
	FETCH_DOCUMENTS_PRODUCT,
	CREATE_NEW_DOCUMENT,
	UPDATE_DOCUMENT,
	DELETE_DOCUMENT
} = require("../controllers/documents/documents.controller");
const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware");

router.post('/create', AUTHENTICATE_TOKEN, CREATE_NEW_DOCUMENT);
router.put('/update', AUTHENTICATE_TOKEN, UPDATE_DOCUMENT);
router.delete('/delete', AUTHENTICATE_TOKEN, DELETE_DOCUMENT);
//router.get('/all', FETCH_ALL_DOCUMENTS);
router.get('/lister/all' ,FETCH_DOCUMENTS_LISTER);
router.get('/product/all', FETCH_DOCUMENTS_PRODUCT);
//router.get('/data', FETCH_MARKET_DATA);

module.exports = router;
