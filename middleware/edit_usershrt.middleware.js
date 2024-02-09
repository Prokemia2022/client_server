const Usersshrt = require("../models/Utils/Usersshrt");

const edit_shrt_account = (async (user) => {
    try {
        const query = {
            _id: user?.id
        }
        const update = { $set: {
            email_of_company:      user?.email_of_company,
            account_type:          user?.account_type,
            profile_photo_url:     user?.profile_photo_url,
            password:              user?.password,
            valid_email_status:    user?.valid_email_status,
            suspension_status:     user?.suspension_status,
            verification_status:   user?.verification_status,
            joined_in:             user?.joined_in,
        }}
        const user_res = await Usersshrt.updateOne(query, update);
        console.log(user_res,'edit2')
        return user;
    } catch (error) {
        console.log(error)
        throw new Error('Error while editing account')
    }
});

module.exports = edit_shrt_account;