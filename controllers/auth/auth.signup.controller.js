/****************************UTILS*************************************/
/****************************MIDDLEWARES*******************************/
const { HASH_STRING } = require('../../middleware/Hash.middleware.js');
const { AUTH_TOKEN_GENERATOR } = require('../../middleware/token.handler.middleware.js');
const { PUBLISH_MESSAGE_TO_BROKER } = require('../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js');
/****************************CONFIGS***********************************/
/****************************LIB***************************************/
const { LOGGER } = require('../../lib/logger.lib.js');

/****************************MODELS************************************/
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require('../../models/USER.model.js');
const { 
	CLIENT_MODEL, 
	SUPPLIER_MODEL, 
	SALESPERSON_MODEL, 
	CONSULTANT_MODEL, 
	ADMIN_MODEL 
} = require('../../models/ACCOUNT.model.js');

/****************************FUNCTION**********************************/

const NEW_USER_ACCOUNT = (async(req, res)=>{
	/**
	 * NEW_USER_ACCOUNT: Creates a base model for all users, support models i.e account status and creates the respective type of account for the new user
	 * @param: payload (object): The schema has been verified, 
	 * 
	**/
	const payload = req.body;

	{/**Create and save user model to the db */}
	try{
		if (payload?.account_type !== 'client' && payload?.account_type !== 'supplier' && payload?.account_type !== 'admin'){
			LOGGER.log('info',`This account type ${payload?.account_type} is not allowed or is Missing`);
            return res.status(200).send({
				error:true,
				message:'We could not create your account.'
			});
		}
		// Check if user already exists
		const _QUERY = { email: payload?.email};
        const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne(_QUERY);
		
		if (EXISTING_ACCOUNT){
            LOGGER.log('info',`${EXISTING_ACCOUNT?.first_name} Account already exists`);
            return res.status(200).send({
				error:true,
				message:'An account with this email already exists'
			});
        };
		const HASHED_PASSWORD = HASH_STRING(payload.password);
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
			case 'admin':
				await CREATE_ADMIN_MODEL(NEW_USER_BASE_MODEL,payload?.role);
				break ;
			case 'client':
				let client;
				if (payload?.client?.client_company_name === ''){
					client = null
				}else{
					client = {
						name:				payload?.client?.client_company_name,
						email:				payload?.client?.client_company_email,
						mobile:				payload?.client?.client_company_mobile,
						address:			payload?.client?.client_company_address,
						website:			payload?.client?.client_company_website,
						position:			payload?.client?.client_company_handler_position,
					}
				}
				await CREATE_CLIENT_MODEL(NEW_USER_BASE_MODEL,client);
				break ;
			case 'supplier':
				let supplier;
				if (payload?.supplier?.supplier_company_name === ''){
					supplier = null
				}else{
					supplier = {
						type:				payload?.supplier?.supplier_type,
						description:		payload?.supplier?.supplier_description,
						name:				payload?.supplier?.supplier_company_name,
						email:				payload?.supplier?.supplier_company_email,
						mobile:				payload?.supplier?.supplier_company_mobile,
						address:			payload?.supplier?.supplier_company_address,
						website:			payload?.supplier?.supplier_company_website,
						position:			payload?.supplier?.supplier_company_handler_position,
						status:				payload?.supplier?.supplier_approval_status,
						status_stage:		payload?.supplier?.supplier_status_stage,
					}
				}
				await CREATE_SUPPLIER_MODEL(NEW_USER_BASE_MODEL,supplier,payload?.supplier_type);
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
		LOGGER.log('info',`${payload?.first_name} Created an ${payload?.account_type} Account.`);
		/**
		 * Message Broker
		 * */
		const EMAIL_PAYLOAD = {
			type:   'user.created',
			name: 	payload?.first_name,
			email: 	payload?.email,
			_id: 	NEW_USER_BASE_MODEL?._id
		}

		//PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');


		const auth_token = AUTH_TOKEN_GENERATOR({
			_id:			NEW_USER_BASE_MODEL?._id,
			name:			payload?.first_name+``+payload?.last_name,
			account_type:	payload?.account_type
		});
		
		return res.status(200).json({
			error:false,
			message:'sign up successful',
			token: auth_token
		});

	}catch(err){
		LOGGER.log('error',`ERROR[CREATE NEW ACCOUNT]: \n\n\n ${err}\n\n\n`);
		return res.status(500).json({error:true,message:'We could not create your account.'});
	}
});


const CREATE_ACCOUNT_STATUS=async(USER)=>{
	let approved = true;
	if (USER?.account_type !== 'client'){
		approved = false
	}
	try{
		const NEW_ITEM = await ACCOUNT_STATUS_MODEL.create({
			user_model_ref:				USER?._id,
			suspension:					{ 
											status: false,
											reason: '',
										},
			approved:					true,
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

async function CREATE_ADMIN_MODEL(USER,role){
	try{
		const NEW_ITEM = await ADMIN_MODEL.create({
			user_model_ref:				USER?._id,	
			role:				role
		});
		const id = USER?._id;
		const query = { _id : id};
		const updateUserModel = {
			admin_account_model_ref: NEW_ITEM?._id
		}
		await USER_BASE_MODEL.updateOne(query,updateUserModel);
		return;
	}catch(err){
		LOGGER.log('error',`Failed to create admin account schema and update user details ${err}`);
		return err;
	}
};


async function CREATE_CLIENT_MODEL(USER,CLIENT){
	try{
		let NEW_ITEM; 
		if (CLIENT === null){
			NEW_ITEM = await CLIENT_MODEL.create({
				user_model_ref:		USER?._id,
			})
		}else{
			NEW_ITEM = await CLIENT_MODEL.create({
				user_model_ref:				USER?._id,
				company:					{
					name:					CLIENT?.name || '',
					email:					CLIENT?.email || '',
					mobile:					CLIENT?.mobile || '',
					address:				CLIENT?.address || '',
					website:				CLIENT?.website || '',
					position:				CLIENT?.position || ''
				},
			});
		}
		const id = USER?._id;
		const query = { _id : id};
		const updateUserModel = {
				client_account_model_ref: NEW_ITEM?._id,
		}
		await USER_BASE_MODEL.updateOne(query,updateUserModel);
		return;
	}catch(err){
		LOGGER.log('error',`Failed to create client account schema and update user details ${err}`);
		return err;
	}
};

async function CREATE_SUPPLIER_MODEL(USER,SUPPLIER,TYPE){
	try{
		let NEW_ITEM; 
		if (SUPPLIER === null){
			NEW_ITEM = await SUPPLIER_MODEL.create({
				user_model_ref:		USER?._id,
				type:				TYPE || 'supplier',
				statistics:			{ views: 0 },
				status:				{ status: true, stage: 'pending', comment: ''}
			})
		}else{
			NEW_ITEM = await SUPPLIER_MODEL.create({
				user_model_ref:				USER?._id,
				type:						SUPPLIER?.type || 'supplier',
				description:				SUPPLIER?.description || '',
				company:					{
					name:					SUPPLIER?.name || '',
					email:					SUPPLIER?.email || '',
					mobile:					SUPPLIER?.mobile || '',
					address:				SUPPLIER?.address || '',
					website:				SUPPLIER?.website || '',
					position:				SUPPLIER?.position || ''
				},
				statistics:					{ views: 0 },
				status:						{ status: SUPPLIER?.status || true, stage: SUPPLIER?.status_stage || 'pending', comment: ''}
			});
		}
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
