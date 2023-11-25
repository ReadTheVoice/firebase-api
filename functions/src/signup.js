const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();

exports.signUp = async function(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
    } = req.body;

    const existingUser = await admin.auth().getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists",
      });
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

    return res.status(200).json({
      message: "Successful registration",
    });
  } catch (error) {
    logger.error("Registration error:", error);
    return res.status(500).json({
      error: "Registration error",
    });
  }
};
