const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const axios = require("axios");
const jwt = require("jsonwebtoken");

exports.logIn = async function(req, res) {
  try {
    const {
      email,
      password,
      rememberMe,
    } = req.body;
    const signInEndpoint = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=" + process.env.FB_API_KEY;

    let userId = null;
    let jwtToken = null;
    const expiresIn = rememberMe ? "365d" : "1d";

    await axios.post(signInEndpoint, {
      email: email,
      password: password,
      returnSecureToken: true,
    }).then(async (axiosRes) => {
      userId = axiosRes.data.localId;

      jwtToken = jwt.sign({
        userId,
      }, process.env.JWT_SECRET, {
        expiresIn,
      });

      const userDoc = admin.firestore().collection("tokens").doc(userId);
      const userData = (await userDoc.get()).data();
      const userTokens = userData && userData.tokens ? userData.tokens : [];

      userTokens.push(jwtToken);

      await userDoc.set({
        tokens: userTokens,
      });
    }).catch((error) => {
      logger.error("Login error:", error);
      return res.status(200).json({
        error: "LOGIN_ERROR",
      });
    });

    return res.status(200).json({
      jwtToken: jwtToken,
    });
  } catch (error) {
    logger.error("Login error:", error);
    return res.status(200).json({
      error: "LOGIN_ERROR",
    });
  }
};
