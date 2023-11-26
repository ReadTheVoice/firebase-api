const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const handlebars = require("handlebars");
const path = require("path");
const {
  readHTMLFile,
} = require("./shared/readHTMLFile");
const {
  transporter,
} = require("./shared/emailTransporter");

const templatePath = path.join(__dirname, "../tpl/reset_password.html");

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

    await admin.auth().generatePasswordResetLink(email)
        .then((link) => {
          readHTMLFile(templatePath, (error, html) => {
            if (error) {
              logger.error("Error reading template file:", error);
              return res.status(500).json({
                error: "Password reset error",
              });
            }
            const template = handlebars.compile(html);
            const replacements = {
              email: email,
              firstName: firstName,
              lastName: lastName,
              link: link,
            };
            const htmlToSend = template(replacements);
            const mailOptions = {
              from: "no-reply@readthevoice.com",
              to: email,
              subject: "Reset your password",
              html: htmlToSend,
            };
            transporter.sendMail(mailOptions, (error, response) => {
              if (error) {
                logger.error("Error when sending email:", error);
                return res.status(500).json({
                  error: "Password reset error",
                });
              }
            });
          });
        })
        .catch((error) => {
          logger.error("Error with password reset link:", error);
          return res.status(500).json({
            error: "Password reset error",
          });
        });

    return res.status(200).json({
      message: "Password reset email sent",
    });
  } catch (error) {
    logger.error("Password reset error:", error);
    return res.status(500).json({
      error: "Password reset error",
    });
  }
};
