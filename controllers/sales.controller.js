const Order = require("../models/Utils/Order");

const new_sale = async(req, res)=>{
    const payload = req.body;
    try{
        const new_Order = await Order.create({
            //creator_info
            creator_id:					payload.creator_id,
            creator_name: 				payload.creator_name,
            email_of_creator:           payload.email_of_creator,
            mobile_of_creator:          payload.mobile_of_creator,
            //client-info
            name_of_client:				payload.name_of_client,
            company_name_of_client:     payload.company_name_of_client,
            mobile_of_client:           payload.mobile_of_client,
            email_of_client:			payload.email_of_client,
            location_of_client:         payload.location_of_client,
            //product info
            name_of_product:  			payload.name_of_product,
            volume_of_items:			payload.volume_of_items,
            unit_price: 				payload.unit_price,
            total: 						payload.total,
            //payment_info
            delivery_terms: 			payload.delivery_terms,
            delivery_date: 				payload.delivery_date,
            payment_terms: 				payload.payment_terms,
            order_notification_status:  false,
            order_status: 					"pending",
            publish_status:             payload.publish_status
        });
        console.log(new_Order)
        return res.status(200).send("successfully created your order");
    }catch(err){
        console.log(err)
		return res.status(500).send("Could not create your order")
    }
}

const sales_by_creator=async(req, res)=>{
    const id = req.query.query;
    const query = {creator_id: id};
    try{
        const sales = await Order.find(query);
        return res.status(200).send(sales)
    }catch(err){
        console.log(err);
        return res.status(400).send('could not fetch sales')
    }
}

const edit_sale=(async (req, res)=>{
    const id = req.query.query;
    const payload = req.body;
    const query = {_id: id}
    const existing_sales = await Order.findOne(query);
    if (!existing_sales){
        return res.status(400).send("could not find this sale")
    }else{
        try{
            const update = { $set: {
                //creator_info
                creator_id:					payload.creator_id,
                creator_name: 				payload.creator_name,
                email_of_creator:           payload.email_of_creator,
                mobile_of_creator:          payload.mobile_of_creator,
                //client-info
                name_of_client:				payload.name_of_client,
                company_name_of_client:     payload.company_name_of_client,
                mobile_of_client:           payload.mobile_of_client,
                email_of_client:			payload.email_of_client,
                location_of_client:         payload.location_of_client,
                //product info
                name_of_product:  			payload.name_of_product,
                volume_of_items:			payload.volume_of_items,
                unit_price: 				payload.unit_price,
                total: 						payload.total,
                //payment_info
                delivery_terms: 			payload.delivery_terms,
                delivery_date: 				payload.delivery_date,
                payment_terms: 				payload.payment_terms,
                order_notification_status:  payload.order_notification_status,
                order_status: 				payload.order_status,
                publish_status:             payload.publish_status
            }}
            const options = { };
            await Order.updateOne( query, update, options)
            return res.status(200).send("Sucessfully updated this sale")
        }catch(err){
            console.log(err)
            return res.status(400).send('An error occured')
        }
    }
})

const delete_sale=(async (req, res)=>{
    const id = req.query.query;
    const query = {_id: id}
    const existing_sales = await Order.findOne(query);
    if (!existing_sales){
        return res.status(400).send("could not find this sale")
    }else{
        await Order.findOneAndDelete(query ).then((response)=>{
            return res.status(200).send("Sucessfully deleted this sale")
        })
    }
})

module.exports = {
    new_sale,
    sales_by_creator,
    delete_sale,
    edit_sale
};