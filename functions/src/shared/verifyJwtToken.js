const jwt = require("jsonwebtoken");

/**
 * @param {string} token
 * @return {Object}
 */
function verifyTokenAndGetUserId(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.exp * 1000 < Date.now()) {
      return {
        error: "TOKEN_EXPIRED",
      };
    }

    return {
      userId: decoded.userId,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return {
        error: "TOKEN_EXPIRED",
      };
    } else if (error.name === "JsonWebTokenError") {
      return {
        error: "TOKEN_INVALID",
      };
    } else {
      return {
        error: "TOKEN_VERIFICATION_ERROR",
      };
    }
  }
}

module.exports = {
  verifyTokenAndGetUserId,
};
