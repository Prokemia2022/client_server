const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
	//account_information - about the user
	first_name:			{type: String},
	last_name:			{type: String},
	gender:				{type: String},
	profile_photo_url: 	{type:String},
	account_type:		{type: String},
	//company user information - tells us of the company infomation
	email_of_company:	{type: String,unique:true}, //email of salesperson in the company
	mobile_of_company:	{type: String},
	address:			{type: String},
	company_name:		{type: String},
	position:			{type: String},
	//Search-results
	recents:			[ //limit array to 5 search results
							{
								Name:String, //name of search i.e name of product or distributor
								Item:String //category of search i.e industry, product , technology, manufacturer
							},
						],
	//security - logins and authentications
	password:			{ type: String},
	access_token: 		{ type: String},
	valid_email_status: { type: Boolean},
	//listing_status - check if user has listed a product
	listing_status: 	{type: Boolean},
	suspension_status:  { type: Boolean},
	//date of joining
	joined_in:			{ type: Date,default: Date.now},
},{timestamps:true})

module.exports = mongoose.model("clients",ClientSchema);