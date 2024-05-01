const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.listMeetings = async function(req, res) {
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
        .orderBy("createdAt", "desc")
        .get();

    if (meetingsSnapshot.empty) {
      return res.status(200).json({
        message: "NO_MEETINGS_FOUND",
      });
    }

    const meetings = [];
    for (const doc of meetingsSnapshot.docs) {
      const meetingData = doc.data();
      const transcriptSnapshot = await admin.database().ref(`transcripts/${doc.id}`).once("value");
      let state = 0;
      if (transcriptSnapshot.exists() && transcriptSnapshot.val().data !== "") {
        state = meetingData.isFinished ? 2 : 1;
      } else {
        state = meetingData.isFinished ? 2 : 0;
      }
      meetings.push({
        id: doc.id,
        ...meetingData,
        state,
      });
    }

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
