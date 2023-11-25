const {
    onRequest
} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const verifyToken = (handler) => {
    return async (req, res) => {
        const token = req.headers.authorization;

        if (!token || token !== process.env.ACCESS_TOKEN) {
            logger.error("Unauthorized - Invalid token");
            return res.status(401).json({
                error: "Unauthorized - Invalid token"
            });
        }

        await handler(req, res);
    };
};