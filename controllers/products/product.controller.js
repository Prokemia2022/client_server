/****************************UTILS***************************************/
const mongoose = require('mongoose');
/****************************MODELS**************************************/
const { USER_BASE_MODEL } = require("../../models/USER.model.js");
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
const { QUEUE_NOTIFICATION } = require('../notifications/index.js');
const NOTIFICATION_SERVICE = require('../notifications/service.js');

/****************************CONSTANTS*********************************/
/****************************HELPER FUNCTIONS**************************/
/****************************FUNCTIONS***********************************/
const CREATE_NEW_PRODUCT = (async(req,res)=>{
	const payload = req.body;
	const ACCOUNT_ID = req.query?.account_id;
	const ACCOUNT_TYPE = req.query?.account_type;
	try{
		if (!ACCOUNT_ID || !ACCOUNT_TYPE){
			throw new ValidationError('Missing parameter requirements')
		}
		let EXISTING_ACCOUNT;
		const ACCOUNT_QUERY = { _id : ACCOUNT_ID,  }; // use the id of the account i.e supplier
		const PROJECTION = { user_model_ref: 1, products: 1, status: 1 };
		
		switch (ACCOUNT_TYPE){
			case 'client':
				EXISTING_ACCOUNT = await CLIENT_MODEL.findOne(ACCOUNT_QUERY,PROJECTION)
				break;
			case 'supplier':
				EXISTING_ACCOUNT = await SUPPLIER_MODEL.findOne(ACCOUNT_QUERY,PROJECTION)
				break;
			case 'admin':
				EXISTING_ACCOUNT = await SUPPLIER_MODEL.findOne(ACCOUNT_QUERY,PROJECTION)
				break;
			default:
				throw new ValidationError('Missing parameter requirements')
		};

		if (!EXISTING_ACCOUNT){
			throw new ValidationError('You dont have an active lister account, set up one now')
		};
		if (EXISTING_ACCOUNT?.status.stage === 'pending'){
			throw new ValidationError('This lister account is yet to be approved.')
		};
		if (EXISTING_ACCOUNT?.status.stage === 'suspended'){
			throw new ValidationError('This lister account has been suspended.Contact support')
		};

		const NEW_PRODUCT_ITEM = await PRODUCT_MODEL.create({
			name:			payload?.name,
			description:	payload?.description,
			expiry:			{ status: payload?.expiry_status == 'True'? true : false , date: payload?.expiry_date },
			supplier:		payload?.supplier,
			lister:			EXISTING_ACCOUNT?._id,
			seller:			payload?.seller,
			industry:		payload?.industry,
			technology:		payload?.technology,
			chemical_name:  payload?.chemical_name,
			function:		payload?.function,
			brand:			payload?.brand,
			features:		payload?.features,
			application:	payload?.application,
			packaging:		payload?.packaging,
			storage:		payload?.storage,
			status:			{ 
								status:		true,
								stage:		'pending',
								comment:	'',
								date:		new Date(Date.now())
							},
			sponsored:		{ status: payload?.sponsored?.status },
			statistics:		{
								views: 0,
								search: 0
							},
		});

		const options = { ordered: true };
		let DOCUMENTS = [];
		for(let i = 0; i < payload?.documents?.length; i++){
			const record = {
				title:				payload?.documents[i]?.title,
				url:				payload?.documents[i]?.url,
				type:				payload?.documents[i]?.type,
				product_model_ref:	NEW_PRODUCT_ITEM?._id,
				user_model_ref:		EXISTING_ACCOUNT?._id,
				industry:			payload?.industry,
				technology:			payload?.technology,
				status:				{
					status:	true,
					stage:	'pending',
					comment:'',
					date:	new Date(Date.now())
				}
			};
			DOCUMENTS.push(record);
		};
		const NEW_DOCUMENTS = await DOCUMENT_MODEL.insertMany(DOCUMENTS, options);

		EXISTING_ACCOUNT?.products?.push(NEW_PRODUCT_ITEM?._id);
		EXISTING_ACCOUNT?.documents?.push(NEW_DOCUMENTS_TEMP_ARR);
		EXISTING_ACCOUNT.save();

		const NEW_DOCUMENTS_TEMP_ARR = NEW_DOCUMENTS?.map((item)=>item?._id)

		const UPDATE_PRODUCT_DOCUMENT = {$set:{documents: NEW_DOCUMENTS_TEMP_ARR}};
		await PRODUCT_MODEL.updateOne({_id: NEW_PRODUCT_ITEM?._id},UPDATE_PRODUCT_DOCUMENT);

		await MARKET_MODEL.updateOne({_id: payload?.industry},{ $push: { 
			documents: { $each: NEW_DOCUMENTS_TEMP_ARR }, 
			products: { $each: [NEW_PRODUCT_ITEM?._id] } 
		}});
		await MARKET_MODEL.updateOne({_id: payload?.technology},{ $push: { 
			documents: { $each: NEW_DOCUMENTS_TEMP_ARR },
			products: { $each: [NEW_PRODUCT_ITEM?._id] } 
		} });
		LOGGER.log('info',`SUCCESS[CREATE_NEW_PRODUCT]: ${NEW_PRODUCT_ITEM?.name}`);

		await NOTIFICATION_SERVICE.ADMIN_NOTIFICATIONS_HANDLER({
			roles: ['super','sales'],
			notificationTypes: ['inapp','fcm',],
			moduleType: 'product.created',
			payload: {
				subject: 'A new product has been added.',
				body: `Hey there, ${NEW_PRODUCT_ITEM?.name} has just been created and is waiting to be reviewed!`,
				actionUrl: `/admin/products/product?product_id=${NEW_PRODUCT_ITEM?._id}`,
				product_id: NEW_PRODUCT_ITEM?._id,
			},
			priority: 2
		});
		// send notification to user.
		await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
			userIds: [EXISTING_ACCOUNT?.user_model_ref],
			notificationTypes: ['inapp','fcm'],
			moduleType: 'product.created',
			payload: {
				subject: 'Your product has been created',
				body: '',
				actionUrl: `/supplier/products/product?product_id=${NEW_PRODUCT_ITEM?._id}`,
				product_id: NEW_PRODUCT_ITEM?._id,
			},
			priority: 2
		});

		return res.status(200).send({
			error: false,
			message: 'Product created successfully'
		})

	}catch(error){
		LOGGER.log('error',`ERROR[CREATE_NEW_PRODUCT]: ${error}`);
		if (error instanceof ValidationError) {
            return res.status(400).json({
                error: true,
                message: error.message
            });
        }
		return res.status(500).json({
			error:true,
			message:'we could not create this product.'
		});
	}
});
// list for products for clients
const FETCH_PRODUCTS =(async(req,res)=>{
	const QUERY = req.query.query;
	try{
		
		const EXISTING_PRODUCTS = await PRODUCT_MODEL.aggregate([
			{
				$match: { "status.stage": "approved" }
			},
			{
				// Populate the lister field
				$lookup: {
					from: 'suppliers', // The lister collection
					localField: 'lister',
					foreignField: '_id',
					as: 'lister', // Will contain populated lister data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$lister',
			},
			{
				// Populate the supplier field
				$lookup: {
					from: 'suppliers', // The supplier collection
					localField: 'supplier',
					foreignField: '_id',
					as: 'supplier', // Will contain populated supplier data
				},
			},
			{
				// Unwind the populated supplier array to a single document
				$unwind: '$supplier',
			},
			{
				// Populate the seller field
				$lookup: {
					from: 'suppliers', // The seller collection
					localField: 'seller',
					foreignField: '_id',
					as: 'seller', // Will contain populated seller data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$seller',
			},
			{
				// Populate the industry field
				$lookup: {
					from: 'markets', // The industry collection
					localField: 'industry',
					foreignField: '_id',
					as: 'industry', // Will contain populated industry data
				},
			},
			{
				// Unwind the populated industry array to a single document
				$unwind: '$industry',
			},
			{
				// Populate the technology field
				$lookup: {
					from: 'markets', // The technology collection
					localField: 'technology',
					foreignField: '_id',
					as: 'technology', // Will contain populated technology data
				},
			},
			{
				// Unwind the populated technology array to a single document
				$unwind: '$technology',
			},
			{
				// Populate the document field
				$lookup: {
					from: 'documents', // The documents collection
					localField: 'documents',
					foreignField: '_id',
					as: 'documents', // Will contain populated documents data
				},
			},
			{
				// Match products whose brand, name, industry, technology, seller, supplier, chemical_name, description, application, starts with the query, e.g., 'rhe'
				$match: {
					$or:[
						{
							"name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"brand": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
						{
							"industry.title": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
						{
							"technology.title": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},
						{
							"seller.company.name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},{
							"supplier.company.name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},{
							"lister.company.name":{
								$regex:	`^${QUERY}`,
								$options:	"i"
							}
						}
					],
				}
			},
		]);
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		EXISTING_PRODUCTS,
		});
	}catch(error){
		LOGGER.log('error',`System Error: Fetching products. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch products.'});
	}
});
// list products by lister
const FETCH_PRODUCTS_BY_OWNER =(async(req,res)=>{
	const ACCOUNT_ID = req.query.account_id;
	const QUERY = req.query.query;
	const STATUS_FILTER = req.query.status_filter || '';
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10  // Used to skip to the next records

	try{
		const EXISTING_PRODUCTS = await PRODUCT_MODEL.aggregate([
			{
				$match: { lister: new mongoose.Types.ObjectId(ACCOUNT_ID) }
			},
			{
				// Populate the lister field
				$lookup: {
					from: 'suppliers', // The lister collection
					localField: 'lister',
					foreignField: '_id',
					as: 'lister', // Will contain populated lister data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$lister',
			},
			{
				// Populate the supplier field
				$lookup: {
					from: 'suppliers', // The supplier collection
					localField: 'supplier',
					foreignField: '_id',
					as: 'supplier', // Will contain populated supplier data
				},
			},
			{
				// Unwind the populated supplier array to a single document
				$unwind: '$supplier',
			},
			{
				// Populate the seller field
				$lookup: {
					from: 'suppliers', // The seller collection
					localField: 'seller',
					foreignField: '_id',
					as: 'seller', // Will contain populated seller data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$seller',
			},
			{
				// Populate the industry field
				$lookup: {
					from: 'markets', // The industry collection
					localField: 'industry',
					foreignField: '_id',
					as: 'industry', // Will contain populated industry data
				},
			},
			{
				// Unwind the populated industry array to a single document
				$unwind: '$industry',
			},
			{
				// Populate the technology field
				$lookup: {
					from: 'markets', // The technology collection
					localField: 'technology',
					foreignField: '_id',
					as: 'technology', // Will contain populated technology data
				},
			},
			{
				// Unwind the populated technology array to a single document
				$unwind: '$technology',
			},
			{
				// Populate the document field
				$lookup: {
					from: 'documents', // The documents collection
					localField: 'documents',
					foreignField: '_id',
					as: 'documents', // Will contain populated documents data
				},
			},
			{
				$project: {
					"name":					1,
					"brand":				1,
					"documents":			1,
					"requests":				1,
					"industry.title":		1,
					"technology.title":		1,
					"status":				1,
					"expiry":				1,
					"createdAt": 1
				}
			},
			{
				// Match products whose brand, name, industry, technology, seller, supplier, chemical_name, description, application, starts with the query, e.g., 'rhe'
				$match: {
					$or:[
						{
							"name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"brand": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
						{
							"industry.title": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
						{
							"technology.title": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},
						{
							"status.stage": {STATUS_FILTER}
						}
					],
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: SKIP_VALUE},
			{ $limit: 10 }
		]);
		
		const EXISTING_PRODUCTS_COUNT = await PRODUCT_MODEL?.countDocuments({lister: ACCOUNT_ID});
		return res.status(200).send({
			error: false,
			message: 'success',
			data:	EXISTING_PRODUCTS,
			count:	EXISTING_PRODUCTS_COUNT
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH_PRODUCTS_BY_OWNER]{USER: ${ACCOUNT_ID} \n\n\n ${error}\n\n\n}`);
		return res.status(500).json({error:true,message:'we could not fetch products by owner.'});

	}
});
// product data by lister
const FETCH_PRODUCT_DATA_BY_OWNER = (async(req,res)=>{
	const PRODUCT_ID = req.query.product_id;
	try{
		const EXISTING_PRODUCT = await PRODUCT_MODEL.findOne({ _id : PRODUCT_ID })
			.populate({path:'supplier',select: 'company _id'})
			.populate({path:'lister',select: 'company _id'})
			.populate({path:'seller',select: 'company _id'})
			.populate({path:'industry',select: 'title'})
			.populate({path:'technology',select: 'title'})
			.populate({path:'documents',select: 'title type status url'})	
			.exec();
		if (!EXISTING_PRODUCT){
			return res.status(200).json({
				error:		true,
				message:	'A product with this id does not exist'
			});
		};

		return res.status(200).send({
			error: false,
			message: 'Product fetched successfully',
			data:	EXISTING_PRODUCT
		})

	}catch(error){
		LOGGER.log('error',`ERROR[FETCH PRODUCT OWNER]{ \n\n\n ${error}\n\n\n }`);
		return res.status(500).json({error:true,message:'we could not fetch product data.'});

	}
});
// product data client side
const FETCH_PRODUCT_DATA_USER = (async(req,res)=>{
	const PRODUCT_ID = req.query.product_id;
	
	try{
		const EXISTING_PRODUCT = await PRODUCT_MODEL.findOne({ _id : PRODUCT_ID })
			.populate({path:'supplier',select: 'company _id'})
			.populate({path:'seller',select: 'company _id'})
			.populate({path:'industry',select: 'title'})
			.populate({path:'technology',select: 'title'})
			.populate({path:'documents',select: 'title type status url'})	
			.exec();
		if (!EXISTING_PRODUCT){
			return res.status(200).json({
				error:		true,
				message:	'A product with this id does not exist'
			});
		};
		await PRODUCT_MODEL.updateOne({_id: PRODUCT_ID},{ "statistics.views": (EXISTING_PRODUCT?.statistics?.views || 0) + 1 })

		return res.status(200).send({
			error: false,
			message: 'Product fetched successfully',
			data:	EXISTING_PRODUCT
		})

	}catch(error){
		LOGGER.log('error',`ERROR[FETCH PRODUCT USER]{ \n\n\n ${error}\n\n\n }`);
		return res.status(500).json({error:true,message:'we could not fetch product data.'});

	}
});

const UPDATE_PRODUCT_DATA = (async(req,res)=>{
	const payload = req.body;
	const PRODUCT_ID = req.query.product_id;
	try{
		const EXISTING_PRODUCT = await PRODUCT_MODEL.findOne({ _id : PRODUCT_ID }).populate({path:'lister',select: 'user_model_ref'});
		if (!EXISTING_PRODUCT){
			return res.status(200).json({
				error:		true,
				message:	'This product does not exist'
			});
		};

		const UPDATE_PRODUCT_DOCUMENT = {$set:{
			name:			payload?.name,
			description:	payload?.description,
			expiry:			{ status: payload?.expiry_status , date: payload?.expiry_date },
			supplier:		payload?.supplier,
			lister:			payload?.lister,
			seller:			payload?.seller,
			industry:		payload?.industry,
			technology:		payload?.technology,
			chemical_name:  payload?.chemical_name,
			function:		payload?.function,
			brand:			payload?.brand,
			features:		payload?.features,
			application:	payload?.application,
			packaging:		payload?.packaging,
			storage:		payload?.storage,
			status:			{ 
				status: payload?.product_stage === 'suspended'? false: true,
				stage: payload?.product_stage,
				comment: '', 
			},
			sponsored:		{ status: payload?.sponsored?.status },
		}};

		await PRODUCT_MODEL.updateOne({_id: PRODUCT_ID},UPDATE_PRODUCT_DOCUMENT);

		if(payload.product_stage !== EXISTING_PRODUCT?.status?.stage){
			// no notification required as product status has not changed
			let notification_obj;
			switch(payload?.product_stage){
				case 'approved':
					notification_obj = { moduleType: 'product.approved', status: 'approved', subject: `${EXISTING_PRODUCT?.name} has been approved by the admin` };
					break;
				case 'suspended':
					notification_obj = { moduleType: 'product.rejected', status: 'rejected', subject: `${EXISTING_PRODUCT?.name} has been rejected by the admin` };
					break;
				default:
					break
			}
	
			await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
				userIds: [EXISTING_PRODUCT?.lister?.user_model_ref],
				notificationTypes: ['inapp','fcm'],
				moduleType: notification_obj?.moduleType,
				payload: {
					subject: notification_obj?.subject,
					body: '',
					actionUrl: `/supplier/products/product?product_id=${EXISTING_PRODUCT?._id}`,
					product_id: EXISTING_PRODUCT?._id,
				},
				priority: 2
			});
		};
		return res.status(200).send({
			error: false,
			message: 'Product updated successfully',
		});
	}catch(error){
		LOGGER.log('error',`
			Function: [UPDATE_PRODUCT_DATA],
			title: Failed,
			ID: ${PRODUCT_ID}, 
			module: product,
			message:${error},
		`);
		return res.status(500).json({error:true,message:'Product could not be updated.'});
	}
});

const DELETE_PRODUCT = (async(req,res)=>{
	const PRODUCT_ID = req.query.product_id;
	try{
		const EXISTING_PRODUCT = await PRODUCT_MODEL.findOne({ _id : PRODUCT_ID }).populate({path:'lister',select: 'user_model_ref'}).exec();
		if (!EXISTING_PRODUCT){
			return res.status(200).json({
				error:		true,
				message:	'A product with this id does not exist'
			});
		};
		await MARKET_MODEL.updateMany({},{ $pull: { products: { $in: [PRODUCT_ID] }, documents: { $in: EXISTING_PRODUCT?.documents } }});
		await SUPPLIER_MODEL.updateMany({_id: EXISTING_PRODUCT?.lister},{ $pull: { products: { $in: [PRODUCT_ID] }, documents: { $in: EXISTING_PRODUCT?.documents } }})
		await DOCUMENT_MODEL.updateMany(
			{product_model_ref: PRODUCT_ID},
			{$set:{
				"status.status":false,
				"status.stage":'delete',
				"status.comment":'Product deleted',
				"status.date":new Date(Date.now())
			}}
		);
		//await PRODUCT_MODEL.deleteOne({_id: PRODUCT_ID}); delete product after 30 days
		await PRODUCT_MODEL.updateOne(
			{_id: PRODUCT_ID},
			{ $set:{
				"status.status": false,
				"status.stage": 'deleted',
				"status.date": new Date(Date.now() + 30*24*60*60*1000),
				"status.comment":'Product deleted',
				}
			}) // delete product after 30 days
		
		await NOTIFICATION_SERVICE.ADMIN_NOTIFICATIONS_HANDLER({
			roles: ['super','sales'],
			notificationTypes: ['inapp','fcm',],
			moduleType: 'product.deleted',
			payload: {
				subject: `Product has been deleted.`,
				body: `Hey there, ${EXISTING_PRODUCT?.name} has been marked as deleted!`,
				actionUrl: `/admin/products/product?product_id=${EXISTING_PRODUCT?._id}`,
				product_id: EXISTING_PRODUCT?._id,
			},
			priority: 2
		});
		// send notification to user.
		await NOTIFICATION_SERVICE.USER_NOTIFICATIONS_HANDLER({
			userIds: [EXISTING_PRODUCT?.lister?.user_model_ref],
			notificationTypes: ['inapp','fcm'],
			moduleType: 'product.deleted',
			payload: {
				subject: 'Your product has been deleted.',
				body: 'Contact support for reactivation of the product',
				actionUrl: `/supplier/products/product?product_id=${EXISTING_PRODUCT?._id}`,
				product_id: EXISTING_PRODUCT?._id,
			},
			priority: 2
		});
		return res.status(200).send({
			error: false,
			message: 'Product deleted successfully'
		})
	}catch(error){
		LOGGER.log('error',`
			Function: [DELETE_PRODUCT],
			ID: ${PRODUCT_ID}, 
			error: ${error}
		`);
		return res.status(500).json({error:true,message:'Product could not be deleted'});
	}
});
// list products for admin
const FETCH_ALL_PRODUCTS_FOR_ADMIN=(async(req,res)=>{
	const QUERY = req.query.query;
	const STATUS_FILTER = req.query.status_filter || '';
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10  // Used to skip to the next records
	try{
		const EXISTING_PRODUCTS = await PRODUCT_MODEL.aggregate([
			{
				// Populate the lister field
				$lookup: {
					from: 'suppliers', // The lister collection
					localField: 'lister',
					foreignField: '_id',
					as: 'lister', // Will contain populated lister data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$lister',
			},
			{
				// Populate the supplier field
				$lookup: {
					from: 'suppliers', // The supplier collection
					localField: 'supplier',
					foreignField: '_id',
					as: 'supplier', // Will contain populated supplier data
				},
			},
			{
				// Unwind the populated supplier array to a single document
				$unwind: '$supplier',
			},
			{
				// Populate the seller field
				$lookup: {
					from: 'suppliers', // The seller collection
					localField: 'seller',
					foreignField: '_id',
					as: 'seller', // Will contain populated seller data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$seller',
			},
			{
				// Populate the industry field
				$lookup: {
					from: 'markets', // The industry collection
					localField: 'industry',
					foreignField: '_id',
					as: 'industry', // Will contain populated industry data
				},
			},
			{
				// Unwind the populated industry array to a single document
				$unwind: '$industry',
			},
			{
				// Populate the technology field
				$lookup: {
					from: 'markets', // The technology collection
					localField: 'technology',
					foreignField: '_id',
					as: 'technology', // Will contain populated technology data
				},
			},
			{
				// Unwind the populated technology array to a single document
				$unwind: '$technology',
			},
			{
				// Populate the document field
				$lookup: {
					from: 'documents', // The documents collection
					localField: 'documents',
					foreignField: '_id',
					as: 'documents', // Will contain populated documents data
				},
			},
			{
				$project: {
					"name":					1,
					"brand":				1,
					"documents":			1,
					"requests":				1,
					"industry.title":		1,
					"technology.title":		1,
					"supplier.company":		1,
					"seller.company":		1,
					"lister.company":		1,
					"status":				1,
					"expiry":				1,
					"statistics":			1,
					"createdAt":			1
				}
			},
			{
				// Match products whose brand, name, industry, technology, seller, supplier, chemical_name, description, application, starts with the query, e.g., 'rhe'
				$match: {
					$or:[
						{
							"name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"brand": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
						{
							"industry.title": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
						{
							"technology.title": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},
						{
							"supplier.company.name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},
						{
							"seller.company.name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},{
							"lister.company.name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},
						{
							"status.stage": {STATUS_FILTER}
						}
					],
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: SKIP_VALUE},
			{ $limit: 10 }
		]);
		
		const EXISTING_PRODUCTS_COUNT = await PRODUCT_MODEL?.countDocuments();
		return res.status(200).send({
			error: false,
			message: 'success',
			data:	EXISTING_PRODUCTS,
			count:	EXISTING_PRODUCTS_COUNT
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH PRODUCTS ADMIN]{\n\n\n ${error}\n\n\n}`);
		return res.status(500).json({error:true,message:'we could not fetch products for admin.'});
	}
});

module.exports = {
	/*****************************SUPPLIER_LISTER************************************/
	CREATE_NEW_PRODUCT,
	FETCH_PRODUCTS_BY_OWNER,
	FETCH_PRODUCT_DATA_BY_OWNER,
	FETCH_ALL_PRODUCTS_FOR_ADMIN,
	DELETE_PRODUCT,
	UPDATE_PRODUCT_DATA,
	/*****************************USER***********************************************/
	FETCH_PRODUCTS,
	FETCH_PRODUCT_DATA_USER
}