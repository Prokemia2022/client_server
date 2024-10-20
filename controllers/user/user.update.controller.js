/****************************UTILS***************************************/
const mongoose = require('mongoose');
/****************************MODELS**************************************/
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../../models/USER.model.js");
const { 
	DOCUMENT_MODEL, 
	PRODUCT_MODEL, 
	REQUEST_MODEL, 
	MARKET_MODEL 
} = require("../../models/PRODUCT.model.js");
const { SUPPLIER_MODEL, CLIENT_MODEL } = require("../../models/ACCOUNT.model.js");
/****************************CONFIGS*************************************/
/****************************LIB*****************************************/
const { LOGGER } = require('../../lib/logger.lib.js');
const { ValidationError } = require('../../lib/error.lib.js');
/****************************CONSTANTS***********************************/
/****************************HELPER FUNCTIONS****************************/
const IS_PRODUCT_SAVED=(product,saved_products)=>{
	//console.log(saved_products?.some((product_id)=> product === product_id?.toString()))
	if(!product){
		return null
	}else if (saved_products?.length > 0 && saved_products?.some((product_id)=> product === product_id?.toString())){
		return true;
	}else{
		return false;
	}
};
/****************************FUNCTIONS***********************************/

const UPDATE_USER_DETAILS = (async (req,res)=>{
	const USER_ID = req.query.user_id;
	const payload = req.body;
	try{	
		await USER_BASE_MODEL.updateOne(
		{_id: USER_ID},
		{
			$set:{ 
				first_name:				payload?.first_name,
				last_name:				payload?.last_name,
				mobile:					payload?.mobile,
				profile_image_url:		payload?.profile_image_url,
			}
		});

		return res.status(200).send({
            error:false,
            message:`Account has been updated successfully`
		});
	}catch(error){
		LOGGER.log('error',`ERROR[UPDATE_USER_DETAILS] ${error}`)
		return res.status(500).json({
			error:	true,
			message:'Failed to update your details. Try again later.'
		});
	}
});

const HANDLE_ACCOUNT_SAVED_PRODUCTS=async()=>{
	const ACCOUNT_ID = req.query.account_id;
	const ACCOUNT_TYPE = req.query.account_type;
	const payload = req.body;
	try{
		if (!ACCOUNT_ID || ACCOUNT_TYPE){
			throw new ValidationError('Missing parameter requirements')
		};
		let ACCOUNT_DATA;
		switch(ACCOUNT_TYPE){
			case 'client':
				ACCOUNT_DATA = await CLIENT_MODEL.findOne({user_model_ref: ACCOUNT_ID},{products: 1});
				if (IS_PRODUCT_SAVED(payload?.products[0],ACCOUNT_DATA?.products)){
					await CLIENT_MODEL.updateOne({user_model_ref: ACCOUNT_ID},{$pull: { products: payload?.products[0]}})
				}else{
					await CLIENT_MODEL.updateOne({user_model_ref: ACCOUNT_ID},	{ $push: {"products": {"$each": payload?.products}}});	
				}
				break;
			default:
				throw new ValidationError('Missing parameter requirements')
		}

		return res.status(200).send({
            error:null,
            message:`PRODUCTs updated successfully`
		});
	}catch(error){
		LOGGER.log('error',`ERROR[HANDLE_ACCOUNT_SAVED_PRODUCTS]: ${error}`)
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
		return res.status(500).json({
			error:	true,
			message:'Failed to update products. Try again later.'
		});
	}
};

const UPDATE_USER_ACCOUNT_DETAILS = (async (req,res)=>{
	const ACCOUNT_ID = req.query.account_id;
	const ACCOUNT_TYPE = req.query.account_type;
	const payload = req.body;
	try{
		const UPDATE_DOCUMENT = {$set:{ 
			"company.name":				payload?.name,
			"company.email":			payload?.email,
			"company.mobile":			payload?.mobile,
			"company.address":			payload?.address,
			"company.position":			payload?.position,
			"company.website":			payload?.website,
			"description":				payload?.description,
			"technology":				payload?.technology,
			"industry":					payload?.industry,
			"status.status":			payload?.status,
			"status.stage":				payload?.status_stage,
		}};
		switch (ACCOUNT_TYPE){
			case 'client':
				await CLIENT_MODEL.updateOne({user_model_ref: ACCOUNT_ID},UPDATE_DOCUMENT);
				
				await ACCOUNT_STATUS_MODEL.updateOne({user_model_ref: ACCOUNT_ID},{
					$set:{
						approved: payload?.status_stage == 'approved'? true : false,
						"suspension.status": payload?.status_stage == 'suspended'? true : false,
					}
				})
				break;
			case 'supplier':
				await SUPPLIER_MODEL.updateOne({user_model_ref: ACCOUNT_ID},UPDATE_DOCUMENT);
				break;
			default:
				throw new ValidationError('Missing parameter requirements')
		}
		
		return res.status(200).send({
            error:false,
            message:`Account has been successfully updated`
		});
	}catch(error){
		LOGGER.log('error',`ERROR[UPDATE_USER_ACCOUNT_DETAILS] ${error}`)
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
		return res.status(500).json({
			error:	true,
			message:'Failed to update your details. Try again later.'
		});
	}
});


module.exports ={
	UPDATE_USER_DETAILS,
	UPDATE_USER_ACCOUNT_DETAILS,
	HANDLE_ACCOUNT_SAVED_PRODUCTS,
	IS_PRODUCT_SAVED
}
