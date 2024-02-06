const UserShrt = require('../models/Utils/Usersshrt.js')

const Existing_User=async(email)=>{
    const query = {
        email_of_company: email
    }
    try {
        const user = await UserShrt.findOne(query);
        return user;
    } catch (error) {
        console.log(error)
        throw new Error('Error while checking if user is in db');
    }
}

module.exports = Existing_User