
const express = require("express")
const axios = require("axios")

const router = express.Router()

const Send_created_product_email=async(email_payload)=>{
	console.log('email',email_payload);

	if (!email_payload){
		console.log("Bad Request, no email_payload found")
	}else{
		await axios.post("http://localhost:5001/api/created_product_email",email_payload).then(()=>{
			console.log("success")
		}).catch((err)=>{
			console.log(err)
		})
	}

}

module.exports = Send_created_product_email;