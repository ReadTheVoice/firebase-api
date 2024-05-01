const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.updateMeeting = async function(req, res) {
  try {
    const {
      meetingId,
      name,
      description = "",
      isTranscriptAccessibleAfter = true,
      language = "en",
      allowDownload = false,
      scheduledDate,
      deletionDate,
      transcript,
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
    const doc = await meetingRef.get();

    if (!doc.exists) {
      return res.status(200).json({
        error: "MEETING_NOT_FOUND",
      });
    }

    const meetingData = doc.data();
    if (meetingData.creator !== userId) {
      return res.status(200).json({
        error: "UNAUTHORIZED_ACCESS",
      });
    }

    const updatedData = {
      name,
      description,
      isTranscriptAccessibleAfter,
      language,
      allowDownload,
      scheduledDate: scheduledDate ? admin.firestore.Timestamp.fromDate(new Date(scheduledDate)) : null,
      deletionDate: deletionDate ? admin.firestore.Timestamp.fromDate(new Date(deletionDate)) : null,
    };

    await meetingRef.update(updatedData);

    if (transcript != null) {
      const transcriptData = {
        data: transcript,
      };
      await admin.database().ref(`transcripts/${meetingRef.id}`).set(transcriptData);
    }

    return res.status(200).json({
      message: "MEETING_UPDATED",
      meetingId: meetingId,
    });
  } catch (error) {
    logger.error("Error updating meeting:", error);
    return res.status(200).json({
      error: "ERROR_UPDATING_MEETING",
    });
  }
};
