const mongoose = require("mongoose");

const Order_Schema = new mongoose.Schema({
	//creater info
	creator_id:					{ type: String},
	creator_name:				{ type: String},
	email_of_creator: 			{ type: String},
	mobile_of_creator: 			{ type: String},
	//client info
	name_of_client:				{ type: String},
	company_name_of_client:     { type: String},
	mobile_of_client: 			{ type: String},
	email_of_client:			{ type: String},
	location_of_client:			{ type: String},
	//product info -- []
	name_of_product:  			{ type: String},
	volume_of_items:			{ type: Number},
	unit_price: 				{ type: Number},
	total: 						{ type: Number},
	//payment_info
	delivery_terms: 			{ type: String},
	delivery_date: 				{ type: String},
	payment_terms: 				{ type: String},
	order_notification_status:  { type: Boolean},
	publish_status:				{ type: Boolean},
	order_status: 				{ type: String}, //ie pending, dispatched
	//date
	createdAt:					{ type: Date,default: Date.now},
},{timestamps:true})

module.exports = mongoose.model("orders",Order_Schema);