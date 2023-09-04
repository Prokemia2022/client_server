const express = require('express')
const Product = require("../../models/Utils/Product.js");

let router = express.Router()

router.get('/:lister_id',async(req,res)=>{
    const lister_id = req.params?.lister_id;
    const search_query = req.query?.query;
    

    if(!lister_id){
        return res.status(500).send("Error while fetching products,missing parameters")
    }

    try{
        const query = {
            listed_by_id : lister_id,
        }
        
        const projections = {
            name_of_product : 1,
            sponsored : 1,
            verification_status : 1,
            short_on_expiry: 1,
            short_on_expiry_date : 1
        }
        const products = await Product.find(query,projections);
        console.log('products2',products)
        return res.status(200).send(products)
    }catch(err){
        console.log(err);
        return res.status(500).send("Error while fetching products")
    }
})

module.exports = router;