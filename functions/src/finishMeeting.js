const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.finishMeeting = async function(req, res) {
  try {
    const {
      meetingId,
      token,
    } = req.body;

    const tokenResult = verifyTokenAndGetUserId(token);
    if (tokenResult.error) {
      return res.status(200).json({
        error: tokenResult.error,
      });
    }
    const userId = tokenResult.userId;

    const meetingRef = admin.firestore().collection("meetings").doc(meetingId);
    const meetingDoc = await meetingRef.get();
    if (!meetingDoc.exists) {
      return res.status(200).json({
        error: "MEETING_NOT_FOUND",
      });
    }

    if (meetingDoc.data().creator !== userId) {
      return res.status(200).json({
        error: "UNAUTHORIZED_ACCESS",
      });
    }

    await meetingRef.update({
      isFinished: true,
      endDate: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({
      message: "MEETING_FINISHED",
    });
  } catch (error) {
    logger.error("Error finishing meeting:", error);
    return res.status(200).json({
      error: "ERROR_FINISHING_MEETING",
    });
  }
};
