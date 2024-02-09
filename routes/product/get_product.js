const express = require('express')
const Product = require("../../models/Utils/Product.js");

let router = express.Router()

router.post('/',async(req,res)=>{
    //get payload
    const  payload  = req.body;

    const id = payload._id
    //console.log(id)
    //use payload to find products
    if (!payload)
    	return res.status(401).send('Bad request')

    try{
        const product = await Product.findOne({_id:id});
        //console.log( product?.views);
        if (payload.acc_type == 'distributor' || payload.acc_type == 'manufacturer'){
            return res.status(200).send(product);
        }else{
            const query = { _id:id};
            if (product?.views == undefined){
                const update = { $set: {
                    views: 1
                }}
                const response = await Product.updateOne( query, update).then((response)=>{
                    return res.status(200).send(product);
                })
            }else{
                const update = { $set: {
                    views: product?.views + 1
                }}
                const response = await Product.updateOne( query, update).then((response)=>{
                    return res.status(200).send(product);
                })
            }
        }

        
    }catch(err){
        //console.log(err);
        return res.status(500).send("Error while fetching product")
    }
})

module.exports = router;