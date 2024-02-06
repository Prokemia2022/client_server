const express = require("express");

const Client = require("../../models/Client/Client.js");
const Distributor = require("../../models/Distributor/Distributor.js");
const Manufacturer = require("../../models/Manufacturer/Manufacturer.js");
const Sales = require("../../models/Sales/SalesPerson.js");

const UserShrt = require('../../models/Utils/Usersshrt.js')

const router = express.Router();

router.post('/userall',async(req,res)=>{
    const query = {};
    const projection = {
        account_type: 1,
        email_of_salesperson: 1,
        profile_photo_url: 1,
        password: 1,
        valid_email_status: 1,
        suspension_status: 1,
        verification_status: 1,
        joined_in:  1,
    }
    const existing_users = await Sales.find(query, projection);
     
    updated_user_fields = existing_users.map(item => {
        return {
            email_of_company: item.email_of_salesperson,
            account_type: item.account_type,
            profile_photo_url: item.profile_photo_url,
            password: item.password,
            valid_email_status: item.valid_email_status,
            suspension_status: item.suspension_status,
            verification_status: item.verification_status,
            joined_in:  item.joined_in,
        };
      });
    console.log(updated_user_fields)

    try {
        await UserShrt.insertMany(updated_user_fields).then(()=>{
            return res.sendStatus(200)
        })
    } catch (error) {
        return res.sendStatus(501)
    }
})

module.exports = router;