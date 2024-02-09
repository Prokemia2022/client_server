const SalesPerson = require('../models/Sales/SalesPerson')

const get_data = (async (req, res)=>{
    const email = req.query.query;
    const query = { email_of_salesperson: email};
    const existing_user = await SalesPerson.findOne(query);
    return res.status(200).send(existing_user);
})

const edit_data=(async (req, res)=>{
    const payload = req.body;
    const id = payload._id
    const query = { _id: id};
    const update = { $set: {
        first_name:         	payload.first_name,	
        last_name:          	payload.last_name,
        bio:                	payload.bio,
        payment_method:     	payload.payment_method,
        gender:             	payload.gender,
        mobile_of_salesperson:  payload.mobile_of_salesperson,		
        address:            	payload.address,	
        company_name:       	payload.company_name,	
        position:           	payload.position,
        account_status:         payload.account_status,
        open_to_consultancy:    payload.open_to_consultancy,
        profile_photo_url:  	payload.profile_photo_url,
        valid_email_status:     payload.valid_email_status,
        verification_status:    payload.verification_status,
        suspension_status:      payload.suspension_status
    }};
    const options = { };
    try{
        await SalesPerson.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }catch(err){
        return res.status(400).send('could not update this account');
    }
});


module.exports = {
    get_data,
    edit_data
}