const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.listUserMeetings = async function(req, res) {
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

    const meetingsSnapshot = await admin.firestore().collection("meetings")
        .where("creator", "==", userId)
        .get();

    if (meetingsSnapshot.empty) {
      return res.status(200).json({
        message: "NO_MEETINGS_FOUND",
      });
    }

    const meetings = [];
    meetingsSnapshot.forEach((doc) => {
      meetings.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return res.status(200).json({
      meetings,
    });
  } catch (error) {
    logger.error("Error listing user meetings:", error);
    return res.status(200).json({
      error: "ERROR_LISTING_MEETINGS",
    });
  }
};
