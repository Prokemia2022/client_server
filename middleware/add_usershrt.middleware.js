const { welcome_new_user } = require("../controllers/email.controller");
const Usersshrt = require("../models/Utils/Usersshrt");

const add_shrt_account = (async (new_user) => {
    const user = {
        email_of_company: new_user.email_of_company,
        account_type: new_user.account_type,
        profile_photo_url: new_user.profile_photo_url,
        password: new_user.password,
        valid_email_status: new_user.valid_email_status,
        suspension_status: new_user.suspension_status,
        verification_status: new_user.verification_status,
        joined_in:  new_user.joined_in,
    }
    try {
        await Usersshrt.create(user).then(()=>{
            welcome_new_user(new_user.email_of_company)
            return user
        })
    } catch (error) {
        console.log(error)
        throw new Error('Error while creating account')
    }
});

module.exports = add_shrt_account;