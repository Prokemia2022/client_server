//Password controller
const { USER_BASE_MODEL } = require("../../models/USER.model");
const { CODE_TOKEN_GENERATOR } =  require("../../middleware/token.handler.middleware.js");
const CODE_GENERATOR_FUNC = require("../../middleware/code_generator.js");
const { PUBLISH_MESSAGE_TO_BROKER } = require("../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js");
const { LOGGER } = require("../../lib/logger.lib.js");
const Hash_str = require("../../middleware/Hash.middleware.js");

const SEND_OTP_TO_USER = (async(req,res)=>{
	const email = req.query.email;
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    try{
		const _QUERY = {email:email};
        const EXISTING_USER = await USER_BASE_MODEL?.findOne(_QUERY).populate('account_status_model_ref').exec();

        if (!EXISTING_USER){
            return res.status(200).json({error:true,message:'This Email does not have an existing account, try signing up.'});
        }
        if (EXISTING_USER?.account_status_model_ref?.deletion?.status){
            return res.status(200).send({error:true,message:'This account has been flagged for deletion.'});
        }
        
		const CODE = CODE_GENERATOR_FUNC();
		
		// Send Notification Email to User
		const EMAIL_PAYLOAD = {
			name:	EXISTING_USER?.first_name,
			type:	'user.password.code.request',
			email:	EXISTING_USER?.email,
			code:	CODE,
			sentAt:	new Date(Date.now())
		};

		PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');
        
        const CODE_TOKEN = CODE_TOKEN_GENERATOR(CODE);

		LOGGER.log('info',`${ip} Sending code to  Email:${email}`);

        return res.status(200).json({
            token:CODE_TOKEN,
            error:false,
            message:'Code has been sent successfully.'
        });
    }catch(err){
        LOGGER.log('error',`${ip} - System Error-[sending code to  email-${email}]`,err)
		return res.status(500).json({
			error: true,
			message:'Code could not be sent'
		});
    }

});

const HANDLE_RESET_PASSWORD =(async(req,res)=>{
	const email = req.query.email;
    const payload = req.body;
    
	let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    try{
       	const _QUERY = {email:email};
        const EXISTING_USER = await USER_BASE_MODEL?.findOne(_QUERY).populate('account_status_model_ref').exec();

        if (!EXISTING_USER){
            return res.status(200).json({error:true,message:'This Email does not have an existing account, try signing up.'});
        }
        if (EXISTING_USER?.account_status_model_ref?.deletion?.status){
            return res.status(200).send({error:true,message:'This account has been flagged for deletion.'});
        };

        const HASHED_PASSWORD = Hash_str(payload?.new_password);
        const updateClient = {
			password: HASHED_PASSWORD
		}
		await USER_BASE_MODEL.updateOne(_QUERY,updateClient);
        
		// Send Notification Email to User
		const EMAIL_PAYLOAD = {
			name:	EXISTING_USER?.first_name,
			type:	'user.password.change.request',
			email:	EXISTING_USER?.email,
			sentAt:	new Date(Date.now())
		};

		PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');

        return res.status(200).json({
            error:null,
            message:'Password has been updated successfully.'
        });
    }catch(err){
        LOGGER.log('error',`${ip} - System Error-[resetting password:  email-${email}]${err}`)
		return res.status(500).json({
			error:	true,
			message: 'We could not reset your password'
		});
    }

});

module.exports = {
	HANDLE_RESET_PASSWORD,
	SEND_OTP_TO_USER
}
