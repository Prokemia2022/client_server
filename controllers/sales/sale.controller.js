/****************************UTILS***************************************/
/****************************MODELS**************************************/
const { USER_BASE_MODEL } = require('../../models/USER.model.js');
const { ORDER_MODEL } = require("../../models/PRODUCT.model.js");
const { SALESPERSON_MODEL } = require("../../models/ACCOUNT.model.js");
/****************************CONFIGS*************************************/
/****************************LIB*****************************************/
const { LOGGER } = require('../../lib/logger.lib.js');
const { ValidationError } = require('../../lib/error.lib.js');
const { QUEUE_NOTIFICATION } = require('../notifications/index.js');
const { NOTIFICATION_SERVICE } = require('../notifications/service.js');
/****************************CONSTANTS*********************************/
/****************************HELPER FUNCTIONS**************************/

/***********************************FUNCTIONS**************************/
const CREATE_ORDER=(async(req, res)=>{
	const ACCOUNT_ID = req.query.salesperson_id;
	const payload = req.body;

	try{
        if(!ACCOUNT_ID){
			return res.status(200).json({
				error:		true,
				message:	'No account ID found.',
			});
		};
		const EXISTING_ACCOUNT = await USER_BASE_MODEL.findOne({salesperson_account_model_ref: ACCOUNT_ID}).populate('account_status_model_ref').exec();
		const EXISTING_SALES_ACCOUNT = await SALESPERSON_MODEL.findOne({_id: ACCOUNT_ID});
		
		if(!EXISTING_ACCOUNT){
			return res.status(200).json({
				error:		true,
				message:	'This user does not have a salesperson account.',
			});
		};

		const NEW_ITEM = await ORDER_MODEL.create({
            user_model_ref:         EXISTING_ACCOUNT?._id,
            salesperson_model_ref:  EXISTING_ACCOUNT?.salesperson_account_model_ref,
			product:                payload.products,
            market:                 {
                industry: payload?.market_industry,
                technology: payload?.market_technology
            },
            client: {
                name: payload?.client_name,
            },
            company: {
                name: payload?.company_name,
                address: payload?.company_address,
                mobile: payload?.company_mobile,
                email: payload?.company_email,
				kra_pin: payload?.kra_pin
            },
            delivery: {
                terms: 	payload?.delivery_terms,
				date:	payload?.delivery_date
            },
            payment: {
                terms:  payload?.payment_terms,
				dueDate:payload?.payment_due_date,
            },
			status:	{
				status:				true,
				stage:				'pending',
				comment: '',
				date:				new Date(Date.now())
			},
		});
		

		/*** Send Notifications to respective referees
		 * Client
		 * Salesperson 
		 * Admin
		 *
		 */
		await NOTIFICATION_SERVICE.ADMIN_NOTIFICATIONS_HANDLER({
			roles: ['super','sales'],
			notificationTypes: ['inapp','fcm',],
			moduleType: 'order.created',
			payload: {
				subject: `Order has been created.`,
				body: `Hey there, a new order has been marked as created!`,
				actionUrl: `/admin/sales/view?order_id=${NEW_ITEM?._id}`,
			},
			priority: 2
		});
		// send notification to user.
		// await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
		// 	userIds: [EXISTING_PRODUCT?.lister?.user_model_ref],
		// 	notificationTypes: ['inapp','fcm'],
		// 	moduleType: 'order.created',
		// 	payload: {
		// 		subject: 'Your order has been created.',
		// 		body: '',
		// 		actionUrl: `/supplier/products/product?product_id=${EXISTING_PRODUCT?._id}`,
		// 		product_id: EXISTING_PRODUCT?._id,
		// 	},
		// 	priority: 2
		// });

		// supplier
		EXISTING_SALES_ACCOUNT?.orders?.push(NEW_ITEM?._id);
		EXISTING_SALES_ACCOUNT?.save();

		return res.status(200).send({
			error: false,
			message: 'Order created successfully'
		})

	}catch(error){
		LOGGER.log('error',`ERROR[CREATE_ORDER]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not create this order.'});
	}
});
const UPDATE_ORDER=(async(req, res)=>{
	const payload = req.body;
	const ORDER_ID = req.query.order_id;
	console.log(ORDER_ID,payload)

	try{
		await ORDER_MODEL.updateOne({_id: ORDER_ID},{$set:{
			product:                payload.products,
			"market.industry": payload?.market_industry,
			"market.technology": payload?.market_technology,
            "client.name":  payload?.client_name,
			"company.name": payload?.company_name,
			"company.address": payload?.company_address,
            "company.mobile": payload?.company_mobile,
            "company.email": payload?.company_email,
            "company.kra_pin": payload?.kra_pin,
            "delivery.terms":     payload?.delivery_terms,
			"delivery.date":    payload?.delivery_date,
            "payment.terms":     payload?.payment_terms,
            "payment.dueDate": payload?.payment_due_date,
			status:	{
				status:				payload?.status,
				stage:				payload?.status_stage,
				comment: '',
				date:				new Date(Date.now())
			},
		}});

		return res.status(200).send({
			error: false,
			message: 'Order updated successfully'
		})

	}catch(error){
		LOGGER.log('error',`ERROR[UPDATE_ORDER]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not update this order.'});
	}
});
const FETCH_ALL_ORDERS=(async(req,res)=>{
	const account_type = req.user.account_type;
	console.log(account_type)
	const ACCOUNT_ID = req.query.account_id;
    const QUERY = req.query.query;
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10;
	let ORDER_QUERY = {
		$or: [
            { "product.name": { $regex: QUERY, $options: 'i' }},
            { "client.name": { $regex: QUERY, $options: 'i' }},
            { "company.name": { $regex: QUERY, $options: 'i' }},
            { "invoiceNumber": { $regex: QUERY, $options: 'i' }},
        ] 
    };
	if(account_type === 'salesperson'){
		ORDER_QUERY.salesperson_model_ref = ACCOUNT_ID ;
	}
    // const ORDER_QUERY = { 
    //     salesperson_model_ref: ACCOUNT_ID,
    //     $or: [
    //         { "product.name": { $regex: QUERY, $options: 'i' }},
    //         { "client.name": { $regex: QUERY, $options: 'i' }},
    //         { "company.name": { $regex: QUERY, $options: 'i' }},
    //         { "invoiceNumber": { $regex: QUERY, $options: 'i' }},
    //     ] 
    // };
	try{
		const EXISTING_ORDERS = await ORDER_MODEL.find(ORDER_QUERY)
			.sort({_id: -1})
			.skip(SKIP_VALUE)
			.limit(10)
			.exec();
		ORDER_QUERY = {}
		if(account_type === 'salesperson'){
			ORDER_QUERY = { salesperson_model_ref: ACCOUNT_ID }
		}
		const EXISTING_ORDERS_COUNT = await ORDER_MODEL.countDocuments(ORDER_QUERY)
		return res.status(200).json({
			error: false,
			message: 'Success',
			data: EXISTING_ORDERS,
			count: EXISTING_ORDERS_COUNT
		})
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH_ALL_ORDERS] ${error}`);
		return res.status(500).json({error:true,message:'we could not fetch orders.'});
	}
});
const FETCH_ORDER_DATA=(async(req,res)=>{
	const ORDER_ID = req.query.order_id;
	try{
		const EXISTING_ORDER = await ORDER_MODEL.findById(ORDER_ID)
			.populate('user_model_ref')
			.populate('salesperson_model_ref')
			.exec();

		if (!EXISTING_ORDER){
			return res.status(200).json({
				error:		true,
				message:	'This order does not exist'
			});
		};

		return res.status(200).json({
			error: false,
			message: 'success',
			data: EXISTING_ORDER,
		})
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH_ORDER_DATA] ${error}`);
		return res.status(500).json({error:true,message:'we could not fetch this order.'});
	}
});
const DELETE_ORDER = (async(req,res)=>{
	const ORDER_ID = req.query.order_id;
	try{
		await ORDER_MODEL.updateOne(
			{_id: ORDER_ID},
			{ $set:{
				"status.status": false,
				"status.stage": 'deleted',
				"status.date": new Date(Date.now() + 30*24*60*60*1000),
				"status.comment":'Order deleted',
				}
			}) 
		// send email notification to notify lister of the deleted product
		return res.status(200).send({
			error: false,
			message: 'Order deleted successfully'
		})
	}catch(error){
		LOGGER.log('error',`
			Function: [DELETE_ORDER],
			ID: ${ORDER_ID}, 
			error: ${error}
		`);
		return res.status(500).json({error:true,message:'Order could not be deleted'});
	}
});

module.exports = {
    CREATE_ORDER,
    FETCH_ALL_ORDERS,
	FETCH_ORDER_DATA,
	UPDATE_ORDER,
	DELETE_ORDER
}