// middlewares
const Hash_str = require("../middleware/Hash.middleware");
const add_shrt_account = require("../middleware/add_usershrt.middleware");
const Existing_User = require("../middleware/existing_user.middleware");
const jwtgenerator = require("../middleware/jwtgenerator.middleware");
//models
const Client = require("../models/Client/Client");
const Distributor = require("../models/Distributor/Distributor");
const Manufacturer = require("../models/Manufacturer/Manufacturer");
const SalesPerson = require("../models/Sales/SalesPerson");

const create_client_account = (async (req, res) => {
    const payload = req.body;
    // check if user exists
    const result = await Existing_User(payload.email_of_company) 
    if (result){
        return res.status(201).send('This email already has an existing account')
    }
    const hashed_password = Hash_str(payload?.password);
    const access_token = jwtgenerator(payload)
    const new_User = await Client.create({
        first_name:         payload.first_name,	
        last_name:          payload.last_name,
        gender:             "",		
        profile_photo_url:  '',
        account_type:       payload?.account_type,
        email_of_company:   payload.email_of_company,
        mobile_of_company:  "",		
        address:            "",	
        company_name:       "",	
        position:           "",	
        recents:            [],
        password:           hashed_password,
        access_token:       access_token, 
        listing_status:     false,	
        valid_email_status: false,
        suspension_status:  false,
        joined_in:          Date.now()
    })
    await add_shrt_account(new_User).then(()=>{
        return res.status(200).send(access_token);
    }).catch((error)=>{
        console.log(error);
        return res.sendStatus(501);
    })
});

const create_distributor_account = (async (req, res) => {
    const payload = req.body;
    // check if user exists
    const result = await Existing_User(payload.email_of_company) 
    if (result){
        return res.status(201).send('This email already has an existing account')
    }
    const hashed_password = Hash_str(payload?.password);
    const access_token = jwtgenerator(payload)
    const new_User = await Distributor.create({
        contact_person_name:                '',
        contact_mobile:                     '',
        contact_email:                      '',
        profile_photo_url:                  '',
        account_type:                       payload?.account_type,
        description:			            "",
        email_of_company:                   payload.email_of_company,		
        mobile_of_company:                  "",		
        company_name:                       payload.company_name,
        address_of_company:                 "",	
        password:                           hashed_password,
        access_token:                       access_token,
        listing_status: 	                false,
        sponsored_products:		            0,
        experts:	                        [],
        manufacturers:                      [],
        views:                              0,
        key_contact:                        [],	
        subscription:	                    false,
        subscription_plan:                  '',
        valid_email_status:                 false,
        verification_status:                false,
        suspension_status:                  false,
        joined_in:                          Date.now()
    })
    await add_shrt_account(new_User).then(()=>{
        return res.status(200).send(access_token);
    }).catch((error)=>{
        console.log(error);
        return res.sendStatus(501)
    })
});

const create_manufacturer_account = (async (req, res) => {
    const payload = req.body;
    // check if user exists
    const result = await Existing_User(payload.email_of_company) 
    if (result){
        return res.status(201).send('This email already has an existing account')
    }
    const hashed_password = Hash_str(payload?.password);
    const access_token = jwtgenerator(payload)
    const new_User = await Manufacturer.create({
        contact_person_name:                '',
        contact_mobile:                     '',
        contact_email:                      '',
        profile_photo_url:                  '',
        account_type:                       payload?.account_type,
        description:			            "",
        email_of_company:                   payload.email_of_company,		
        mobile_of_company:                  "",		
        company_name:                       payload.company_name,
        address_of_company:                 "",	
        password:                           hashed_password,
        access_token:                       access_token,
        listing_status: 	                false,
        sponsored_products:		            0,
        experts:	                        [],
        distributors:                       [],
        views:                              0,
        key_contact:                        [],	
        subscription:	                    false,
        subscription_plan:                  '',
        valid_email_status:                 false,
        verification_status:                false,
        suspension_status:                  false,
        joined_in:                          Date.now()
    })
    await add_shrt_account(new_User).then(()=>{
        return res.status(200).send(access_token);
    }).catch((error)=>{
        console.log(error);
        return res.sendStatus(501)
    })
});

const create_salesperson_account = (async (req, res) => {
    const payload = req.body;
    // check if user exists
    const result = await Existing_User(payload.email_of_company) 
    if (result){
        return res.status(201).send('This email already has an existing account')
    }
    const hashed_password = Hash_str(payload?.password);
    const access_token = jwtgenerator(payload)
    const new_User = await SalesPerson.create({
        first_name:             payload.first_name,	
        last_name:              payload.last_name,
        bio:                    "",
        payment_method:         '',
        gender:                 "",		
        profile_photo_url:      '',
        account_type:           payload?.account_type,
        mobile_of_salesperson:  "",		
        email_of_salesperson:   payload.email_of_company,		
        address:                "",	
        company_name:           "",
        position:               "",	
        password:               hashed_password,	
        access_token:           access_token,
        hub_access_status:      false,
        hub_account_id: 	    "",
        account_status:         false,
        recents:                [],
        open_to_consultancy:    false,
        verification_status:    false,
        valid_email_status:     false,
        suspension_status:      false,
        joined_in:              Date.now()
    })
    const sales_user = {
        email_of_company:       new_User.email_of_salesperson,
        account_type:           new_User.account_type,
        profile_photo_url:      new_User.profile_photo_url,
        password:               new_User.password,
        valid_email_status:     new_User.valid_email_status,
        suspension_status:      new_User.suspension_status,
        verification_status:    new_User.verification_status,
        joined_in:              new_User.joined_in,
    }
    await add_shrt_account(sales_user).then(()=>{
        return res.status(200).send(access_token);
    }).catch((error)=>{
        console.log(error);
        return res.sendStatus(501)
    })
});

module.exports = {
    create_client_account,
    create_distributor_account,
    create_manufacturer_account,
    create_salesperson_account
}
