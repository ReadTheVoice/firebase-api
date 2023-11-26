const handlebars = require("handlebars");
const logger = require("firebase-functions/logger");
const {
  readHTMLFile,
} = require("./readHTMLFile");
const {
  transporter,
} = require("./emailTransporter");

/**
 *
 * @param {*} templatePath
 * @param {*} mailOptions
 * @param {*} res
 * @param {*} errorMessage
 */
function sendEmail(templatePath, mailOptions, res, errorMessage) {
  readHTMLFile(templatePath, (error, html) => {
    if (error) {
      logger.error("Error reading template file:", error);
      return res.status(500).json({
        error: errorMessage,
      });
    }
    const template = handlebars.compile(html);
    const htmlToSend = template(mailOptions.replacements);
    mailOptions.html = htmlToSend;

    transporter.sendMail(mailOptions, (error, response) => {
      if (error) {
        logger.error("Error when sending email:", error);
        return res.status(500).json({
          error: errorMessage,
        });
      }
    });
  });
}

module.exports = {
  sendEmail,
};
