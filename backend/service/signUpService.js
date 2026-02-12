const { SignUpModelHandler } = require("../model/signUpModel");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const otpGenerator = require('../utils/otpGenerator');
const cryptoHasher = require('../utils/cryptoHasher');
const randomStringGenerator = require('../utils/randomStringGenerator');
const bcryptHasher = require('../utils/bcryptHasher');
const emailSendingService = require('./emailSendingService');
const smsMessageSending = require('./smsMessageSending');

let signUpModelHandler = new SignUpModelHandler();

class SignUpServiceHandler {
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


            let result = await signUpModelHandler.signUp(
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
                    console.log("Email sending failed");
                    return { success: false };
                }
            }

            return {
                success: true
            }

        } catch (err) {
            console.log('Error while SignUpServiceHandler.signUp ', err.message);
            return {
                success: false
            }
        }
    }

    async validateOtp(sentInfo) {
        try {
            let { userId, otp } = sentInfo;
            let otpHashedUser = cryptoHasher(otp);

            let userFromDb = await signUpModelHandler.otpVerification(userId);

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

        } catch (err) {
            console.log('Error while SignUpServiceHandler.validateOtp ', err.message);
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

            let result = await signUpModelHandler.emailVerification({ userId });

            if (!result.success) {
                return {
                    success: false
                }
            }

            let { emailVerificationToken } = result;

            if (emailVerificationToken.trim() === emailStringHashed.trim()) {
                return {
                    success: true
                }
            }

            return {
                success: false
            }

        } catch (err) {
            console.log("Error while SignUpServiceHandler.validateEmailLink ", err.message);
            return {
                success: false
            }
        }
    }

    async resendOtp(sentInfo) {
        try {
            let { userId } = sentInfo;
            // regenerate and send otp
            let otp = otpGenerator();
            console.log("OTP generated ", otp);
            let otpHashed = cryptoHasher(otp);

            let result = await signUpModelHandler.resendOtp({ otpHashed, userId })

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
            console.log("Error while SignUpServiceHandler.resendOtp ", err.message);
            return {
                success: false
            }
        }
    }


    async resendEmail(sentInfo) {
        try {
            let { userId } = sentInfo;
            // regenerate and send email verification link
            let emailString = randomStringGenerator();
            let emailStringHashed = cryptoHasher(emailString);

            let result = await signUpModelHandler.resendEmailVerification({ emailStringHashed, userId });

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
            console.log("Error while SignUpServiceHandler.resendEmail ", err.message);
            return {
                success: false
            }
        }
    }

}