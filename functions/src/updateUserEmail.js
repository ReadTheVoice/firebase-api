const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  sendEmail,
} = require("./shared/emailSender");
const path = require("path");

const templatePath = path.join(__dirname, "../tpl/verif_email_update.html");

exports.updateUserEmail = async function(req, res) {
  try {
    const {
      email,
      token,
    } = req.body;

    const user = await admin.auth().getUser(token);

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const userEmail = user.email;
    const firstName = user.firstName;
    const lastName = user.lastName;

    const fbUserEmail = await admin.auth().getUserByEmail(email);
    if (fbUserEmail) {
      return res.status(400).json({
        error: "Email already used",
      });
    }

    if (userEmail !== email) {
      await admin.auth().updateUser(token, {
        email,
        emailVerified: false,
      });
      await admin.auth().generateEmailVerificationLink(email)
          .then((link) => {
            const mailOptions = {
              from: "no-reply@readthevoice.com",
              to: email,
              subject: "Please verify your new email address",
              replacements: {
                firstName: firstName,
                lastName: lastName,
                link: link,
              },
            };
            sendEmail(templatePath, mailOptions, res, "Email update error");
          })
          .catch((error) => {
            logger.error("Error with verification link:", error);
            return res.status(500).json({
              error: "Email update error",
            });
          });
      await admin.firestore().collection("users").doc(token).update({
        email: email,
      });

      return res.status(200).json({
        message: "User email updated",
      });
    } else {
      return res.status(304).json({
        message: "Not modified",
      });
    }
  } catch (error) {
    logger.error("Error updating user email:", error);
    return res.status(500).json({
      error: "Error updating user",
    });
  }
};
