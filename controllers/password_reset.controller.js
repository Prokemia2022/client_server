// middlewares
const Hash_str = require("../middleware/Hash.middleware");
const edit_shrt_account = require("../middleware/edit_usershrt.middleware");
const Existing_User = require("../middleware/existing_user.middleware");
//models
const Client = require("../models/Client/Client");
const Distributor = require("../models/Distributor/Distributor");
const Manufacturer = require("../models/Manufacturer/Manufacturer");
const Salesperson = require("../models/Sales/SalesPerson");
const { password_changed } = require("./email.controller");

const handle_reset=async(req, res)=>{
    const {email_of_company, password } = req.body;
    const result = await Existing_User(email_of_company);
    const data = {
        result,
        password
    }
    if (result?.account_type === 'client'){
        await reset_client_password(data).then((response)=>{
            return res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
            return res.status(501).send('This email does not have an existing account')
        });
    }
    if (result?.account_type === 'salesperson'){
        await reset_salesperson_password(data).then((response)=>{
            return res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
            return res.status(501).send('This email does not have an existing account')
        });
    }
    if (result?.account_type === 'manufacturer'){
        await reset_manufacturer_password(data).then((response)=>{
            return res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
            return res.status(501).send('This email does not have an existing account')
        });
    }
    if (result?.account_type === 'distributor'){
        await reset_distributor_password(data).then((response)=>{
            return res.status(200).send("success")
        }).catch((err)=>{
            console.log(err)
            return res.status(501).send('This email does not have an existing account')
        });
    }
}

const reset_client_password = (async (props) => {
    const {result, password} = props;
    if (!result){
        throw new Error('This email does not have an existing account')
    }

    const email = result?.email_of_company;
    const query = {email_of_company:email};
    const hashed_password = Hash_str(password);
	const update = { $set: {
        password: hashed_password
    }};

    const options = { };
    const res = await Client.updateOne( query, update, options)
    const user = {
        id: result?._id,
        email_of_company:       result?.email_of_company,
        account_type:           result?.account_type,
        profile_photo_url:      result?.profile_photo_url,
        password:               hashed_password,
        valid_email_status:     result?.valid_email_status,
        suspension_status:      result?.suspension_status,
        verification_status:    result?.verification_status,
        joined_in:              result?.joined_in,
    }
    const result_data = await edit_shrt_account(user);
    password_changed(result?.email_of_company)
    return result_data
});

const reset_salesperson_password = (async (props) => {
    const {result, password} = props;
    if (!result){
        throw new Error('This email does not have an existing account')
    }
    const email = result?.email_of_company;
    const query = {email_of_salesperson:email};
    const hashed_password = Hash_str(password);

	const update = { $set: {
        password: hashed_password
    }};
    
    const options = { };
    const res = await Salesperson.updateOne( query, update, options)
    const user = {
        id: result?._id,
        password:               hashed_password,
    }
    const result_data = await edit_shrt_account(user);
    password_changed(result?.email_of_company)
    return result_data
});

const reset_manufacturer_password = (async (props) => {
    const {result, password} = props;
    if (!result){
        throw new Error('This email does not have an existing account')
    }
    const email = result?.email_of_company;
    const query = {email_of_company:email};
    const hashed_password = Hash_str(password);

	const update = { $set: {
        password: hashed_password
    }};
    
    const options = { };
    const res = await Manufacturer.updateOne( query, update, options)
    const user = {
        id: result?._id,
        password:               hashed_password,
    }
    const result_data = await edit_shrt_account(user);
    password_changed(result?.email_of_company)
    return result_data
});

const reset_distributor_password = (async (props) => {
    const {result, password} = props;
    if (!result){
        throw new Error('This email does not have an existing account')
    }
    const email = result?.email_of_company;
    const query = {email_of_company:email};
    const hashed_password = Hash_str(password);

	const update = { $set: {
        password: hashed_password
    }};
    
    const options = { };
    const res = await Distributor.updateOne( query, update, options)
    const user = {
        id: result?._id,
        password:               hashed_password,
    }
    const result_data = await edit_shrt_account(user);
    password_changed(result?.email_of_company)
    return result_data
});

module.exports = {
    handle_reset,
}