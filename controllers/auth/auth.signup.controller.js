const { LOGGER } = require('../../lib/logger.lib.js');
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require('../../models/USER.model.js');
const { CLIENT_MODEL, SUPPLIER_MODEL, SALESPERSON_MODEL, CONSULTANT_MODEL } = require('../../models/ACCOUNT.model.js');
const Hash_str = require('../../middleware/Hash.middleware.js');
const {AUTH_TOKEN_GENERATOR} = require('../../middleware/token.handler.middleware.js');
const { PUBLISH_MESSAGE_TO_BROKER } = require('../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js');

const NEW_USER_ACCOUNT = (async(req, res)=>{
	/**
	 * NEW_USER_ACCOUNT: Creates a base model for all users, support models i.e account status and creates the respective type of account for the new user
	 * @param: payload (object): The schema has been verified, 
	 * 
	**/
	let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
	const payload = req.body;

	{/**Create and save user model to the db */}
	try{
		// Check if user already exists
		const _QUERY = { email: payload?.email};
        const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne(_QUERY);
		if (EXISTING_ACCOUNT){
            LOGGER.log('info',`${ip} - ${EXISTING_ACCOUNT?.first_name} Account already exists`);
            return res.status(200).send({error:true,message:'Account already exists'});
        };
		const HASHED_PASSWORD = Hash_str(payload.password);
		const NEW_USER_BASE_MODEL = await USER_BASE_MODEL.create({
			first_name:				payload?.first_name,
			last_name:				payload?.last_name,
			email:					payload?.email,
			mobile:					payload?.mobile,
			password:				HASHED_PASSWORD,
			account_type:			payload?.account_type
		});

		await CREATE_ACCOUNT_STATUS(NEW_USER_BASE_MODEL);
		
		switch (payload?.account_type){
			case 'client':
				await CREATE_CLIENT_MODEL(NEW_USER_BASE_MODEL);
				break ;
			case 'supplier':
				await CREATE_SUPPLIER_MODEL(NEW_USER_BASE_MODEL,payload?.supplier);
				break ;
			case 'salesperson':
				await CREATE_SALESPERSON_MODEL(NEW_USER_BASE_MODEL);
				break ;
			case 'consultant':
				await CREATE_CONSULTANT_MODEL(NEW_USER_BASE_MODEL);
				break ;
			default :
				LOGGER.log('error','Missing required parameter');
				break ;
		};
		// await CREATE_SUBSCRIPTION_ITEM(NEW_CLIENT)
		LOGGER.log('info',`${ip} - ${payload?.first_name} Created an ${payload?.account_type} Account.`);
		/**
		 * Message Broker
		 * */
		const EMAIL_PAYLOAD = {
			type:   'user.created',
			name: 	payload?.first_name,
			email: 	payload?.email,
			_id: 	NEW_USER_BASE_MODEL?._id
		}

		PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');


		const auth_token = AUTH_TOKEN_GENERATOR({
			_id:NEW_USER_BASE_MODEL?._id,
			name: payload?.first_name+``+payload?.last_name,
			account_type:payload?.account_type
		});
		
		return res.status(200).json({
			error:false,
			message:'sign up successful',
			token: auth_token
		});

	}catch(err){
		LOGGER.log('error',`${ip} - System Error: Creating a new account for ${payload?.first_name}, Tel:${payload?.mobile}, Email:${payload?.email}. Error: \n\n\n ${err}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not create your account. Try signing up'});
	}
});


const CREATE_ACCOUNT_STATUS=async(USER)=>{
	try{
		const NEW_ITEM = await ACCOUNT_STATUS_MODEL.create({
			user_model_ref:				USER?._id,
			suspension:					{ 
											status: false,
											reason: '',
										},
			approval:					true,
			deletion:					{ 
											status: false,
											reason: '',
										},
			email:						{
											status: false,
											notification: true
			},
			sms:		                {
											status: true,
											notification: true
			},
			push:						{
											status: true,
											notification: true
			},
			onboarding:					{	status: false },
			complete_profile:			{	status: false }
		});
		const id = USER?._id;
		const query = { _id : id};
		const updateUserModel = {
			account_status_model_ref: NEW_ITEM?._id
		}
		await USER_BASE_MODEL.updateOne(query,updateUserModel)
	}catch(err){
		LOGGER.log('error',`Failed to create user account status schema and update user details`,err)
		return err;
	}
};

async function CREATE_CLIENT_MODEL(USER){
	try{
		const NEW_ITEM = await CLIENT_MODEL.create({
			user_model_ref:				USER?._id,	
		});
		const id = USER?._id;
		const query = { _id : id};
		const updateUserModel = {
			client_account_model_ref: NEW_ITEM?._id
		}
		await USER_BASE_MODEL.updateOne(query,updateUserModel);
		return;
	}catch(err){
		LOGGER.log('error',`Failed to create client account schema and update user details ${err}`);
		return err;
	}
};

async function CREATE_SUPPLIER_MODEL(USER,TYPE){
	try{
		const NEW_ITEM = await SUPPLIER_MODEL.create({
			user_model_ref:				USER?._id,
			type:						TYPE,
		});
		const id = USER?._id;
		const query = { _id : id};
		const updateUserModel = {
			supplier_account_model_ref: NEW_ITEM?._id
		}
		await USER_BASE_MODEL.updateOne(query,updateUserModel);
		return;

	}catch(err){
		LOGGER.log('error',`Failed to create supplier account model and update user details ${err}`);
		return err;
	}
}

async function CREATE_SALESPERSON_MODEL(USER){
	try{
		const NEW_ITEM = await SALESPERSON_MODEL.create({
			user_model_ref:				USER?._id,
		});
		const id = USER?._id;
		const query = { _id : id};
		const updateUserModel = {
			salesperson_account_model_ref: NEW_ITEM?._id
		}
		await USER_BASE_MODEL.updateOne(query,updateUserModel);
		return;

	}catch(err){
		LOGGER.log('error',`Failed to create salesperson account model and update user details ${err}`);
		return err;
	}
};

async function CREATE_CONSULTANT_MODEL(USER){
	try{
		const NEW_ITEM = await CONSULTANT_MODEL.create({
			user_model_ref:				USER?._id,
		});
		const id = USER?._id;
		const query = { _id : id};
		const updateUserModel = {
			consutant_account_model_ref: NEW_ITEM?._id
		}
		await USER_BASE_MODEL.updateOne(query,updateUserModel);
		return;

	}catch(err){
		LOGGER.log('error',`Failed to create consultant account model and update user details ${err}`);
		return err;
	}
}

module.exports = {
	NEW_USER_ACCOUNT
}
