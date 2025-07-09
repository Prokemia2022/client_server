const express = require("express");
const router = express.Router();
const { CREATE_NEW_MARKET, FETCH_MARKET_LIST, FETCH_MARKET_DATA, FETCH_MARKET_DATA_FOR_PAGE } = require("../controllers/markets/market.controller.js");
const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware.js");
router.post('/create', AUTHENTICATE_TOKEN , CREATE_NEW_MARKET);
router.get('/list', FETCH_MARKET_LIST);
router.get('/data', FETCH_MARKET_DATA_FOR_PAGE);
router.get('/data', FETCH_MARKET_DATA);

module.exports = router;
