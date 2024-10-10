/****************************UTILS*************************************/
const moment = require("moment");
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

const SIGN_IN_USER=(async(req,res)=>{
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    try{
        
		const _QUERY = {email:req.body.email};
        const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne(_QUERY).populate('account_status_model_ref').exec();
        if (!EXISTING_ACCOUNT){
			LOGGER.log('info',`${ip} - Account, Email(${req.body.email}): not found`);
			return res.status(200).json({
				error:true,
				message:'Wrong credentials, password or email'
			});
		};

        if (EXISTING_ACCOUNT?.account_status_model_ref?.deletion?.status){
			function daysRemaining(){
				let eventdate = moment(EXISTING_ACCOUNT?.account_status_model_ref?.deletion?.date);
    //var renewed_date = moment(USER_DATA?.subscription_ref?.renewal_date);
				return eventdate.diff(moment(), 'days');
			}

			LOGGER.log('info',`${ip} - Account: ${EXISTING_ACCOUNT?.first_name}  tried logging in but account was flagged for deletion`);
			return res.status(200).json({
				error:true,
				message:`Your account was flagged for deletion. Your account will be deleted in ${daysRemaining()} days. Contact us: support@prokemia.com for any enquiries.`
			});
		};


		if(bcrypt.compareSync(req.body.password, EXISTING_ACCOUNT?.password)){
			const AUTH_TOKEN = AUTH_TOKEN_GENERATOR({
				_id:			EXISTING_ACCOUNT?._id,
				name:			EXISTING_ACCOUNT?.first_name+``+EXISTING_ACCOUNT?.last_name,
				account_type:	EXISTING_ACCOUNT?.account_type
			});

			const EMAIL_PAYLOAD = {
				name: 	EXISTING_ACCOUNT?.first_name,
				type:   'session.created',
				email:  EXISTING_ACCOUNT?.email,
				sentAt: new Date(Date.now())
			};

			PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');
		
			await ACCOUNT_STATUS_MODEL.updateOne({user_model_ref:EXISTING_ACCOUNT?._id},{$set:{last_active: new Date(Date.now())}})
			LOGGER.log('info',`${ip} - ${EXISTING_ACCOUNT?.first_name} signed in`);
			return res.status(200).json({
				error:		false,
				message:	'session.created',
				token:		AUTH_TOKEN
			});
		}else{
			return res.status(200).json({
				error:		true,
				message:	'wrong credentials, password or email'
			});
		}
    }catch(err){
        LOGGER.log('error',`${ip} - System Error[on sign in]`,err);
		return res.status(500).json({
			error:		true,
			message:	'Error occured while signing you in.'	
		});
	}
});

module.exports = {
	SIGN_IN_USER
}
