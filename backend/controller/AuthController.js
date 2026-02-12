const SignUpServiceHandler = require('../service/AuthService');

let signUpServiceHandler = new SignUpServiceHandler();

class AuthController {
    async signUp(req, res) {
        try {
            let { fullname, email, phone, password, deviceIdentifier } = req.validatedBody;

            let result = await signUpServiceHandler.signUp({
                fullname,
                email,
                phone,
                password,
                deviceIdentifier,
            });
            if (result.success) {
                return res.status(200).json(result.data);
            } else {
                return res.status(400).json({ message: "User sign up failed" });
            }
        } catch (err) {
            console.log("Error while AuthController.signUp ", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }


    async validateOtp(req, res) {
        try {
            let { userId, otp } = req.validatedBody;
            let result = await signUpServiceHandler.validateOtp({ userId, otp });
            if (result.success) {
                return res.status(200).json(result.data);
            } else {
                return res.status(400).json({ message: "OTP validation failed" });
            }
        } catch (err) {
            console.log("Error while AuthController.validateOtp ", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async validateEmail(req, res) {
        try {
            let { userId, tokenString } = req.validatedParams;
            // bc this is a get request
            let result = await signUpServiceHandler.validateEmailLink({ userId, tokenString });

            if (result.success) {
                return res.status(200).json(result.data);
            } else {
                return res.status(400).json({ message: "Email verification failed" });
            }
        } catch (err) {
            console.log("Error while AuthController.validateEmail ", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async resendOtp(req, res) {
        try {
            let { userId } = req.validatedParams;
            let result = await signUpServiceHandler.resendOtp(userId);

            if (result.success) {
                return res.status(200).json({ message: "OTP resent successfully" });
            } else {
                return res.status(400).json({ message: "OTP resend failed" });
            }
        } catch (err) {
            console.log("Error while AuthController.resendOtp ", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }


    async resendEmailVerificationLink(req, res) {
        try {
            let { userId } = req.validatedParams;
            let result = await signUpServiceHandler.resendEmail(userId);

            if (result.success) {
                return res.status(200).json({ message: "Email verification link resent successfully" });
            } else {
                return res.status(400).json({ message: "Email verification link resend failed" });
            }
        } catch (err) {
            console.log("Error while AuthController.resendEmailVerificationLink ", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }

    async logIn(req, res) {
        let { logInVia, phone, email, password, deviceIdentifier } = req.validatedBody;
        try {
            let result;
            if (logInVia === "email") {
                result = await signUpServiceHandler.logInWithEmail({ email, password, deviceIdentifier });
            } else if (logInVia === "phone") {
                result = await signUpServiceHandler.logInWithPhone({ phone, password, deviceIdentifier });
            } else {
                return res.status(400).json({ message: "Invalid log in method" });
            }
            if (result.success) {
                return res.status(200).json(result.data);
            } else {
                return res.status(400).json({ message: "Log in failed" });
            }
        } catch (err) {
            console.log("Error while AuthController.logIn ", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }


    async logOut(req, res) {
        try {
            let { randomString } = req.validatedBody; // random string from the refresh token that we want to invalidate
            let result = await signUpServiceHandler.logOut({ randomString });
            if (result.success) {
                return res.status(200).json({ message: "Logged out successfully" });
            } else {
                return res.status(400).json({ message: "Log out failed" });
            }
        } catch (err) {
            console.log("Error while AuthController.logOut ", err.message);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}


module.exports = AuthController;