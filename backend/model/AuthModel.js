const pool = require('../config/pgConnection');

class AuthModelHandler {
    async signUp(sentInfo) {
        try {
            const { deviceIdentifier, fullname, email, phone, otpHashed, passwordHashed, emailStringHashed } = sentInfo;

            const query = `INSERT INTO pending_users (deviceIdentifier, fullname, email, phone_number, otp_hashed, password_hashed , email_verification_token_hashed) VALUES ($1, $2, $3, $4, $5, $6 , $7) RETURNING id`;
            const values = [deviceIdentifier, fullname, email, phone, otpHashed, passwordHashed, emailStringHashed];

            let result = await pool.query(query, values);

            if (result.rows.length > 0) {
                return {
                    success: true,
                    data: result.rows[0].id
                }
            }
            return {
                success: false
            }

        } catch (err) {
            console.log("Error in AuthModelHandler.signUp  ", err.message)
            return {
                success: false
            }
        }

    }


    async otpVerification(pendingUserId) {
        try {
            const query = `SELECT otp_hashed FROM pending_users WHERE id = $1`;
            const values = [pendingUserId];
            let result = await pool.query(query, values);
            if (result.rows.length > 0) {
                return {
                    success: true,
                    otpHashed: result.rows[0].otp_hashed
                }
            }
            return {
                success: false
            }
        } catch (err) {
            console.log("Error in AuthModelHandler.otpVerification  ", err.message)
            return {
                success: false
            }
        }
    }


    async emailVerification(sentInfo) {
        try {
            let { userId } = sentInfo;

            
            let query = `SELECT email_verification_token_hashed FROM pending_users WHERE id = $1`;
            let values = [userId];

            let res = await pool.query(query, values);

            if (res.rowCount === 0) {
                return {
                    success: false
                }
            }

            return {
                success: true,
                emailVerificationToken: res.rows[0].email_verification_token_hashed
            }

        } catch (err) {
            console.log("Error in AuthModelHandler.emailVerification ", err.message)
            return {
                success: false
            }
        }
    }

    async putUserIntoVerified(pendingUserId) {
        try {
            let query = 'SELECT * FROM move_users_into_verified( $1 )'
            let value = [pendingUserId];

            let result = await pool.query(query, value);

            if (result.rows.length > 0) {
                return {
                    success: true,
                    pendingUser: result.rows[0]
                }
            }
            return {
                success: false
            }



        } catch (err) {
            console.log("Error in AuthModelHandler.putUserIntoVerified ", err.message)
            return {
                success: false
            }
        }
    }


    async resendOtp(sentInfo) {
        try {
            const { otpHashed, userId } = sentInfo;
            const query = `UPDATE pending_users SET otp_hashed = $1 WHERE id = $2 RETURNING phone_number`;
            const values = [otpHashed, userId];
            let result = await pool.query(query, values);

            if (result.rows.length > 0) {
                return {
                    success: true,
                    phone: result.rows[0].phone_number
                }
            }
            return {
                success: false
            }
        } catch (err) {
            console.log("Error in AuthModelHandler.resendOtp  ", err.message)
            return {
                success: false
            }
        }
    }


    async resendEmailVerification(sentInfo) {
        try {
            let { emailStringHashed, userId } = sentInfo;
            let query = `UPDATE pending_users SET email_verification_token_hashed = $2 WHERE id = $1 RETURNING email`;
            let values = [userId, emailStringHashed];

            let result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return {
                    success: false
                }
            }

            return {
                success: true,
                email: result.rows[0].email
            }

        } catch (err) {
            console.log("Error in AuthModelHandler.resendEmailVerification ", err.message)
            return {
                success: false
            }
        }
    }


    async deletePendingUser(pendingUserId) {
        try {
            // first collect all pendingUserIds that need to be deleted, then pass that array to the query
            // to have batch delete functionality, we can use ANY operator in SQL and pass an array of pendingUserIds
            const query = `DELETE FROM pending_users WHERE id = ANY($1)`;
            const values = [pendingUserId];
            let result = await pool.query(query, values);
            if (result.rows.length > 0) {
                return {
                    success: true
                }
            }
            return {
                success: false
            }
        } catch (err) {
            console.log("Error in AuthModelHandler.deletePendingUser  ", err.message)
            return {
                success: false
            }
        }
    }

    async logInPhone(sentInfo) {
        try {
            let { phone , deviceIdentifier} = sentInfo;
            let query = `UPDATE verified_users SET deviceIdentifier = $2 WHERE phone_number = $1 RETURNING id, password_hashed;`;
            let values = [phone , deviceIdentifier];

            let result = await pool.query(query, values);

            if (result.rows.length > 0) {
                return {
                    success: true,
                    data: result.rows[0]
                }
            }
            return {
                success: false
            }
        } catch (err) {
            console.log("Error in AuthModelHandler.logInPhone  ", err.message)
            return {
                success: false
            }
        }
    }

    async logInEmail(sentInfo) {
        try {
            let { email, deviceIdentifier } = sentInfo;
            let query = `UPDATE verified_users SET deviceIdentifier = $2 WHERE email = $1 RETURNING id, password_hashed;`;
            let values = [email, deviceIdentifier];
            let result = await pool.query(query, values);

            if (result.rows.length > 0) {
                return {
                    success: true,
                    data: result.rows[0]
                }
            }
            return {
                success: false
            }
        } catch (err) {
            console.log("Error in AuthModelHandler.logInEmail  ", err.message)
            return {
                success: false
            }
        }
    }

}

module.exports = { AuthModelHandler }