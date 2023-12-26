const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.logOut = async function(req, res) {
  try {
    const {
      token,
    } = req.body;
    const result = verifyTokenAndGetUserId(token);

    if (result.error) {
      return res.status(200).json({
        error: result.error,
      });
    }

    const userId = result.userId;

    const userDoc = admin.firestore().collection("tokens").doc(userId);
    const userData = (await userDoc.get()).data();
    const userTokens = userData && userData.tokens ? userData.tokens : [];

    const updatedTokens = userTokens.filter((t) => t !== token);

    await userDoc.set({
      tokens: updatedTokens,
    });

    return res.status(200).json({
      message: "LOGOUT_SUCCESS",
    });
  } catch (error) {
    logger.error("Logout error:", error);
    return res.status(500).json({
      error: "LOGOUT_ERROR",
    });
  }
};
