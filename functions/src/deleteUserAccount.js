const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  sendEmail,
} = require("./shared/emailSender");
const path = require("path");

const templatePath = path.join(__dirname, "../tpl/delete_account.html");

exports.resetPassword = async function(req, res) {
  try {
    const {
      token,
    } = req.body;

    let user = null;
    try {
      user = await admin.auth().getUser(token);
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
    await admin.auth().deleteUser(user.uid);

    await admin.firestore().collection("users").doc(user.uid).delete();

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
