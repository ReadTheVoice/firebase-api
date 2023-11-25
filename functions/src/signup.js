const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

exports.signUp = async function(res, req) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
    } = req.body;

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
