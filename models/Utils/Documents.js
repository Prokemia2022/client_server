const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
	//listing information 
	name_of_document:			{ type: String},
	type_of_document: 			{ type: String},
	product_id:				    { type: String}, //id of the product the document is connected to
    lister_id:                  { type: String}, //id of the lister i.e distributor or manufacturer
    url_of_the_document:        { type: String},
	created_At:					{ type: Date, default: Date.now}
},{timestamps:true})

module.exports = mongoose.model("documents",DocumentSchema);