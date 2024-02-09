//modules import
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
//models import
const Client = require("../../../models/Client/Client.js");
const Distributor = require("../../../models/Distributor/Distributor.js");
const Manufacturer = require("../../../models/Manufacturer/Manufacturer.js");
const Sales = require("../../../models/Sales/SalesPerson.js");

//creates a new client
const Client_User=async(payload)=>{
	//check if payload is available
    if(!payload){
        return  res.status(401).send('Bad Request'); 
    }

    //sign a token and encrypt password
    const salt = bcrypt.genSaltSync(10);
    const encrypted_password = bcrypt.hashSync(payload.password, salt);
    const email = payload.email_of_company
    const acc_type = 'client'
    try{
        const token = jwt.sign(
            {email},
            process.env.TOKEN_CLIENT_KEY,
            {
                expiresIn: '2d'
            }
        )
        //console.log(token)
        const new_Client = await Client.create({
			first_name:         payload.first_name,	
			last_name:          payload.last_name,
			password:           encrypted_password,
            profile_photo_url:  '',
			access_token:       token, 
			address:            "",	
			company_name:       "",	
			position:           "",	
			gender:             "",		
			mobile_of_company:  "",		
			email_of_company:   payload.email_of_company,
            listing_status:     false,	
			recents:            [],
            valid_email_status: false,
            suspension_status:  false,	
		})
        
        //on success email/sms the client to verify account
        return new_Client //return new user 
    }catch(err){
        res.status(201).send('Could not create an account at the moment, try again')
    }
}

//creates a new distributor account
const Distributor_User=async(payload)=>{
	//check if payload is available
    //console.log(payload)
    if(!payload){
        return  res.status(401).send('Bad Request'); 
    }

    //sign a token and encrypt password
    const salt = bcrypt.genSaltSync(10);
    const encrypted_password = bcrypt.hashSync(payload.password, salt);
    const email = payload.email

    try{
        const token = jwt.sign(
            {email},
            process.env.TOKEN_DISTRIBUTOR_KEY,
            {
                expiresIn: '2d'
            }
        )
        //console.log(token)
        const new_Distributor = await Distributor.create({
			contact_person_name:             '',
            contact_mobile:              '',
            contact_email:              '',
            profile_photo_url:      '',
			mobile_of_company:      "",		
			email_of_company:       payload.email_of_company,		
            address_of_company:     "",	
			company_name:           payload.company_name,
            description:			"",
            password:               encrypted_password,
            access_token:           token,
			key_contact:            [],	
			experts:	            [],
			manufacturers:          [],
            subscription:	        false,
			subscription_plan:      '',
            listing_status: 	    false,
            sponsored_products:		0,
            verification_status:    false,
            valid_email_status: false,
            suspension_status:  false,
            views:                  0
		})
        //(new_Distributor)
        //on success email/sms the client to verify account
        return new_Distributor //return new user 
    }catch(err){
        res.status(401).send('Could not create an account at the moment, try again')
    }
}

const Manufacturer_User=async(payload)=>{
	//check if payload is available
    if(!payload){
        return  res.status(401).send('Bad Request'); 
    }

    //sign a token and encrypt password
    const salt = bcrypt.genSaltSync(10);
    const encrypted_password = bcrypt.hashSync(payload.password, salt);
    const email = payload.email

    try{
        const token = jwt.sign(
            {email},
            process.env.TOKEN_MANUFACTURER_KEY,
            {
                expiresIn: '2d'
            }
        )
        //console.log(token)
        const new_Manufacturer = await Manufacturer.create({
            contact_person_name:             '',
            contact_mobile:              '',
            contact_email:              '',
            profile_photo_url:      '',
			mobile_of_company:      "",		
			email_of_company:       payload.email_of_company,	
            address_of_company:     "",	
			company_name:           payload.company_name,
            description:			"",
            password:               encrypted_password,
            access_token:           token,
			key_contact:            [],	
			experts:	            [],
			distributors:           [],
            subscription:	        false,
			subscription_plan:      '',
            listing_status: 	    false,
            sponsored_products:		0,
            verification_status:    false,
            valid_email_status: false,
            suspension_status:  false,
            views:                  0
		})
        
        //on success email/sms the client to verify account
        return new_Manufacturer //return new user 
    }catch(err){
        res.status(401).send('Could not create an account at the moment, try again')
    }
}

const Sales_User=async(payload)=>{
    //check if payload is available
    if(!payload){
        return  res.status(401).send('Bad Request'); 
    }

    //sign a token and encrypt password
    const salt = bcrypt.genSaltSync(10);
    const encrypted_password = bcrypt.hashSync(payload.password, salt);
    const email = payload.email

    try{
        //console.log(token)
        const new_SalesPerson = await Sales.create({
			first_name:         payload.first_name,	
			last_name:          payload.last_name,
            bio:                "",
            payment_method:     '',
			gender:             "",		
            profile_photo_url:  '',
			mobile_of_salesperson:  "",		
			email_of_salesperson:   payload.email_of_company,		
			address:            "",	
			company_name:       "",
			position:           "",	
			password:           encrypted_password,	
			access_token:       '',
            hub_access_status:  false,
	        hub_account_id: 	"",
            account_status:     false,
			recents:            [],
            open_to_consultancy:    false,
            verification_status:    false,
            valid_email_status: false,
            suspension_status:  false,
		})
        return new_SalesPerson;
        
        //on success email/sms the client to verify account
        //return new_SalesPerson //return new user 
    }catch(err){
        console.log(err)
        //res.status(401).send('Could not create an account at the moment, try again')
    }
}


module.exports = {
	create_client_account: Client_User,
	create_distributor_account: Distributor_User,
	create_manufacturer_account: Manufacturer_User,
	create_salesperson_account: Sales_User
}