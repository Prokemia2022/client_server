const mongoose = require("mongoose");

const UserShrtSchema = new mongoose.Schema({
	account_type:		    {type: String},
	email_of_company:	    {type: String,unique:true},
	password:			    { type: String},
    name:			        {type: String},
    profile_photo_url: 	    {type:String},
	valid_email_status:     { type: Boolean},
	suspension_status:      { type: Boolean},
    verification_status:    { type: Boolean},
	joined_in:			    { type: Date},
},{timestamps:true})

module.exports = mongoose.model("usershrt",UserShrtSchema);