const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const sendEmail = require("./shared/emailSender").sendEmail;
const path = require("path");
const verifyTokenAndGetUserId = require("./shared/verifyJwtToken").verifyTokenAndGetUserId;

const templatePath = path.join(__dirname, "../tpl/delete_account.html");

exports.deleteAccount = async function(req, res) {
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

    let user = null;
    try {
      user = await admin.auth().getUser(userId);
    } catch (error) {
      return res.status(200).json({
        error: "USER_NOT_FOUND",
      });
    }

    const userSnapshot = await admin.firestore().collection("users").doc(user.uid).get();
    if (!userSnapshot.exists) {
      return res.status(200).json({
        error: "USER_NOT_FOUND",
      });
    }

    const userData = userSnapshot.data();
    const {
      email,
      firstName,
      lastName,
    } = userData;

    const meetingsSnapshot = await admin.firestore().collection("meetings").where("creator", "==", userId).get();
    meetingsSnapshot.forEach(async (doc) => {
      await admin.firestore().collection("meetings").doc(doc.id).delete();
      await admin.database().ref(`transcripts/${doc.id}`).remove();
    });

    await admin.firestore().collection("users").doc(user.uid).delete();
    await admin.firestore().collection("tokens").doc(user.uid).delete();
    await admin.auth().deleteUser(user.uid);

    const mailOptions = {
      from: "no-reply@readthevoice.com",
      to: email,
      subject: "Confirmation of your account deletion",
      replacements: {
        firstName: firstName,
        lastName: lastName,
      },
    };
    sendEmail(templatePath, mailOptions, res, "ACCOUNT_DELETION_ERROR");

    return res.status(200).json({
      message: "ACCOUNT_DELETED_SUCCESSFULLY",
    });
  } catch (error) {
    logger.error("Account deletion error:", error);
    return res.status(200).json({
      error: "ACCOUNT_DELETION_ERROR",
    });
  }
};
