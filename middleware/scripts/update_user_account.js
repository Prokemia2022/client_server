const express = require("express");

const Client = require("../../models/Client/Client.js");
const Distributor = require("../../models/Distributor/Distributor.js");
const Manufacturer = require("../../models/Manufacturer/Manufacturer.js");
const Sales = require("../../models/Sales/SalesPerson.js");

const router = express.Router();

router.post('/updateall',async(req,res)=>{
    try{
        const update = { $set: {
            account_type: 		'salesperson',
        }};
        await Sales.updateMany(update).then((response)=>{
            return res.status(200).send("success")
        })	
    }catch(err){
        console.log(err)
        return res.status(500).send("could update profiles");
    }
})

module.exports = router;