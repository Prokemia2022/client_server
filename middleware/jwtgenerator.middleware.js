const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtgenerator = (payload)=>{
    //console.log(response)
    const email = payload?.email_of_company;
    //console.log(id)
    const account_type = payload.account_type;
    const jwtOptions = {
        expiresIn: 3600,      // 300 seconds
        header: { 
            "alg": "HS256",
            "typ": "JWT"
        }
    }
    const token = jwt.sign(
        {email, account_type},
        process.env.TOKEN_CLIENT_KEY,
        jwtOptions
    )
    return token;
}
module.exports = jwtgenerator