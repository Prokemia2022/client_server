/****************************UTILS***************************************/
const mongoose = require('mongoose');
/****************************MIDDLEWARES*********************************/
const { QUEUE_NOTIFICATION } = require('../notifications/index.js');
/****************************MODELS**************************************/
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../../models/USER.model.js");
const { 
	DOCUMENT_MODEL, 
	PRODUCT_MODEL, 
	REQUEST_MODEL, 
	MARKET_MODEL 
} = require("../../models/PRODUCT.model.js");
const { SUPPLIER_MODEL, CLIENT_MODEL } = require("../../models/ACCOUNT.model.js");
/****************************CONFIGS*************************************/
/****************************LIB*****************************************/
const { LOGGER } = require('../../lib/logger.lib.js');
const { ValidationError } = require('../../lib/error.lib.js');
const cron = require('node-cron');
/****************************CONSTANTS*********************************/
/****************************HELPER FUNCTIONS**************************/

const HANDLE_GET_NEXT_30_DAYS=()=>{
	const now = new Date();
	const next30Days = now.getTime() + 30 * 24 * 60 * 60 * 1000;
	const next30DaysTimestamp = new Date(next30Days).getTime();
	return next30DaysTimestamp
}

const HANDLE_FLAG_NOTIFICATIONS = async (user) => {
    const userId = user?._id;
	const toAdmin = false;
	const notificationType = 'email';

    const emailPayload = {
        type: 'flag.user.account',
		subject: "Your account has been flagged for deletion",
        name:	user?.first_name,
        email:	user?.email,
        _id:	user?._id
    };
    
    // Uncomment when message broker is ready
    await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,emailPayload);
};
const HANDLE_DELETION_NOTIFICATIONS = async (user) => {
    const userId = user?._id;
	const toAdmin = false;
	const notificationType = 'email';

    const emailPayload = {
        type: 'user.deleted.account',
		subject: "We are sad to see you leave!",
        name:	user?.first_name,
        email:	user?.email,
        _id:	user?._id
    };
    
    // Uncomment when message broker is ready
    await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,emailPayload);
};

/****************************FUNCTIONS***********************************/

const HANDLE_FLAG_ACCOUNT_DELETION=(async(req,res)=>{
	const ACCOUNT_ID = req.query.account_id;
	const payload = req.body;
	try{
		if (!ACCOUNT_ID){
			throw new ValidationError('Missing parameter requirements')
		}
		const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne({_id: ACCOUNT_ID},{first_name: 1,email: 1});
		// Account Flagging
		await ACCOUNT_STATUS_MODEL.updateOne(
			{ user_model_ref: ACCOUNT_ID },
			{ $set: {
				"deletion.status" :	true,
				"deletion.reason" :	payload?.reason,
				"deletion.date" :	new Date() || HANDLE_GET_NEXT_30_DAYS()
			}}
		);
		// Notifications
		await HANDLE_FLAG_NOTIFICATIONS(EXISTING_ACCOUNT);
		// Logging
		LOGGER.log('info',`SUCCESS[HANDLE_FLAG_ACCOUNT_DELETION]`);

		return res.status(200).json({
			error:		false,
			message:	`Your account has been flagged for deletion and will be deleted in the next 30 days`,
		});
	}catch(error){
		LOGGER.log('error',`ERROR[HANDLE_FLAG_ACCOUNT_DELETION]:${error}`);
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
		return res.status(500).json({
            error: true,
            message: 'We could not delete your account at this time.'
        });
	}	
});

const HANDLE_ACCOUNT_DELETION=(async(req,res)=>{	
	const ACCOUNT_ID = req.query.account_id;
	const ACCOUNT_TYPE = req.query?.account_type;
	try{
		if (!ACCOUNT_ID){
			throw new ValidationError('Missing parameter requirements')
		}
		switch (ACCOUNT_TYPE){
			case 'client':
				await DELETE_CLIENT_MODELS(ACCOUNT_ID);
				break;
			case 'supplier':
				const EXISTING_SUPPLIER_ACCOUNT = await SUPPLIER_MODEL.findOne({user_model_ref: ACCOUNT_ID},{products: 1, documents: 1})
				
				await DELETE_SUPPLIER_MODELS(ACCOUNT_ID,EXISTING_SUPPLIER_ACCOUNT?.products,EXISTING_SUPPLIER_ACCOUNT?.documents);
				break;
			default:
				throw new ValidationError('Missing parameter requirements')
		};
		await HANDLE_DELETION_NOTIFICATIONS(EXISTING_ACCOUNT);
		LOGGER.log('info',`SUCCESS[HANDLE_ACCOUNT_DELETION]`)
		
		return res.status(200).json({
			error:		false,
			message:	'Your account has been deleted',
		});
	}catch(error){
		LOGGER.log('error',`ERROR[HANDLE_ACCOUNT_DELETION]: ${error}`)
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
		return res.status(500).json({
			error:	true,
			message:'Your account could not be deleted. Try again later.'
		});
	};
});



const DELETE_CLIENT_MODELS=async(ACCOUNT_ID)=>{
	try{
		await REQUEST_MODEL.updateMany({requestor_model_ref: ACCOUNT_ID},{
			$set: {
				"status.status":	false,
				"status.comment":	'Request is inactive as the client account deleted their account'
			}
		})
		await CLIENT_MODEL.deleteOne({user_model_ref: ACCOUNT_ID})
		await ACCOUNT_STATUS_MODEL.deleteOne({user_model_ref: ACCOUNT_ID})	
		await USER_BASE_MODEL.deleteOne({_id: ACCOUNT_ID})
	}catch(error){
		throw new ValidationError('We could not delete your account data');
	}
};

const DELETE_SUPPLIER_MODELS=async(ACCOUNT_ID,products,documents)=>{
	try{
		await REQUEST_MODEL.updateMany({supplier_model_ref: ACCOUNT_ID},{
			$set: {
				"status.status":	false,
				"status.comment":	'Request is inactive as the supplier account deleted their account'
			} 
		});
		await PRODUCT_MODEL.deleteMany({lister: ACCOUNT_ID});
		await DOCUMENT_MODEL.deleteMany({user_model_ref: ACCOUNT_ID});
		await MARKET_MODEL.updateMany({},{ $pull: { 
			products:	{ $in:	products }, 
			documents:	{ $in:	documents } 
		}});	
		await SUPPLIER_MODEL.deleteOne({user_model_ref: ACCOUNT_ID});
		await ACCOUNT_STATUS_MODEL.deleteOne({user_model_ref: ACCOUNT_ID})	
		await USER_BASE_MODEL.deleteOne({_id: ACCOUNT_ID})
	}catch(error){
		throw new ValidationError('We could not delete your account data');
	}
};

const CRON_HANDLE_ACCOUNT_DELETION=async()=>{
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0); // Set to the start of today

	const endOfToday = new Date();
	endOfToday.setHours(23, 59, 59, 999); // Set to the end of today
	
	const ACCOUNTS_TO_BE_DELETED = await ACCOUNT_STATUS_MODEL.find({
		"deletion.date":	{
			$gte: startOfToday,
			$lt: endOfToday
		}
	}).populate({path:'user_model_ref',select:'account_type'}).exec();

	for (const account of ACCOUNTS_TO_BE_DELETED){
		const ACCOUNT_ID = account?.user_model_ref?._id;
		const ACCOUNT_TYPE = account?.user_model_ref?.account_type;
		switch (ACCOUNT_TYPE){
			case 'client':
				await DELETE_CLIENT_MODELS(ACCOUNT_ID);
				break;
			case 'supplier':
				const EXISTING_SUPPLIER_ACCOUNT = await SUPPLIER_MODEL.findOne({user_model_ref: ACCOUNT_ID},{products: 1, documents: 1})
				
				await DELETE_SUPPLIER_MODELS(ACCOUNT_ID,EXISTING_SUPPLIER_ACCOUNT?.products,EXISTING_SUPPLIER_ACCOUNT?.documents);
				break;
			default:
				throw new ValidationError('Missing parameter requirements')
		}
	};
}


// Run the worker periodically (e.g., every once a day)
cron.schedule('30 10 * * * *', async() => {
	await CRON_HANDLE_ACCOUNT_DELETION()
});

module.exports = {
	HANDLE_FLAG_ACCOUNT_DELETION,
	HANDLE_ACCOUNT_DELETION,
	CRON_HANDLE_ACCOUNT_DELETION,
	/********************HELPER FUNCTIONS********************/
	HANDLE_GET_NEXT_30_DAYS,
}
