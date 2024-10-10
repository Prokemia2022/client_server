/**
 *	This Controller Handles a user's account
 *	1.	Delete User Account and details
 *	2.	Update User Password
 *	3.  Update User Account Status
 *	4.	Verify User Account (Validates Users's email);
 *
 * */
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require('../../models/USER.model');
const { CLIENT_MODEL, SUPPLIER_MODEL, SALESPERSON_MODEL, CONSULTANT_MODEL } = require('../../models/ACCOUNT.model.js');
const { LOGGER } = require('../../lib/logger.lib.js');
const { PUBLISH_MESSAGE_TO_BROKER } = require('../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js');
// Verify Account

// Update Password

//	Update Account Status

// Delete User Account and notify user
const HANDLE_USER_ACCOUNT_DELETION=(async(req,res)=>{
	// Get User ID & Payload
	const UID = req.query.user_id;
	const payload = req.body;
	// Verify User Exist
	const USER_QUERY = { _id: UID};
	try{
		const EXISTING_USER = await USER_BASE_MODEL.findOne(USER_QUERY).populate('account_status_model_ref').exec();
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'An account with this id does not exist'
			});
		};

		if (EXISTING_USER?.account_status_model_ref?.deletion?.status){
			return res.status(200).json({
				error:		true,
				message:	'This account has already been flagged for deletion',
				date:		EXISTING_USER?.account_status_model_ref?.deletion?.date
			});
		};
		
		// Flag account for deletion
		const now = new Date();
		const next30Days = now.getTime() + 30 * 24 * 60 * 60 * 1000;
		const next30DaysTimestamp = new Date(next30Days).getTime();

		const DOCUMENT_UPDATE_ITEM = {$set: {
			"deletion.status" :	true,
			"deletion.reason" :	payload?.reason,
			"deletion.date" :	next30DaysTimestamp
		}};
		const DOCUMENT_UPDATE_QUERY = { user_model_ref: UID };
		
		await ACCOUNT_STATUS_MODEL.updateOne(DOCUMENT_UPDATE_QUERY,DOCUMENT_UPDATE_ITEM);
		
		// Send Notification Email to User
		const EMAIL_PAYLOAD = {
			name:	EXISTING_USER?.first_name,
			type:	'user.deleted.flag',
			email:	EXISTING_USER?.email,
			sentAt:	new Date(Date.now())
		};

		PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');
		
		LOGGER.log('info',`user: ${UID} requested deletion of account`);
		return res.status(200).json({
			error:		false,
			message:	'Your account has been flagged for deletion',
		});
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion request of User Account: ${UID}`,err)
		return res.status(500).json({
			error:	true,
			message:'Failed to Delete your Account. Try again later.'
		});
	};
});

const HANDLE_USER_ACCOUNT_DELETION_CRON_FUNCTION = (async(req, res)=>{
	// GET USER ID
	const UID = req.query.user_id;
	// VERIFY USER requested deletion
	// User exists
	// Items associated with the user i.e products, account-status, billings, industry, samples, quotes, documents
	//
	const USER_QUERY = { _id: UID};
	const USER_ITEM_QUERY = { user_model_ref: UID };

	try{
	// Check if user account exists
		const EXISTING_USER = await USER_BASE_MODEL.findOne(USER_QUERY).populate('account_status_model_ref').exec();
		
		if (!EXISTING_USER){
			return res.status(200).json({
				error:	true,
				message: 'An account with this id does not exist'
			})
		};

		if (!EXISTING_USER?.account_status_model_ref?.deletion?.status){
			return res.status(200).json({
				error:		true,
				message:	'This account is not flagged for deletion',
			});
		};

		// Get type of account of user
		const account_type = EXISTING_USER?.account_type;
		// 1. client			
		// 2. supplier
		// 3. salesperson
		// 4. consultant
		// 5. account_status
		// 6. subscriptions
		// 7. billings
		// 8. products
		// 9. documents & images
		// 10.salespeople
		switch (account_type){
			case 'client':
				await DELETE_CLIENT_ITEM(UID);
				await DELETE_ACCOUNT_STATUS_ITEM(UID);
				await DELETE_USER_MODEL_ITEM(UID);

				LOGGER.log('info',`USER:${UID} account deleted`);
				break;
			case 'supplier':
				await DELETE_SUPPLIER_ITEM(UID);
				// delete all Products
				// delete all Consultants
				await DELETE_ACCOUNT_STATUS_ITEM(UID);
				await DELETE_USER_MODEL_ITEM(UID);
				break;
			case 'salesperson':
				await DELETE_SALESPERSON_ITEM(UID);
				await DELETE_ACCOUNT_STATUS_ITEM(UID);
				await DELETE_USER_MODEL_ITEM(UID);
				break;
			case 'consultant':
				await DELETE_CONSULTANT_ITEM(UID);
				await DELETE_ACCOUNT_STATUS_ITEM(UID);
				await DELETE_USER_MODEL_ITEM(UID);
				break;
			default:
				throw new Error('Could not find the type of account')
		};

		// Send Notification Email to User
		const EMAIL_PAYLOAD = {
			name:	EXISTING_USER?.first_name,
			type:	'user.deleted.flag',
			email:	EXISTING_USER?.email,
			sentAt:	new Date(Date.now())
		};
		PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');

		return res.status(200).json({
			error: false,
			message: 'Account deleted successfully.',
		})
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion of User Account: ${UID}`,err);
		return res.status(500).json({
			error:	true,
			message:'Failed to Delete your Account. Try again later.'
		});

	}
});

const DELETE_CLIENT_ITEM = async(UID)=>{
	try{
		await CLIENT_MODEL.findOneAndDelete({user_model_ref:UID});
		LOGGER.log('info',`USER:${UID} client item deleted`);
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion of Client item: ${UID}`,err);
		throw new Error(`Error While Handling Deletion of Client item`);
	}
};

const DELETE_SUPPLIER_ITEM = async(UID)=>{
	try{
		await SUPPLIER_MODEL.findOneAndDelete({user_model_ref:UID});
		LOGGER.log('info',`USER:${UID} supplier item deleted`);
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion of Supplier item: ${UID}`,err);
		throw new Error(`Error While Handling Deletion of Supplier item`);
	}
};

const DELETE_SALESPERSON_ITEM = async(UID)=>{
	try{
		await SALESPERSON_MODEL.findOneAndDelete({user_model_ref:UID});
		LOGGER.log('info',`USER:${UID} salesperson item deleted`);
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion of salesperson item: ${UID}`,err);
		throw new Error(`Error While Handling Deletion of salesperson item`);
	}
};

const DELETE_CONSULTANT_ITEM = async(UID)=>{
	try{
		await CONSULTANT_MODEL.findOneAndDelete({user_model_ref:UID});
		LOGGER.log('info',`USER:${UID} consultant item deleted`);
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion of consultant item: ${UID}`,err);
		throw new Error(`Error While Handling Deletion of consultant item`);
	}
};


const DELETE_ACCOUNT_STATUS_ITEM = async(UID)=>{
	try{
		await ACCOUNT_STATUS_MODEL.findOneAndDelete({user_model_ref:UID});
		LOGGER.log('info',`USER:${UID} account status deleted`);
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion of account status item: ${UID}`,err);
	}
};

const DELETE_USER_MODEL_ITEM = async(UID)=>{
	try{
		await USER_BASE_MODEL.findOneAndDelete({user_model_ref:UID});
	}catch(err){
		LOGGER.log('error',`Error While Handling Deletion of user model item: ${UID}`,err);
	}
};



module.exports = {
	HANDLE_USER_ACCOUNT_DELETION,
	HANDLE_USER_ACCOUNT_DELETION_CRON_FUNCTION
}
