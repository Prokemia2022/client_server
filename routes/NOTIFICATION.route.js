const express = require("express");
const router = express.Router();

const { AUTHENTICATE_TOKEN } = require("../middleware/token.verifier.middleware.js");
const { FETCH_UNREAD_NOTIFICATIONS, MARK_NOTIFICATION_AS_READ } = require("../controllers/notifications/index.js");

router.get('/user', AUTHENTICATE_TOKEN ,FETCH_UNREAD_NOTIFICATIONS);
router.post('/mark_read', AUTHENTICATE_TOKEN ,MARK_NOTIFICATION_AS_READ);

module.exports = router;
