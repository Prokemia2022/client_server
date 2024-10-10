/****************************UTILS*************************************/
const bcrypt = require('bcryptjs');

/****************************FUNCTION**********************************/

const HASH_STRING =(string)=>{
    const salt = bcrypt.genSaltSync(10);
    const HASHED_STRING = bcrypt.hashSync(string, salt);
    return HASHED_STRING;
}

module.exports = {
	HASH_STRING
}
