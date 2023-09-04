//modules imports
const express = require('express');
//models import
const Manufacturer = require('../../../models/Manufacturer/Manufacturer.js');

let router = express.Router()

router.post('/',async (req,res,next)=>{
    const payload = req.body; //get payload
    //console.log(payload)
    //check if payload is available
    if(!payload){
        return  res.status(401).send('Bad Request'); 
    }
    const id = payload._id //get the Manufacturer id
    ////console.log(payload)
	const existing_Manufacturer = await Manufacturer.findOne({_id:id}) //checks if a manufacturer_Account already exists
    
    if (existing_Manufacturer != null){ //if there is a client_account

        if (payload.acc_type === 'manufacturer'){
            //console.log('manufacturer1',existing_Manufacturer)
            return res.status(200).send(existing_Manufacturer)
        }else{
            //console.log(existing_Manufacturer)
            const query = { _id:id};
            if (existing_Manufacturer?.views == undefined){
                const update = { $set: {
                    views: 1
                }}
                const response = await Manufacturer.updateOne( query, update).then((response)=>{
                    return res.status(200).send(existing_Manufacturer)
                })
            }else{
                const update = { $set: {
                    views: existing_Manufacturer?.views + 1
                }}
                const response = await Manufacturer.updateOne( query, update).then((response)=>{
                    return res.status(200).send(existing_Manufacturer)
                })
            }
        }
    }else{
        return res.status(500).send("could not find this account, it may have been deleted or it doesnt exist");
    }
});

module.exports = router;