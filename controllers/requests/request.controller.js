/****************************UTILS***************************************/
/****************************MODELS**************************************/
const { USER_BASE_MODEL } = require('../../models/USER.model.js');
const { REQUEST_MODEL, PRODUCT_MODEL } = require("../../models/PRODUCT.model.js");
const { SUPPLIER_MODEL } = require("../../models/ACCOUNT.model.js");
/****************************CONFIGS*************************************/
/****************************LIB*****************************************/
const { LOGGER } = require('../../lib/logger.lib.js');
const { ValidationError } = require('../../lib/error.lib.js');
const { QUEUE_NOTIFICATION } = require('../notifications/index.js');
const { NOTIFICATION_SERVICE } = require('../notifications/service.js');
/****************************CONSTANTS*********************************/
/****************************HELPER FUNCTIONS**************************/
const HANDLE_STATUS_REQUEST_NOTIFICATIONS = async (user,toAdmin,payload,action_url,notificationType,email_type,status) => {
	const userId = user?._id;
	const FCM_TOKEN = user?.fcm_token;
	let notificationPayload;
	switch (notificationType) {
		case 'fcm':
			
		case 'in-app':
			
		case 'email':
			notificationPayload = {
				type:	 			email_type,
				subject: 			`Your ${payload?.type} request has been ${status}.`,
				email:				user?.email,
				body:{
					name:			user?.first_name,
					_id:			payload?._id,
					product_id:		payload?.product_id,
					product_name:	payload?.product_name,
					amount:			payload?.amount,
					units:			payload?.units,
					type:			payload?.type,
					action_url:	    action_url
				}
			};
			await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,notificationPayload);
		default:
			return;
	};
};
const HANDLE_NEW_REQUEST_NOTIFICATIONS = async (user,toAdmin,payload,action_url,notificationType,email_type) => {
	const userId = user?._id;
	const FCM_TOKEN = user?.fcm_token;
	let notificationPayload;
	switch (notificationType) {
		case 'fcm':
			notificationPayload = {
				type:	 'sample.request.created',
				subject: `Hey there, Your ${payload?.type} request has been created.`,
				body:     {
					action_url: 	action_url,
					date: 			payload?.createdAt,
					message: 		'Waiting to be reviewed!',
					type: 			'request',
					token: 			FCM_TOKEN
				}
			};
			await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,notificationPayload);
		case 'in-app':
			notificationPayload = {
				type:	 'sample.request.created',
				subject: `Hey there, Your ${payload?.type} request has been created.`,
				body:     {
					action_url: 	action_url,
					date: 			payload?.createdAt,
					message: 		'Waiting to be reviewed!',
					type: 			'request',
					token: 			user?.fcm_token
				}
			};
		case 'email':
			notificationPayload = {
				type:	 			email_type,
				subject: 			`Your ${payload?.type} request has been created.`,
				email:				user?.email,
				body:{
					name:			user?.first_name,
					_id:			payload?._id,
					product_id:		payload?.product_id,
					product_name:	payload?.product_name,
					amount:			payload?.amount,
					units:			payload?.units,
					type:			payload?.type,
					action_url:	    action_url
				}
			};
			await QUEUE_NOTIFICATION(userId,toAdmin,notificationType,notificationPayload);
		default:
			return;
	};
};

const CREATE_REQUEST=(async(req, res)=>{
	const ACCOUNT_ID = req.user.sub;
	const payload = req.body;

	try{
		const EXISTING_USER = await USER_BASE_MODEL.findOne({_id: ACCOUNT_ID}).populate('account_status_model_ref').exec();
		const EXISTING_PRODUCT = await PRODUCT_MODEL.findById(payload?.product_model_ref);
		
		if(!EXISTING_PRODUCT?.status?.status && (EXISTING_PRODUCT?.status?.stage === 'suspension')){
			return res.status(200).json({
				error:		true,
				message:	'This product does not accept requests at the moment: Product not found.',
			});
		};

		const EXISTING_SUPPLIER = await SUPPLIER_MODEL.findById(payload?.supplier_model_ref).populate({path: 'user_model_ref',select: 'email first_name'}).exec();
		
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
		NEW_REQUEST_ITEM.product_id = EXISTING_PRODUCT?._id;
		NEW_REQUEST_ITEM.product_name = EXISTING_PRODUCT?.name;
		EXISTING_SUPPLIER.email = EXISTING_SUPPLIER?.user_model_ref?.email;
		EXISTING_SUPPLIER.first_name = EXISTING_SUPPLIER?.user_model_ref?.first_name;
/*		

		// Send Email to client/requestor
		let action_url;
		action_url = `https://prokemia.com/dashboard/client/requests/view?request_id=${NEW_REQUEST_ITEM?._id}`;
		await HANDLE_NEW_REQUEST_NOTIFICATIONS(EXISTING_USER,'false',NEW_REQUEST_ITEM,action_url,'email','request.created');
		// send email to lister
		action_url = `https://prokemia.com/dashboard/supplier/requests/view?request_id=${NEW_REQUEST_ITEM?._id}`;
		await HANDLE_NEW_REQUEST_NOTIFICATIONS(EXISTING_SUPPLIER,'false',NEW_REQUEST_ITEM,action_url,'email','supplier.request.created');
		await HANDLE_NEW_REQUEST_NOTIFICATIONS(EXISTING_SUPPLIER,'false',NEW_REQUEST_ITEM,action_url,'fcm','supplier.request.created');
*/
		await NOTIFICATION_SERVICE.ADMIN_NOTIFICATIONS_HANDLER({
			roles: ['super','sales'],
			notificationTypes: ['inapp','fcm',],
			moduleType: `${payload.type}.request.created`,
			payload: {
				subject: `${payload?.type} request has been created.`,
				body: ``,
				actionUrl: `/admin/requests/view?request_id=${NEW_REQUEST_ITEM?._id}`,
			},
			priority: 2
		});
		// send notification to user.
		await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
			userIds: [EXISTING_USER?._id],
			notificationTypes: ['inapp','fcm','email'],
			moduleType: `${payload.type}.request.created`,
			payload: {
				subject: `Your ${payload?.type} request has been created.`,
				email: EXISTING_USER?.email,
				body:{
					name:			EXISTING_USER?.first_name,
					_id:			NEW_REQUEST_ITEM?._id,
					product_id:		NEW_REQUEST_ITEM?.product_id,
					product_name:	NEW_REQUEST_ITEM?.product_name,
					amount:			NEW_REQUEST_ITEM?.amount,
					units:			NEW_REQUEST_ITEM?.units,
					type:			NEW_REQUEST_ITEM?.type,
					action_url:	    `https://prokemia.com/dashboard/client/requests/view?request_id=${NEW_REQUEST_ITEM?._id}`,
				},
				actionUrl: `/client/requests/view?request_id=${NEW_REQUEST_ITEM?._id}`,
			},
			priority: 2
		});
		await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
			userIds: [EXISTING_SUPPLIER?.user_model_ref],
			notificationTypes: ['inapp','fcm','email'],
			moduleType: `${payload.type}.request.created`,
			payload: {
				subject: `A ${payload?.type} request has been created.`,
				email: EXISTING_SUPPLIER?.email,
				body:{
					name:			EXISTING_SUPPLIER?.first_name,
					_id:			NEW_REQUEST_ITEM?._id,
					product_id:		NEW_REQUEST_ITEM?.product_id,
					product_name:	NEW_REQUEST_ITEM?.product_name,
					amount:			NEW_REQUEST_ITEM?.amount,
					units:			NEW_REQUEST_ITEM?.units,
					type:			NEW_REQUEST_ITEM?.type,
					action_url:	    `https://prokemia.com/dashboard/supplier/requests/view?request_id=${NEW_REQUEST_ITEM?._id}`,
				},
				actionUrl: `/supplier/requests/view?request_id=${NEW_REQUEST_ITEM?._id}`,
			},
			priority: 2
		});
		return res.status(200).send({
			error: false,
			message: 'Product deleted successfully'
		})

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
			message: 'Request created successfully'
		})

	}catch(error){
		LOGGER.log('error',`ERROR[CREATE_REQUEST]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not create this request.'});
	}

});

const FETCH_ALL_REQUESTS=(async(req,res)=>{
	const USER_ID = req.user.sub;
	const ACCOUNT_ID = req.query.account_id;
	const ACCOUNT_TYPE = req.user.account_type;
	const REQUESTS_TYPE = req.query.request_type || 'sample';
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10;

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
			.skip(SKIP_VALUE)
			.limit(10)
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

const FETCH_ALL_ADMIN_REQUESTS=(async(req,res)=>{
	const USER_ID = req.user.sub;
	const REQUESTS_TYPE = req.query.request_type || 'sample';
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10;
	try{
		const REQUESTS_QUERY = {
			type : REQUESTS_TYPE
		};

		const EXISTING_REQUESTS = await REQUEST_MODEL.find(REQUESTS_QUERY)
			.sort({_id: -1})
			.populate({path: 'product_model_ref', select: 'name'})
			.populate({path:'requestor_model_ref',select:'first_name'})
			.populate({path:'supplier_model_ref',select:'company'})
			.skip(SKIP_VALUE)
			.limit(10)
			.exec();
		const EXISTING_REQUESTS_COUNT = await REQUEST_MODEL.countDocuments()
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
		// send notification to client
		// EXISTING_REQUEST.product_id = EXISTING_REQUEST?.product_model_ref?._id;
		// EXISTING_REQUEST.product_name = EXISTING_REQUEST?.product_model_ref?.name;
		// let action_url;
		// action_url = `https://prokemia.com/dashboard/client/requests/view?request_id=${EXISTING_REQUEST?._id}`;
		// if(payload.request_status_stage === EXISTING_REQUEST?.status?.stage){
		// 	;
		// }else if(payload.request_status_stage === 'started'){
		// 	await HANDLE_STATUS_REQUEST_NOTIFICATIONS(EXISTING_USER,'false',EXISTING_REQUEST,action_url,'email','request.started',payload?.request_status_stage);
		// }else if(payload.request_status_stage === 'completed'){
		// 	await HANDLE_STATUS_REQUEST_NOTIFICATIONS(EXISTING_USER,'false',EXISTING_REQUEST,action_url,'email','request.completed',payload?.request_status_stage);
		// }else if(payload.request_status_stage === 'rejected'){
		// 	await HANDLE_STATUS_REQUEST_NOTIFICATIONS(EXISTING_USER,'false',EXISTING_REQUEST,action_url,'email','request.rejected',payload?.request_status_stage);
		// };

		if(payload.request_status_stage !== EXISTING_REQUEST?.status?.stage){
			// no notification required as product status has not changed
			let notification_obj;
			switch(payload.request_status_stage){
				case 'started':
					notification_obj = { moduleType: 'request.started', status: 'started'}
					break;
				case 'completed':
					notification_obj = { moduleType: 'request.completed', status: 'completed'}
					break;
				case 'rejected':
					notification_obj = { moduleType: 'request.rejected', status: 'rejected'}
					break;
				default:
					break
			}
	
			await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
				userIds: [EXISTING_USER?._id],
				notificationTypes: ['inapp','fcm','email'],
				moduleType: notification_obj?.moduleType,
				payload: {
					subject: `Your ${EXISTING_REQUEST?.type} request has been ${notification_obj.status}.`,
					actionUrl: `/client/requests/view?request_id=${EXISTING_REQUEST?._id}`,
					email: EXISTING_USER?.email,
					body:{
						name:			EXISTING_USER?.first_name,
						_id:			EXISTING_REQUEST?._id,
						product_id:		EXISTING_REQUEST?.product_id,
						product_name:	EXISTING_REQUEST?.product_name,
						amount:			EXISTING_REQUEST?.amount,
						units:			EXISTING_REQUEST?.units,
						type:			EXISTING_REQUEST?.type,
						action_url:	    `https://prokemia.com/dashboard/client/requests/view?request_id=${EXISTING_REQUEST?._id}`
					}
				},
				priority: 2
			});
		};

		return res.status(200).send({
			error: false,
			message: 'Changes have been saved'
		})

	}catch(error){
		LOGGER.log('error',`System Error: Request update failed. USER: ${USER_ID}. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not update this request.'});
	}
});

const HANDLE_REQUEST_STATUS=(async(req, res)=>{
	const USER_ID = req.user.sub;
	const REQUEST_ID = req.query.request_id;
	const payload = req.body;
	try{
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
		const CLIENT_ID = EXISTING_REQUEST?.requestor_model_ref?._id
		const EXISTING_USER = await USER_BASE_MODEL.findById(CLIENT_ID).populate('account_status_model_ref').exec();
		if (!EXISTING_USER){
			return res.status(200).json({
				error:		true,
				message:	'An account with this id does not exist'
			});
		};
		const UPDATE_REQUEST_ITEM = {$set:{
			status:	{
				status:				payload?.request_status_status,
				stage:				payload?.request_status_stage,
			},
		}};

		await REQUEST_MODEL.updateOne({_id: REQUEST_ID},UPDATE_REQUEST_ITEM);
		// send notification to client
		// EXISTING_REQUEST.product_id = EXISTING_REQUEST?.product_model_ref?._id;
		// EXISTING_REQUEST.product_name = EXISTING_REQUEST?.product_model_ref?.name;
		// let action_url;
		// action_url = `https://prokemia.com/dashboard/client/requests/view?request_id=${EXISTING_REQUEST?._id}`;
		// if(payload.request_status_stage === 'started'){
		// 	await HANDLE_STATUS_REQUEST_NOTIFICATIONS(EXISTING_USER,'false',EXISTING_REQUEST,action_url,'email','request.started',payload?.request_status_stage);
		// }else if(payload.request_status_stage === 'completed'){
		// 	await HANDLE_STATUS_REQUEST_NOTIFICATIONS(EXISTING_USER,'false',EXISTING_REQUEST,action_url,'email','request.completed',payload?.request_status_stage);
		// }else if(payload.request_status_stage === 'rejected'){
		// 	await HANDLE_STATUS_REQUEST_NOTIFICATIONS(EXISTING_USER,'false',EXISTING_REQUEST,action_url,'email','request.rejected',payload?.request_status_stage);
		// };
		if(payload.request_status_stage !== EXISTING_REQUEST?.status?.stage){
			// no notification required as product status has not changed
			let notification_obj;
			switch(payload.request_status_stage){
				case 'started':
					notification_obj = { moduleType: 'request.started', status: 'started'}
					break;
				case 'completed':
					notification_obj = { moduleType: 'request.completed', status: 'completed'}
					break;
				case 'rejected':
					notification_obj = { moduleType: 'request.rejected', status: 'rejected'}
					break;
				default:
					break
			}
	
			await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
				userIds: [EXISTING_USER?._id],
				notificationTypes: ['inapp','fcm','email'],
				moduleType: notification_obj?.moduleType,
				payload: {
					subject: `Your ${EXISTING_REQUEST?.type} request has been ${notification_obj.status}.`,
					actionUrl: `/client/requests/view?request_id=${EXISTING_REQUEST?._id}`,
					email: EXISTING_USER?.email,
					body:{
						name:			EXISTING_USER?.first_name,
						_id:			EXISTING_REQUEST?._id,
						product_id:		EXISTING_REQUEST?.product_id,
						product_name:	EXISTING_REQUEST?.product_name,
						amount:			EXISTING_REQUEST?.amount,
						units:			EXISTING_REQUEST?.units,
						type:			EXISTING_REQUEST?.type,
						action_url:	    `https://prokemia.com/dashboard/client/requests/view?request_id=${EXISTING_REQUEST?._id}`
					}
				},
				priority: 2
			});
		};

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

		// await REQUEST_MODEL.deleteOne({_id: REQUEST_ID});
		await REQUEST_MODEL.updateOne(
			{_id: REQUEST_ID},
			{ $set:{
				"status.status": false,
				"status.stage": 'deleted',
				"status.date": new Date(Date.now() + 30*24*60*60*1000),
				"status.comment":'Request deleted',
				}
			});
		await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
			userIds: [EXISTING_SUPPLIER?.user_model_ref],
			notificationTypes: ['inapp','fcm'],
			moduleType: 'request.deleted',
			payload: {
				subject: `Your ${EXISTING_REQUEST?.type} request has been deleted.`,
				body: '',
				actionUrl: `/supplier/requests/view?request_id=${EXISTING_REQUEST?._id}`,
			},
			priority: 2
		});
		await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
			userIds: [EXISTING_CLIENT?._id],
			notificationTypes: ['inapp','fcm'],
			moduleType: 'request.deleted',
			payload: {
				subject: `Your ${EXISTING_REQUEST?.type} request has been deleted.`,
				body: '',
				actionUrl: `/client/requests/view?request_id=${EXISTING_REQUEST?._id}`,
			},
			priority: 2
		});
		
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
	DELETE_REQUEST,
	HANDLE_REQUEST_STATUS,
	FETCH_ALL_ADMIN_REQUESTS
}
