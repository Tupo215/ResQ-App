const pool = require('../config/pgConnection');

class TokenModelHandler {
    async putRefreshTokenInfo(sentInfo) {
        try {
            let { userId, randomStringHashed } = sentInfo;

            let query = `INSERT INTO refresh_token(user_id , random_string_hashed) VALUES ($1 , $2) RETURNING id`;
            let values = [userId, randomStringHashed];

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
            console.log("Error in TokenModelHandler.putRefreshTokenInfo  ", err.message)
            return {
                success: false
            }
        }
    }

    async findRefreshToken(sentInfo) {
        try {
            let { randomStringHashed } = sentInfo;

            let query = `UPDATE refresh_token SET is_valid = false WHERE random_string_hashed = $1 RETURNING user_id;`;
            // to make it more secure we will invalidate the refresh token as soon as it is used to generate a new access token, so that even if the refresh token is stolen, it cannot be used to generate new access tokens
            let values = [randomStringHashed];

            let result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return {
                    success: false
                }
            }

            let { user_id } = result.rows[0];

            return {
                success: true,
                userId: user_id
            }

        } catch (err) {
            console.log("Error in tokenModelHandler.findRefreshToken ", err.message);
            return {
                success: false
            }
        }
    }

    async invalidateRefreshToken(sentInfo) {
        try {
            let { randomStringHashed } = sentInfo;

            let query = `UPDATE refresh_token SET is_valid = false WHERE random_string_hashed = $1`;
            let values = [randomStringHashed];

            let result = await pool.query(query, values);

            if (result.rowCount > 0) {
                return {
                    success: true
                }
            }
            return {
                success: false
            }

        } catch (err) {
            console.log("Error in tokenModelHandler.deleteRefreshToken ", err.message);
            return {
                success: false
            }
        }
    }


}

module.exports = TokenModelHandler;