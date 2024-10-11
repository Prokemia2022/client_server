/************************************UTILS*************************************/
const moment = require("moment");
/************************************MODELS*************************************/
const { USER_BASE_MODEL } = require("../models/USER.model.js");
/************************************LIB*************************************/
const { LOGGER } = require('../lib/logger.lib.js');
/************************************CONFIGS*************************************/
require('dotenv').config();
/************************************FUNCTION*************************************/

const USER_API_AUTHORIZATION = async(req,res,next)=>{
    const USER_ID = req.user?.sub;
	const USER_EMAIL = req.body?.email || req.query?.email ;
	const USER_QUERY = { $or: [{ _id: USER_ID}, {email: USER_EMAIL }]};
	/**
     * @description This middleware handles the api authentication by the user
     * 
     */
	try{
		const EXISTING_USER = await USER_BASE_MODEL.findOne(USER_QUERY).populate('account_status_model_ref').exec();
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'We could not find a user for this account'
			});
		};
	
		if (EXISTING_USER?.account_status_model_ref?.suspension?.status){
			return res.status(200).json({
				error:		true,
				message:	'This user account has been suspended',
			});
		};

		function daysRemaining(date){
			const DELETION_DATE = moment(date);
			return DELETION_DATE.diff(moment(), 'days');
		}
		if (EXISTING_USER?.account_status_model_ref?.deletion?.status){
			return res.status(200).json({
				error:		true,
				message:	`Your account was flagged for deletion. Your account will be deleted in ${daysRemaining(EXISTING_USER?.account_status_model_ref?.deletion?.date)} days. Contact us: support@prokemia.com for any enquiries.`,
			});
		};
		next()
	}catch(error){
		LOGGER.log('error',`ERROR[AUTHENTICATING USER]: ${error}`);
        return res.status(500).json({
            error:true,
            message: 'We are sorry we could not authenticate you'
        });
    }
};

module.exports = {
	USER_API_AUTHORIZATION
}
