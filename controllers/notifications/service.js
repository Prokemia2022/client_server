const { WELCOME_EMAIL_TEMPLATE, SIGN_IN_EMAIL_TEMPLATE, FLAG_ACCOUNT_DELETION_EMAIL_TEMPLATE, ACCOUNT_DELETION_EMAIL_TEMPLATE, PASSWORD_RESET_CODE_EMAIL_TEMPLATE, PASSWORD_CHANGED_EMAIL_TEMPLATE } = require("../../lib/email_templates/auth.email_template");
const { REQUEST_CREATED_EMAIL_TEMPLATE, NOTIFY_CLIENT_REQUEST_STARTED_EMAIL_TEMPLATE, NOTIFY_CLIENT_REQUEST_REJECTED_EMAIL_TEMPLATE, NOTIFY_CLIENT_REQUEST_COMPLETED_EMAIL_TEMPLATE, NOTIFY_SUPPLIER_REQUEST_CREATED_EMAIL_TEMPLATE } = require("../../lib/email_templates/request.email_template");
const { ValidationError } = require("../../lib/error.lib");
const { LOGGER } = require("../../lib/logger.lib");
const Transporter = require("../../middleware/transporter.middleware");
const { ADMIN_MODEL } = require("../../models/ACCOUNT.model");
const { USER_BASE_MODEL } = require("../../models/USER.model");
const { NOTIFICATION_MODEL } = require("../../models/UTIL.model");

class NOTIFICATION_SERVICE{
	constructor() {
        this.NOTIFICATION_TYPES = {
            EMAIL: 'email',
            SMS: 'sms',
            FCM: 'fcm',
			INAPP: 'inapp',
        };

        this.ADMIN_ROLES = {
            SALES: 'sales',
            SUPERVISOR: 'supervisor',
            MANAGER: 'manager',
			DEVELOPER: 'developer',
			OPERATIONS: 'operations',
			SECURITY: 'security'
        };
    }

	async ADMIN_NOTIFICATIONS_HANDLER({ roles, notificationTypes, payload, moduleType, priority = 2 }) {
        try {
            // Check if all notification types are valid
            const invalidTypes = notificationTypes?.filter(
                type => !Object.values(this.NOTIFICATION_TYPES).includes(type)
            );
            if (invalidTypes.length) {
                throw new Error(`Invalid notification types: ${invalidTypes.join(', ')}`);
            }

            // Get admin users based on roles
            const adminUserIds = await this.GET_ADMIN_BY_ROLES_FOR_NOTIFICATIONS(roles);
            
            if (!adminUserIds.length) {
                throw new Error('No admin users found for the specified roles');
            };

			for (const type of notificationTypes) {
                const notification = new NOTIFICATION_MODEL({
                    userId: adminUserIds,
                    toAdmin: true,
                    notificationType: type,
					moduleType,
                    payload,
                    priority,
                    status: {
                        sent: false,
                        read: false,
                        status: 'pending'
                    }
                });

                await notification.save();
            };
			return ;
        } catch (error) {
            console.error('Error sending admin notification:', error);
            throw error;
        }
    }

	// Helper method to get admin users by roles
    async GET_ADMIN_BY_ROLES_FOR_NOTIFICATIONS(roles) {
		try {
			// return await ADMIN_MODEL.find({ role: { $in: roles }})
			return await USER_BASE_MODEL.find({ account_type: 'admin'})
		} catch (error) {
			throw new Error('getAdminUsersByRoles method needs to be implemented');
		}
    }

	/**
     * Send notification to specific users
     * @param {Object} params Notification parameters
     * @param {string[]} params.userIds Array of user IDs to notify
     * @param {string} params.notificationType Type of notification (email/sms/fcm)
     * @param {Object} params.payload Notification data
     * @param {number} params.priority Priority level (0-5)
     * @returns {Promise<Object>} Created notification object
     */
    async USER_NOTIFICATIONS_HANDLER({ userIds, notificationTypes, payload, moduleType, priority = 2 }) {
        try {
            // Check if all notification types are valid
            const invalidTypes = notificationTypes.filter(
                type => !Object.values(this.NOTIFICATION_TYPES).includes(type)
            );
            if (invalidTypes.length) {
                throw new Error(`Invalid notification types: ${invalidTypes.join(', ')}`);
            }

            // Validate user IDs
            if (!userIds || !userIds.length) {
                throw new Error('No user IDs provided');
            };

			for (const type of notificationTypes) {
                const notification = new NOTIFICATION_MODEL({
                    userId: userIds,
                    toAdmin: false,
                    notificationType: type,
					moduleType,
                    payload,
                    priority,
                    status: {
                        sent: false,
                        read: false,
                        status: 'pending'
                    }
                });

                await notification.save();
            };
			return ;
        } catch (error) {
			LOGGER.log('info',`
				Function: [NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER],
				title: 	Failed,
				ID: -,
				module: ${moduleType},
				message:${error},
			`);
            console.error('Error sending user notification:', error);
            throw error;
        }
    }

    async HANDLE_EMAIL_NOTIFICATIONS(notification) {
		let _TEMPLATE;
		let SENDER_EMAIL = process.env.SENDER_EMAIL;
		
		switch (notification?.moduleType){
			case 'user.created':
				_TEMPLATE = WELCOME_EMAIL_TEMPLATE(notification?.payload);
				break;
			case 'user.signedin':
				_TEMPLATE = SIGN_IN_EMAIL_TEMPLATE(notification?.payload);
				break;
			case 'flag.user.account':
				_TEMPLATE = FLAG_ACCOUNT_DELETION_EMAIL_TEMPLATE(notification?.payload);
				break;
			case 'user.deleted.account':
				_TEMPLATE = ACCOUNT_DELETION_EMAIL_TEMPLATE(notification?.payload);
				break;
			case 'password.code.request':
				_TEMPLATE = PASSWORD_RESET_CODE_EMAIL_TEMPLATE(notification?.payload);
				break;
			case 'password.change.success':
				_TEMPLATE = PASSWORD_CHANGED_EMAIL_TEMPLATE(notification?.payload);
				break;
			case 'request.created':
				_TEMPLATE = REQUEST_CREATED_EMAIL_TEMPLATE(notification?.payload?.body);
				break;
			case 'request.started':
				_TEMPLATE = NOTIFY_CLIENT_REQUEST_STARTED_EMAIL_TEMPLATE(notification?.payload?.body);
				break;
			case 'request.rejected':
				_TEMPLATE = NOTIFY_CLIENT_REQUEST_REJECTED_EMAIL_TEMPLATE(notification?.payload?.body);
				break;
			case 'request.completed':
				_TEMPLATE = NOTIFY_CLIENT_REQUEST_COMPLETED_EMAIL_TEMPLATE(notification?.payload?.body);
				break;
			case 'supplier.request.created':
				_TEMPLATE = NOTIFY_SUPPLIER_REQUEST_CREATED_EMAIL_TEMPLATE(notification?.payload?.body);
				break;
			default:
				throw new ValidationError(`Invalid email type`);
		};
		try{
			const MAIL_OPTIONS = {
				from:		SENDER_EMAIL, // sender address
				to:			notification?.payload?.email, // list of receivers
				subject:	notification?.payload?.subject, // Subject line
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
};

module.exports = new NOTIFICATION_SERVICE();