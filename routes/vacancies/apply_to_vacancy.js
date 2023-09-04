//modules imports
const express = require("express");
//models imports
const Application = require('../../models/Utils/applications.js')


const router = express.Router()

router.post("/",async(req,res)=>{
	const payload = req.body;

	if (!payload)
		return res.send(401).send("Bad Request")

	try{
		const new_application = await Application.create({
			//vacancy info
            career_title:			payload?.career_title,
            career_id:	            payload?.career_id,
            career_description:  	payload?.career_description,
            //lister info
            name: 	                payload?.name,
            address: 		        payload?.address,
            gender: 		        payload?.gender,
            email:			        payload?.email,
            mobile:			        payload?.mobile,
            cover_head:			    payload?.cover_head,
            resume_url:			    payload?.resume_url,
		})
		
		return res.status(200).send("successfully applied to this vacancy")
	}catch(err){
		console.log(err)
		return res.status(500).send("Could not apply to this vacancy")
	}
})

module.exports = router;