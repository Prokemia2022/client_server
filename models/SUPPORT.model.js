const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const AutoIncrement = require('mongoose-sequence')(mongoose);


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

const TICKET_SCHEMA_MODEL = new mongoose.Schema({
	title: 			    { type: String },
	name: 			    { type: String },
	email:  			{ type: String },
	mobile:  			{ type: String },
    message:	  		{ type: String }, // demos, support, feedback
    type:	  			{ type: String },
    ticketNumber:		{ type: String },
	seq_id:             { type: Number },
	status:				{ status:  Boolean, stage: String, comment: String, approver: String },
},{ timestamps: true });

TICKET_SCHEMA_MODEL.plugin(AutoIncrement, {
	id: 'ticket_counter', // Unique identifier for the counter
	inc_field: 'seq_id', // Field to store the incremented value
	start_seq: 1, // Starting number
});

// Post save hook to ensure invoiceNumber is set
TICKET_SCHEMA_MODEL.post('save', async function(doc) {
	if (!doc.ticketNumber && doc.seq_id) {
		await mongoose.models.TICKET.findByIdAndUpdate(doc._id, {
			ticketNumber: `TC-${doc.seq_id}`
		}, { new: true });
	}
});

const DEMO_REQUEST_MODEL = mongoose.model('DEMO_REQUEST', DEMO_REQUEST_SCHEMA_MODEL);
const CONTACT_REQUEST_MODEL = mongoose.model('CONTACT_REQUEST', CONTACT_REQUEST_SCHEMA_MODEL);
const TICKET_MODEL = mongoose.model('TICKET', TICKET_SCHEMA_MODEL);

module.exports = {
	DEMO_REQUEST_MODEL,
	CONTACT_REQUEST_MODEL,
	TICKET_MODEL
}
