const jwt = require('jsonwebtoken');
const { LOGGER } = require('../lib/logger.lib.js');
require('dotenv').config();

const AUTH_TOKEN_GENERATOR = (user)=>{
    /**
     * @description This middleware is used to generate a token for authenticating a user
     * 
     * @param user : {Object} - The user object
     * @argument USER_ID : {String} - The converted hexadecimal string
     * @argument ACCOUNT_TYPE: {String} - The type of account e.g
     * @argument NAME: {String} - The name of the user
     * 
     * @property JWT_OPTIONS: {Object} - 
     * @property JWT_PAYLOAD: {Object} - contains the claims about the user data.
     * @property AUTH_TOKEN:  {a 3 Base64-encoded string}
     *
     */

    const USER_ID = user?._id.toHexString();
    const ACCOUNT_TYPE = user?.account_type;
    const NAME = user?.name;

    const JWT_OPTIONS = {
        expiresIn: 100000,
        header: { 
            "alg": "HS256", // Signing algorithm
            "typ": "JWT" // Token type
        }
    };

    const JWT_PAYLOAD = {
        sub : USER_ID,
        name: NAME,
        account_type : ACCOUNT_TYPE,
    }

    try{
        const AUTH_TOKEN = jwt.sign(
            JWT_PAYLOAD,
            process.env.ACCESS_TOKEN_KEY,
            JWT_OPTIONS
        );
        return AUTH_TOKEN;
    }catch(err){
		LOGGER.log('error',`ERROR[AUTH_TOKEN_GENERATOR]: ${err}`);
        throw new Error('AUTH TOKEN generation error');
    }

};

const CODE_TOKEN_GENERATOR = (CODE)=>{

    const jwtOptions = {
        expiresIn: 10000,
        header: { 
            "alg": "HS256",
            "typ": "JWT"
        }
    };

    const jwtPayload = {
        code: CODE
    }

    try{
        const CODE_TOKEN = jwt.sign(
            jwtPayload,
            process.env.CODE_TOKEN_KEY,
            jwtOptions
        );
        return CODE_TOKEN;
    }catch(err){
        LOGGER.log('error',`System Error[on creating CODE token]`);
        throw new Error('CODE TOKEN generation error');
    }

}

module.exports = {
    AUTH_TOKEN_GENERATOR,
    CODE_TOKEN_GENERATOR
};
