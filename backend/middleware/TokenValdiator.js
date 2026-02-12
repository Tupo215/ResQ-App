const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(
    {
        path: path.resolve(__dirname, '../../.env')
    }
)
let { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = process.env;

async function accessValidator(req, res, next) {
    try {
        let access = req.headers['authorization'].split(' f');

        let result = jwt.verify(access[1], ACCESS_TOKEN_SECRET);

        req.decodedAccess = result;
        next();
    } catch (err) {
        console.log("Error while accessValidator ", err.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
}



async function refreshValidator(req, res, next) {
    try {
        let { refreshToken } = req.body;

        let result = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        req.body = result;
        next();
    } catch (err) {
        console.log("Error while refreshValidator ", err.message);
        return res.status(401).json({ message: "Unauthorized" });
    }
}



module.exports = {
    accessValidator,
    refreshValidator
}