const { AuthModelHandler } = require("../model/AuthModel");
const otpGenerator = require('../utils/otpGenerator');
const cryptoHasher = require('../utils/cryptoHasher');
const randomStringGenerator = require('../utils/randomStringGenerator');
const bcryptHasher = require('../utils/bcryptHasher');
const bcryptCompare = require('../utils/bcryptCompare');
const emailSendingService = require('./emailSendingService');
const smsMessageSending = require('./smsMessageSending');
const TokenGenerationServiceHandler = require('./tokenGenerationService');

let authModelHandler = new AuthModelHandler();
let tokenGenerationServiceHandler = new TokenGenerationServiceHandler();

class AuthService {
    async signUp(sentInfo) {
        try {
            // users sign up
            // generate otp - hash it and send it to them
            // save them in pending users
            // hash their password

            // generate otp
            // send the messages or email including links


            let { fullname, email, phone, password, deviceIdentifier } = sentInfo;
            let otpHashed, otp, emailString, emailStringHashed;
            let passwordHashed = await bcryptHasher(password);


            if (phone) {
                otp = otpGenerator();
                console.log("OTP generated ", otp);
                otpHashed = cryptoHasher(otp);
            } else {
                // email will be provided
                emailString = randomStringGenerator();
                emailStringHashed = cryptoHasher(emailString);
            }


            let result = await authModelHandler.signUp(
                {
                    fullname,
                    email,
                    phone,
                    otpHashed,
                    passwordHashed,
                    emailStringHashed,
                    deviceIdentifier
                }
            )

            if (!result.success) {
                console.log("Saving problem in pending user")
                return {
                    success: false
                }
            }

            let userId = result.data;
            console.log("Given user id in pending_users is ", userId);

            // send otp via sms or link
            if (email) {
                // send verification with link
                let res = await emailSendingService({
                    email,
                    emailString,
                    userId
                });

                if (!res.success) {
                    console.log("Email sending failed");
                    return { success: false };
                }
            } else if (phone) {
                // send verification with sms
                let res = await smsMessageSending({ phone, otp })
                if (!res.success) {
                    console.log("SMS sending failed");
                    return { success: false };
                }
            }

            return {
                success: true,
                data: {
                    userId
                }

            }

        } catch (err) {
            console.log('Error while AuthService.signUp ', err.message);
            return {
                success: false
            }
        }
    }

    async validateOtp(sentInfo) {
        try {
            let { userId, otp } = sentInfo;
            let otpHashedUser = cryptoHasher(otp);

            let userFromDb = await authModelHandler.otpVerification(userId);

            if (!userFromDb.success) {
                return {
                    success: false
                }
            }

            let { otpHashed } = userFromDb;



            if (otpHashedUser.trim() !== otpHashed.trim()) {
                return {
                    success: false
                }
            }


            // then generate access and refresh tokens
            let { accessToken } = tokenGenerationServiceHandler.accessTokenGenerator(userId);
            let refreshTokenResult = await tokenGenerationServiceHandler.refreshTokenGenerator(userId);

            if (!refreshTokenResult.success) {
                return {
                    success: false
                }
            }

            let { refreshToken } = refreshTokenResult;
            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken
                }
            }

        } catch (err) {
            console.log('Error while AuthService.validateOtp ', err.message);
            return {
                success: false
            }
        }
    }

    async validateEmailLink(sentInfo) {
        try {
            // check if the token u have sent is 
            let { tokenString, userId } = sentInfo;

            let emailStringHashed = cryptoHasher(tokenString);

            let result = await authModelHandler.emailVerification({ userId });

            if (!result.success) {
                return {
                    success: false
                }
            }

            let { emailVerificationToken } = result;

            if (emailVerificationToken.trim() !== emailStringHashed.trim()) {
                return {
                    success: false
                }
            }

            let putUserIntoVerifiedResult = await authModelHandler.putUserIntoVerified(userId); 

            if (!putUserIntoVerifiedResult.success) {
                return {
                    success: false
                } 
            }


            // then generate access and refresh tokens
            let { accessToken } = tokenGenerationServiceHandler.accessTokenGenerator(userId);
            let refreshTokenResult = await tokenGenerationServiceHandler.refreshTokenGenerator(userId);

            if (!refreshTokenResult.success) {
                return {
                    success: false
                }
            }

            let { refreshToken } = refreshTokenResult;
            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken
                }
            }

        } catch (err) {
            console.log("Error while AuthService.validateEmailLink ", err.message);
            return {
                success: false
            }
        }
    }

    async resendOtp(userId) {
        try {
            // regenerate and send otp
            let otp = otpGenerator();
            console.log("OTP generated ", otp);
            let otpHashed = cryptoHasher(otp);

            let result = await authModelHandler.resendOtp({ otpHashed, userId })

            if (!result.success) {
                return {
                    success: false
                }
            };

            let phone = result.phone;
            let res = await smsMessageSending({ phone, otp })

            if (!res.success) {
                return {
                    success: false
                }
            };

            return {
                success: true
            }


        } catch (err) {
            console.log("Error while AuthService.resendOtp ", err.message);
            return {
                success: false
            }
        }
    }


    async resendEmail(userId) {
        try {
            // regenerate and send email verification link
            let emailString = randomStringGenerator();
            let emailStringHashed = cryptoHasher(emailString);

            let result = await authModelHandler.resendEmailVerification({ emailStringHashed, userId });

            if (!result.success) {
                return {
                    success: false
                }
            };

            let email = result.email;
            let res = await emailSendingService({
                email,
                emailString,
                userId
            });

            if (!res.success) {
                return {
                    success: false
                }
            };

            return {
                success: true
            }

        } catch (err) {
            console.log("Error while AuthService.resendEmail ", err.message);
            return {
                success: false
            }
        }
    }

    async logInWithPhone(sentInfo) {
        try {
            let { phone, password, deviceIdentifier } = sentInfo;
            // we need to update deviceIdentifier too

            let result = await authModelHandler.logInPhone({ phone, deviceIdentifier });

            if (!result.success) {
                return {
                    success: false
                }
            }

            let { password_hashed, id } = result.data;

            let matched = await bcryptCompare(password, password_hashed);


            if (!matched) {
                return {
                    success: false
                }
            }

            // generate tokens
            // then generate access and refresh tokens
            let { accessToken } = tokenGenerationServiceHandler.accessTokenGenerator(id);
            let refreshTokenResult = await tokenGenerationServiceHandler.refreshTokenGenerator(id);

            if (!refreshTokenResult.success) {
                return {
                    success: false
                }
            }

            let { refreshToken } = refreshTokenResult;
            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken
                }
            }
        } catch (err) {
            console.log("Error while AuthService.logInWithPhone ", err.message);
            return {
                success: false
            }
        }
    }

    async logInWithEmail(sentInfo) {
        try {
            let { email, password, deviceIdentifier } = sentInfo;
            // we need to update deviceIdentifier too

            let result = await authModelHandler.logInEmail({ email, deviceIdentifier });

            if (!result.success) {
                return {
                    success: false
                }
            }

            let { password_hashed, id } = result.data;

            let matched = await bcryptCompare(password, password_hashed);


            if (!matched) {
                return {
                    success: false
                }
            }

            // generate tokens
            // then generate access and refresh tokens
            let { accessToken } = tokenGenerationServiceHandler.accessTokenGenerator(id);
            let refreshTokenResult = await tokenGenerationServiceHandler.refreshTokenGenerator(id);

            if (!refreshTokenResult.success) {
                return {
                    success: false
                }
            }

            let { refreshToken } = refreshTokenResult;
            return {
                success: true,
                data: {
                    accessToken,
                    refreshToken
                }
            }
        } catch (err) {
            console.log("Error while AuthService.logInWithPhone ", err.message);
            return {
                success: false
            }
        }
    }


    async logOut(sentInfo) {
        try {
            // log out is related to token invalidation. 
            // so refresh token will be sent
            let {  randomString } = sentInfo;

            let res = await tokenGenerationServiceHandler.invalidateRefreshToken({ randomString });

            if (!res.success) {
                return {
                    success: false
                }
            }

            return {
                success: true
            }
        } catch (err) {
            console.log("Error while AuthService.logOut ", err.message);
            return {
                success: false
            }
        }
    }
}


module.exports = AuthService;