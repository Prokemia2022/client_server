const { NOTIFICATION_MODEL } =  require('../../models/UTIL.model.js');
const { LOGGER } = require("../../lib/logger.lib.js");
const cron = require('node-cron');

const { HANDLE_EMAIL_NOTIFICATIONS } = require('./index.js')
const MAX_RETRY_COUNT = 5;
const RETRY_DELAY = 3000; // Delay between retries in milliseconds

const PROCEESS_NOTIFICATION_QUEUE = async () => {
	//LOGGER.log('info',`[PROCEESS_NOTIFICATION_QUEUE]: Notification Worker`);
	// Find pending notifications
	const PENDING_NOTIFICATIONS = await NOTIFICATION_MODEL.find({ "status.sent": false ,"status.status": "pending"});
	//LOGGER.log('info',`[PROCEESS_NOTIFICATION_QUEUE]: Notifications: ${PENDING_NOTIFICATIONS}`);
	for (const notification of PENDING_NOTIFICATIONS){
		try{
			switch (notification.notificationType){
				case 'fcm':
					//await SEND_FCM_NOTIFICATION(notification)
					break;
				case 'email':
					//await HANDLE_EMAIL_NOTIFICATIONS(notification)
					break;
				case 'sms':
					break;
				default:
					break
			}
			notification.status.sent = true;
			notification.status.status = 'success';
			
			LOGGER.log('info',`[PROCEESS_NOTIFICATION_QUEUE]: Notification Success`);
			
			await notification.save();
			return;
		}catch(error){
			LOGGER.log('error',`ERROR[PROCEESS_NOTIFICATION_QUEUE]:${error}`);
			// If sending fails, increment the retry count
			notification.retryCount += 1;
			notification.lastAttemptAt = new Date();

			// Mark as failed if retry count exceeds max retries
			if (notification.retryCount >= MAX_RETRY_COUNT) {
				notification.status.status = 'failed';
			}

			await notification.save();
			return;
		}
	}
};

// Run the worker periodically (e.g., every few minute)
cron.schedule('*/10 * * * * *', async() => {
	await PROCEESS_NOTIFICATION_QUEUE()
});

