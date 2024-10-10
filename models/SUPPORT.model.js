const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const DEMO_REQUEST_SCHEMA_MODEL = new mongoose.Schema({
	name: 			    { type: String },
	email:  			{ type: String },
	mobile:  			{ type: String },
    job_function:  		{ type: String },
	status:				{ status:  Boolean, stage: String, comment: String, approver: String },
},{ timestamps: true });

const CONTACT_REQUEST_SCHEMA_MODEL = new mongoose.Schema({
	name: 			    { type: String },
	email:  			{ type: String },
	mobile:  			{ type: String },
    message:	  		{ type: String },
	status:				{ status:  Boolean, stage: String, comment: String, approver: String },
},{ timestamps: true });

const DEMO_REQUEST_MODEL = mongoose.model('DEMO_REQUEST', DEMO_REQUEST_SCHEMA_MODEL);
const CONTACT_REQUEST_MODEL = mongoose.model('CONTACT_REQUEST', CONTACT_REQUEST_SCHEMA_MODEL);

module.exports = {
	DEMO_REQUEST_MODEL,
	CONTACT_REQUEST_MODEL
}
