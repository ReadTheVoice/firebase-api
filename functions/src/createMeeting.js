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
      isFinished = false,
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
      isFinished,
      creator: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      endDate: null,
    };

    const meetingRef = await admin.firestore().collection("meetings").add(meetingData);

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
