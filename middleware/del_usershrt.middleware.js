const { user_deleted_account } = require("../controllers/email.controller");
const Usersshrt = require("../models/Utils/Usersshrt");

const del_shrt_account = (async (email) => {
    const query = {
        email_of_company: email
    }
    try {
        await Usersshrt.findOneAndDelete(query).then(()=>{
            user_deleted_account(email)
            return 'success'
        })
    } catch (error) {
        console.log(error)
        throw new Error('Error while deleting account')
    }
});

module.exports = del_shrt_account;