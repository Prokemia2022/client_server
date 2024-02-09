const mongoose = require("mongoose");

const SalesPersonSchema = new mongoose.Schema({
	//account_information - about the user
	first_name:			{type: String},
	last_name:			{type: String},
	gender:				{type: String},
	bio: 				{ type: String},
	payment_method: 	{ type: String},
	profile_photo_url: 			{ type:String},
	//user information - tells us of the company infomation
	email_of_salesperson:	{type: String,unique:true}, //email of salesperson in the company
	mobile_of_salesperson:	{type: String},
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
	//The hub community
	hub_access_status: 	{type: Boolean},
	hub_account_id: 	{type: String},
	//open_to_consultancy
	open_to_consultancy: { type: Boolean},
	//account status - announymous or not
	account_status:		{type: Boolean},
	//verification_status,
	valid_email_status: { type: Boolean},
	verification_status:		{ type: Boolean},
	suspension_status:  { type: Boolean},
	//date of joining
	account_type:		{type: String},
	joined_in:			{ type: Date,default: Date.now},
},{timestamps:true})

module.exports = mongoose.model("salespeople",SalesPersonSchema);
