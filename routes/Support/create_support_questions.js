//modules imports
const express = require("express");
//models imports
const Support_Question = require("../../models/Support/Support_questions.js");

const router = express.Router()

router.post("/",async(req,res)=>{
	const payload = req.body;

	if (!payload)
		return res.send(401).send("Bad Request")

	try{
		const new_Question = await Support_Question.create({
			name:			payload.name,
			email:  	    payload.email,
			message:		payload.message,
			solved:         false
		})
		
		return res.status(200).send("successfully posted a new question")
	}catch(err){
		console.log(err)
		return res.status(500).send("Could not add a new question")
	}
})

module.exports = router;