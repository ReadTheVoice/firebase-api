const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const axios = require("axios");

exports.logIn = async function(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;

    await admin.auth().getUserByEmail(email).then((userRecord) => {
      if (!userRecord.emailVerified) {
        return res.status(400).json({
          error: "Email not verified.",
        });
      }
    }).catch((error) => {
      logger.error("Login error:", error);
      return res.status(500).json({
        error: "Login error",
      });
    });

    const signInEndpoint = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + process.env.FB_API_KEY;

    let userId = null;
    await axios.post(signInEndpoint, {
      email: email,
      password: password,
      returnSecureToken: true,
    }).then(async (res) => {
      userId = res.data.localId;
    });

    return res.status(200).json({
      userId: userId,
    });
  } catch (error) {
    logger.error("Login error:", error);
    return res.status(500).json({
      error: "Login error",
    });
  }
};
