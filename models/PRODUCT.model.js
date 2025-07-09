const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const PRODUCT_SCHEMA_MODEL = new mongoose.Schema({
	name:			{ type: String },
	image_url:		{ type: String },
	expiry:			{ status: Boolean, date: Date },
	lister:			{ type: mongoose.Schema.Types.ObjectId, ref: 'SUPPLIER' },
	supplier:		{ type: mongoose.Schema.Types.ObjectId, ref: 'SUPPLIER' },
	seller:			{ type: mongoose.Schema.Types.ObjectId, ref: 'SUPPLIER' },
	consultants:	[{type: mongoose.Schema.Types.ObjectId, ref: 'USER' }],
	description:	{ type: String },
	chemical_name:  { type: String },
	function:		{ type: String },
	brand:			{ type: String },
	features:		{ type: String },
	application:	{ type: String },
	packaging:		{ type: String },
	storage:		{ type: String },
	documents:		[{type: mongoose.Schema.Types.ObjectId, ref: 'DOCUMENT'}],
	industry:		{type: mongoose.Schema.Types.ObjectId, ref: 'MARKET' },
	technology:		{type: mongoose.Schema.Types.ObjectId, ref: 'MARKET' },
	status:			{
						status: Boolean, 
						stage: String, //pending,approval,suspension,draft 
						comment: String, 
						date: Date, 
						approver: mongoose.Schema.Types.ObjectId 
					},
	sponsored:		{ status: Boolean, },
	statistics:		{
						views:		Number, default: 0,
						search:		Number,
					},
	requests:		[{type: mongoose.Schema.Types.ObjectId, ref: 'REQUEST'}],
},{ timestamps: true });

const DOCUMENT_SCHEMA_MODEL = new Schema({
	title:				{ type: String },
	url:				{ type: String },
	type:				{ type: String },
	product_model_ref:	{ type: mongoose.Schema.Types.ObjectId, ref:'PRODUCT' },
	user_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref:'SUPPLIER' },
	industry:			{ type: mongoose.Schema.Types.ObjectId, ref: 'MARKET'},
	technology:			{ type: mongoose.Schema.Types.ObjectId, ref: 'MARKET' },
	status:				{
							status: Boolean, 
							stage: String, 
							comment: String, 
							date: Date, 
							approver: mongoose.Schema.Types.ObjectId 
						},
	statistics:		{
						views:		Number,
						search:		Number,
					},
}, { timestamps: true });

const MARKET_SCHEMA_MODEL = new Schema({
	title:			{ type: String },
	description:	{ type: String },
	image_url:		{ type: String },
	type:			{ type: String }, // industry or technology
	status:			{
						status: Boolean, 
						stage: String, //pending,approval,suspension,draft 
						comment: String, 
						date: Date, 
						approver: mongoose.Schema.Types.ObjectId 
					},
	documents:		[{type:mongoose.Schema.Types.ObjectId, ref:'DOCUMENT'}],
	products:		[{type:mongoose.Schema.Types.ObjectId, ref:'PRODUCT'}],
	suggested:		{ type: mongoose.Schema.Types.ObjectId, ref: 'USER' },
	statistics:		{
						views:		Number,
						search:		Number,
					},
},{ timestamps: true }); 

const ORDER_SCHEMA_MODEL = new Schema({
	user_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'USER' }, // creator of order
	client:				{ name: String, company: String, mobile: String, email: String, address: String },
	product:			{ name: String, amount: Number, price: Number, unit: String, id: mongoose.Schema.Types.ObjectId },
	delivery:			{ terms: String, date: Date },
	payment:			{ type: String },
	notification:		{ status: Boolean, email: Boolean, sms: Boolean, push: Boolean },
	status:			{
						status: Boolean, 
						stage: String, //pending,approval,suspension,draft 
						comment: String, 
						date: Date, 
						approver: mongoose.Schema.Types.ObjectId 
					},
},{ timestamps: true });

const REQUEST_MODEL_SCHEMA = new Schema({
	type:					{ type: String }, //sample or quote
	product_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'PRODUCT' },
	requestor_model_ref:	{ type: mongoose.Schema.Types.ObjectId, ref: 'USER' },
	supplier_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'SUPPLIER' },
	industry:				{ type:	String },
	technology:				{ type: String },
	amount:					{ type: Number }, // requested amount
	expected_annual_ammount:{ type: Number }, // annual amount the customer consumes
	units:					{ type: String },
	use_case:				{ type: String },
	comment:				{ type:	String },
	followup:				{ 
		status: Boolean, 
		date: Date, 
		prospect: Boolean, 
		days: Number, 
		price: Number, 
		comment: String 
	}, // supplier section action
	conversion:				{ 
		status: Boolean,
		date: Date,
		price: Number,
		comment: String 
	}, // client action on supplier
	delivery: { 
		location: String,
		status: Boolean, 
		date: Date, 
		comment: String 
	},
	status: {
		status: Boolean, 
		stage: String, //pending,approval,suspension,draft 
		comment: String, 
		date: Date, 
		approver: mongoose.Schema.Types.ObjectId 
	},
	notification:	{ 
		created: {
			requester: { sms: Boolean, email: Boolean },
			supplier:  { sms: Boolean, email: Boolean },
			admin: { sms: Boolean, email: Boolean }
		},
		approval:{
			requester: Boolean,
			supplier: Boolean,
			admin:	Boolean
		},
		processing:{
			requester: Boolean,
			supplier: Boolean,
			admin:	Boolean
		},
		completed:{
			requester: Boolean,
			supplier: Boolean,
			admin:	Boolean
		}
	},
}, { timestamps: true });

const PRODUCT_MODEL = mongoose.model('PRODUCT', PRODUCT_SCHEMA_MODEL);
const DOCUMENT_MODEL = mongoose.model('DOCUMENT', DOCUMENT_SCHEMA_MODEL);
const MARKET_MODEL = mongoose.model('MARKET', MARKET_SCHEMA_MODEL);
const ORDER_MODEL = mongoose.model('ORDER', ORDER_SCHEMA_MODEL);
const REQUEST_MODEL = mongoose.model('REQUEST', REQUEST_MODEL_SCHEMA);
//const R

module.exports = {
	PRODUCT_MODEL,
	DOCUMENT_MODEL,
	MARKET_MODEL,
	ORDER_MODEL,
	REQUEST_MODEL
}
