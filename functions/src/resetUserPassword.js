const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  sendEmail,
} = require("./shared/emailSender");
const path = require("path");

const templatePath = path.join(__dirname, "../tpl/reset_password.html");

exports.resetPassword = async function(req, res) {
  try {
    const {
      email,
    } = req.body;

    let user = null;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (error) {
      logger.error("Error fetching user by email:", error);
      return res.status(200).json({
        error: "USER_NOT_FOUND",
      });
    }

    if (!user) {
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
      firstName,
      lastName,
    } = userData;

    await admin.auth().generatePasswordResetLink(email)
        .then((link) => {
          const mailOptions = {
            from: "no-reply@readthevoice.com",
            to: email,
            subject: "Reset your password",
            replacements: {
              email: email,
              firstName: firstName,
              lastName: lastName,
              link: link,
            },
          };
          sendEmail(templatePath, mailOptions, res, "PASSWORD_RESET_ERROR");
        })
        .catch((error) => {
          logger.error("Error with password reset link:", error);
          return res.status(200).json({
            error: "PASSWORD_RESET_ERROR",
          });
        });

    await admin.firestore().collection("tokens").doc(user.uid).delete();


    return res.status(200).json({
      message: "PASSWORD_RESET_EMAIL_SENT",
    });
  } catch (error) {
    logger.error("Password reset error:", error);
    return res.status(200).json({
      error: "PASSWORD_RESET_ERROR",
    });
  }
};
