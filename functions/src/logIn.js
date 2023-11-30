const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const axios = require("axios");

exports.logIn = async function(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    const signInEndpoint = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + process.env.FB_API_KEY;

    let userId = null;
    await axios.post(signInEndpoint, {
      email: email,
      password: password,
      returnSecureToken: true,
    }).then(async (axiosRes) => {
      userId = axiosRes.data.localId;
      await admin.auth().getUser(userId).then((userRecord) => {
        if (!userRecord.emailVerified) {
          return res.status(200).json({
            error: "EMAIL_NOT_VERIFIED",
          });
        }
      }).catch((error) => {
        logger.error("Login error:", error);
        return res.status(200).json({
          error: "LOGIN_ERROR",
        });
      });
    }).catch((error) => {
      logger.error("Login error:", error);
      return res.status(200).json({
        error: "LOGIN_ERROR",
      });
    });

    return res.status(200).json({
      userId: userId,
    });
  } catch (error) {
    logger.error("Login error:", error);
    return res.status(200).json({
      error: "LOGIN_ERROR",
    });
  }
};
