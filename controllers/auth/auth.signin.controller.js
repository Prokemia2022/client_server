/****************************UTILS*************************************/
const bcrypt = require("bcryptjs");
/****************************MIDDLEWARES*******************************/
const { AUTH_TOKEN_GENERATOR } = require('../../middleware/token.handler.middleware.js');
const { PUBLISH_MESSAGE_TO_BROKER } = require("../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js");
/****************************MODELS************************************/
const { 
	USER_BASE_MODEL, 
	ACCOUNT_STATUS_MODEL 
} = require("../../models/USER.model.js");
/****************************LIB***************************************/
const { LOGGER } = require("../../lib/logger.lib.js");
const { ValidationError } = require('../../lib/error.lib.js')
/****************************HELPER FUNCTIONS**************************/
const VALIDATE_ACCOUNT_PASSWORD = async(_QUERY,password) => {
	const EXISTING_USER = await USER_BASE_MODEL.findOne(_QUERY,{first_name: 1,last_name: 1,account_type: 1,password: 1})
	if(!bcrypt.compareSync(password, EXISTING_USER?.password)){
		throw new ValidationError(`wrong credentials, password or email`);
	}
	return EXISTING_USER
};

const handleNewUserNotifications = async (user) => {
    const emailPayload = {
        type:	'session.created',
        name:	user.first_name,
        email:	user.email,
        _id:	user._id
    };
    
    // Uncomment when message broker is ready
    // await PUBLISH_MESSAGE_TO_BROKER(emailPayload, 'EMAIL_QUEUE');
};

/****************************FUNCTION**********************************/
const SIGN_IN_USER=(async(req,res)=>{
    try{
		const _QUERY = {email:req.body.email};
		// VALIDATION
		const USER = await VALIDATE_ACCOUNT_PASSWORD(_QUERY,req.body?.password)
		
		const AUTH_TOKEN = AUTH_TOKEN_GENERATOR({
			_id:			USER?._id,
			name:			`${USER?.first_name} ${USER?.last_name}`,
			account_type:	USER?.account_type
		});

		// Handle notifications
        await handleNewUserNotifications(USER);
		
		LOGGER.log('info',`[USER SIGNED IN]`);
		// UPDATE ACCOUNT ACTIVITY STATUS
		await ACCOUNT_STATUS_MODEL.updateOne(
			{ user_model_ref: USER?._id },
			{ $set:{last_active: new Date(Date.now())} }
		)
		return res.status(200).json({
			error:		false,
			message:	'Welcome back, we are happy to see you',
			token:		AUTH_TOKEN
		});
    }catch(error){
		LOGGER.log('error',`ERROR[USER SIGN IN]: \n\n\n ${error}\n\n\n]`);
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
        
        return res.status(500).json({
            error: true,
            message: 'We could not sign you in to your account at this time.'
        });
	}
});

module.exports = {
	SIGN_IN_USER
}
