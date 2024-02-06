const Technology = require('../models/Utils/Technology.js')

const gettechnologies_srt = (async (req, res) =>{
    const query = { verification_status: true}
    const projection = {
        title: 1, cover_image: 1
    }
    const technologies = await Technology.find(query,projection);
    return res.status(200).send(technologies)
})

const get_data=(async (req, res)=>{
    const query = req.query?.query;
    const query_option = {title:query}
    const result = await Technology.findOne(query_option);
    return res.status(200).send(result)
})

module.exports = {
    gettechnologies_srt,
    get_data
}