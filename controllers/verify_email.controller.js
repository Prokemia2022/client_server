// middlewares
const edit_shrt_account = require("../middleware/edit_usershrt.middleware");
const Existing_User = require("../middleware/existing_user.middleware");
//models
const Client = require("../models/Client/Client");
const Distributor = require("../models/Distributor/Distributor");
const Manufacturer = require("../models/Manufacturer/Manufacturer");
const Salesperson = require("../models/Sales/SalesPerson");
const { password_changed } = require("./email.controller");

const handle_verify=async(req, res)=>{
    const {email_of_company } = req.body;
    console.log(email_of_company)
    const result = await Existing_User(email_of_company);
    console.log(result)
    if (result?.account_type === 'client'){
        await verify_client_email(result).then((response)=>{
            return res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
            return res.status(501).send('This email does not have an existing account')
        });
    }
    if (result?.account_type === 'salesperson'){
        await verify_salesperson_email(result).then((response)=>{
            return res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
            return res.status(501).send('This email does not have an existing account')
        });
    }
    if (result?.account_type === 'manufacturer'){
        await verify_manufacturer_email(result).then((response)=>{
            return res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
            return res.status(501).send('This email does not have an existing account')
        });
    }
}

const verify_client_email = (async (result) => {
    if (!result){
        throw new Error('This email does not have an existing account')
    }
    const email = result?.email_of_company
    const query = {email_of_company:email};
	const update = { $set: {
        valid_email_status: true
    }};
    const options = { };
    const res = await Client.updateOne( query, update, options)
    const user = {
        id: result?._id,
        email_of_company:       result?.email_of_company,
        account_type:           result?.account_type,
        profile_photo_url:      result?.profile_photo_url,
        password:               result?.password,
        valid_email_status:     true,
        suspension_status:      result?.suspension_status,
        verification_status:    result?.verification_status,
        joined_in:              result?.joined_in,
    }
    const result_data = await edit_shrt_account(user);
    return result_data
});

const verify_salesperson_email = (async (result) => {
    if (!result){
        throw new Error('This email does not have an existing account')
    }
    const email = result?.email_of_company
    const query = {email_of_salesperson:email};
	const update = { $set: {
        valid_email_status: true
    }};
    const options = { };
    const res = await Salesperson.updateOne( query, update, options)
    const user = {
        id: result?._id,
        email_of_company:       result?.email_of_company,
        account_type:           result?.account_type,
        profile_photo_url:      result?.profile_photo_url,
        password:               result?.password,
        valid_email_status:     true,
        suspension_status:      result?.suspension_status,
        verification_status:    result?.verification_status,
        joined_in:              result?.joined_in,
    }
    const result_data = await edit_shrt_account(user);
    return result_data
});
const verify_manufacturer_email = (async (result) => {
    if (!result){
        throw new Error('This email does not have an existing account')
    }
    const email = result?.email_of_company
    const query = {email_of_company:email};
	const update = { $set: {
        valid_email_status: true
    }};
    const options = { };
    const res = await Manufacturer.updateOne( query, update, options)
    const user = {
        id: result?._id,
        email_of_company:       result?.email_of_company,
        account_type:           result?.account_type,
        profile_photo_url:      result?.profile_photo_url,
        password:               result?.password,
        valid_email_status:     true,
        suspension_status:      result?.suspension_status,
        verification_status:    result?.verification_status,
        joined_in:              result?.joined_in,
    }
    const result_data = await edit_shrt_account(user);
    return result_data
});

module.exports = {
    handle_verify,
}