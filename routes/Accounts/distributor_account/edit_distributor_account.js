//modules imports
const express = require("express");
//models imports
const Distributor = require('../../../models/Distributor/Distributor.js');

const router = express.Router();

router.post('/',async(req,res)=>{
	//get payload
	const payload = req.body; 
	///console.log(payload)
	//check if payload exists
	if (!payload)
		return res.status(400).send("Bad Request")

	const id = payload._id //use id to find existing user account

	const existing_distributor = await Distributor.findOne({_id:id}) //find user account

	if (existing_distributor != null)
		try{
			const query = {_id:id};
	        const update = { $set: {
				contact_person_name:        payload.contact_person_name,
				contact_mobile:          	payload.contact_mobile,		
				contact_email:          	payload.contact_email,		
				mobile_of_company:  		payload.mobile_of_company,		
				address_of_company: 		payload.address_of_company,	
				company_name:       		payload.company_name,
				description:				payload.description,
				profile_photo_url:  		payload.profile_photo_url,
	        }};
	        const options = { };
	        
	        await Distributor.updateOne( query, update, options).then((response)=>{
				return res.status(200).send("successfully edited the profile")
			})
    	}catch(err){
			console.log(err)
			return res.status(500).send("could not edit profile at the moment");
		}
	else{
		return res.status(500).send("could not find this account, it may have been deleted or it doesnt exist");
	}
})

module.exports = router;