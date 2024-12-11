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
                phone: payload?.company_mobile,
                email: payload?.company_email
            },
            delivery: {
                terms: payload?.delivery_terms,
            },
            payment: {
                terms: payload?.payment_terms,
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

const FETCH_ALL_ORDERS=(async(req,res)=>{
	const ACCOUNT_ID = req.query.account_id;
    const QUERY = req.query.query;
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10;
    const ORDER_QUERY = { 
        salesperson_model_ref: ACCOUNT_ID,
        // $or: [
        //     { "product.name": QUERY},
        //     { "client.name": QUERY},
        //     { "company.name": QUERY},
        //     { "company.email": QUERY},
        //     { "market.industry": QUERY},
        //     { "market.technology": QUERY},
        // ] 
    };

	try{
		const EXISTING_ORDERS = await ORDER_MODEL.find(ORDER_QUERY)
			.sort({_id: -1})
			.skip(SKIP_VALUE)
			.limit(10)
			.exec();
		const EXISTING_ORDERS_COUNT = await ORDER_MODEL.countDocuments({salesperson_model_ref: ACCOUNT_ID})
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

module.exports = {
    CREATE_ORDER,
    FETCH_ALL_ORDERS,
	FETCH_ORDER_DATA
}