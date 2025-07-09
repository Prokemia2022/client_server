const { LOGGER } = require("../../lib/logger.lib.js");
const { USER_BASE_MODEL } = require("../../models/USER.model.js");
const { SUPPLIER_MODEL, CLIENT_MODEL }  = require("../../models/ACCOUNT.model.js");

const UPDATE_USER_DETAILS = (async (req,res)=>{
	const USER_ID = req.user.sub || req.query.user_id;
	const payload = req.body;
	console.log(payload)
	try{
		const EXISTING_USER = await USER_BASE_MODEL.findById(USER_ID).populate('account_status_model_ref').exec();
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'An account with this id does not exist'
			});
		};

		if (EXISTING_USER?.account_status_model_ref?.suspension?.status){
			return res.status(200).json({
				error:		true,
				message:	'This account has been suspended',
			});
		};

		if (EXISTING_USER?.account_status_model_ref?.deletion?.status){
			return res.status(200).json({
				error:		true,
				message:	'This account has already been flagged for deletion',
				date:		EXISTING_USER?.account_status_model_ref?.deletion?.date
			});
		};
		const UPDATE_DOCUMENT = {
			$set:{ 
				first_name:				payload?.first_name,
				last_name:				payload?.last_name,
				mobile:					payload?.mobile,
				profile_image_url:		payload?.profile_image_url,
			}
		};
		const _QUERY = { _id: USER_ID };
		await USER_BASE_MODEL.updateOne(_QUERY,UPDATE_DOCUMENT);

		const CLIENT_MODEL_ = await CLIENT_MODEL.findOne({user_model_ref: USER_ID})
		

		function IS_PRODUCT_SAVED_BY_USER() {
			let SAVED_PRODUCTS_ARR = CLIENT_MODEL_.products?.map((product)=> product?._id)
			console.log(SAVED_PRODUCTS_ARR)
			console.log(SAVED_PRODUCTS_ARR?.some((SAVED_PRODUCTS_ID)=> payload?.products[0] === SAVED_PRODUCTS_ID?.toString()))
			if (SAVED_PRODUCTS_ARR?.length > 0 && SAVED_PRODUCTS_ARR?.some((SAVED_PRODUCTS_ID)=> payload?.products[0] === SAVED_PRODUCTS_ID?.toString())){
				return true;
			}else{
				return false;
			}
		}

		if (EXISTING_USER?.account_type === 'client'){
			if (IS_PRODUCT_SAVED_BY_USER()){
				await CLIENT_MODEL.updateOne(
					{user_model_ref: USER_ID},
					{$pull: { products: payload?.products[0]}}
				)
			}else{
				await CLIENT_MODEL.updateOne({user_model_ref: USER_ID},	{ $push: {"products": {"$each": payload?.products}}});
				
			}
		}
		
		return res.status(200).send({
            error:null,
            message:`Account has been successfully updated`
		});
	}catch(err){
		LOGGER.log('error',`Updating user details: ${USER_ID}`,err)
		return res.status(500).json({
			error:	true,
			message:'Failed to update your details. Try again later.'
		});
	}
});

const UPDATE_USER_ACCOUNT_DETAILS = (async (req,res)=>{
	const USER_ID = req.user.sub || req.query.user_id;
	const payload = req.body;
	try{
		const EXISTING_USER = await USER_BASE_MODEL.findById(USER_ID).populate('account_status_model_ref').exec();
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'An account with this id does not exist'
			});
		};

		if (EXISTING_USER?.account_status_model_ref?.suspension?.status){
			return res.status(200).json({
				error:		true,
				message:	'This account has been suspended',
			});
		};

		if (EXISTING_USER?.account_status_model_ref?.deletion?.status){
			return res.status(200).json({
				error:		true,
				message:	'This account has already been flagged for deletion',
				date:		EXISTING_USER?.account_status_model_ref?.deletion?.date
			});
		};
		const UPDATE_DOCUMENT = {$set:{ 
			"company.name":				payload?.name,
			"company.email":			payload?.email,
			"company.mobile":			payload?.mobile,
			"company.address":			payload?.address,
			"company.position":			payload?.position,
			"company.website":			payload?.website,
			"description":				payload?.description,
			"technology":				payload?.technology,
			"industry":					payload?.industry
		}};
		const _QUERY = { user_model_ref : USER_ID };
		switch (req.user?.account_type){
			case 'client':
				await CLIENT_MODEL.updateOne(_QUERY,UPDATE_DOCUMENT);
				break;
			case 'supplier':
				await SUPPLIER_MODEL.updateOne(_QUERY,UPDATE_DOCUMENT);
				break;
			default:
				return res.status(200).send({
					error:true,
					message:`Missing account field`
				});
		}
		
		return res.status(200).send({
            error:null,
            message:`Account has been successfully updated`
		});
	}catch(err){
		LOGGER.log('error',`Updating user details: ${USER_ID}`,err)
		return res.status(500).json({
			error:	true,
			message:'Failed to update your details. Try again later.'
		});
	}
});


module.exports ={
	UPDATE_USER_DETAILS,
	UPDATE_USER_ACCOUNT_DETAILS
}
