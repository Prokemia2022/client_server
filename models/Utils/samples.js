const mongoose = require("mongoose");

const SampleSchema = new mongoose.Schema({
    //product details
    product_details:                    { type: mongoose.Schema.Types.ObjectId, ref: "products"},
    lister_details:                     { type: mongoose.Schema.Types.ObjectId, ref: "distributors"},
    industry:                           { type: String},
	technology:                         { type: String},
    // client details
    client_details:                     { type: mongoose.Schema.Types.ObjectId, ref: "clients"},
    requester_id:                       { type: String},
    supplier_id:                        { type: String},
    // sample details
    description:                        { type: String},
    number_of_samples:                  { type: Number},
    annual_volume:                      { type: Number}, // anticipated amount of products to use.
    units:                              { type: String},
    additional_info:                    { type: String},
    // supplier section -follow up with client
    follow_up_date:                     { type: Date},
    follow_up_remarks:                  { type: String},
    follow_up_prospect_status:          { type: Boolean},
    follow_up_sampling_period:          { type: Number}, // number of says the client requested to sample the product
    follow_up_sampling_price:           { type: Number}, // price per unit of requested sample
    // closing
    conversion_client_status:           { type: Boolean},
    conversion_client_price:            { type: Number},
    conversion_client_date:             { type: Date},
    // delivery
    delivery_date:                      { type: Date},
    delivery_remarks:                   { type: String},
    // sample status
    sample_status:	                    { type: Boolean }, // the active status of the sample True: Active, False: Declined
    sample_status_stage:	            { type: String },  // the active stage of the sample
    sample_status_comment:	            { type: String },  // comment on the stage of the sample i.e status: False, Stage:declined, reason: The Client is spamming. 
    deletion_status:	                { type: Boolean },
    client_notification_Status:         { type: Boolean}, // send client notifications on any activity on the sample
    supplier_notification_Status:       { type: Boolean}, // send supplier notifications on any activity on the sample
},{timestamps:true});

const Sample = mongoose.model('Sample', SampleSchema);

module.exports = Sample;