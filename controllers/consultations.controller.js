const ProdConsultationSchema = require('../models/Utils/consultancy/prodconsultation');

const create_consultancy_form=(async(req,res)=>{
    const payload = req.body;

    try{
        const new_Item = await ProdConsultationSchema.create({
            user_id:                    payload?.user_id,
            user_name:                  payload?.user_name,
            user_email:                 payload?.user_email,
            user_mobile:                payload?.user_mobile,
            user_company_name:          payload?.user_company_name,
            user_company_email:         payload?.user_company_email,
            user_company_mobile:        payload?.user_company_mobile,
            account_type:               payload?.account_type,
            industry:                   payload?.industry,
            technology:                 payload?.technology,
            description:                payload?.description,
            //expert details
            expert_id:                  payload?.expert_id,
            expert_name:                payload?.expert_name,
            expert_email:               payload?.expert_email,
            expert_mobile:              payload?.expert_mobile,
            expert_company_name:        payload?.expert_company_name,
            notification_status:        payload?.notification_status,
        })
        console.log(new_Item)
        return res.status(200).send('success')
    }catch(err){
        console.log(err)
        return res.status(400).send('Could not create your request')
    }
})

module.exports={
    create_consultancy_form
}