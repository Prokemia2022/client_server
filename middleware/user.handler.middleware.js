const { USER_BASE_MODEL } = require("../models/USER.model.js");
const { LOGGER } = require('../lib/logger.lib.js');
require('dotenv').config();

const USER_API_AUTHORIZATION = async(req,res,next)=>{
    const USER_ID = req.user.sub;
	const USER_QUERY = { _id: USER_ID };
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

		if (EXISTING_USER?.account_status_model_ref?.deletion?.status){
			return res.status(200).json({
				error:		true,
				message:	'This user account has been deleted',
				date:		EXISTING_USER?.account_status_model_ref?.deletion?.date
			});
		};
		
		next()
	}catch(error){
		LOGGER.log('error',`System Error[on authenticating user] ERROR: ${error}`);
        return res.status(500).json({
            error:true,
            message: 'We are sorry we could not authenticate you'
        });
    }
};

module.exports = {
	USER_API_AUTHORIZATION
}
