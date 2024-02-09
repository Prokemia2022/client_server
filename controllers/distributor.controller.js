const Distributor = require("../models/Distributor/Distributor");

const getdistributors_srt = (async (req, res) => {
    const query = { 
        verification_status : true,
        suspension_status: false,
    }
    const projection = {
        company_name: 1,
        description: 1,
        profile_photo_url: 1,
        subscription: 1,
        account_type: 1
    }
    const distibutors = await Distributor.find(query, projection);
    return res.status(200).send(distibutors);
});

const get_data = (async (req, res)=>{
    const email = req.query.query;
    const query = { email_of_company: email};
    const existing_user = await Distributor.findOne(query);
    return res.status(200).send(existing_user)
});

const get_distributor=(async (req,res)=>{
    const id = req.query.query;
    const query = { _id: id};
    const existing_user = await Distributor.findOne(query);
    if (existing_user?.views == undefined){
        const update = { $set: { views: 1 }}
        const response = await Distributor.updateOne( query, update).then(()=>{
            return res.status(200).send(existing_user)
        })
    }else{
        const update = { $set: { views: existing_user?.views + 1 }}
        const response = await Distributor.updateOne( query, update).then(()=>{
            return res.status(200).send(existing_user)
        })
    }
});

const edit_distributor=(async(req,res)=>{
    const payload = req.body;
    const id = payload._id;
    const existing_distributor = await Distributor.findOne({_id:id});
    try{
        const query = {_id:id};
        const update = { $set: {
            contact_person_name:        payload.contact_person_name,
            contact_mobile:          	payload.contact_mobile,		
            contact_email:          	payload.contact_email,	
            email_of_company:   		payload.email_of_company,		
            mobile_of_company:  		payload.mobile_of_company,		
            address_of_company: 		payload.address_of_company,	
            company_name:       		payload.company_name,
            description:				payload.description,
            profile_photo_url:  		payload.profile_photo_url,
        }};
        const options = { };
        await Distributor.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })	
    }catch(err){
        console.log(err)
        return res.status(500).send("could not edit profile at the moment");
    }
});
// experts
const create_new_expert=(async (req,res)=>{
    const payload = req.body; //get payload
    const id = payload._id;
    const existing_distributor = await Distributor.findOne({_id:id});
    const expert_item = {
        'name': 		payload.name,
        'mobile': 		payload.mobile, 
        'email': 		payload.email,
        'role': 		payload.role,
        'description': 		payload.description,
    }
    try{
        const query = {_id:id};
        const update = { $push: {"experts": {"$each": [expert_item]}}};
        const options = { };
        
        await Distributor.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }catch(err){
        return res.status(500).send("Could not add a expert, try again in a few minutes");
    }
});

const edit_expert=(async (req,res)=>{
    const payload = req.body; //get payload
    const id = payload.id //use id to find existing user account
    const existing_distributor = await Distributor.findOne({_id:id});
    const prev_name = payload.prev_name;
    const expert_item = {
        'name': 		payload.name,
        'mobile': 		payload.mobile, 
        'email': 		payload.email,
        'role': 		payload.role,
        'description': 		payload.description,
    }

    const query = {_id:id};
    const options = { };
    try{
        const update = { $pull: {"experts": { name:prev_name}}};
        await Distributor.updateOne( query, update, options)
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not edit this expert, try again in a few minutes");
    }

    try{
        const update = { $push: {"experts": {"$each": [expert_item]}}};
        await Distributor.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not edit this expert, try again in a few minutes");
    }
});

const delete_expert=(async(req,res)=>{
    const payload = req.body; //get payload
    const id = payload._id;
    const existing_distributor = await Distributor.findOne({_id:id});
    const name = payload.name;
    try{
        const query = {_id:id};
        const update = { $pull: {"experts": { name:name}}};
        const options = { };
        
        await Distributor.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not delete this expert, try again in a few minutes");
    }
});
// manufacturers
const create_manufacturer=(async(req,res)=>{
    const payload = req.body;
    const id = payload._id;
	const existing_distributor = await Distributor.findOne({_id:id})
    const manufacturer_item = {
        'name': 	payload.name,
        'email': 	payload.email,
        'mobile': 	payload.mobile
    }
    try{
        const query = {_id:id};
        const update = { $push: {"manufacturers": {"$each": [manufacturer_item]}}};
        const options = { };
        
        await Distributor.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }catch(err){
        return res.status(500).send("Could not add a manufacturer, try again in a few minutes");
    }
})

const edit_manufacturer=(async(req,res)=>{
    const payload = req.body;
    const id = payload._id;
	const existing_distributor = await Distributor.findOne({_id:id})
    const prev_name = payload.prev_name;

    const manufacturer_item = {
        'name': 	payload.name,
        'email': 	payload.email,
        'mobile': 	payload.mobile
    }
    const query = {_id:id};
    const options = { };

    try{
        const update = { $pull: {"manufacturers": { name:prev_name}}};
        
        await Distributor.updateOne( query, update, options)
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not edit this manufacturer, try again in a few minutes");
    }
    try{
        const update = { $push: {"manufacturers": {"$each": [manufacturer_item]}}};        
        await Distributor.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not edit this manufacturer, try again in a few minutes");
    }
})

const delete_distributor=(async(req,res)=>{
    const payload = req.body;
    const id = payload._id;
	const existing_distributor = await Distributor.findOne({_id:id})
    const name = payload.name;
    try{
        const query = {_id:id};
        const update = { $pull: {"manufacturers": { name:name}}};
        const options = { };
        
        await Distributor.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not delete this manufacturer, try again in a few minutes");
    }
})

module.exports = {
    getdistributors_srt,
    get_data,
    get_distributor,
    edit_distributor,
    create_new_expert,
    edit_expert,
    delete_expert,
    create_manufacturer,
    edit_manufacturer,
    delete_distributor
}