const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	//listing information 
	name_of_product:			{ type: String},
	email_of_lister: 			{ type: String},
	listed_by_id:				{ type: String}, //id of the lister
	short_on_expiry:			{ type: Boolean}, //the product needs a quick sell as it is expiring soon
	short_on_expiry_date:		{ type: Date},
	//manufacturer information
	manufactured_by: 			{ type: String},
	manufactured_by_id:			{ type: String},
	//seller information
	distributed_by:				{ type: String},
	distributed_by_id:			{ type: String},
	website_link_to_Seller: 	{ type: String},
	//product information
	description_of_product:		{ type: String},
	chemical_name:  			{ type: String},
	function:					{ type: String},
	brand:						{ type: String},
	features_of_product:		{ type: String},
	application_of_product:		{ type: String},
	packaging_of_product:		{ type: String},
	storage_of_product:			{ type: String},
	//documents
	data_sheet:					{ type: String},
	safety_data_sheet:			{ type: String},
	formulation_document: 		{ type: String},
	//category_of_product
	industry: 					{ type: String},
	technology: 				{ type: String},
	//stats
	views:						{ type: Number},
	//featured status
	sponsored:					{ type: Boolean},
	//verification_status
	verification_status:		{ type: Boolean},
	//date
	created_At:					{ type: Date, default: Date.now}
},{timestamps:true})

module.exports = mongoose.model("products",ProductSchema)
