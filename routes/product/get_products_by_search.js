const express = require('express')
const Product = require("../../models/Utils/Product.js");

let router = express.Router()

router.get('/',async(req,res)=>{
    const search_query = req.query?.query;

    //console.log(search_query)
    if(!search_query){
        return res.status(500).send("Error while fetching products,missing parameters")
    }

    try{
        const query = {
            verification_status : true,
            suspension_status : false,
        }
        
        const projections = {
            name_of_product : 1,
            distributed_by : 1,
            industry : 1,
            technology : 1
        }
        const products = await Product.find(query,projections);
        const result = products.filter((item) => item.name_of_product?.toLowerCase().includes(search_query.toLowerCase()) ||
                                                 item.industry?.toLowerCase().includes(search_query.toLowerCase()) || 
                                                 item.technology?.toLowerCase().includes(search_query.toLowerCase())
											)
        //console.log('products2',result)
        
        return res.status(200).send(result)
    }catch(err){
        //console.log(err);
        return res.status(500).send("Error while fetching products")
    }
})

module.exports = router;
