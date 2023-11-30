const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

exports.updateUserProfile = async function(req, res) {
  try {
    const {
      firstName,
      lastName,
      token,
    } = req.body;

    const user = await admin.auth().getUser(token);

    if (!user) {
      return res.status(200).json({
        error: "USER_NOT_FOUND",
      });
    }

    const userSnapshot = await admin.firestore().collection("users").doc(token).get();

    if (!userSnapshot.exists) {
      return res.status(200).json({
        error: "USER_NOT_FOUND",
      });
    } else {
      await admin.firestore().collection("users").doc(token).update({
        firstName: firstName,
        lastName: lastName,
      });
      return res.status(200).json({
        message: "USER_PROFILE_UPDATED",
      });
    }
  } catch (error) {
    logger.error("Error updating user profile:", error);
    return res.status(200).json({
      error: "ERROR_UPDATING_USER_PROFILE",
    });
  }
};
