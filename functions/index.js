const admin = require("firebase-admin");
const {
  onRequest,
} = require("firebase-functions/v2/https");
const {
  onSchedule,
} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");

admin.initializeApp();

const verifyToken = (handler) => {
  return async (req, res) => {
    const token = req.headers.authorization;

    if (!token || token !== process.env.ACCESS_TOKEN) {
      logger.error("Unauthorized - Invalid token");
      return res.status(200).json({
        error: "Unauthorized - Invalid token",
      });
    }

    await handler(req, res);
  };
};

const signUpFunction = require("./src/signUp.js");
const logInFunction = require("./src/logIn.js");
const logOutFunction = require("./src/logOut.js");
const verifyTokenFunction = require("./src/verifyUserToken.js");
const deleteAccountFunction = require("./src/deleteUserAccount.js");
const resetPasswordFunction = require("./src/resetUserPassword.js");
const updateUserEmailFunction = require("./src/updateUserEmail.js");
const updateUserProfileFunction = require("./src/updateUserProfile.js");
const createMeetingFunction = require("./src/createMeeting.js");
const deleteMeetingFunction = require("./src/deleteMeeting.js");
const listMeetingsFunction = require("./src/listMeetings.js");
const getMeetingFunction = require("./src/getMeeting.js");
const finishMeetingFunction = require("./src/finishMeeting.js");
const updateMeetingFunction = require("./src/updateMeeting.js");
const autoDeleteMeetingsFunction = require("./src/autoDeleteMeetings.js");

exports.signUp = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  signUpFunction.signUp(req, res);
}));

exports.logIn = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  logInFunction.logIn(req, res);
}));

exports.logOut = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  logOutFunction.logOut(req, res);
}));

exports.verifyToken = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  verifyTokenFunction.verifyToken(req, res);
}));

exports.resetPassword = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  resetPasswordFunction.resetPassword(req, res);
}));

exports.deleteAccount = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  deleteAccountFunction.deleteAccount(req, res);
}));

exports.updateUserEmail = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  updateUserEmailFunction.updateUserEmail(req, res);
}));

exports.updateUserProfile = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  updateUserProfileFunction.updateUserProfile(req, res);
}));

exports.createMeeting = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  createMeetingFunction.createMeeting(req, res);
}));

exports.deleteMeeting = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  deleteMeetingFunction.deleteMeeting(req, res);
}));

exports.listMeetings = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  listMeetingsFunction.listMeetings(req, res);
}));

exports.finishMeeting = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  finishMeetingFunction.finishMeeting(req, res);
}));

exports.getMeeting = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  getMeetingFunction.getMeeting(req, res);
}));

exports.updateMeeting = onRequest({
  region: "europe-west3",
}, verifyToken(async (req, res) => {
  updateMeetingFunction.updateMeeting(req, res);
}));

exports.autoDeleteMeetings = onSchedule({
  region: "europe-west3",
  schedule: "* * * * *",
}, async (event) => {
  autoDeleteMeetingsFunction.autoDeleteMeetings(event);
});
