const CODE_GENERATOR_FUNC=()=>{
    const characters = '0123456789';
    let result = '';
    const charactersLength = characters.length
    for (let i = 0;i < 6;i++){
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

module.exports = CODE_GENERATOR_FUNC
