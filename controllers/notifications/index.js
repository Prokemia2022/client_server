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
	PASSWORD_CHANGED_EMAIL_TEMPLATE,
} = require('../../lib/email_templates/auth.email_template.js');
const messaging = require("../../lib/firebaseConfig.js");
const { 
	REQUEST_CREATED_EMAIL_TEMPLATE, 
	NOTIFY_SUPPLIER_REQUEST_CREATED_EMAIL_TEMPLATE, 
	NOTIFY_CLIENT_REQUEST_STARTED_EMAIL_TEMPLATE, 
	NOTIFY_CLIENT_REQUEST_COMPLETED_EMAIL_TEMPLATE, 
	NOTIFY_CLIENT_REQUEST_REJECTED_EMAIL_TEMPLATE 
} = require("../../lib/email_templates/request.email_template.js");
const { ADMIN_MODEL } = require("../../models/ACCOUNT.model.js");
const { USER_BASE_MODEL } = require("../../models/USER.model.js");

const QUEUE_NOTIFICATION=async(userId, toAdmin, notificationType, payload)=>{
	try{
		await NOTIFICATION_MODEL.create({
			userId: userId,
			toAdmin: toAdmin,
			notificationType: notificationType,
			payload: payload,
			priority: payload?.priority,
			status: { sent: false, read: false, status: 'pending'},
			retryCount: 0,
			createdAt: new Date()
		}); 
		LOGGER.log('info',`
			Function: [QUEUE_NOTIFICATION],
			title: Saved,
			module: ${payload?.title},
		`);
		return
	}catch(error){
		LOGGER.log('info',`
			Function: [QUEUE_NOTIFICATION],
			title: 	Failed,
			ID: -,
			module: ${payload?.title},
			message:${error},
		`);
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
async function FETCH_UNREAD_NOTIFICATIONS(req, res, next) {
	try{
		const userId = req.query?.account_id;
		if(!userId){
            throw new ValidationError('User ID not found')
        };
		const query = {
			userId: { $in: userId }, 
			notificationType: 'inapp',
			"status.read": false,
			"status.status": "pending",
		};
		const EXISTING_NOTIFICATIONS = await NOTIFICATION_MODEL.find(query).sort({createdAt: -1});
		const EXISTING_NOTIFICATIONS_COUNT = EXISTING_NOTIFICATIONS?.length;
		return res.status(200).send({
			error: false,
			message: 'success',
			data:	EXISTING_NOTIFICATIONS,
			count:	EXISTING_NOTIFICATIONS_COUNT
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH_UNREAD_NOTIFICATIONS_NOTIFICATION]:${error}`);
		//throw new Error('The users notifications could not be retrieved')
		return res.status(500).send({
			error: true,
			message: 'failed to fetch notifications',
		});
	}
};

// Function to mark notifications as read
async function MARK_NOTIFICATION_AS_READ(req,res) {
	try {
		const notificationIds = req.body?.notificationIds;
		console.log(notificationIds)
		await NOTIFICATION_MODEL.updateOne(
		  { _id: notificationIds },
		  { $set: { "status.read": true } }
		);
		return res.status(200).send({
			error: false,
            message: 'notifications marked as read'
		});
	} catch (error) {
		LOGGER.log('error',`ERROR[MARK_NOTIFICATION_AS_READ]:${error}`);
		return res.sendStatus(500);
	}
  }

async function HANDLE_EMAIL_NOTIFICATIONS(payload){
	let _TEMPLATE;
	let SENDER_EMAIL = process.env.SENDER_EMAIL;
	
	switch (payload?.payload?.type){
		case 'user.created':
			_TEMPLATE = WELCOME_EMAIL_TEMPLATE(payload?.payload);
			break;
		case 'user.signedin':
			_TEMPLATE = SIGN_IN_EMAIL_TEMPLATE(payload?.payload);
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
		case 'request.created':
			_TEMPLATE = REQUEST_CREATED_EMAIL_TEMPLATE(payload?.payload?.body);
			break;
		case 'request.started':
			_TEMPLATE = NOTIFY_CLIENT_REQUEST_STARTED_EMAIL_TEMPLATE(payload?.payload?.body);
			break;
		case 'request.rejected':
			_TEMPLATE = NOTIFY_CLIENT_REQUEST_REJECTED_EMAIL_TEMPLATE(payload?.payload?.body);
			break;
		case 'request.completed':
			_TEMPLATE = NOTIFY_CLIENT_REQUEST_COMPLETED_EMAIL_TEMPLATE(payload?.payload?.body);
			break;
		case 'supplier.request.created':
			_TEMPLATE = NOTIFY_SUPPLIER_REQUEST_CREATED_EMAIL_TEMPLATE(payload?.payload?.body);
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

async function SEND_FCM_NOTIFICATION(notification) {
    try {
        // Get user accounts and validate
        const EXISTING_ACCOUNTS = await USER_BASE_MODEL.find({
            _id: { $in: notification?.userId },
            fcm_token: { $exists: true, $ne: null } // Only get users with valid tokens
        });

        if (!EXISTING_ACCOUNTS.length) {
            LOGGER.log('warn', 'No valid users found for FCM notification');
            return {
                success: false,
                message: 'No valid users found with FCM tokens'
            };
        }

        // Filter out null/undefined tokens and get unique tokens
        const tokens = [...new Set(
            EXISTING_ACCOUNTS
                .map(user => user?.fcm_token)
                .filter(token => token)
        )];

        if (!tokens.length) {
            LOGGER.log('warn', 'No valid FCM tokens found');
            return {
                success: false,
                message: 'No valid FCM tokens available'
            };
        }

        LOGGER.log('info', `Sending FCM to ${tokens.length} devices`);

        // Create messages array for each token
        const messages = tokens.map(token => ({
            token,  // Individual token for each message
            notification: {
                title: notification?.payload?.subject,
                body: notification?.payload?.body,
            },
            webpush: {
                fcmOptions: {
                    link: `${process.env.BASE_NOTIFICATION_URL}${notification?.payload?.actionUrl}`,
                },
                notification: {
                    click_action: `${process.env.BASE_NOTIFICATION_URL}${notification?.payload?.actionUrl}`,
                }
            },
            data: {
                notificationId: notification._id.toString(),
                moduleType: notification?.moduleType || '',
                timestamp: new Date().toISOString(),
                ...(notification?.payload?.data || {})
            }
        }));

        // Send messages
        const response = await messaging.sendEach(messages);

        // Handle partial failures and invalid tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push({
                        token: tokens[idx],
                        error: resp.error
                    });

                    LOGGER.log('error', `FCM failure for token: ${tokens[idx]}`, resp.error);
                }
            });

            // Handle invalid tokens
            if (failedTokens.length > 0) {
                await handleFailedTokens(failedTokens);
            }
        }

        LOGGER.log('info', 'SUCCESS[SEND_FCM_NOTIFICATION]:', {
            successCount: response.successCount,
            failureCount: response.failureCount
        });

        return {
            success: true,
            successCount: response.successCount,
            failureCount: response.failureCount
        };

    } catch (error) {
        // Handle specific FCM errors
        let errorMessage = error.message;
        
        if (error.code === 'messaging/invalid-argument') {
            errorMessage = 'Invalid message format';
        } else if (error.code === 'messaging/registration-token-not-registered') {
            errorMessage = 'One or more FCM tokens are invalid or expired';
        } else if (error.code === 'messaging/quota-exceeded') {
            errorMessage = 'FCM quota exceeded. Please try again later';
        } else if (error.code === 'messaging/sender-id-mismatch') {
            errorMessage = 'FCM sender ID mismatch';
        }

        LOGGER.log('error', `ERROR[SEND_FCM_NOTIFICATION]: ${errorMessage}`, error);
        throw new Error(errorMessage);
    }
}

async function handleFailedTokens(failedTokens) {
    try {
        const invalidTokens = failedTokens.filter(({ error }) => 
            error.code === 'messaging/invalid-registration-token' ||
            error.code === 'messaging/registration-token-not-registered'
        ).map(({ token }) => token);

        if (invalidTokens.length > 0) {
            // Remove invalid tokens from users
            await USER_BASE_MODEL.updateMany(
                { fcm_token: { $in: invalidTokens } },
                { $unset: { fcm_token: "" } }
            );

            LOGGER.log('info', `Removed ${invalidTokens.length} invalid FCM tokens`);
        }
    } catch (error) {
        LOGGER.log('error', 'Error handling failed tokens:', error);
    }
}



module.exports = {
	SAVE_NOTIFICATION,
	FETCH_UNREAD_NOTIFICATIONS,
	MARK_NOTIFICATION_AS_READ,
	QUEUE_NOTIFICATION,
	HANDLE_EMAIL_NOTIFICATIONS,
	SEND_FCM_NOTIFICATION,
};
