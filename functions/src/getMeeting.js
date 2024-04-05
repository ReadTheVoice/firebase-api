const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.getMeeting = async function(req, res) {
  try {
    const {
      meetingId,
      token,
    } = req.body;

    const result = verifyTokenAndGetUserId(token);
    if (result.error) {
      return res.status(200).json({
        error: result.error,
      });
    }
    const userId = result.userId;

    const meetingRef = admin.firestore().collection("meetings").doc(meetingId);
    const meetingDoc = await meetingRef.get();
    if (!meetingDoc.exists) {
      return res.status(200).json({
        error: "MEETING_NOT_FOUND",
      });
    }

    const meetingData = meetingDoc.data();

    if (meetingDoc.data().creator !== userId) {
      return res.status(200).json({
        error: "UNAUTHORIZED_ACCESS",
      });
    }

    const transcriptRef = admin.database().ref(`transcripts/${meetingId}`);
    const transcriptSnapshot = await transcriptRef.once("value");
    let transcriptData = {};
    if (transcriptSnapshot.exists()) {
      transcriptData = transcriptSnapshot.val();
    }

    const meeting = [];

    meeting.push({
      id: meetingDoc.id,
      ...meetingData,
      transcript: transcriptData,
    });

    return res.status(200).json({
      meeting: meeting[0],
    });
  } catch (error) {
    logger.error("Error getting meeting:", error);
    return res.status(200).json({
      error: "ERROR_GETTING_MEETING",
    });
  }
};
