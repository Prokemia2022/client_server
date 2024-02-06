const Existing_User = require("../middleware/existing_user.middleware");
const jwtgenerator = require("../middleware/jwtgenerator.middleware");
const bcrypt = require('bcryptjs');
const { signed_in_user } = require("./email.controller");

const signin = async(req, res)=>{
    const payload = req.body;
    const result = await Existing_User(payload.email_of_company);
    if (result){
        if(bcrypt.compareSync(payload?.password, result?.password)){
            const access_token = jwtgenerator(result);
            signed_in_user(result?.email_of_company)
            return res.status(200).send(access_token);
        }else{
            return res.status(400).send('wrong credentials, try again');
        }
    }
    return res.status(401).send("No account exists with this email"); // false value indicates user credentials are wrong
}

module.exports = signin;