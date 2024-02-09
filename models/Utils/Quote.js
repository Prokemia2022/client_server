const mongoose = require("mongoose");

const QuoteSchema = new mongoose.Schema({
	product_name:       {type: String},
    product_id:         {type: String},
    listed_by_id:       {type: String},
    email_of_lister:    {type: String},
    industry:           {type: String},
	technology:         {type: String},
    // requester details
	first_name:			{type: String},
	last_name:			{type: String},
    requester_id:       {type: String},
    company_name:		{type: String},
    email_of_company:	{type: String}, //email of salesperson in the company
	mobile_of_company:	{type: String},
	address:			{type: String},
    // quote details
    description:        {type: String},
    annual_volume:      {type: Number},
    units:              {type: String},
    additional_info:    {type: String},
    email_sent:         {type: Boolean},
    suspension_status:  {type: Boolean},
    Notification_Status:  {type: Boolean},
    approval_status:    {type: Boolean},
},{timestamps:true})

module.exports = mongoose.model("quotes",QuoteSchema)