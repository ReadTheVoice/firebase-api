const {
  onRequest,
} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const verifyToken = (handler) => {
  return async (req, res) => {
    const token = req.headers.authorization;

    if (!token || token !== process.env.ACCESS_TOKEN) {
      logger.error("Unauthorized - Invalid token");
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    await handler(req, res);
  };
};

const signUpFunction = require("./src/signup.js");

exports.signUp = onRequest({
  region: "europe-west3",
}, verifyToken(async (res, req) => {
  signUpFunction.signUp(res, req);
}));
