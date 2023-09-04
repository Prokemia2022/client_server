const express = require('express');

const Product = require("../../models/Utils/Product.js");

let router = express.Router()

router.post("/",async (req,res)=>{
    //get product details
    const payload = req.body;

    console.log(payload)
    if(!payload){
        return res.status(400).send('Bad request')
    }

    const id = payload._id
    //console.log(id)
    
    const existing_product = await Product.findOne({_id:id})

    if (payload.uid !== existing_product?.listed_by_id){
        return res.status(401).send('Bad request')
    }
    
    //console.log(existing_product)
    if(!existing_product){
        return res.status(400).send('This product does not exist or may have been deleted')
    }
    try{
        const query = {_id:id};
        const update = { $set: {
            name_of_product: 					payload.name_of_product,
			manufactured_by: 					payload.manufactured_by,
			distributed_by:						payload.distributed_by,
			manufactured_date: 					payload.manufactured_date,
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
			industry: 							payload.industry,
			technology: 						payload.technology,
			short_on_expiry: 					payload.short_on_expiry,
			website_link_to_Seller: 			payload.website_link_to_Seller,
        }};
        const options = { };
        
        await Product.updateOne( query, update, options).then((response)=>{return res.status(200).send("success")})
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not edit this product, try again in a few minutes");
    }
})

module.exports = router;