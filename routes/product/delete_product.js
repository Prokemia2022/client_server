const express = require('express');

const Product = require("../../models/Utils/Product.js");
const Send_delete_product_email = require("./send_deleted_product_email.js")

let router = express.Router()

router.post("/",async (req,res)=>{
    //get payload
    const payload = req.body;
    //check if payload exists
    if(!payload){
        return res.send(400).send("Bad Request")
    }
    
    const id = payload._id
    
    try{
        const existing_product = await Product.findOne({_id:id});
        if (!existing_product){
        	return res.status(400).send("could not find this product")
        }else if(existing_product?.listed_by_id !== payload?.lister_id){
            console.log(existing_product?.listed_by_id,payload?.lister_id)
            return res.status(400).send("It seems you are not the owner of this product")
        }else{
            await Product.findOneAndDelete({_id:id} ).then((response)=>{
                const email_payload = {
                    email : existing_product.email_of_lister,
                    name_of_product: existing_product?.name_of_product
                }
                Send_delete_product_email(email_payload)
                return res.status(200).send("Sucessfully deleted this product")
            })
        }

        //return res.status(200).send("Sucessfully deleted")
    }catch(err){
		console.log(err);
    	return res.status(500).send("could not delete this product at the moment")
    }
})

module.exports = router;