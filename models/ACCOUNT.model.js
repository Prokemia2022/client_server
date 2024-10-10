const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const ADMIN_MODEL_SCHEMA = new Schema({
	user_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'USER'},
	role:				{ type: String },
}, { timestamps: true });

const CLIENT_MODEL_SCHEMA = new Schema({
	user_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'USER'},
	company:			{ name:	String, email: String, mobile: String, address: String, position: String },
	requests:			[{type: mongoose.Schema.Types.ObjectId, ref: 'REQUEST'}],
	products:			[{ type: mongoose.Schema.Types.ObjectId, ref: 'PRODUCT' }],
}, { timestamps: true });

const SUPPLIER_MODEL_SCHEMA = new Schema({
	user_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'USER' },
	type:				{ type: String },// Distributor or Manufacturer
	image_url:			{ type: String },
	description:		{ type: String },// Details of the supplier account
	company:			{ name: String, email: String, mobile: String, address: String, position: String, website: String },
	products:			[{type: mongoose.Schema.Types.ObjectId, ref: 'PRODUCT' }],
	statistics:			{ views: Number, default: 0 },
	consultants:		[{type: mongoose.Schema.Types.ObjectId, ref: 'CONSULTANT'}],
	technology:			{type: mongoose.Schema.Types.ObjectId, ref: 'MARKET'},
	industry:			{type: mongoose.Schema.Types.ObjectId, ref: 'MARKET'},
	documents:			[{type: mongoose.Schema.Types.ObjectId, ref: 'DOCUMENT'}],
	orders:				[{type: mongoose.Schema.Types.ObjectId, ref: 'ORDER'}],
	requests:			[{type: mongoose.Schema.Types.ObjectId, ref: 'REQUEST'}],
	status:				{ status: Boolean, stage: String, comment: String }
}, { timestamps: true });

const SALESPERSON_MODEL_SCHEMA = new Schema({
	user_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'USER' },
	description:		{ type: String },
	company:			[{
		name: String,
		mobile: String,
		email: String,
		address: String,
		position: String,
		existing_supplier_id:	mongoose.Schema.Types.ObjectId
	}],
	consultation:		{ 
		status: Boolean, 
		consultation_model_refs: [{ 
			type: mongoose.Schema.Types.ObjectId, 
			ref:'CONSULTANT'
		}],
	}
},{timestamps: true});

const CONSULTANTS_MODEL_SCHEMA = new Schema({
	user_model_ref:		{ type:	mongoose.Schema.Types.ObjectId, ref: 'USER' },
	description:		{ type: String },
	markets:			[{type: mongoose.Schema.Types.ObjectId, ref: 'MARKET'}],
}, { timestamps: true });

const CLIENT_MODEL = mongoose.model("CLIENT", CLIENT_MODEL_SCHEMA);
const ADMIN_MODEL = mongoose.model("ADMIN", ADMIN_MODEL_SCHEMA);
const SUPPLIER_MODEL = mongoose.model("SUPPLIER", SUPPLIER_MODEL_SCHEMA);
const SALESPERSON_MODEL = mongoose.model("SALESPERSON", SALESPERSON_MODEL_SCHEMA);
const CONSULTANT_MODEL = mongoose.model("CONSULTANT", CONSULTANTS_MODEL_SCHEMA);

module.exports = {
	ADMIN_MODEL,
	CLIENT_MODEL,
	SUPPLIER_MODEL,
	SALESPERSON_MODEL,
	CONSULTANT_MODEL
}
