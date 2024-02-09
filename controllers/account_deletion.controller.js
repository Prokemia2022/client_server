// middlewares
const del_shrt_account = require("../middleware/del_usershrt.middleware");
const Existing_User = require("../middleware/existing_user.middleware");
//models
const Client = require("../models/Client/Client");
const Distributor = require("../models/Distributor/Distributor");
const Manufacturer = require("../models/Manufacturer/Manufacturer");
const SalesPerson = require("../models/Sales/SalesPerson");

const delete_client_account = (async (req, res) => {
    const payload = req.query.query;
    // check if user exists
    const result = await Existing_User(payload) 
    if (!result){
        return res.status(401).send('we could not find an existing account with this email')
    }
    try{
        const email = payload
        const query={
            email_of_company: email
        }
        const del_result = await Client.findOneAndDelete(query);
        await del_shrt_account(email).then(()=>{
            return res.status(200).send('deleted successfull');
        }).catch((error)=>{
            console.log(error);
            return res.sendStatus(501);
        })
    }catch(err){
        console.log(err)
    }
});

const delete_distributor_account = (async (req, res) => {
    const payload = req.query.query;
    //check if user exists
    const result = await Existing_User(payload) 
    if (!result){
        return res.status(401).send('we could not find an existing account with this email')
    }
    try{
        const email = payload
        const query={
            email_of_company: email
        }
        const del_result = await Distributor.findOneAndDelete(query);
        await del_shrt_account(email).then(()=>{
            return res.status(200).send('deleted successfull');
        }).catch((error)=>{
            console.log(error);
            return res.sendStatus(501);
        })
    }catch(err){
        console.log(err)
    }
});

const delete_manufacturer_account = (async (req, res) => {
    const payload = req.query.query;
    //check if user exists
    const result = await Existing_User(payload) 
    if (!result){
        return res.status(401).send('we could not find an existing account with this email')
    }
    try{
        const email = payload
        const query={
            email_of_company: email
        }
        const del_result = await Manufacturer.findOneAndDelete(query);
        await del_shrt_account(email).then(()=>{
            return res.status(200).send('deleted successfull');
        }).catch((error)=>{
            console.log(error);
            return res.sendStatus(501);
        })
    }catch(err){
        console.log(err)
    }
});

const delete_salesperson_account = (async (req, res) => {
    const payload = req.query.query;
    //check if user exists
    const result = await Existing_User(payload) 
    if (!result){
        return res.status(401).send('we could not find an existing account with this email')
    }
    try{
        const email = payload
        const query={
            email_of_salesperson: email
        }
        const del_result = await SalesPerson.findOneAndDelete(query);
        await del_shrt_account(email).then(()=>{
            return res.status(200).send('deleted successfull');
        }).catch((error)=>{
            console.log(error);
            return res.sendStatus(501);
        })
    }catch(err){
        console.log(err)
    }
});

module.exports = {
    delete_client_account,
    delete_distributor_account,
    delete_manufacturer_account,
    delete_salesperson_account
}