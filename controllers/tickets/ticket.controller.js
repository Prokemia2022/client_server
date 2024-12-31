const { TICKET_MODEL } = require('../../models/SUPPORT.model');
const { LOGGER } = require("../../lib/logger.lib.js");

const CREATE_TICKET=(async(req,res)=>{
	const payload = req.body;
	try{
		await TICKET_MODEL.create({
			name:			payload.name,
			title:			payload.title,
			email:  	    payload.email,
            mobile:  	    payload.mobile,
            type:  	        payload.type,
            message:  	    payload.message,
			status:			{
				status:		true,
				stage:		'open',
				comment:	payload?.comment,
				approver:	''
			}
		})

		return res.status(200).json({
			error: false,
			message: 'Thank you for reaching out. We will contact you soon'
		})
	}catch(error){
		LOGGER.log('error',`ERROR[CREATE_TICKET]`,error)
		return res.status(500).json({
			error: true,
			message:'Something went wrong'
		});
	}
});

const FETCH_TICKETS=(async(req,res)=>{
    try{
        const type = req.query.type;
        const QUERY = req.query.query;
        const PAGE = req.query.page || 1;
        const SKIP_VALUE = (parseInt(PAGE) - 1) * 10;

        let DATA_QUERY = {
            $or: [
                // { "type": type},
                { "title": { $regex: QUERY, $options: 'i' }},
                { "name": { $regex: QUERY, $options: 'i' }},
                { "message": { $regex: QUERY, $options: 'i' }},
            ] 
        };
        const TICKETS_DATA = await TICKET_MODEL.find(DATA_QUERY)
            .sort({createdAt: -1})
			.skip(SKIP_VALUE)
			.limit(10)
			.exec();
		const TICKETS_DATA_COUNT = await TICKET_MODEL.countDocuments(DATA_QUERY)
        
        return res.status(200).json({
            error: false,
            data: TICKETS_DATA,
            count: TICKETS_DATA_COUNT,
        });
    }catch(error){
		LOGGER.log('error',`ERROR[FETCH_TICKETS]`,error)
		return res.status(500).json({
			error: true,
			message:'Something went wrong'
		});
	}
});

const FETCH_TICKET_DATA=(async(req,res)=>{
    try{
        const id = req.query.ticket_id;
        const TICKET_DATA = await TICKET_MODEL.findById(id)
        return res.status(200).json({
            error: false,
            data: TICKET_DATA
        });
    }catch(error){
        LOGGER.log('error',`ERROR[FETCH_TICKET_DATA]`,error);
        return res.status(500).json({
			error: true,
			message:'Something went wrong'
		});
    }
});

const UPDATE_TICKET=(async(req,res)=>{
    try{
        const TICKET_ID = req.query.ticket_id;
        const payload = req.body;
        const TICKET_DATA = await TICKET_MODEL.findByIdAndUpdate(TICKET_ID,payload);
        return res.status(200).json({
            error: false,
			message: 'ticket successfully updated'

        });
    }catch(error){
        LOGGER.log('error',`ERROR[UPDATE_TICKET]`,error);
        return res.status(500).json({
            error: true,
            message:'Something went wrong'
        });
    }
});

const DELETE_TICKET=(async () => {
    try{
        const TICKET_ID = req.query.ticket_id;
		await TICKET_MODEL.updateOne(
			{_id: TICKET_ID},
			{ $set:{
				"status.status": false,
				"status.stage": 'deleted',
				"status.date": new Date(Date.now() + 30*24*60*60*1000),
				"status.comment":'ticket deleted',
				}
			}) 
		// send email notification to notify lister of the deleted product
		return res.status(200).send({
			error: false,
			message: 'ticket successfully marked as deleted '
		})
	}catch(error){
		LOGGER.log('error',`
			Function: [DELETE_TICKET],
			ID: ${TICKET_ID}, 
			error: ${error}
		`);
		return res.status(500).json({error:true,message:'Ticket could not be marked as deleted'});
	}
});

module.exports = { 
	CREATE_TICKET,
    FETCH_TICKETS,
    FETCH_TICKET_DATA,
    UPDATE_TICKET,
    DELETE_TICKET
}
