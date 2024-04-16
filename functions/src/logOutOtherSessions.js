const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.logOutOtherSessions = async function(req, res) {
  try {
    const {
      token,
    } = req.body;
    const result = await verifyTokenAndGetUserId(token);

    if (result.error) {
      return res.status(200).json({
        error: result.error,
      });
    }

    const userId = result.userId;

    const userDoc = admin.firestore().collection("tokens").doc(userId);
    const userData = (await userDoc.get()).data();
    const userTokens = userData && userData.tokens ? userData.tokens : [];

    // Filter out the current token, keeping it in the list and removing others
    const updatedTokens = userTokens.filter((t) => t === token);

    await userDoc.set({
      tokens: updatedTokens,
    });

    return res.status(200).json({
      message: "LOGOUT_OTHER_SESSIONS_SUCCESS",
    });
  } catch (error) {
    logger.error("Logout other sessions error:", error);
    return res.status(500).json({
      error: "LOGOUT_OTHER_SESSIONS_ERROR",
    });
  }
};
