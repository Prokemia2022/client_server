const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const USER_BASE_MODEL_SCHEMA = new mongoose.Schema({
	first_name:			{ type: String },
	last_name:			{ type: String },
	email:				{ type: String, unique: true },
	mobile:				{ type: String },
	profile_image_url:	{ type: String },
	account_type:		{ type: String },
	password:			{ type: String },
	refresh_token:		{ type: String },
	// account information
	admin_account_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'ADMIN'},
	client_account_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'CLIENT'},
	supplier_account_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'SUPPLIER'},
	salesperson_account_model_ref:	{ type: mongoose.Schema.Types.ObjectId, ref: 'SALESPERSON'},
	consultant_account_model_ref:	{ type: mongoose.Schema.Types.ObjectId, ref: 'CONSULTANT'},
	// subscription & billing information
	subscription_model_ref:			{ type: mongoose.Schema.Types.ObjectId, ref: 'SUBSCRIPTION' },	
	// notfication information
	// status information
	account_status_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: 'ACCOUNT_STATUS'},
},{ timestamps: true });

// SUBSCRIPTION ACCOUNT DETAILS
const SUBSCRIPTION_MODEL_SCHEMA = new Schema({
	account_model_ref:			{ type: mongoose.Schema.Types.ObjectId, ref: "USER"},
	status:						{ type: Boolean, default: false }, // true for accounts that have an active subscription false for accounts that have inactivated: Paused their subscription.
	plan:						{ type: String, default:'free'},   // free or business or enterprise
	cycle:						{ type: String, default: 'monthly'}, // Period for billing subscription i.e monthly, semi-annualy, yearly and when the billing will be done 
	// active_billing field holds the information of the current builling details: Invoice plus the date.
	billings: 					[{ type: mongoose.Schema.Types.ObjectId, ref: "BILLING"}],
	cancellation_status:		{ status: Boolean, reason: String, date: Date }, // whether the account wants to cancel the subscription
}, { timestamps: true });

// INVOICES FOR SUBSCRIPTIONS
const BILLING_MODEL_SCHEMA = new Schema({
	subscription_model_ref:		{ type: mongoose.Schema.Types.ObjectId, ref: "SUBSCRIPTION"},
	amount:						{ type: Number }, // amount to be charged
	method:						{ type: String },
	description: 				{ type: String },
	start:						{ type: Date }, // start date of billing
	end:						{ type: Date }, // end date of billing
});

const ACCOUNT_STATUS_MODEL_SCHEMA = new Schema({	
	user_model_ref:		{ type: String },
	suspension:			{ status: Boolean, reason: String },
	approved:			{ type: Boolean },
	deletion:			{ status: Boolean, reason: String, date: Date},
	email:				{ status: Boolean, notification: Boolean, }, // Email: Status - Verified, Notification - Whether to receive marketing emails
	sms:				{ status: Boolean, notification: Boolean }, // Mobile: Status - Verified, Notification - allow marketing // transactional
	push:				{ status: Boolean, notification: Boolean },
	onboarding:			{ status: Boolean },
	complete_profile:	{ status: Boolean },
	last_active:		{ type: Date }
});

const USER_BASE_MODEL = mongoose.model('USER', USER_BASE_MODEL_SCHEMA);
const ACCOUNT_STATUS_MODEL = mongoose.model('ACCOUNT_STATUS',ACCOUNT_STATUS_MODEL_SCHEMA);
const SUBSCRIPTION_MODEL = mongoose.model('SUBSCRIPTION',SUBSCRIPTION_MODEL_SCHEMA);
const BILLING_MODEL = mongoose.model('BILLING',BILLING_MODEL_SCHEMA);


module.exports = {
	USER_BASE_MODEL,
	ACCOUNT_STATUS_MODEL,
	SUBSCRIPTION_MODEL,
	BILLING_MODEL
}
