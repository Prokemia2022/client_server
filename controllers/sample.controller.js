const Sample = require('../models/Utils/samples')

const new_sample=(async (req, res)=>{
    const payload = req.body;
    const new_item={
        product_name: 			payload.product_name,
        product_id: 			payload.product_id,
        listed_by_id: 			payload.listed_by_id,
        email_of_lister:		payload.email_of_lister,
        industry:				payload.industry,
        technology:				payload.technology,
        first_name:				payload.first_name,
        last_name:				payload.last_name,
        company_name:  			payload.company_name,
        email_of_company:		payload.email_of_company,
        mobile_of_company:		payload.mobile_of_company,
        address:				payload.address,
        description:			payload.description,
        number_of_samples:      payload.number_of_samples,
        annual_volume: 			payload.annual_volume,
        units:				    payload.units,
        additional_info:		payload.additional_info,
        requester_id:           payload.requester_id,
        email_sent:             payload.email_sent,
        suspension_status:      payload.suspension_status,
        Notification_Status:    payload.Notification_Status,
        approval_status:        payload.approval_status,
    }
    try{
        const saved_sample = await Sample.create(new_item);
        return res.status(200).send('Sample request made successfully!')
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not submit your request")
    }
})

const get_samples_by_lister=(async(req, res)=>{
    const id = req.query.query;
    const query = {requester_id: id};
    const samples = await Sample.find(query);
    return res.status(200).send(samples)
})

module.exports = {
    new_sample,
    get_samples_by_lister
}