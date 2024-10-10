const { LOGGER } = require('../../lib/logger.lib.js');
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../../models/USER.model.js");
const { PUBLISH_MESSAGE_TO_BROKER } = require('../../middleware/MESSAGE_BROKER/PUBLISH_MESSAGE_TO_BROKER.js');
const { VERIFY_USER_ACCOUNT_ERROR_HTML_TEMPLATE, VERIFY_USER_ACCOUNT_SUCCESS_HTML_TEMPLATE } = require("../../lib/templates/html_templates.js");
const CODE_GENERATOR_FUNC = require('../../middleware/code_generator.js');

const GET_VERIFICATION_CODE_EMAIL=(async(req,res)=>{
    const email = req.query.email;
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    try{
        if (!email){
            return res.status(403).send({error:true,message:'Missing details'});
        };

		const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne({email: email}).populate('account_status_model_ref').exec();

        if (!EXISTING_ACCOUNT){
            return res.status(200).send({error:true,message:'This email does not have an existing account, try signing up'});
        };

        if (EXISTING_ACCOUNT?.account_status_model_ref?.email.status){
            return res.status(200).send({error:true,message:'This email has already been verified, thank you for being part of us.'});
        };

		const CODE = CODE_GENERATOR_FUNC();

		const EMAIL_PAYLOAD = {
			name: 	EXISTING_ACCOUNT?.first_name,
			type:   'user.verify.code.request',
			email:  EXISTING_ACCOUNT?.email,
			code:	CODE,
			sentAt: new Date(Date.now())
		};

		PUBLISH_MESSAGE_TO_BROKER(EMAIL_PAYLOAD,'EMAIL_QUEUE');

        return res.status(200).json({error:null,message:'Your verification code has been sent to your email.'});
    }catch(err){
        LOGGER.log('error',`${ip} - System Error-[sending verification email]`)
        return res.sendStatus(500);
    }
});

const VERIFY_USER_ACCOUNT=(async(req,res)=>{
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];

    const SUCCESS_TEMPLATE = VERIFY_USER_ACCOUNT_SUCCESS_HTML_TEMPLATE();
    const ERROR_TEMPLATE = VERIFY_USER_ACCOUNT_ERROR_HTML_TEMPLATE();

    const email = req?.query?.email;
	const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne({email:email}).populate('account_status_model_ref').exec();

    if (!EXISTING_ACCOUNT){
        return res.status(200).send(ERROR_TEMPLATE)
    };

    try {
        if (EXISTING_ACCOUNT?.account_status_model_ref?.email.status){
            return res.status(200).send(SUCCESS_TEMPLATE);
        }else{
			const UPDATE_DOCUMENT = {$set:{
				"email.status" :   true
            }};
            const _QUERY = {user_model_ref: EXISTING_ACCOUNT?._id};
            await ACCOUNT_STATUS_MODEL.updateOne(_QUERY, UPDATE_DOCUMENT).then(()=>{
                LOGGER.log('info',`${ip} - USER_ID: ${EXISTING_ACCOUNT?._id} Name: ${EXISTING_ACCOUNT?.first_name} has been verified`);
                return res.status(200).send(SUCCESS_TEMPLATE);
            });
        };
    } catch (error) {
        LOGGER.log('error',`${ip} - System Error-[verifying user]`,error)
        return res.sendStatus(500);
    }
})
module.exports = {
	GET_VERIFICATION_CODE_EMAIL,
	VERIFY_USER_ACCOUNT
};
