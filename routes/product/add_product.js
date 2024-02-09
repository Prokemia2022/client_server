//modules import
const express = require("express");
//models import
const Product = require("../../models/Utils/Product.js");
const Send_created_product_email = require('./send_created_product_email.js')

const router = express.Router()

router.post("/",async(req,res)=>{
	const payload = req.body;
	
	if (!payload)
		return res.send(401).send("Bad Request")

	const title = payload.name_of_product
	const existing_product = await Product.findOne({name_of_product:title})

	if (existing_product){
		return res.status(401).send('This product already exists')
	}else{
		try{
			//console.log(payload)
			console.time("new_Product")
			const new_Product = await Product.create({
				name_of_product: 					payload.name_of_product,
				manufactured_by: 					payload.manufactured_by,
				manufactured_by_id:					payload.manufactured_by_id,
				distributed_by:						payload.distributed_by,
				distributed_by_id:					payload.distributed_by_id,
				listed_by_id:						payload.listed_by_id,
				description_of_product:				payload.description_of_product,
				chemical_name:  					payload.chemical_name,
				function:							payload.function,
				brand:								payload.brand,
				data_sheet:							payload.data_sheet_url,
				safety_data_sheet:					payload.safety_data_sheet_url,
				formulation_document: 				payload.formulation_document_url,
				features_of_product:				payload.features_of_product,
				application_of_product:				payload.application_of_product,
				packaging_of_product:				payload.packaging_of_product,
				storage_of_product:					payload.storage_of_product,
				manufactured_date: 					payload.manufactured_date,
				industry: 							payload.industry,
				technology: 						payload.technology,
				sponsored:							false,
				short_on_expiry: 					payload.short_on_expiry,
				short_on_expiry_date:				payload.short_on_expiry_date,
				email_of_lister: 					payload.email_of_lister,
				website_link_to_Seller: 			payload.website_link_to_Seller,
				verification_status:				false,
				views:								0
			})
			console.timeEnd("new_Product")
			console.log(new_Product)
			const email_payload = {
                email : payload.email_of_lister,
                name_of_product: payload.name_of_product
            }
            Send_created_product_email(email_payload)
			return res.status(200).send(new_Product)
		}catch(err){
			console.log(err)
			return res.status(500).send("Could not add a new product")
		}
	}
})

module.exports = router;