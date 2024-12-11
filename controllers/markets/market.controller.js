const { LOGGER } = require("../../lib/logger.lib.js");
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../../models/USER.model.js");
const { PRODUCT_MODEL, MARKET_MODEL, DOCUMENT_MODEL } = require("../../models/PRODUCT.model.js");
const { CLIENT_MODEL, SUPPLIER_MODEL } = require("../../models/ACCOUNT.model.js");
const {error} = require("winston");
const mongoose = require('mongoose');

const CREATE_NEW_MARKET = (async(req, res)=>{
	const payload = req.body;
	const USER_ID = req.user.sub;

	try{
		await MARKET_MODEL.create({
			title:			payload?.title,
			description:	payload?.description,
			image_url:		payload?.image_url,
			type:			payload?.type,
			status:			{
								status:	payload?.status_stage === 'approved'? true : false,
								stage:	payload?.status_stage,
								comment:'',
								date:	new Date(Date.now()),
			},
			suggested:		payload?.suggested,
		});

		return res.status(200).send({
			error: false,
			message: 'Market created successfully'
		});
	}catch(error){
		LOGGER.log('error',`System Error: Creating a new market. USER: ${USER_ID}. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not create this market.'});
	}
});

const UPDATE_MARKET = (async(req, res)=>{
	const payload = req.body;
	const MARKET_ID = req.query.market_id;
	try{
		const EXISTING_MARKET = await MARKET_MODEL.findOne({ _id : MARKET_ID })
		if (!EXISTING_MARKET){
			return res.status(200).json({
				error:		true,
				message:	'A market with this id does not exist'
			});
		};
		const UPDATE_DOCUMENT = {$set:{
			title:			payload?.title,
			description:	payload?.description,
			image_url:		payload?.image_url,
			type:			payload?.type,
			status:			{
								status:	payload?.status_stage === 'approved'? true : false,
								stage:	payload?.status_stage,
								comment:'',
			},
			suggested:		payload?.suggested,
		}};
		await MARKET_MODEL.updateOne({_id: MARKET_ID},UPDATE_DOCUMENT);
		return res.status(200).send({
			error: false,
			message: 'Market updated successfully'
		});
	}catch(error){
		LOGGER.log('error',`ERROR[UPDATE_MARKET]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not update this market.'});
	}
});

const FETCH_MARKET_LIST=(async(req,res)=>{
	const type = req.query.type;
	try{
		let MARKET_QUERY = {"status.stage": 'approved'}
		if (type !== 'undefined'){
			MARKET_QUERY = { type:type,"status.stage": 'approved' };
		}
		const projection = { title: 1, type: 1, image_url: 1, products: 1, documents: 1};
		const EXISTING_MARKETS = await MARKET_MODEL.find(MARKET_QUERY,projection);

		return res.status(200).send({
			error: false,
			message: 'Success',
			data:	EXISTING_MARKETS
		})
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH MARKETS]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch markets.'});

	}
});
const FETCH_MARKET_LIST_ADMIN=(async(req,res)=>{
	const type = req.query.type;
	const QUERY = req.query.query;
	const PAGE = req.query.page || 1;
	const STATUS_FILTER = req.query.status_filter || '';
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10  // Used to skip to the next records

	try{
		const EXISTING_MARKETS = await MARKET_MODEL.aggregate([
			{
				$match: { type: type }
			},
			{
				$project: {
					"title":					1,
					"image_url":				1,
					"documents":			1,
					"products":				1,
					"suppliers":		1,
					"clients":		1,
					"statistics":				1,
					"type":				1,
					"status":				1,
				}
			},
			{
				// Match products whose brand, name, industry, technology, seller, supplier, chemical_name, description, application, starts with the query, e.g., 'rhe'
				$match: {
					$or:[
						{
							"title": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							},
						},{
							"type": {
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
			{ $sort: { _id: -1}},
			{ $skip: SKIP_VALUE},
			{ $limit: 10 }
		]);
		
		const EXISTING_MARKETS_COUNT = await MARKET_MODEL?.countDocuments({type: type});
		return res.status(200).send({
			error: false,
			message: 'success',
			data:	EXISTING_MARKETS,
			count:	EXISTING_MARKETS_COUNT
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH_MARKET_LIST_ADMIN]{\n\n\n ${error}\n\n\n}`);
		return res.status(500).json({error:true,message:'we could not fetch markets.'});

	}
});

const FETCH_MARKET_DATA=(async(req,res)=>{
	let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
 
	const MARKET_ID = req.query.market_id;
	try{
		const MARKET_QUERY = { _id : MARKET_ID };
		const EXISTING_MARKET = await MARKET_MODEL.findOne(MARKET_QUERY)
			.populate({
				path:'products',
				select:'name lister supplier seller industry technology brand chemical_name application features',
				populate:[
					{path:'industry',select:'title'},
					{path:'technology',select: 'title'},
					{path:'supplier', select:'company'},
					{path:'seller',select:'name'}
				]})
			.populate({ path: 'documents', select: 'title url type'})
			.exec();

		//await MARKET_MODEL.updateOne({_id: MARKET_ID},{ "statistics.views" : (EXISTING_MARKET?.statistics?.views || 0 ) + 1 })
		return res.status(200).send({
			error: false,
			message: 'Success',
			data:	EXISTING_MARKET
		})
	}catch(error){
		LOGGER.log('error',`${ip} - System Error: Fetching details about thismarkets.Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch market data.'});
	}
});

const FETCH_MARKET_DATA_FOR_PAGE=(async(req,res)=>{
	// Piece the information for a particular market
	// Products, Documents, Bio
	try{
		const MARKET_ID = req.query.market_id;
		const DOCS_PAGE = req.query.docs_page || 1;
		const DOCS_SKIP_VALUE = (parseInt(DOCS_PAGE) - 1) * 10  // Used to skip to the next records
		
		const PRODS_PAGE = req.query.prods_page || 1;
		const PRODS_SKIP_VALUE = (parseInt(PRODS_PAGE) - 1) * 10  // Used to skip to the next records

		
		let RETURN_DATA;
		// check whether market exists and is approved
		const projection = { title: 1, image_url: 1, type: 1, description: 1,status: 1 };
		const EXISTING_MARKET = await MARKET_MODEL.findOne({_id: MARKET_ID},projection);

		if (!EXISTING_MARKET || EXISTING_MARKET?.status?.stage === 'suspended'){
			return res.status(200).json({
				error:		true,
				message:	'This market does not exist.'
			});
		};
		// find and return approved documents
		const EXISTING_DOCUMENTS = await DOCUMENT_MODEL.aggregate([
			{
				$match: { 
					$or:[
					{
						industry: new mongoose.Types.ObjectId(MARKET_ID)
					},
					{
						technology: new mongoose.Types.ObjectId(MARKET_ID),
					}],
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
					$or:[
					{
						industry: new mongoose.Types.ObjectId(MARKET_ID)
					},
					{
						technology: new mongoose.Types.ObjectId(MARKET_ID),
					}],
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
			market:			EXISTING_MARKET,
			documents:		EXISTING_DOCUMENTS,
			documents_count:await DOCUMENT_MODEL.countDocuments(
				{
					$or:[
					{
						industry: new mongoose.Types.ObjectId(MARKET_ID)
					},
					{
						technology: new mongoose.Types.ObjectId(MARKET_ID),
					}],
					"status.stage":'approved'
				}),
			products:		EXISTING_PRODUCTS,
			products_count: await PRODUCT_MODEL.countDocuments({
					$or:[
					{
						industry: new mongoose.Types.ObjectId(MARKET_ID)
					},
					{
						technology: new mongoose.Types.ObjectId(MARKET_ID),
					}],
					"status.stage":'approved'
			})
		}
		
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		RETURN_DATA,
		});
	}catch(error){
		LOGGER.log('error',`ERROR[FETCH MARKET DATA]: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({
			error:true,
			message:'we could not fetch this market data.'
		});
	}
});

const DELETE_MARKET = (async(req,res)=>{
	const MARKET_ID = req.query.market_id;
	try{
		const EXISTING_MARKET = await MARKET_MODEL.findOne({ _id : MARKET_ID })
		if (!EXISTING_MARKET){
			return res.status(200).json({
				error:		true,
				message:	'A market with this id does not exist'
			});
		};
		await MARKET_MODEL.deleteOne({ _id : MARKET_ID })
		return res.status(200).send({
			error: false,
			message: 'Market deleted successfully'
		})
	}catch(error){
		LOGGER.log('error',`ERROR[DELETE_MARKET]\n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not delete this market.'});
	}
});

module.exports = {
	CREATE_NEW_MARKET,
	UPDATE_MARKET,
	DELETE_MARKET,
	FETCH_MARKET_LIST,
	FETCH_MARKET_DATA,
	FETCH_MARKET_DATA_FOR_PAGE,
	FETCH_MARKET_LIST_ADMIN
}
