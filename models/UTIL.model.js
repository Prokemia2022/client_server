const mongoose = require("mongoose");

// Define the Notification Schema
const NOTIFICATION_SCHEMA_MODEL = new mongoose.Schema({
	userId:				{ type: mongoose.Schema.Types.ObjectId, required: true },
	toAdmin:			{ type: Boolean },
	notificationType:	{ type: String, required: true }, // 'websocket', 'push', 'email'
	payload:			{ type: Object, required: true }, // Actual notification data
	status:				{ sent: Boolean, read: Boolean, status: String }, //
	retryCount:			{ type: Number, default: 0 },
	priority:			{ type: Number, default: 0}, // priority: 0: , 1: , 2: , 3: , 4: , 5: 
	createdAt:			{ type: Date, default: Date.now },
	lastAttemptAt:		{ type: Date, default: null }, 
},{ timestamps: true });

const NOTIFICATION_MODEL = mongoose.model('NOTIFICATION', NOTIFICATION_SCHEMA_MODEL);

module.exports = {
	NOTIFICATION_MODEL
}
/**
| Priority | Description                            | Examples                                                                           | Action                                                                                           |
|----------|----------------------------------------|------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------|
| **5**    | **Critical**                           | Account security breaches, system outages, compliance/legal issues                 | Immediate action required, ensure retries and high delivery reliability.                         |
| **4**    | **High-Priority**                      | Payment reminders, account deletion warnings, important updates to services        | Send quickly, retry if fails, urgent but not critical.                                           |
| **3**    | **Medium-Priority**                    | Payment confirmations, account updates, shipping notifications                     | Moderate urgency, can be delayed slightly if necessary, but should be processed reliably.        |
| **2**    | **Low-Priority**                       | Promotional offers, newsletters, routine updates                                   | Low urgency, can be delayed or batched during high system load.                                  |
| **1**    | **Very Low-Priority**                  | Recommendations, survey invites, social activity updates                           | Non-urgent, can be delayed significantly, should not block more important notifications.         |
| **0**    | **Optional (Debug/Testing)**           | Internal logs, debugging messages, trivial updates                                 | Can be deprioritized or discarded if system resources are limited.                               |

 */
