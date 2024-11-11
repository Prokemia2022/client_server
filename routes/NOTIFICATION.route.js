const express = require("express");
const router = express.Router();

const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware.js");
const { FETCH_UNREAD_NOTIFICATIONS } = require("../controllers/notifications/index.js");

router.get('/user', AUTHENTICATE_TOKEN ,FETCH_UNREAD_NOTIFICATIONS);

module.exports = router;
