/****************************UTILS*************************************/
/****************************MIDDLEWARES*******************************/
const { HASH_STRING } = require("../../middleware/Hash.middleware.js");
const { PUBLISH_MESSAGE_TO_BROKER } = require("../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js");
const { CODE_TOKEN_GENERATOR } =  require("../../middleware/token.handler.middleware.js");
const CODE_GENERATOR_FUNC = require("../../middleware/code_generator.js");
const { QUEUE_NOTIFICATION } = require('../notifications/index.js');
/****************************CONFIGS***********************************/
/****************************LIB***************************************/
const { LOGGER } = require("../../lib/logger.lib.js");
const { ValidationError } = require('../../lib/error.lib.js')
/****************************MODELS************************************/
const { USER_BASE_MODEL } = require("../../models/USER.model");
/****************************CONSTANTS*********************************/
/****************************HELPER FUNCTIONS**************************/
const HANDLE_SEND_CODE_NOTIFICATIONS = async (user,code) => {
    const userId = user?._id;
	const toAdmin = false;
	const notificationType = 'email';

    const emailPayload = {
        type:		'password.code.request',
		subject:	"Password Reset OTP Code",
        name:		user?.first_name,
        email:		user?.email,
        _id:		user?._id,
		code:		code
    };
    
    // Uncomment when message broker is ready
    await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,emailPayload);
};

const HANDLE_PASSWORD_CHANGED_NOTIFICATIONS = async (user) => {
    const userId = user?._id;
	const toAdmin = false;
	const notificationType = 'email';

    const emailPayload = {
        type:		'password.change.success',
		subject:	"Password Reset Confirmation!",
        name:		user?.first_name,
        email:		user?.email,
        _id:		user?._id
    };
    
    // Uncomment when message broker is ready
    await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,emailPayload);
};

/****************************FUNCTION**********************************/

const SEND_OTP_TO_USER = (async(req,res)=>{
	const email = req.query.email;
    try{
		const EXISTING_USER = await USER_BASE_MODEL?.findOne({email:email},{first_name: 1,email: 1});
		
		const CODE = CODE_GENERATOR_FUNC();

		// Handle notifications
        await HANDLE_SEND_CODE_NOTIFICATIONS(EXISTING_USER,CODE);
		
        const CODE_TOKEN = CODE_TOKEN_GENERATOR(CODE);

		LOGGER.log('info',`[PASSWORD RESET CODE SENT]:${email}`);

        return res.status(200).json({
            token:		CODE_TOKEN,
            error:		false,
            message:	'Code has been sent successfully.'
        });
    }catch(error){
		LOGGER.log('error',`ERROR[PASSWORD RESET CODE]$:${error}`)
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
		return res.status(500).json({
			error: true,
			message:'We could not send you a code at this time.'
		});
    }
});

const HANDLE_RESET_PASSWORD =(async(req,res)=>{
	const email = req.query.email;
    const payload = req.body;
    try{
		const EXISTING_USER = await USER_BASE_MODEL?.findOne({email:email},{first_name: 1,email: 1});
        const HASHED_PASSWORD = HASH_STRING(payload?.new_password);
		await USER_BASE_MODEL.updateOne({email:email},{
			password: HASHED_PASSWORD
		});
        
		// Handle notifications
        await HANDLE_PASSWORD_CHANGED_NOTIFICATIONS(EXISTING_USER);

		LOGGER.log('info',`SUCCESS[PASSWORD UPDATE]`);

        return res.status(200).json({
            error:null,
            message:'Password has been updated successfully.'
        });
    }catch(err){
		LOGGER.log('error',`ERROR[PASSWORD UPDATE]:${err}`)
		return res.status(500).json({
			error:	true,
			message: 'We could not reset your password at this time'
		});
    }

});

module.exports = {
	HANDLE_RESET_PASSWORD,
	SEND_OTP_TO_USER
}
