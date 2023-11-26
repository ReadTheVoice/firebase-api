const admin = require("firebase-admin");
const {
  onRequest,
} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

admin.initializeApp();

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
const logInFunction = require("./src/login.js");
const verifyTokenFunction = require("./src/verifytoken.js");
const resetPasswordFunction = require("./src/resetpassword.js");

exports.signUp = onRequest({
  region: "europe-west3",
}, verifyToken(async (res, req) => {
  signUpFunction.signUp(res, req);
}));

exports.logIn = onRequest({
  region: "europe-west3",
}, verifyToken(async (res, req) => {
  logInFunction.logIn(res, req);
}));

exports.verifyToken = onRequest({
  region: "europe-west3",
}, verifyToken(async (res, req) => {
  verifyTokenFunction.verifyToken(res, req);
}));

exports.resetPassword = onRequest({
  region: "europe-west3",
}, verifyToken(async (res, req) => {
  resetPasswordFunction.resetPassword(res, req);
}));
