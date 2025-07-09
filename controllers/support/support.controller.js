const { DEMO_REQUEST_MODEL, CONTACT_REQUEST_MODEL } = require('../../models/SUPPORT.model');
const { LOGGER } = require("../../lib/logger.lib.js");

const CREATE_DEMO_REQUEST=(async(req,res)=>{
	const payload = req.body;

	try{
		await DEMO_REQUEST_MODEL.create({
			name:			payload.name,
			email:  	    payload.email,
            mobile:  	    payload.mobile,
            job_function:  	payload.job_function,
			status:			{
				status:		true,
				stage:		'pending',
				comment:	payload?.comment,
				approver:	''
			}
		})

		return res.status(200).json({
			error: false,
			message: 'Thank you for reaching out. We will contact you soon'
		})
	}catch(error){
		LOGGER.log('error',`System Error-[creating a demo request email-${payload?.email}]`,error)
		return res.status(500).json({
			error: true,
			message:'Something went wrong'
		});
	}
});

const CREATE_CONTACT_REQUEST=(async(req,res)=>{
	const payload = req.body;

	try{
		await CONTACT_REQUEST_MODEL.create({
			name:			payload.name,
			email:  	    payload.email,
            mobile:  	    payload.mobile,
            message:		payload.message,
			status:			{
				status:		true,
				stage:		'pending',
				comment:	payload?.comment,
				approver:	''
			}
		})

		return res.status(200).json({
			error: false,
			message: 'Thank you for reaching out. We will contact you soon'
		})
	}catch(error){
		LOGGER.log('error',`System Error-[creating a contact request email-${payload?.email}]`,error)
		return res.status(500).json({
			error: true,
			message:'Something went wrong'
		});
	}
});

module.exports = { 
	CREATE_DEMO_REQUEST,
	CREATE_CONTACT_REQUEST
}
