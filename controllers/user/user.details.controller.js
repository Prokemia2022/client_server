//User Details handler
const { USER_BASE_MODEL } = require("../../models/USER.model.js");
const { LOGGER } = require('../../lib/logger.lib.js');
const { SUPPLIER_MODEL } = require("../../models/ACCOUNT.model.js");
const { DOCUMENT_MODEL, PRODUCT_MODEL } = require("../../models/PRODUCT.model.js");
const mongoose = require('mongoose');

const FETCH_USER_DATA=(async(req,res)=>{
    const USER_ID = req.query.user_id;
    let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
    try{
		//console.log(req);
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
				EXISTING_ACCOUNT = await USER_BASE_MODEL.findById(USER_ID).populate('account_status_model_ref').populate({path:'supplier_account_model_ref',populate:[{path:'industry',select:'title'},{path:'technology',select:'title'}]}).exec();
				break;
			default:
				break;
		};
        //const EXISTING_ACCOUNT = await USER_BASE_MODEL.findById(USER_ID).populate('account_status_model_ref').exec();
        if (!EXISTING_ACCOUNT){
            return res.status(200).send({error:true,message:'This User does not have an existing account'});
        };
		//LOGGER.log('info',EXISTING_ACCOUNT)
        return res.status(200).send({
            error:null,
            data:EXISTING_ACCOUNT
        });
    }catch(error){
        LOGGER.log('error',`${ip} - System Error-[Fetching user details]`)
        return res.sendStatus(500);
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

const FETCH_ACCOUNTS_DATA=(async(req, res)=>{
	let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress).split(",")[0];
	const ACCOUNT_TYPE = req.query.account_type;
    try{
		let ACCOUNTS_DATA ;
		switch (ACCOUNT_TYPE){
			case 'supplier':
				const projection = { company: 1, image_url: 1, type: 1, description: 1, products: 1, consultants: 1, markets: 1, documents: 1 };
				ACCOUNTS_DATA = await SUPPLIER_MODEL.find({},projection);
				break;
			default:
				return res.status(200).send({
					error:true,
					message: 'Missing details'
				});
		}
		return res.status(200).send({
            error:null,
            data: ACCOUNTS_DATA,
        });
    }catch(error){
        LOGGER.log('error',`${ip} - System Error-[Fetching ACCOUNTs, id]`,error)
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
		//console.log(RETURN_DATA)
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


module.exports = {
	FETCH_USER_DATA,
	LIST_SUPPLIERS_ACCOUNTS_DATA,
	FETCH_ACCOUNT_DATA,
	FETCH_ACCOUNTS_DATA,
	FETCH_SUPPLIER_ACCOUNT_FOR_PAGE
}
