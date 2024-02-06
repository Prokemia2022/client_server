const Industry = require("../models/Utils/Industry.js");

const getindustries_srt = (async (req, res) =>{
    const query = { verification_status: true}
    const projection = {
        title: 1, cover_image: 1
    }
    const industries = await Industry.find(query,projection);
    return res.status(200).send(industries)
})

const get_data=(async (req, res)=>{
    const query = req.query?.query;
    const query_option = {title:query}
    const result = await Industry.findOne(query_option);
    return res.status(200).send(result)
})

module.exports = {
    getindustries_srt,
    get_data
}