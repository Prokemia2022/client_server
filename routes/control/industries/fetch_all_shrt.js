// const express = require('express')
// const Industry = require("../../../models/Utils/Industry");

// let router = express.Router()

// router.get('/',async(req,res)=>{
//     try{
//         const query = { }
//         const options = {
//             projection: {
//                 title : 1
//             }
//         }
//         const industries = await Industry.find(query,options);
//         return res.status(200).send(industries)
//     }catch(err){
//         console.log(err);
//     }
// })

// module.exports = router;