//modules imports
const express = require('express');
//models import
const Distributor = require('../../../models/Distributor/Distributor.js');

let router = express.Router()

router.post('/',async (req,res,next)=>{
    const payload = req.body; //get payload
    //console.log(payload)
    //check if payload is available
    if(!payload){
        return  res.status(401).send('Bad Request'); 
    }
    const id = payload._id //get the distributor id

	const existing_distributor = await Distributor.findOne({_id:id}) //checks if a client_Account already exists

	if (existing_distributor != null){ //if there is a client_account
        
        if (payload.acc_type === 'distributor'){
            //console.log('distributor1',existing_distributor)
            return res.status(200).send(existing_distributor)
        }else{
            const query = { _id:id};
    
            if (existing_distributor?.views == undefined){
                //console.log('distributor2',existing_distributor)
                const update = { $set: {
                    views: 1
                }}
                const response = await Distributor.updateOne( query, update).then((response)=>{
                    return res.status(200).send(existing_distributor)
                })
            }else{
                //console.log('distributor3',existing_distributor)
                const update = { $set: {
                    views: existing_distributor?.views + 1
                }}
                const response = await Distributor.updateOne( query, update).then((response)=>{
                    return res.status(200).send(existing_distributor)
                })
            }
        }
    }else{
        return res.status(500).send("could not find this account, it may have been deleted or it doesnt exist");
    }
});

module.exports = router;