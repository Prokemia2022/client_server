const { NOTIFICATION_MODEL } =  require('../../models/UTIL.model.js');
const { LOGGER } = require("../../lib/logger.lib.js");
const cron = require('node-cron');

const { HANDLE_EMAIL_NOTIFICATIONS, SEND_FCM_NOTIFICATION } = require('./index.js')
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 3000; // Delay between retries in milliseconds

const PROCEESS_NOTIFICATION_QUEUE = async () => {
	//LOGGER.log('info',`[PROCEESS_NOTIFICATION_QUEUE]: Notification Worker`);
	// Find pending notifications
	const PENDING_NOTIFICATIONS = await NOTIFICATION_MODEL.find({
		notificationType: { $ne: "in-app" },
		"status.sent": false,
		"status.status": "pending"
	}).sort({ priority: -1 });
	// LOGGER.log('info',`[PROCEESS_NOTIFICATION_QUEUE]: Notifications: ${PENDING_NOTIFICATIONS}`);
	for (const notification of PENDING_NOTIFICATIONS){
		try{
			switch (notification.notificationType){
				case 'fcm':
					if (process.env.ACTIVATE_FCM_NOTIFICATION_FLAG === 'true'){
						await SEND_FCM_NOTIFICATION(notification)
					}else{
						throw new Error('Notification type not active')
					}
					break;
				case 'email':
					if (process.env.ACTIVATE_EMAIL_NOTIFICATION_FLAG === 'true'){
						await HANDLE_EMAIL_NOTIFICATIONS(notification)
					}else{
						throw new Error('Notification type not active')
					}
					break;
				case 'sms':
					break;
				default:
					throw new Error('Unknown notification type')
			}
			notification.status.sent = true;
			notification.status.status = 'success'; 
			LOGGER.log('info',`
				Function: [PROCEESS_NOTIFICATION_QUEUE],
				title: Success,
				ID: ${notification?._id}, 
				module: notification,
				message: Notification Success,
			`);
			
			await notification.save();
			return;
		}catch(error){
			LOGGER.log('error',`
				Function: [PROCEESS_NOTIFICATION_QUEUE],
				title: Failed,
				ID: ${notification?._id}, 
				module: notification,
				message:${error},
			`);
			// If sending fails, increment the retry count
			notification.retryCount += 1;
			notification.status.sent = false;
			notification.status.status = 'pending';
			notification.lastAttemptAt = new Date();

			// Mark as failed if retry count exceeds max retries
			if (notification.retryCount >= MAX_RETRY_COUNT) {
				notification.status.status = 'failed';
			};
			await notification.save();
			return;
		}
	}
};

// Run the worker periodically (e.g., every few minute)
cron.schedule('*/10 * * * * *', async() => {
	await PROCEESS_NOTIFICATION_QUEUE()
});

