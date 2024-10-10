const { USER_BASE_MODEL } = require('../../models/USER.model.js');
const { REQUEST_MODEL } = require("../../models/PRODUCT.model.js");
const { SUPPLIER_MODEL } = require("../../models/ACCOUNT.model.js");
const {	PRODUCT_MODEL } = require("../../models/PRODUCT.model.js");
const { LOGGER } = require('../../lib/logger.lib.js');

const CREATE_REQUEST=(async(req, res)=>{
	let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
	const USER_ID = req.user.sub;
	const USER_QUERY = { _id: USER_ID };
	const payload = req.body;

	try{
		const EXISTING_USER = await USER_BASE_MODEL.findOne(USER_QUERY).populate('account_status_model_ref').exec();
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
		const EXISTING_PRODUCT = await PRODUCT_MODEL.findById(payload?.product_model_ref);
		
		if(!EXISTING_PRODUCT?.status?.status && (EXISTING_PRODUCT?.status?.stage === 'suspension')){
			return res.status(200).json({
				error:		true,
				message:	'This product does not accept requests at the moment: Product not found.',
			});
		};

		const EXISTING_SUPPLIER = await SUPPLIER_MODEL.findById(payload?.supplier_model_ref);
		
		if(!EXISTING_SUPPLIER){
			return res.status(200).json({
				error:		true,
				message:	'This product does not accept requests at the moment: Supplier not found.',
			});
		};

		const NEW_REQUEST_ITEM = await REQUEST_MODEL.create({
			type:					payload?.type,
			product_model_ref:		payload?.product_model_ref,
			requestor_model_ref:	payload?.requestor_model_ref,
			supplier_model_ref:		payload?.supplier_model_ref,
			industry:				payload?.industry,
			technology:				payload?.technology,
			amount:					payload?.amount,
			expected_annual_ammount:payload?.expected_annual_ammount,
			units:					payload?.units,
			use_case:				payload?.use_case,
			comment:				payload?.comment,
			status:	{
				status:				true,
				stage:				'pending',
				comment: '',
				date:				new Date(Date.now())
			},
		});

		/*** Send Notifications to respective referees
		 * Requestor
		 * Supplier 
		 * Admin
		 *
		 */

		/** add requests to respective models
		 * supplier
		 * requestor
		 * product
		 *
		 */

		// requestor
		EXISTING_USER?.requests?.push(NEW_REQUEST_ITEM?._id);
		EXISTING_USER?.save();

		// supplier
		EXISTING_SUPPLIER?.requests?.push(NEW_REQUEST_ITEM?._id);
		EXISTING_SUPPLIER?.save();

		// product
		EXISTING_PRODUCT?.requests?.push(NEW_REQUEST_ITEM?._id);
		EXISTING_PRODUCT?.save();

		return res.status(200).send({
			error: false,
			message: 'Product created successfully'
		})

	}catch(error){
		LOGGER.log('error',`${ip} - System Error: Creating a new request. USER: ${USER_ID}. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not create this request.'});
	}

});

const FETCH_ALL_REQUESTS=(async(req,res)=>{
	const USER_ID = req.user.sub;
	const ACCOUNT_ID = req.query.account_id;
	const ACCOUNT_TYPE = req.user.account_type;
	const REQUESTS_TYPE = req.query.request_type || 'sample';

	try{
		let REQUESTS_ACCOUNT_QUERY;
		switch(ACCOUNT_TYPE){
			case 'client':
				REQUESTS_ACCOUNT_QUERY = { requestor_model_ref: USER_ID };
				break;
			case 'supplier':
				REQUESTS_ACCOUNT_QUERY = { supplier_model_ref: ACCOUNT_ID };
				break;
			default:
				res.status(200).json({error:true, message: 'missing required field'})
				break;
		}
		const REQUESTS_QUERY = {
			REQUESTS_ACCOUNT_QUERY,
			type : REQUESTS_TYPE
		};
		

		const EXISTING_REQUESTS = await REQUEST_MODEL.find(REQUESTS_QUERY)
			.sort({_id: -1})
			.populate({path: 'product_model_ref', select: 'name'})
			.populate({path:'requestor_model_ref',select:'first_name'})
			.populate({path:'supplier_model_ref',select:'company'})
			.exec();
		const EXISTING_REQUESTS_COUNT = await REQUEST_MODEL.countDocuments(REQUESTS_ACCOUNT_QUERY)
		return res.status(200).json({
			error: false,
			message: 'Success',
			data: EXISTING_REQUESTS,
			count: EXISTING_REQUESTS_COUNT
		})
	}catch(error){
		LOGGER.log('error',`System Error: fetching requests. USER: ${USER_ID}. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch requests.'});
	}
});

const FETCH_REQUEST_DATA=(async(req,res)=>{
	const USER_ID = req.user.sub;
	const REQUEST_ID = req.query.request_id;
	try{
		const EXISTING_USER = await USER_BASE_MODEL.findById(USER_ID).populate('account_status_model_ref').exec();
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'An account with this id does not exist'
			});
		};
		const EXISTING_REQUEST = await REQUEST_MODEL.findById(REQUEST_ID)
			.populate({path:'product_model_ref',select:'name'})
			.populate({path:'requestor_model_ref',select:'first_name last_name client_account_model_ref email mobile address', populate: {path: 'client_account_model_ref', select: 'company'}})
			.exec();

		if (!EXISTING_REQUEST){
			return res.status(200).json({
				error:		true,
				message:	'A request with this id does not exist'
			});
		};

		return res.status(200).json({
			error: false,
			message: 'success',
			data: EXISTING_REQUEST,
		})
	}catch(error){
		LOGGER.log('error',`System Error: fetching request data. USER: ${USER_ID}. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch this request.'});
	}
});

const UPDATE_REQUEST=(async(req,res)=>{
	const USER_ID = req.user.sub;
	const REQUEST_ID = req.query.request_id;
	const payload = req.body;
	try{
		const EXISTING_USER = await USER_BASE_MODEL.findById(USER_ID).populate('account_status_model_ref').exec();
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'An account with this id does not exist'
			});
		};
		const EXISTING_REQUEST = await REQUEST_MODEL.findById(REQUEST_ID)
			.populate({path:'product_model_ref',select:'name'})
			.populate({path:'requestor_model_ref',select:'first_name last_name client_account_model_ref email mobile address', populate: {path: 'client_account_model_ref', select: 'company'}})
			.exec();
	
		if (!EXISTING_REQUEST){
			return res.status(200).json({
				error:		true,
				message:	'A request with this id does not exist'
			});
		};
		const UPDATE_REQUEST_ITEM = {$set:{
			type:					payload?.type,
			industry:				payload?.industry,
			technology:				payload?.technology,
			amount:					payload?.amount,
			expected_annual_ammount:payload?.expected_annual_ammount,
			units:					payload?.units,
			use_case:				payload?.use_case,
			comment:				payload?.comment,
			status:	{
				status:				payload?.request_status_status,
				stage:				payload?.request_status_stage,
				comment:			payload?.request_status_comment,
				date:				EXISTING_REQUEST?.status?.date || new Date(Date.now())
			},
			followup: { 
				status:				true, 
				prospect:			true, 
				days:				payload?.followup_days, 
				price:				payload?.followup_price, 
				comment:			payload?.followup_comment 
			},

		}};

		await REQUEST_MODEL.updateOne({_id: REQUEST_ID},UPDATE_REQUEST_ITEM);
		return res.status(200).send({
			error: false,
			message: 'Changes have been saved'
		})

	}catch(error){
		LOGGER.log('error',`System Error: Request update failed. USER: ${USER_ID}. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not update this request.'});
	}
})

const DELETE_REQUEST=(async(req,res)=>{
	const USER_ID = req.user.sub;
	const REQUEST_ID = req.query.request_id;
	try{
		const EXISTING_USER = await USER_BASE_MODEL.findById(USER_ID).populate('account_status_model_ref').exec();
	
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'An account with this id does not exist'
			});
		};
		const EXISTING_REQUEST = await REQUEST_MODEL.findById(REQUEST_ID)
			.populate({path:'product_model_ref',select:'name'})
			.populate({path:'requestor_model_ref',select:'first_name last_name client_account_model_ref email mobile address', populate: {path: 'client_account_model_ref', select: 'company'}})
			.exec();
	
		if (!EXISTING_REQUEST){
			return res.status(200).json({
				error:		true,
				message:	'A request with this id does not exist'
			});
		};
		
		const EXISTING_PRODUCT = await PRODUCT_MODEL.findById(EXISTING_REQUEST?.product_model_ref);
		const EXISTING_SUPPLIER = await SUPPLIER_MODEL.findById(EXISTING_REQUEST?.supplier_model_ref);
		const EXISTING_CLIENT = await USER_BASE_MODEL.findById(EXISTING_REQUEST?.requestor_model_ref);	


		// requestor
		EXISTING_CLIENT?.requests?.pull(REQUEST_ID);
		EXISTING_CLIENT?.save();

		// supplier
		EXISTING_SUPPLIER?.requests?.pull(REQUEST_ID);
		EXISTING_SUPPLIER?.save();

		// product
		EXISTING_PRODUCT?.requests?.pull(REQUEST_ID);
		EXISTING_PRODUCT?.save();

		await REQUEST_MODEL.deleteOne({_id: REQUEST_ID});
		
		return res.status(200).send({
			error: false,
			message: 'Request deleted successfully',
		});
	}catch(error){
		LOGGER.log('error',`System Error: Request deletion failed. USER: ${USER_ID}. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not delete this request.'});
	}
})

module.exports = {
	CREATE_REQUEST,
	FETCH_ALL_REQUESTS,
	FETCH_REQUEST_DATA,
	UPDATE_REQUEST,
	DELETE_REQUEST
}
