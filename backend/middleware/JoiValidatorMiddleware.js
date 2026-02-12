// this file will create a helper function that returns validator function for all Joi schemas
function validateSchemaMiddleware(schema) {
    return function validator(req, res, next) {
        try {
            let { error, value } = schema.validate(req.body);

            req.body = value;
            console.log("req.body that was validated is ", req.body);

            next();

        } catch (err) {
            console.log("Error while validatorCreator(schema) ", err.message);
            return res.status(400).json({
                reason: 'Bad request'
            })
        }
    }
}


module.exports = validateSchemaMiddleware