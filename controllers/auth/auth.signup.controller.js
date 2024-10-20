/****************************UTILS*************************************/
/****************************MIDDLEWARES*******************************/
const { HASH_STRING } = require('../../middleware/Hash.middleware.js');
const { AUTH_TOKEN_GENERATOR } = require('../../middleware/token.handler.middleware.js');
const { PUBLISH_MESSAGE_TO_BROKER } = require('../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js');
const { QUEUE_NOTIFICATION } = require('../notifications/index.js');
/****************************CONFIGS***********************************/
/****************************LIB***************************************/
const { LOGGER } = require('../../lib/logger.lib.js');
const { ValidationError } = require('../../lib/error.lib.js')
/****************************MODELS************************************/
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require('../../models/USER.model.js');
const { 
	CLIENT_MODEL, 
	SUPPLIER_MODEL, 
	ADMIN_MODEL 
} = require('../../models/ACCOUNT.model.js');
/****************************CONSTANTS*********************************/
const ALLOWED_ACCOUNT_TYPES = ['client', 'supplier', 'admin'];
/****************************HELPER FUNCTIONS**************************/
const VALIDATE_ACCOUNT_TYPES = (accountType) => {
    if (!ALLOWED_ACCOUNT_TYPES.includes(accountType)) {
        throw new ValidationError(`Invalid account type: ${accountType}`);
    }
};

const CHECK_EXISTING_ACCOUNT = async (email) => {
    const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne({ email });
    if (EXISTING_ACCOUNT) {
        throw new ValidationError('An account with this email already exists');
    }
};

const CREATE_BASE_USER = async (payload, hashedPassword) => {
    return await USER_BASE_MODEL.create({
        first_name:		payload.first_name,
        last_name:		payload.last_name,
        email:			payload.email,
        mobile:			payload.mobile,
        password:		hashedPassword,
        account_type:	payload.account_type
    });
};

const HANDLE_NOTIFICATIONS = async (user, payload) => {
	const userId = user?._id;
	const toAdmin = false;
	const notificationType = 'email';

    const emailPayload = {
        type: 'user.created',
		subject: "Welcome to Prokemia",
        name: payload?.first_name,
        email: payload?.email,
        _id: user?._id
    };
    
    // Uncomment when message broker is ready
    await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,emailPayload);
};
/****************************FUNCTION**********************************/

const NEW_USER_ACCOUNT = (async(req, res)=>{
	try{

		const payload = req.body;
		
		// VALIDATION
        VALIDATE_ACCOUNT_TYPES(payload?.account_type);
        await CHECK_EXISTING_ACCOUNT(payload?.email);

		const HASHED_PASSWORD = HASH_STRING(payload.password);

		// Create base user
		const NEW_BASE_USER = await CREATE_BASE_USER(payload, HASHED_PASSWORD);
		
        // Create account status
        await CREATE_ACCOUNT_STATUS(NEW_BASE_USER);
		
		// Create specific account type
        await CREATE_SPECIFIC_ACCOUNT(NEW_BASE_USER, payload);

		// Handle notifications
        await HANDLE_NOTIFICATIONS(NEW_BASE_USER, payload);

		
		LOGGER.log('info',`SUCCESS[NEW_USER_ACCOUNT: ${payload?.account_type} ACCOUNT CREATED]:${payload?.first_name}`);

		const auth_token = AUTH_TOKEN_GENERATOR({
			_id:			NEW_BASE_USER?._id,
			name:			`${payload.first_name} ${payload.last_name}`,
			account_type:	payload?.account_type
		});
		
		return res.status(200).json({
			error:false,
			message:'sign up successful',
			token: auth_token
		});

	}catch(error){
		LOGGER.log('error',`ERROR[NEW_USER_ACCOUNT]: \n\n\n ${error}\n\n\n`);
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
        
        return res.status(500).json({
            error: true,
            message: 'We could not create your account at this time.'
        });
	}
});

const CREATE_SPECIFIC_ACCOUNT = async (user, payload) => {
    const accountCreators = {
        admin: () => CREATE_ADMIN_MODEL(user, payload?.role),
        client: () => CREATE_CLIENT_MODEL(user, formatClientData(payload?.client)),
        supplier: () => CREATE_SUPPLIER_MODEL(user, formatSupplierData(payload?.supplier), payload?.supplier?.supplier_type)
    };

    const creator = accountCreators[payload?.account_type];
    if (creator) {
        await creator();
    }
};

const CREATE_ACCOUNT_STATUS = async (user) => {
    try {
        const accountStatus = await ACCOUNT_STATUS_MODEL.create({
            user_model_ref: user._id,
            suspension: { 
                status: false,
                reason: '',
            },
            approved: user?.account_type === 'client', // Auto-approve only clients
            deletion: { 
                status: false,
                reason: '',
            },
            email: {
                status: false,
                notification: true
            },
            sms: {
                status: true,
                notification: true
            },
            push: {
                status: true,
                notification: true
            },
            onboarding: { status: false },
            complete_profile: { status: false }
        });

        await USER_BASE_MODEL.updateOne(
            { _id: user._id },
            { account_status_model_ref: accountStatus._id }
        );

    } catch (error) {
        LOGGER.log('error', '[ACCOUNT STATUS CREATION]', error);
        throw error;
    }
};

async function CREATE_ADMIN_MODEL(user,role){
	try{
		const adminAccount = await ADMIN_MODEL.create({
            user_model_ref: user?._id,
            role: role
        });
		await USER_BASE_MODEL.updateOne(
            { _id: user._id },
            { admin_account_model_ref: adminAccount._id }
        );
	}catch(error){
		LOGGER.log('error','[ADMIN ACCOUNT CREATION]',error);
		throw error;
	}
};

const formatClientData = (clientData) => {
    if (!clientData?.client_company_name) return null;
    
    return {
        name: clientData.client_company_name,
        email: clientData.client_company_email,
        mobile: clientData.client_company_mobile,
        address: clientData.client_company_address,
        website: clientData.client_company_website,
        position: clientData.client_company_handler_position
    };
};

const formatSupplierData = (supplierData) => {
    if (!supplierData?.supplier_company_name) return null;
    
    return {
        type: supplierData.supplier_type,
        description: supplierData.supplier_description,
        name: supplierData.supplier_company_name,
        email: supplierData.supplier_company_email,
        mobile: supplierData.supplier_company_mobile,
        address: supplierData.supplier_company_address,
        website: supplierData.supplier_company_website,
        position: supplierData.supplier_company_handler_position,
        status: supplierData.supplier_approval_status,
        status_stage: supplierData.supplier_status_stage
    };
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
		await USER_BASE_MODEL.updateOne(
            { _id: USER._id },
            { client_account_model_ref: NEW_ITEM?._id }
        );
	}catch(error){
		LOGGER.log('error','[CLIENT ACCOUNT CREATION]',error);
		throw error;
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
				type:						TYPE || 'supplier',
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
		await USER_BASE_MODEL.updateOne(
            { _id: USER?._id },
            { supplier_account_model_ref: NEW_ITEM?._id }
        );
	}catch(error){
		LOGGER.log('error','[SUPPLIER ACCOUNT CREATION]',error);
		throw error;
	}
}

module.exports = {
	NEW_USER_ACCOUNT
}
