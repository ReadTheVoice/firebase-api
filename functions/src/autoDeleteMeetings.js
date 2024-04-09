const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

exports.autoDeleteMeetings = async function(event) {
  const now = admin.firestore.Timestamp.now();
  const meetingsRef = admin.firestore().collection("meetings");
  const snapshot = await meetingsRef.where("deletionDate", "<=", now).get();

  if (snapshot.empty) {
    logger.log("No expired meetings to delete");
    return null;
  }

  const firestoreBatch = admin.firestore().batch();
  const deleteTranscriptsPromises = [];

  snapshot.forEach((doc) => {
    logger.log(`Deleting meeting: ${doc.id}`);
    firestoreBatch.delete(doc.ref);

    const deleteTranscriptPromise = admin.database().ref(`transcripts/${doc.id}`).remove();
    deleteTranscriptsPromises.push(deleteTranscriptPromise);
  });

  try {
    await firestoreBatch.commit();
    logger.log("Expired meetings deleted successfully from Firestore");
    await Promise.all(deleteTranscriptsPromises);
    logger.log("Corresponding transcripts deleted successfully from Realtime Database");
  } catch (error) {
    logger.error("Error deleting expired meetings and transcripts:", error);
  }
};
