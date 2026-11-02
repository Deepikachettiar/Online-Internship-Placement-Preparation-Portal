
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Authentication required.",
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: "Authentication is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return res.status(401).json({
        message: "Invalid authentication token.",
      });
    }

    req.user = {
      _id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
}

// Reads the token if one is sent and sets req.user. It never blocks the request,
// so public routes keep working and routes that need a login still check req.user.
function attachUser(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token || !process.env.JWT_SECRET) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded && typeof decoded === "object" && decoded.id) {
      req.user = {
        _id: decoded.id,
        role: decoded.role,
      };
    }
  } catch {
    // Invalid or expired token: continue without a user.
  }

  next();
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  attachUser,
};
