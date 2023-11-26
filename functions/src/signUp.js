const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");
const {
  sendEmail,
} = require("./shared/emailSender");
const path = require("path");

const templatePath = path.join(__dirname, "../tpl/verif_email.html");

exports.signUp = async function(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
    } = req.body;

    try {
      await admin.auth().getUserByEmail(email);
    } catch (error) {
      if (error.code !== "auth/user-not-found") {
        return res.status(400).json({
          error: "Email already exists",
        });
      }
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      firstName,
      lastName,
      email,
    });

    await admin.auth().generateEmailVerificationLink(email)
        .then((link) => {
          const mailOptions = {
            from: "no-reply@readthevoice.com",
            to: email,
            subject: "Please verify your account",
            replacements: {
              email: email,
              link: link,
            },
          };
          sendEmail(templatePath, mailOptions, res, "Registration error");
        })
        .catch((error) => {
          logger.error("Error with verification link:", error);
          return res.status(500).json({
            error: "Registration error",
          });
        });


    return res.status(200).json({
      message: "Successful registration, verification email sent",
    });
  } catch (error) {
    logger.error("Registration error:", error);
    return res.status(500).json({
      error: "Registration error",
    });
  }
};
