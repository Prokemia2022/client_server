/****************************UTILS***************************************/
const mongoose = require('mongoose');
/****************************MODELS**************************************/
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../../models/USER.model.js");
const { DOCUMENT_MODEL, PRODUCT_MODEL, REQUEST_MODEL, MARKET_MODEL } = require("../../models/PRODUCT.model.js");
const { SUPPLIER_MODEL, CLIENT_MODEL } = require("../../models/ACCOUNT.model.js");
/****************************CONFIGS*************************************/
/****************************LIB*****************************************/
const { LOGGER } = require('../../lib/logger.lib.js');
/****************************FUNCTIONS***********************************/

const FETCH_USER_DATA=(async(req,res)=>{
    const USER_ID = req.user?.sub;
    try{
		let EXISTING_ACCOUNT;
		switch (req?.user?.account_type){
			case 'client':
				EXISTING_ACCOUNT = await USER_BASE_MODEL.findById(USER_ID)
					.populate('account_status_model_ref')
					.populate({
						path:'client_account_model_ref',
						populate: [{
							path: 'products',
							select: 'name lister seller supplier documents industry technology',
							populate: [
								{path: 'lister', select: 'company',},
								{path: 'supplier', select: 'company'},
								{path: 'seller', select: 'company'}
							]
						}]
					}).exec();
				break;
			case 'supplier':
				EXISTING_ACCOUNT = await USER_BASE_MODEL.findById(USER_ID)
					.populate('account_status_model_ref')
					.populate({
						path:'supplier_account_model_ref',
						populate:[
							{ path:'industry', select:'title'},
							{ path:'technology',select:'title'}
						]})
					.exec();
				break;
			case 'admin':
				EXISTING_ACCOUNT = await USER_BASE_MODEL.findById(USER_ID)
					.populate('account_status_model_ref')
					.populate('admin_account_model_ref')
					.exec();
				break;
			default:
				break;
		};
        return res.status(200).send({
            error: false,
            data:  EXISTING_ACCOUNT
        });
    }catch(error){
		LOGGER.log('error',`ERROR[FETCH USER DATA]:${error}`)
        return res.status(500).json({
            error:true,
            message: 'We are sorry we could not find your data'
        });
    }
});

const LIST_SUPPLIERS_ACCOUNTS_DATA=(async(req,res)=>{
    try{
		const projection = { company: 1, user_model_ref: 1, image_url: 1 };
		const SUPPLIERS_LIST = await SUPPLIER_MODEL.find({},projection);
		return res.status(200).send({
            error:null,
            data: SUPPLIERS_LIST,
			count:SUPPLIERS_LIST?.length
        });
    }catch(error){
        LOGGER.log('error',`${ip} - System Error-[Fetching list of suppliers, id]`,error)
        return res.sendStatus(500);
    }
});

const FETCH_ACCOUNT_DATA=(async(req, res)=>{
	const ACCOUNT_ID = req.query.account_id;
	const ACCOUNT_TYPE = req.query.account_type;
    try{
		let ACCOUNT_DATA ;
		switch (ACCOUNT_TYPE){
			case 'supplier':
				ACCOUNT_DATA = await SUPPLIER_MODEL.aggregate([
					{
						$match: { 
							_id: new mongoose.Types.ObjectId(ACCOUNT_ID),
							
						}
					},
					{
						// Populate the lister field
						$lookup: {
							from: 'products', // The product collection
							localField: 'product_model_ref',
							foreignField: '_id',
							as: 'product_model_ref', // Will contain populated product_model_ref data
						},
					},
					{
						// Unwind the populated lister array to a single document
						$unwind: '$product_model_ref',
					}
				])

				const projection = { company: 1, image_url: 1, type: 1, description: 1, products: 1, consultants: 1, markets: 1, documents: 1 };
				ACCOUNT_DATA = await SUPPLIER_MODEL.findOne({_id: ACCOUNT_ID},projection)
					.populate({
						path:'products',
						select:'name lister seller supplier brand chemical_name application features industry technology',
						populate:[
							{path:'industry',select:'title'},
							{path:'technology',select:'title'},
							{path:'supplier',select: 'company'},
							{path:'seller',select:'company'},
							{path:'lister',select:'company'}
						]})
					.populate({path:'markets',select:'title'}).exec();
				break;
			default:
				return res.status(200).send({
					error:true,
					message: 'Missing details'
				});
		}
		return res.status(200).send({
            error:null,
            data: ACCOUNT_DATA,
        });
    }catch(error){
        LOGGER.log('error',`System Error-[Fetching account data, id]`,error)
        return res.sendStatus(500);
    }

});

const FETCH_SUPPLIER_ACCOUNT_FOR_PAGE=(async(req,res)=>{
	// Piece the information for a particular supplier
	// Products, Documents, Bio
	try{
		const SUPPLIER_ID = req.query.supplier_id;
		const DOCS_PAGE = req.query.docs_page || 1;
		const DOCS_SKIP_VALUE = (parseInt(DOCS_PAGE) - 1) * 10  // Used to skip to the next records
		
		const PRODS_PAGE = req.query.prods_page || 1;
		const PRODS_SKIP_VALUE = (parseInt(PRODS_PAGE) - 1) * 10  // Used to skip to the next records

		
		let RETURN_DATA;
		// check whether supplier account exists and is approved
		const projection = { company: 1, image_url: 1, type: 1, description: 1 };
		const EXISTING_SUPPLIER = await SUPPLIER_MODEL.findOne({_id: SUPPLIER_ID},projection);

		if (!EXISTING_SUPPLIER || EXISTING_SUPPLIER?.status?.stage === 'suspended'){
			return res.status(200).json({
				error:		true,
				message:	'This supplier does not exist.'
			});
		};
		// find and return approved documents
		const EXISTING_DOCUMENTS = await DOCUMENT_MODEL.aggregate([
			{
				$match: { 
					user_model_ref: new mongoose.Types.ObjectId(SUPPLIER_ID),
					"status.stage": "approved"
				}
			},
			
			{
				// Populate the lister field
				$lookup: {
					from: 'products', // The product collection
					localField: 'product_model_ref',
					foreignField: '_id',
					as: 'product_model_ref', // Will contain populated product_model_ref data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$product_model_ref',
			},
			{
				$project: {
					"title":						1,
					"url":							1,
					"type":							1,
					"product_model_ref._id":		1,
					"product_model_ref.name":		1,
					"_id":							1
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: DOCS_SKIP_VALUE},
			{ $limit: 10 }
		])
		// find products
		const EXISTING_PRODUCTS = await PRODUCT_MODEL.aggregate([
			{
				$match: { 
					lister: new mongoose.Types.ObjectId(SUPPLIER_ID),
					"status.stage": "approved" 
				}
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
				$project: {
					"name":							1,
					"_id":							1,
					"brand":						1,
					"chemical_name":				1,
					"application":					1,
					"features":						1,
					"industry.title":				1,
					"technology.title":				1,
					"lister":						1,
					"seller._id":					1,
					"seller.company.name":			1,
					"supplier._id":					1,
					"supplier.company.name":		1,
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: PRODS_SKIP_VALUE},
			{ $limit: 10 }
		])
		// Compile data
		RETURN_DATA={
			company:		EXISTING_SUPPLIER,
			documents:		EXISTING_DOCUMENTS,
			documents_count:await DOCUMENT_MODEL.countDocuments({user_model_ref:SUPPLIER_ID,"status.stage":'approved'}),
			products:		EXISTING_PRODUCTS,
			products_count: await PRODUCT_MODEL.countDocuments({
				lister:SUPPLIER_ID,
				"status.stage":'approved'
			})
		}
		await SUPPLIER_MODEL?.updateOne({_id:SUPPLIER_ID},{"statistics.views": (EXISTING_SUPPLIER?.statistics?.views || 0) + 1 })
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		RETURN_DATA,
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH SUPPLIER DATA]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({
			error:true,
			message:'we could not fetch this suppliers account.'
		});
	}
})


const FETCH_ALL_SUPPLIERS_FOR_ADMIN=(async(req,res)=>{
	const QUERY = req.query.query.toLowerCase();
	const STATUS_FILTER = req.query.status_filter || '';
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10  // Used to skip to the next records
	
	try{
		const EXISTING_SUPPLIERS = await SUPPLIER_MODEL.aggregate([
			{
				$project: {
					"company":				1,
					"image_url":			1,
					"type":					1,
					"products":				1,
					"documents":			1,
					"requests":				1,
					"status":				1,	
					"createdAt":			1
				}
			},
			{
				$match: {
					$or:[
						{
							"company.name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"company.email": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"company.mobile": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
						{
							"status.stage": {STATUS_FILTER}
						}
					],
				}
			},
			{ $sort: { createdAt: -1}},
			{ $skip: SKIP_VALUE},
			{ $limit: 10 }
		]);

		const EXISTING_SUPPLIERS_COUNT = await SUPPLIER_MODEL?.countDocuments();
		return res.status(200).send({
			error: false,
			message: 'success',
			data:	EXISTING_SUPPLIERS,
			count:	EXISTING_SUPPLIERS_COUNT
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH ALL SUPPLIERS ADMIN]: ${error}`);
		return res.status(500).json({error:true,message:'we could not fetch suppliers.'});

	}
})

const FETCH_SUPPLIER_ACCOUNT_FOR_ADMIN=(async(req,res)=>{
	// Piece the information for a particular supplier
	// Products, Documents, Bio
	try{
		const SUPPLIER_ID = req.query.supplier_id;
		const REQUEST_TYPES = req.query.request_type;

		const DOCS_PAGE = req.query.docs_page || 1;
		const DOCS_SKIP_VALUE = (parseInt(DOCS_PAGE) - 1) * 10  // Used to skip to the next records
		
		const PRODS_PAGE = req.query.prods_page || 1;
		const PRODS_SKIP_VALUE = (parseInt(PRODS_PAGE) - 1) * 10  // Used to skip to the next records

		const REQS_PAGE = req.query.reqs_page || 1;
		const REQS_SKIP_VALUE = (parseInt(REQS_PAGE) - 1) * 10  // Used to skip to the next records

		
		let RETURN_DATA;
		// check whether supplier account exists and is approved
		const projection = { company: 1, image_url: 1, type: 1, description: 1, user_model_ref: 1, statistics: 1, industry: 1, technology: 1, status: 1};
		const EXISTING_SUPPLIER = await SUPPLIER_MODEL.findOne({_id: SUPPLIER_ID},projection).populate({path:'user_model_ref',select:'first_name last_name email mobile'}).populate({path:'industry',select: 'title'}).populate({path:'technology',select: 'title'}).exec();

		if (!EXISTING_SUPPLIER || EXISTING_SUPPLIER?.status?.stage === 'suspended'){
			return res.status(200).json({
				error:		true,
				message:	'This supplier does not exist.'
			});
		};

		// find and return approved documents
		const EXISTING_DOCUMENTS = await DOCUMENT_MODEL.aggregate([
			{
				$match: { 
					user_model_ref: new mongoose.Types.ObjectId(SUPPLIER_ID),
				}
			},
			
			{
				// Populate the lister field
				$lookup: {
					from: 'products', // The product collection
					localField: 'product_model_ref',
					foreignField: '_id',
					as: 'product_model_ref', // Will contain populated product_model_ref data
				},
			},
			{
				// Unwind the populated lister array to a single document
				$unwind: '$product_model_ref',
			},
			{
				$project: {
					"title":						1,
					"url":							1,
					"type":							1,
					"product_model_ref._id":		1,
					"product_model_ref.name":		1,
					"_id":							1
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: DOCS_SKIP_VALUE},
			{ $limit: 10 }
		])
		// find products
		const EXISTING_PRODUCTS = await PRODUCT_MODEL.aggregate([
			{
				$match: { 
					lister: new mongoose.Types.ObjectId(SUPPLIER_ID),
				}
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
				$project: {
					"name":							1,
					"_id":							1,
					"brand":						1,
					"chemical_name":				1,
					"application":					1,
					"features":						1,
					"industry.title":				1,
					"technology.title":				1,
					"lister":						1,
					"seller._id":					1,
					"seller.company.name":			1,
					"supplier._id":					1,
					"supplier.company.name":		1,
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: PRODS_SKIP_VALUE},
			{ $limit: 10 }
		])
		// Find REQUESTS
		const EXISTING_REQUESTS = await REQUEST_MODEL.aggregate([
			{
				$match: { 
					supplier_model_ref: new mongoose.Types.ObjectId(SUPPLIER_ID),
					type:				REQUEST_TYPES
				}
			},
			{
				// Populate the product field
				$lookup: {
					from: 'products', // The products collection
					localField: 'product_model_ref',
					foreignField: '_id',
					as: 'product_model_ref', // Will contain populated product data
				},
			},
			{
				// Unwind the populated product array to a single document
				$unwind: '$product_model_ref',
			},
			{
				// Populate the requestor field
				$lookup: {
					from: 'users', // The seller collection
					localField: 'requestor_model_ref',
					foreignField: '_id',
					as: 'requestor_model_ref', // Will contain populated requestor data
				},
			},
			{
				// Unwind the populated requestor array to a single document
				$unwind: '$requestor_model_ref',
			},
			{
				$project: {
					"amount":						1,
					"_id":							1,
					"units":						1,
					"createdAt":					1,
					"status":						1,
					"industry":						1,
					"technology":					1,
					"requestor_model_ref.first_name":1,
					"type":							1,
					"product_model_ref.name":		1,
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: REQS_SKIP_VALUE},
			{ $limit: 10 }
		])
		// Compile data
		RETURN_DATA={
			company:		EXISTING_SUPPLIER,
			/*********************documents******************************/
			documents:		EXISTING_DOCUMENTS,
			documents_count:await DOCUMENT_MODEL.countDocuments({user_model_ref:SUPPLIER_ID}),
			/*********************products*******************************/
			products:		EXISTING_PRODUCTS,
			products_count: await PRODUCT_MODEL.countDocuments({
				lister:SUPPLIER_ID,
			}),
			products_analytics: {
				rejected:	await PRODUCT_MODEL.countDocuments({
					lister: SUPPLIER_ID,
					"status.stage": 'rejected'
				}),
				drafts:	await PRODUCT_MODEL.countDocuments({
					lister: SUPPLIER_ID,
					"status.stage": 'draft'
				}),
				pending:	await PRODUCT_MODEL.countDocuments({
					lister: SUPPLIER_ID,
					"status.stage": 'pending'
				}),
				approved:	await PRODUCT_MODEL.countDocuments({
					lister: SUPPLIER_ID,
					"status.stage": 'approved'
				}),
			},
			/*******************requests*********************************/
			requests:		EXISTING_REQUESTS,
			requests_count: await REQUEST_MODEL.countDocuments({
				supplier_model_ref:	SUPPLIER_ID,
				type:				REQUEST_TYPES
			}),
			samples_analytics: {
				rejected:	await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'sample',
					"status.stage":		'rejected'
				}),
				processing:		await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'sample',
					"status.stage":		'processing'
				}),
				pending:	await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'sample',
					"status.stage":		'pending'
				}),
				console:	await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'sample',
					"status.stage":		'completed'
				}),
			},
			quotes_analytics: {
				rejected:	await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'quote',
					"status.stage":		'rejected'
				}),
				processing:		await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'quote',
					"status.stage":		'processing'
				}),
				pending:	await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'quote',
					"status.stage":		'pending'
				}),
				console:	await REQUEST_MODEL.countDocuments({
					supplier_model_ref:	SUPPLIER_ID,
					type:				'quote',
					"status.stage":		'completed'
				}),
			},

		}
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		RETURN_DATA,
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH SUPPLIER DATA]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({
			error:true,
			message:'we could not fetch this suppliers account.'
		});
	}
})

const FETCH_ALL_CLIENTS_FOR_ADMIN=(async(req,res)=>{
	const QUERY = req.query.query.toLowerCase();
	const PAGE = req.query.page || 1;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10  // Used to skip to the next records
	
	try{
		const EXISTING_CLIENTS = await USER_BASE_MODEL.aggregate([
			{
				$match: { 
					account_type:	'client'
				}
			},
			{
				// Populate the client field
				$lookup: {
					from: 'clients', // The client collection
					localField: 'client_account_model_ref',
					foreignField: '_id',
					as: 'client_account_model_ref', // Will contain populated client data
				},
			},
			{
				// Unwind the populated client array to a single document
				$unwind: '$client_account_model_ref',
			},
			{
				// Populate the client account status field
				$lookup: {
					from: 'account_statuses', // The client collection
					localField: 'account_status_model_ref',
					foreignField: '_id',
					as: 'account_status_model_ref', // Will contain populated client data
				},
			},
			{
				// Unwind the populated client array to a single document
				$unwind: '$account_status_model_ref',
			},
			{
				$project: {
					"client_account_model_ref":		1,
					"profile_image_url":			1,
					"first_name":					1,
					"email":						1,
					"mobile":						1,
					"requests":						1,
					"_id":							1,	
					"createdAt":					1,
					"account_status_model_ref":		1
				}
			},
			{
				$match: {
					$or:[
						{
							"first_name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"email": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"mobile": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"company.name": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},
					],
				}
			},
			{ $sort: { createdAt: -1}},
			{ $skip: SKIP_VALUE},
			{ $limit: 10 }
		]);

		const EXISTING_CLIENTS_COUNT = await USER_BASE_MODEL?.countDocuments({account_type: 'client'});
		return res.status(200).send({
			error: false,
			message: 'success',
			data:	EXISTING_CLIENTS,
			count:	EXISTING_CLIENTS_COUNT
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH ALL CLIENTS ADMIN]: ${error}`);
		return res.status(500).json({error:true,message:'we could not fetch clients.'});

	}
})

const FETCH_CLIENT_ACCOUNT_FOR_ADMIN=(async(req,res)=>{
	// Piece the information for a particular client
	// Products, Documents, Bio
	try{
		const CLIENT_ID = req.query.client_id;
		const REQUEST_TYPES = req.query.request_type;

		const PRODS_PAGE = req.query.prods_page || 1;
		const PRODS_SKIP_VALUE = (parseInt(PRODS_PAGE) - 1) * 10  // Used to skip to the next records

		const REQS_PAGE = req.query.reqs_page || 1;
		const REQS_SKIP_VALUE = (parseInt(REQS_PAGE) - 1) * 10  // Used to skip to the next records

		
		let RETURN_DATA;
		// check whether supplier account exists and is approved
		const projection = { 
			first_name:					1, 
			profile_image_url:			1, 
			last_name:					1,
			email:						1,
			mobile:						1,
			account_type:				1, 
			client_account_model_ref:	1, 
			account_status_model_ref:	1,
			createdAt:					1
		};
		const EXISTING_CLIENT = await USER_BASE_MODEL.findOne({_id: CLIENT_ID},projection).populate('client_account_model_ref').populate('account_status_model_ref').exec();
		if (!EXISTING_CLIENT){
			return res.status(200).json({
				error:		true,
				message:	'This client does not exist.'
			});
		};


		// find products
		const EXISTING_PRODUCTS = await PRODUCT_MODEL.aggregate([
			{
				$match: { 
					"_id": {$in: EXISTING_CLIENT?.client_account_model_ref?.products
					}
				}
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
				$project: {
					"name":							1,
					"_id":							1,
					"brand":						1,
					"chemical_name":				1,
					"application":					1,
					"features":						1,
					"industry.title":				1,
					"technology.title":				1,
					"lister":						1,
					"seller._id":					1,
					"seller.company.name":			1,
					"supplier._id":					1,
					"supplier.company.name":		1,
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: PRODS_SKIP_VALUE},
			{ $limit: 10 }
		])
		// Find REQUESTS
		const EXISTING_REQUESTS = await REQUEST_MODEL.aggregate([
			{
				$match: { 
					requestor_model_ref: new mongoose.Types.ObjectId(CLIENT_ID),
					type:				REQUEST_TYPES
				}
			},
			{
				// Populate the product field
				$lookup: {
					from: 'products', // The products collection
					localField: 'product_model_ref',
					foreignField: '_id',
					as: 'product_model_ref', // Will contain populated product data
				},
			},
			{
				// Unwind the populated product array to a single document
				$unwind: '$product_model_ref',
			},
			{
				// Populate the requestor field
				$lookup: {
					from: 'users', // The seller collection
					localField: 'requestor_model_ref',
					foreignField: '_id',
					as: 'requestor_model_ref', // Will contain populated requestor data
				},
			},
			{
				// Unwind the populated requestor array to a single document
				$unwind: '$requestor_model_ref',
			},
			{
				$project: {
					"amount":						1,
					"_id":							1,
					"units":						1,
					"createdAt":					1,
					"status":						1,
					"industry":						1,
					"technology":					1,
					"requestor_model_ref.first_name":1,
					"type":							1,
					"product_model_ref.name":		1,
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: REQS_SKIP_VALUE},
			{ $limit: 10 }
		])
		// Compile data
		RETURN_DATA={
			user_data:		EXISTING_CLIENT,
			/*********************products*******************************/
			products:		EXISTING_PRODUCTS,
			products_count: EXISTING_CLIENT?.client_account_model_ref?.products?.length,
			/*******************requests*********************************/
			requests:		EXISTING_REQUESTS,
			requests_count: await REQUEST_MODEL.countDocuments({
				requestor_model_ref:	CLIENT_ID,
				type:				REQUEST_TYPES
			}),
			samples_analytics: {
				rejected:	await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'sample',
					"status.stage":		'rejected'
				}),
				processing:		await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'sample',
					"status.stage":		'processing'
				}),
				pending:	await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'sample',
					"status.stage":		'pending'
				}),
				console:	await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'sample',
					"status.stage":		'completed'
				}),
			},
			quotes_analytics: {
				rejected:	await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'quote',
					"status.stage":		'rejected'
				}),
				processing:		await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'quote',
					"status.stage":		'processing'
				}),
				pending:	await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'quote',
					"status.stage":		'pending'
				}),
				console:	await REQUEST_MODEL.countDocuments({
					requestor_model_ref:	CLIENT_ID,
					type:				'quote',
					"status.stage":		'completed'
				}),
			},

		};
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		RETURN_DATA,
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH CLIENT DATA]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({
			error:true,
			message:'we could not fetch this client account.'
		});
	}
})

const HANDLE_ACCOUNT_DELETION=(async(req,res)=>{
	/*
	 * This Function handles the deletion of an account i.e supplier, client, consultants 
	 * It does not delete the users account.
	 *
	 *
	 */
	const ACCOUNT_ID = req.query.account_id;
	const ACCOUNT_TYPE = req.query.account_type;
	let EXISTING_ACCOUNT;

	try{
		switch (ACCOUNT_TYPE){
			case 'client':
				EXISTING_ACCOUNT = await USER_BASE_MODEL.findById(ACCOUNT_ID);
				await REQUEST_MODEL.deleteMany({requestor_model_ref: ACCOUNT_ID})
				await CLIENT_MODEL.deleteOne({user_model_ref: ACCOUNT_ID})
				await ACCOUNT_STATUS_MODEL.deleteOne({user_model_ref: ACCOUNT_ID})	
				await USER_BASE_MODEL.deleteOne({_id: ACCOUNT_ID})
				break;
			case 'supplier':
				EXISTING_ACCOUNT = await SUPPLIER_MODEL.findById(ACCOUNT_ID,{products: 1, documents: 1, requests: 1,user_model_ref: 1})
				
				// Delete products
				await PRODUCT_MODEL.deleteMany({lister: ACCOUNT_ID});
				await REQUEST_MODEL.deleteMany({supplier_model_ref: ACCOUNT_ID})

				await DOCUMENT_MODEL.deleteMany({user_model_ref: ACCOUNT_ID})
				await MARKET_MODEL.updateMany({},{ $pull: { 
					products: { $in: EXISTING_ACCOUNT?.products }, 
					documents: { $in: EXISTING_ACCOUNT?.documents } 
				}});
				await SUPPLIER_MODEL.deleteOne({_id: ACCOUNT_ID})
				await ACCOUNT_STATUS_MODEL.deleteOne({user_model_ref: EXISTING_ACCOUNT?.user_model_ref})	
				await USER_BASE_MODEL.deleteOne({_id: EXISTING_ACCOUNT?.user_model_ref})
				break;
			default:
				break;
		}

		return res.status(200).json({
			error:		false,
			message:	'Account deleted',
		});
	}catch(err){
		LOGGER.log('error',`ERROR:[account could not be deleted]`,err)
		return res.status(500).json({
			error:	true,
			message:'Your account could not be deleted. Try again later.'
		});
	};
}); 

module.exports = {
	FETCH_USER_DATA,
	LIST_SUPPLIERS_ACCOUNTS_DATA,
	FETCH_ACCOUNT_DATA,
	FETCH_SUPPLIER_ACCOUNT_FOR_PAGE,
	FETCH_ALL_SUPPLIERS_FOR_ADMIN,
	FETCH_SUPPLIER_ACCOUNT_FOR_ADMIN,
	HANDLE_ACCOUNT_DELETION,
	FETCH_ALL_CLIENTS_FOR_ADMIN,
	FETCH_CLIENT_ACCOUNT_FOR_ADMIN
}
