const mongoose = require("mongoose");

const ProdConsultationSchema = new mongoose.Schema({
    user_id:                {type: String},
    user_name:              {type: String},
    user_email:             {type: String},
    user_mobile:            {type: String},
    user_company_name:      {type: String},
    user_company_email:     {type: String},
    user_company_mobile:    {type: String},
    account_type:           {type: String},
    industry:               {type: String},
    technology:             {type: String},
    description:            {type: String},
    //expert details
    expert_id:              {type: String},
    expert_name:            {type: String},
    expert_email:           {type: String},
    expert_mobile:          {type: String},
    expert_company_name:    {type: String},
    notification_status:    {type:String},
	createdAt:		        {type: Date,default: Date.now},
},{timestamps:true})

module.exports = mongoose.model("prodconsultations",ProdConsultationSchema);
