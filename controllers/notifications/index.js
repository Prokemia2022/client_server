/****************************MODELS**************************************/
const { NOTIFICATION_MODEL } = require("../../models/UTIL.model.js")
/****************************LIB*****************************************/
const { LOGGER } = require('../../lib/logger.lib.js');
const { ValidationError } = require('../../lib/error.lib.js');
/****************************EMAIL TEMPLATES*****************************/
const Transporter = require('../../middleware/transporter.middleware.js');
const { 
	WELCOME_EMAIL_TEMPLATE,
	SIGN_IN_EMAIL_TEMPLATE,
	FLAG_ACCOUNT_DELETION_EMAIL_TEMPLATE,
	ACCOUNT_DELETION_EMAIL_TEMPLATE,
	PASSWORD_RESET_CODE_EMAIL_TEMPLATE,
	PASSWORD_CHANGED_EMAIL_TEMPLATE
} = require('../../lib/email_templates/auth.email_template.js');

const QUEUE_NOTIFICATION=async(userId, toAdmin, notificationType, payload)=>{
	try{
		await NOTIFICATION_MODEL.create({
			userId: userId,
			toAdmin: toAdmin,
			notificationType: notificationType,
			payload: payload,
			status: { sent: false, read: false, status: 'pending'},
			retryCount: 0,
			createdAt: new Date()
		});
		
		LOGGER.log('info',`SUCCESS[QUEUE_NOTIFICATION]`);
		return
	}catch(error){
		throw new Error("Could not queue this notification.")
	}
};
// Function to save a new notification
async function SAVE_NOTIFICATION(notification) {
	try{
		const saved_notification = await NOTIFICATION_MODEL.create({
			users:		notification?.users,
			mode:		notification?.mode,
			type:		notification?.type,
			data:		{
						subject: notification?.subject, message: notification?.message, data: notification?.data
			},
			status:		{
				read: false, 
				sent: false
			},
			retry:		0,
		});
		LOGGER.log('info',`SUCCESS[SAVE_NOTIFICATION]`);
		return
	}catch(error){
		LOGGER.log('error',`ERROR[SAVE_NOTIFICATION]:${error}`);
		throw new Error('This notification could not be saved')
	}
};

// Function to get unread notifications for a user
async function FETCH_UNREAD_NOTIFICATIONS(users) {
	try{
		return await NOTIFICATION_MODEL.find({ users: { $in: users }, $or: [{"status.read": false},{"status.sent": false}]}).sort({ createdAt: -1 });
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH_UNREAD_NOTIFICATIONS_NOTIFICATION]:${error}`);
		throw new Error('The users notifications could not be retrieved')
	}
}

// Function to mark notifications as read
async function markNotificationsAsRead(notificationIds) {
	try{
		await NOTIFICATION_MODEL.updateMany(
			{ _id: { $in: notificationIds } },
			{ $set: { "status.read": true } }
		);
	}catch(error){
		LOGGER.log('error',`ERROR[markNotificationsAsRead]:${error}`);
		throw new Error('The users notifications could not be marked as read')
	}
};

async function HANDLE_EMAIL_NOTIFICATIONS(payload){
	let _TEMPLATE;
	let SENDER_EMAIL = process.env.SENDER_EMAIL;
	
	switch (payload?.payload?.type){
		case 'user.created':
			_TEMPLATE = WELCOME_EMAIL_TEMPLATE(payload?.payload);
			break;
		case 'flag.user.account':
			_TEMPLATE = FLAG_ACCOUNT_DELETION_EMAIL_TEMPLATE(payload?.payload);
			break;
		case 'user.deleted.account':
			_TEMPLATE = ACCOUNT_DELETION_EMAIL_TEMPLATE(payload?.payload);
			break;
		case 'password.code.request':
			_TEMPLATE = PASSWORD_RESET_CODE_EMAIL_TEMPLATE(payload?.payload);
			break;
		case 'password.change.success':
			_TEMPLATE = PASSWORD_CHANGED_EMAIL_TEMPLATE(payload?.payload);
			break;
		default:
			throw new ValidationError(`Invalid email type`);
	};
	try{
		const MAIL_OPTIONS = {
			from:		SENDER_EMAIL, // sender address
			to:			payload?.payload?.email, // list of receivers
			subject:	payload?.payload?.subject, // Subject line
			text:		'', // plain text body
			html:		_TEMPLATE, // html body
		};

		Transporter.sendMail(MAIL_OPTIONS, function (error, info){
			if(error){
				LOGGER.log('error',`ERROR[HANDLE_EMAIL_NOTIFICATIONS]:${error}`);
				throw new Error('Error while sending email')
			}
			return
		})
	}catch(error){
		LOGGER.log('error',`ERROR[HANDLE_EMAIL_NOTIFICATIONS]:${error}`);
	}
}

module.exports = {
	SAVE_NOTIFICATION,
	FETCH_UNREAD_NOTIFICATIONS,
	markNotificationsAsRead,
	QUEUE_NOTIFICATION,
	HANDLE_EMAIL_NOTIFICATIONS
};
