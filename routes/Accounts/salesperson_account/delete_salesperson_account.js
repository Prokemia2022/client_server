//modules import
const express = require("express");
//models import
const Sales = require('../../../models/Sales/SalesPerson.js');
const Send_delete_account_email = require("../send_deleted_account_email.js")

const router = express.Router();

router.post('/',async(req,res)=>{
	//get_payload
	const payload = req.body; 

	if (!payload)
		return res.status(400).send("Bad Request")

	const id = payload._id //get the salesperson id
	const existing_salesperson = await Sales.findOne({_id:id})

    if (existing_salesperson != null)
		try{
			await Sales.findOneAndDelete({_id:id} ).then((response)=>{
				const email_payload = {
	                email : existing_salesperson.email_of_salesperson
	            }
	            Send_delete_account_email(email_payload)
                return res.status(200).send("Sucessfully deleted this account")
            })
    	}catch(err){
            console.log(err)
            return res.status(500).send("could not delete your profile at the moment");
        }
	else{
		return res.status(500).send("could not find this account, it may have been deleted or it doesnt exist");
	}
})

module.exports = router;