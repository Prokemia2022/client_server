const Sample = require('../models/Utils/samples');
const { sample_confirmation_request, sample_supplier_request, sample_status_notification } = require('./email.controller');

const new_sample=(async (req, res)=>{
    const payload = req.body;
    const new_item={
        product_details:                    payload.product_id,
        lister_details:                     payload.listed_by_id,
        industry:				            payload.industry,
        technology:				            payload.technology,
        // client details
        client_details:                     payload.client_id,
        requester_id:                       payload.client_id,
        supplier_id:                        payload.supplier_id,
        // sample details
        description:			            payload.description,
        number_of_samples:                  payload.number_of_samples,
        annual_volume: 			            payload.annual_volume,
        units:				                payload.units,
        additional_info:		            payload.additional_info,
        // supplier section -follow up with client
        follow_up_date:                     payload.follow_up_date,
        follow_up_remarks:                  payload.follow_up_remarks,
        follow_up_prospect_status:          payload.follow_up_prospect_status,
        follow_up_sampling_period:          payload.follow_up_sampling_period, // number of says the client requested to sample the product
        follow_up_sampling_price:           payload.follow_up_sampling_price, // price per unit of requested sample
        // closing
        conversion_client_status:           payload.conversion_client_status,
        conversion_client_price:            payload.conversion_client_price,
        conversion_client_date:             payload.conversion_client_date,
        // delivery
        delivery_date:                      payload.delivery_date,
        delivery_remarks:                   payload.delivery_remarks,
        // sample status
        sample_status:	                    payload.sample_status, // the active status of the sample True: Active, False: Declined
        sample_status_stage:	            payload.sample_status_stage,  // the active stage of the sample
        sample_status_comment:	            payload.sample_status_comment,  // comment on the stage of the sample i.e status: False, Stage:declined, reason: The Client is spamming. 
        deletion_status:	                payload.deletion_status,
        client_notification_Status:         payload.client_notification_Status, // send client notifications on any activity on the sample
        supplier_notification_Status:       payload.supplier_notification_Status,
    }
    try{
        const saved_sample = await Sample.create(new_item);
        const query = {_id: saved_sample?._id};
        const options = {strictPopulate: false}
        const created_sample = await Sample.findById(query,options).populate('product_details').populate('client_details').populate('lister_details').exec();
        const email_payload = {
            product_name: created_sample?.product_details?.name_of_product,
            first_name: created_sample?.client_details?.first_name,
            sample_id: created_sample?._id,
            number_of_samples: created_sample?.number_of_samples,
            units: created_sample?.units,
            address: created_sample?.address,
            product_id: created_sample?.product_details?._id,
            client_email: created_sample?.client_details?.email_of_company,
            client_address: created_sample?.client_details?.address,
            additional_info: created_sample?.additional_info,
            listed_by_id: created_sample?.lister_details?._id,
            lister_email: created_sample?.lister_details?.email_of_company
        }
        sample_confirmation_request(email_payload);
        sample_supplier_request(email_payload);
        return res.status(200).send('Sample request has made successfully!')
    }catch(err){
        console.log(err)
        return res.status(500).send("Could not submit your request")
    }
});

const UpdateSample=(async(req,res)=>{
    const sample_id = req.query.sample_id;
    const updated_sample = req.body;

    const query = {_id: sample_id};
    const existing_sample = await Sample.findById(query).populate('product_details').populate('client_details').populate('lister_details').exec();

    if (!existing_sample) {
        return res.status(404).send('Sample not found');
    }
    const email_payload = {
        product_name: existing_sample?.product_details?.name_of_product,
        first_name: existing_sample?.client_details?.first_name,
        sample_id: existing_sample?._id,
        sample_status: updated_sample?.sample_status_stage,
        number_of_samples: updated_sample?.number_of_samples,
        units: updated_sample?.units,
        address: updated_sample?.address,
        product_id: existing_sample?.product_details?._id,
        client_email: existing_sample?.client_details?.email_of_company,
        client_address: existing_sample?.client_details?.address,
        additional_info: updated_sample?.additional_info,
        listed_by_id: existing_sample?.lister_details?._id,
        lister_email: existing_sample?.lister_details?.email_of_company
    }
    try{
        await Sample.updateOne(query,updated_sample).then(()=>{
            if (existing_sample?.client_notification_Status) {
                sample_status_notification(email_payload)
            }
            return res.status(200).send('Sample updated successfully')
        });
    }catch(err){
        console.log(err)
        return res.status(500).send('Error updating sample')
    }
})

const get_samples_by_requester=(async(req, res)=>{
    const id = req.query.query;
    const query = {requester_id: id};
    const samples = await Sample.find(query).populate('product_details');
    return res.status(200).send(samples)
});

const get_samples_by_product_lister=(async(req, res)=>{
    const id = req.query.query;
    const query = {supplier_id: id};
    const samples = await Sample.find(query).populate('product_details').populate('client_details').populate('lister_details').exec();

    return res.status(200).send(samples)
})

module.exports = {
    new_sample,
    get_samples_by_requester,
    get_samples_by_product_lister,
    UpdateSample
}