const bcrypt = require('bcryptjs');

const Hash_str=(str)=>{
    const salt = bcrypt.genSaltSync(10);
    const hashed_str = bcrypt.hashSync(str, salt);
    return hashed_str;
}

module.exports = Hash_str;