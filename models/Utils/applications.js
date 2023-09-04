const mongoose = require("mongoose");

const ApplicationsSchema = new mongoose.Schema({
	//vacancy info
	career_title:			{ type: String},
	career_id:	            { type: String},
	career_description:  	{ type: String},
	//lister info
	name: 	                { type: String},
	address: 		        { type: String},
	gender: 		        { type: String},
	email:			        { type: String},
    mobile:			        { type: String},
    cover_head:			    { type: String},
    resume_url:			    { type: String},
    linkedInUrl:            { type: String},
	//date
	createdAt:		{ type: Date,default: Date.now},
},{timestamps:true})

module.exports = mongoose.model("application",ApplicationsSchema);
