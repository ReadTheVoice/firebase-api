const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  sendEmail,
} = require("./emailSender");
const path = require("path");

const templatePath = path.join(__dirname, "../tpl/account_deletion.html");

exports.resetPassword = async function(req, res) {
  try {
    const {
      token,
    } = req.body;

    let user = null;
    try {
      user = await admin.auth().getUser(token);
    } catch (error) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const userSnapshot = await admin.firestore().collection("users").doc(user.uid).get();

    if (!userSnapshot.exists) {
      return res.status(404).json({
        error: "User not found",
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
    sendEmail(templatePath, mailOptions, res, "Account deletion error");

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    logger.error("Account deletion error:", error);
    return res.status(500).json({
      error: "Account deletion error",
    });
  }
};
