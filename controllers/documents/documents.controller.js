const { LOGGER } = require("../../lib/logger.lib.js");
const { USER_BASE_MODEL, ACCOUNT_STATUS_MODEL } = require("../../models/USER.model.js");
const { PRODUCT_MODEL, DOCUMENT_MODEL, MARKET_MODEL } = require("../../models/PRODUCT.model.js");
const { CLIENT_MODEL, SUPPLIER_MODEL } = require("../../models/ACCOUNT.model.js");
const mongoose = require('mongoose');
/*
const FETCH_ALL_DOCUMENTS=(async(req,res)=>{
	const QUERY = req.query.query;
	const DOCUMENT_QUERY = {
		'status.stage': true,
		title:	QUERY,
		$or: { type: QUERY, industry: QUERY, technology: QUERY }
	}
	
	try{
		const EXISTING_DOCUMENTS = await DOCUMENT_MODEL.find(DOCUMENT_QUERY)
			.sort({ _id: -1})
			.populate({path:'product_model_ref',select: 'name'})
			.populate({path:'industry',select: 'title type'})
			.populate({path:'technology',select: 'title type'})
			.populate({path:'user_model_ref',select: 'company'})
            .exec();
		;
		const FILTERED_DOCUMENTS = EXISTING_DOCUMENTS?.filter((document)=> 
			document?.title?.toLowerCase().includes(QUERY?.toLowerCase()) || 
			document?.type?.toLowerCase().includes(QUERY?.toLowerCase()) ||
			document?.industry?.title?.toLowerCase().includes(QUERY?.toLowerCase()) ||
			document?.technology?.title?.toLowerCase().includes(QUERY?.toLowerCase()) ||
			document?.user_model_ref?.company?.name?.toLowerCase().includes(QUERY?.toLowerCase())
		);

		console.log(FILTERED_DOCUMENTS)
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		FILTERED_DOCUMENTS,
		});

	}catch(error){
		LOGGER.log('error',`System Error: Fetching documents. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch documents.'});
	}
});

const FETCH_DOCUMENTS_LISTER=(async(req,res)=>{
	const SUPPLIER_ID = req.query.supplier_id;
	const DOCUMENT_QUERY = {
		user_model_ref: SUPPLIER_ID
	}
	
	try{
		const EXISTING_DOCUMENTS = await DOCUMENT_MODEL.find(DOCUMENT_QUERY)
			.sort({ _id: -1})
			.populate({path:'product_model_ref',select: 'name'})
			.populate({path:'industry',select: 'title type'})
			.populate({path:'technology',select: 'title type'})
            .exec();
		;
		const FILTERED_DOCUMENTS = EXISTING_DOCUMENTS?.filter((document)=> 
			document?.title?.toLowerCase().includes(QUERY?.toLowerCase()) || 
			document?.type?.toLowerCase().includes(QUERY?.toLowerCase()) ||
			document?.industry?.title?.toLowerCase().includes(QUERY?.toLowerCase()) ||
			document?.technology?.title?.toLowerCase().includes(QUERY?.toLowerCase())
		);

		console.log(FILTERED_DOCUMENTS)
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		FILTERED_DOCUMENTS,
		});

	}catch(error){
		LOGGER.log('error',`System Error: Fetching documents by lister. Error: \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch documents by lister.'});
	}
});
*/
const CREATE_NEW_DOCUMENT=(async(req,res)=>{
	const payload = req.body;
	const PRODUCT_ID = req.query.product_id || payload?.product_model_ref;

	try{
		console.log(payload)
		const EXISTING_ACCOUNT = await SUPPLIER_MODEL.findOne({_id: payload?.account_id});

		if (!EXISTING_ACCOUNT){
			return res.status(200).json({
				error:		true,
				message:	'You dont have an active lister account, set up one now',
			});
		};

		const EXISTING_PRODUCT = await PRODUCT_MODEL.findOne({ _id : PRODUCT_ID })
		if (!EXISTING_PRODUCT){
			return res.status(200).json({
				error:		true,
				message:	'A product with this id does not exist'
			});
		};
		const NEW_DOCUMENT_ITEM = await DOCUMENT_MODEL.create({
			title:				payload?.title,
			url:				payload?.url,
			type:				payload?.type,
			product_model_ref:	PRODUCT_ID,
			user_model_ref:		payload?.account_id,
			industry:			EXISTING_PRODUCT?.industry,
			technology:			EXISTING_PRODUCT?.technology,
			status:				{
				status:	true,
				stage:	'pending',
				comment:'',
				date:	new Date(Date.now())
			}
		});

		EXISTING_ACCOUNT?.documents?.push(NEW_DOCUMENT_ITEM?._id);
		EXISTING_ACCOUNT?.save();

		EXISTING_PRODUCT?.documents?.push(NEW_DOCUMENT_ITEM?._id);
		EXISTING_PRODUCT?.save();

		let EXISTING_MARKET;
		EXISTING_MARKET = await MARKET_MODEL.findOne({_id: EXISTING_PRODUCT?.industry});	
		EXISTING_MARKET?.documents?.push(NEW_DOCUMENT_ITEM?._id);
		EXISTING_MARKET?.save();

		EXISTING_MARKET = await MARKET_MODEL.findOne({_id: EXISTING_PRODUCT?.technology});	
		EXISTING_MARKET?.documents?.push(NEW_DOCUMENT_ITEM?._id);
		EXISTING_MARKET?.save();
	
		return res.status(200).send({
			error: false,
			message: 'Document created successfully'
		})	
	}catch(error){
		LOGGER.log('error',`ERROR[CREATE DOCUMENT]{ \n\n\n ${error}\n\n\n }`);
		return res.status(500).json({error:true,message:'we could not create a new document.'});
	}
	
});

const FETCH_DOCUMENTS_PRODUCT=(async(req,res)=>{
	const PRODUCT_ID = req.query.product_id;
	const QUERY = req.query.query
	const DOCUMENT_QUERY = {
		product_model_ref: PRODUCT_ID
	}
	
	try{
		const EXISTING_DOCUMENTS = await DOCUMENT_MODEL.find(DOCUMENT_QUERY)
			.sort({ _id: -1})
			.populate({path:'product_model_ref',select: 'name'})
			.populate({path:'user_model_ref',select: 'company'})
			.populate({path:'industry',select: 'title type'})
			.populate({path:'technology',select: 'title type'})
            .exec();
		;
		console.log(EXISTING_DOCUMENTS)
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		EXISTING_DOCUMENTS
		});

	}catch(error){
		LOGGER.log('error',`ERROR[FETCH DOCUMENTS PER PRODUCT] \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch documents for this product.'});
	}
});

const UPDATE_DOCUMENT=(async(req,res)=>{
	const DOCUMENT_ID = req.query.document_id;
	const payload = req.body;


	const DOCUMENT_QUERY = {
		_id: DOCUMENT_ID
	};

	const UPDATE_DOCUMENT_ITEM = {
		$set:{
			title:	payload?.title,
			type:	payload?.type,
			url:	payload?.url
		}
	}
	
	try{
		await DOCUMENT_MODEL.findByIdAndUpdate(DOCUMENT_QUERY,UPDATE_DOCUMENT_ITEM)
		return res.status(200).send({
			error:		false,
			message:	'successfully updated document',
		});

	}catch(error){
		LOGGER.log('error',`ERROR[UPDATE DOCUMENT] \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not update this document.'});
	}
});

const DELETE_DOCUMENT=(async(req,res)=>{
	const DOCUMENT_ID = req.query.document_id;
	const DOCUMENT_QUERY = {
		_id: DOCUMENT_ID
	};
	try{
		const EXISTING_DOCUMENT = await DOCUMENT_MODEL.findById(DOCUMENT_ID)
		if (!EXISTING_DOCUMENT){
			return res.status(200).json({
				error:		true,
				message:	'A document with this id does not exist'
			});
		}; 

		await PRODUCT_MODEL.findOneAndUpdate({_id: EXISTING_DOCUMENT?.product_model_ref.toString()}, { 
			$pullAll: { 
				documents: [DOCUMENT_ID], 
			}
		});

		await SUPPLIER_MODEL.findOneAndUpdate({_id: EXISTING_DOCUMENT?.user_model_ref.toString()}, { 
			$pullAll: { 
				documents: [DOCUMENT_ID], 
			}
		});
		
		await MARKET_MODEL.findOneAndUpdate({_id: EXISTING_DOCUMENT?.industry.toString()}, { 
			$pullAll: { 
				documents: [DOCUMENT_ID], 
			}
		});
		
		await MARKET_MODEL.findOneAndUpdate({_id: EXISTING_DOCUMENT?.technology.toString()}, { 
			$pullAll: { 
				documents: [DOCUMENT_ID], 
			}
		});

		await DOCUMENT_MODEL.findByIdAndDelete(DOCUMENT_QUERY)
		return res.status(200).send({
			error:		false,
			message:	'successfully deleted document',
		});

	}catch(error){
		LOGGER.log('error',`ERROR[DELETE DOCUMENT] \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not delete this document.'});
	}
});

const FETCH_DOCUMENTS_LISTER=(async(req,res)=>{
	const ACCOUNT_ID = req.query.account_id;
	const QUERY = req.query.query;
	const STATUS_FILTER = req.query.status || '';
	const PAGE = req.query.page;
	const SKIP_VALUE = (parseInt(PAGE) - 1) * 10  // Used to skip to the next records
		
	try{
		
		const EXISTING_DOCUMENTS = await DOCUMENT_MODEL.aggregate([
			{
				$match: { 
					user_model_ref: new mongoose.Types.ObjectId(ACCOUNT_ID),
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
				$project: {
					"title":						1,
					"url":							1,
					"type":							1,
					"product_model_ref._id":		1,
					"product_model_ref.name":		1,
					"industry.title":				1,
					"industry.type":				1,
					"technology.title":				1,
					"technology.type":				1,
					"status":						1,
					"statistics":					1,
					"createdAt": 1
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
							"product_model_ref.name": {
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
							"type": {
								$regex: `^${QUERY}`, // Query
								$options: "i"   // 'i' for case-insensitive search
							}
						},
						
					],
				}
			},
			{ $sort: { _id: -1}},
			{ $skip: SKIP_VALUE},
			{ $limit: 10 }
		]);
		const EXISTING_DOCUMENTS_COUNT = await DOCUMENT_MODEL.countDocuments({user_model_ref: ACCOUNT_ID});
		console.log(EXISTING_DOCUMENTS)
		return res.status(200).send({
			error:		false,
			message:	'success',
			data:		EXISTING_DOCUMENTS,
			count:		EXISTING_DOCUMENTS_COUNT
		});

	}catch(error){
		console.log(error)
		LOGGER.log('error',`ERROR[FETCH DOCUMENTS PER LISTER] \n\n\n ${error}\n\n\n`);
		return res.status(500).json({error:true,message:'we could not fetch documents for this account.'});
	}
});

module.exports = {
	//FETCH_ALL_DOCUMENTS,
	FETCH_DOCUMENTS_LISTER,
	FETCH_DOCUMENTS_PRODUCT,
	CREATE_NEW_DOCUMENT,
	UPDATE_DOCUMENT,
	DELETE_DOCUMENT
}
