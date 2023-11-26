const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

exports.verifyToken = async function(req, res) {
  try {
    const {
      token,
    } = req.body;

    const user = await admin.auth().getUser(token);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const userSnapshot = await admin.firestore().collection("users").doc(token).get();

    if (!userSnapshot.exists) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const userData = userSnapshot.data();
    const {
      email,
      firstName,
      lastName,
    } = userData;

    return res.status(200).json({
      email: email,
      firstName: firstName,
      lastName: lastName,
    });
  } catch (error) {
    logger.error("Token verification error:", error);
    return res.status(401).json({
      error: "Token verification error",
    });
  }
};
