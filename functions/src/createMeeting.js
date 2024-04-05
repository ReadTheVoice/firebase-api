const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  verifyTokenAndGetUserId,
} = require("./shared/verifyJwtToken");

exports.createMeeting = async function(req, res) {
  try {
    const {
      name,
      description = "",
      isTranscriptAccessibleAfter = true,
      scheduledDate,
      deletionDate,
      token,
    } = req.body;

    const result = verifyTokenAndGetUserId(token);
    if (result.error) {
      return res.status(200).json({
        error: result.error,
      });
    }
    const userId = result.userId;

    const meetingData = {
      name,
      description,
      isTranscriptAccessibleAfter,
      creator: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isFinished: false,
      endDate: null,
      scheduledDate: admin.firestore.Timestamp.fromDate(new Date(scheduledDate)),
      deletionDate: deletionDate ? admin.firestore.Timestamp.fromDate(new Date(deletionDate)) : null,
    };

    const meetingRef = await admin.firestore().collection("meetings").add(meetingData);

    const transcriptData = {
      data: "",
    };
    await admin.database().ref(`transcripts/${meetingRef.id}`).set(transcriptData);

    return res.status(200).json({
      message: "MEETING_CREATED",
      meetingId: meetingRef.id,
    });
  } catch (error) {
    logger.error("Error creating meeting:", error);
    return res.status(200).json({
      error: "ERROR_CREATING_MEETING",
    });
  }
};
