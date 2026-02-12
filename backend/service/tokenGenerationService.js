const { SignUpModelHandler } = require("../model/signUpModel");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config(
    {
        path: path.resolve(__dirname, '../../.env')
    }
)

let signUpModelHandler = new SignUpModelHandler();
let { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;


function accessTokenGenerator(userId) {
    // access token expires every 1 hr
    let oneHr = 3600; // 1 hr = 3600 sec;
    let current = Math.floor(Date.now() / 1000); // to convert 
    let accessToken = jwt.sign({
        userId,
        exp: current + oneHr
    }, ACCESS_TOKEN_SECRET)


    return {
        success: true,
        accessToken
    }
}


async function refreshTokenGenerator(sentInfo) {
    try {
        // 2 types of obj - one sent to client one sent to db
        let { randomString, userId } = sentInfo;
        let twenty_days_from_now = 20 * 24 * 60 * 60;
        let exp = Date.now() / 1000 + twenty_days_from_now;
        let objSentToClient = {
            randomString,
            exp
        }

        let randomStringHashed = crypto.createHash('sha-256').update(randomString).digest('hex');
        let sentToDataBase = {
            userId,
            randomStringHashed
        }

        let res = await signUpModelHandler.putRefreshTokenInfo(sentToDataBase);

        if (!res.success){
            return {
                success : false
            }
        }

        let refreshToken = jwt.sign(objSentToClient , REFRESH_TOKEN_SECRET );

        return {
            success : true,
            refreshToken
        }

    } catch (err) {
        console.log("Error while refreshTokenGenerator ", err.message)
        return {
            success: false
        }
    }
}


async function generateAccessFromRefresh(params) {
    
}


async function invalidateAccess(sentInfo) {
    
}