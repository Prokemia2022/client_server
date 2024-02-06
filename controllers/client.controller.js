const Hash_str = require('../middleware/Hash.middleware.js');
const Client = require('../models/Client/Client.js');
const { password_changed } = require('./email.controller.js');

const get_client_data = (async (req, res)=>{
    const email = req.query.query;
    const query = { email_of_company: email};
    const projection = {password: 0}
    const result = await Client.findOne(query,projection);
    return res.status(200).send(result);
})

const update_client_data = (async (req, res)=>{
    const payload = req.body;
    const id = payload?._id
    const query = { _id: id};
    const update = { $set: {
        first_name: 		payload.first_name,
        last_name: 			payload.last_name,
        company_name: 		payload.company_name,
        mobile_of_company:  payload.mobile_of_company,		
        email_of_company:   payload.email_of_company,
        address: 			payload.address_of_company,
        position:           payload.position,	
        gender:             payload.gender,
        profile_photo_url:  payload.profile_photo_url,
    }};
    const options = { };
    try{
        await Client.updateOne( query, update, options).then(()=>{
            return res.status(200).send("success")
        });
    }catch(err){
        console.log(err)
        return res.status(500).send("could not edit profile at the moment");
    }
});

const password_reset=async(req, res)=>{
    const {id, password} = req.body;
    const hashed_password = Hash_str(password);
    const query = {_id:id};
	const update = { $set: {
        password: hashed_password
    }};
    const options = { };
    const payload = {email}
    await Client.updateOne( query, update, options).then((response)=>{
        password_changed(payload)
        return res.status(200).send("success")
    });
}

module.exports = {
    get_client_data,
    update_client_data,
    password_reset
}