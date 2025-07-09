const SCHEMA_VALIDATOR = (schema) => (async (req, res, next) => {
    try {
        await schema.validate({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        return res.status(403).send({error:true,message:'Payload Validation failed'})
    }
});

module.exports = SCHEMA_VALIDATOR;
