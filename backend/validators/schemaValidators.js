const Joi = require('joi');

// is there uuid type in Joi

// create schemas that validate user input from the mobile
let signUpInputValidator = Joi.object(
    {
        fullname: Joi.string().required(),
        primaryValidator: Joi.string().trim().validate('phone', 'email').required(),
        email: Joi.email().trim().when('primaryValidator', {
            is: 'email',
            then: Joi.required(),
            otherwise: Joi.optional().empty(null)
        }),
        phone: Joi.string().trim().when('primaryValidator', {
            is: 'phone',
            then: Joi.required(),
            otherwise: Joi.optional().empty(null)
        }),
        otp: Joi.string().trim().required(),
        password: Joi.string().trim().required(),

        deviceIdentifier: Joi.uuid().trim()
    }, {
    abortEarly: false
}
);


let otpInputValidator = Joi.object(
    {
        // we send in the pendingUserId and otpHashed
        userId: Joi.uuid().trim().required(),
        otp: Joi.string().trim().required()
    }, {
    abortEarly: false
}
)


let resendOtpValidator = Joi.object(
    {
        // we send in the pendingUserId and otpHashed
        UserId: Joi.uuid().trim().required()
    }, {
    abortEarly: false
}
)



module.exports = {
    signUpInputValidator,
    otpInputValidator,
    resendOtpValidator
}