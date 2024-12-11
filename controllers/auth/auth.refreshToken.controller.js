const { LOGGER } = require("../../lib/logger.lib.js");
const { USER_BASE_MODEL } = require("../../models/USER.model.js");
const { AUTH_TOKEN_GENERATOR } = require('../../middleware/token.handler.middleware.js');

const REFRESH_USER_TOKEN=(async(req,res)=>{
    try{
		const _QUERY = {_id:req.query.sub};
        const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne(_QUERY).populate('account_status_model_ref').exec();
        if (!EXISTING_ACCOUNT){
			LOGGER.log('info',`Account not found`);
			return res.status(200).json({
				error:true,
				message:'User account not found'
			});
		};

		const AUTH_TOKEN = AUTH_TOKEN_GENERATOR({
			_id:			EXISTING_ACCOUNT?._id,
			name:			EXISTING_ACCOUNT?.first_name+``+EXISTING_ACCOUNT?.last_name,
			account_type:	EXISTING_ACCOUNT?.account_type
		});
					
		return res.status(200).json({
			error:		false,
			message:	'session.refreshed',
			token:		AUTH_TOKEN
		});
    }catch(err){
        LOGGER.log('error',`System Error[on session refreshing]`,err);
		return res.status(500).json({
			error:		true,
			message:	'Error occured while refreshing token'	
		});
	}
});

module.exports = REFRESH_USER_TOKEN;
