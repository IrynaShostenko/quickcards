const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization token is required.",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    return next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

module.exports = requireAuth;
