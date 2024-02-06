const Product = require("../models/Utils/Product.js");

const getproducts_srt = (async (req, res) =>{
    const query = { verification_status: true, sponsored: true };
    const projection = { name_of_product: 1,  distributed_by: 1, technology: 1, industry: 1, sponsored: 1 }
    const products = await Product.find(query,projection);
    return res.status(200).send(products)
})

const products_search = (async (req, res) =>{
    const search_query = req.query?.query;
    const query = { verification_status: true, suspension_status : false, };
    const projection = { name_of_product: 1,  distributed_by: 1,manufactured_by: 1,distributed_by_id: 1, manufactured_by_id: 1, technology: 1, industry: 1, sponsored: 1, brand:1, application_of_product:1, views: 1, function: 1, features_of_product: 1 }
    const products = await Product.find(query,projection);
    const filtered_result = products.filter((item) => item.name_of_product?.toLowerCase().includes(search_query.toLowerCase()) || item.industry?.toLowerCase().includes(search_query.toLowerCase()) ||  item.technology?.toLowerCase().includes(search_query.toLowerCase()) ||  item.manufactured_by?.toLowerCase().includes(search_query.toLowerCase()) ||  item.distributed_by?.toLowerCase().includes(search_query.toLowerCase()))
    return res.status(200).send(filtered_result)
});

const product_data=(async (req,res)=>{
    const id = req.query?.query;
    const query = {_id: id};
    const product = await Product.findOne(query);
    if (product?.views == undefined){
        const update = { $set: { views: 1 }}
        const response = await Product.updateOne( query, update);
        return res.status(200).send(product);
    }else{
        const update = { $set: { views: product?.views + 1 }}
        const response = await Product.updateOne( query, update)
        return res.status(200).send(product);
    }
})

const product_by_lister=(async(req, res)=>{
    const id = req.query?.query;
    const query = {listed_by_id: id}
    const projection = { name_of_product: 1,  distributed_by: 1,manufactured_by: 1,distributed_by_id: 1, manufactured_by_id: 1, technology: 1, industry: 1, sponsored: 1, brand:1, application_of_product:1, views: 1, function: 1,features_of_product: 1 }
    const products = await Product.find(query,projection);
    return res.status(200).send(products)
})

const delete_product=(async (req, res)=>{
    const id = req.query.pid;
    const existing_product = await Product.findOne({_id:id});
    if (!existing_product){
        return res.status(400).send("could not find this product")
    }else{
        await Product.findOneAndDelete({_id:id} ).then((response)=>{
            return res.status(200).send("Sucessfully deleted this product")
        })
    }
})

const feature_product=(async (req, res)=>{
    const payload = req.body;
    const id = payload._id
    const existing_product = await Product.findOne({_id:id});
    const query = {_id:id};
    const update = { $set: { sponsored: true }};
    const options = { };
    if (!existing_product){
        return res.status(400).send("could not find this product")
    }else{
        await Product.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }
})

const unfeature_product=(async (req, res)=>{
    const payload = req.body;
    const id = payload._id
    const existing_product = await Product.findOne({_id:id});
    const query = {_id:id};
    const update = { $set: { sponsored: false }};
    const options = { };
    if (!existing_product){
        return res.status(400).send("could not find this product")
    }else{
        await Product.updateOne( query, update, options).then((response)=>{
            return res.status(200).send("success")
        })
    }
})

const add_product=(async (req, res)=>{
    const payload = req.body;
    const name = payload?.name_of_product
    const query = {name_of_product:name};
    const existing_product = await Product.findOne(query);
    if (existing_product){
        return res.status(401).send('This product already exists');
    }
    const new_product={
        name_of_product: 					payload.name_of_product,
        manufactured_by: 					payload.manufactured_by,
        manufactured_by_id:					payload.manufactured_by_id,
        distributed_by:						payload.distributed_by,
        distributed_by_id:					payload.distributed_by_id,
        listed_by_id:						payload.listed_by_id,
        description_of_product:				payload.description_of_product,
        chemical_name:  					payload.chemical_name,
        function:							payload.function,
        brand:								payload.brand,
        data_sheet:							payload.data_sheet_url,
        safety_data_sheet:					payload.safety_data_sheet_url,
        formulation_document: 				payload.formulation_document_url,
        features_of_product:				payload.features_of_product,
        application_of_product:				payload.application_of_product,
        packaging_of_product:				payload.packaging_of_product,
        storage_of_product:					payload.storage_of_product,
        manufactured_date: 					payload.manufactured_date,
        industry: 							payload.industry,
        technology: 						payload.technology,
        sponsored:							false,
        short_on_expiry: 					payload.short_on_expiry,
        short_on_expiry_date:				payload.short_on_expiry_date,
        email_of_lister: 					payload.email_of_lister,
        website_link_to_Seller: 			payload.website_link_to_Seller,
        verification_status:				false,
        views:								0
    }
    try{
        const saved_product = await Product.create(new_product);
        return res.status(200).send(saved_product)
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not add a new product")
    }
})

const top_products=(async (req,res)=>{
    try{
        const query = { verification_status: true, suspension_status : false,sponsored:true };
        const projection = { name_of_product: 1,  distributed_by: 1, technology: 1, industry: 1, sponsored: 1, views:1 }
        const result = await Product.find(query,projection)
        return res.status(200).send(result?.sort((a,b)=>(b.views - a.views)).slice(0,4))
    }catch(err){
        console.log(err)
        return res.status(400).send('An error has occured')
    }
})

const edit_product=(async (req,res)=>{
    const payload = req.body;

    const id = payload?._id;
    const existing_product = await Product.findOne({_id:id});
    try{
        const query = {_id:id};
        const update = { $set: {
            name_of_product: 					payload.name_of_product,
			manufactured_by: 					payload.manufactured_by,
			distributed_by:						payload.distributed_by,
			manufactured_date: 					payload.manufactured_date,
			description_of_product:				payload.description_of_product,
			chemical_name:  					payload.chemical_name,
			function:							payload.function,
			brand:								payload.brand,
			data_sheet:							payload.data_sheet_url,
			safety_data_sheet:					payload.safety_data_sheet_url,
			formulation_document: 				payload.formulation_document_url,
			features_of_product:				payload.features_of_product,
			application_of_product:				payload.application_of_product,
			packaging_of_product:				payload.packaging_of_product,
			storage_of_product:					payload.storage_of_product,
			industry: 							payload.industry,
			technology: 						payload.technology,
			short_on_expiry: 					payload.short_on_expiry,
			website_link_to_Seller: 			payload.website_link_to_Seller,
        }};
        const options = { };
        await Product.updateOne( query, update, options).then((response)=>{return res.status(200).send("success")})
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not edit this product, try again in a few minutes");
    }
})
module.exports = {
    getproducts_srt,
    products_search,
    product_data,
    product_by_lister,
    delete_product,
    feature_product,
    unfeature_product,
    add_product,
    top_products,
    edit_product
}