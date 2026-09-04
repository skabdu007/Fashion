const jwt = require("jsonwebtoken");

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

const normalizeDecodedUser = (decodedUser = {}) => ({
  ...decodedUser,
  id: String(decodedUser.id || decodedUser._id || decodedUser.user_id || ""),
  role: String(decodedUser.role || "").toUpperCase()
});

const decodeFromKnownSecrets = (token) => {
  const secrets = [
    process.env.JWT_SECRET_ADMIN,
    process.env.JWT_SECRET_CUSTOMER,
    process.env.JWT_SECRET_VENDOR
  ].filter(Boolean);

  for (const secret of secrets) {
    try {
      return normalizeDecodedUser(jwt.verify(token, secret));
    } catch {}
  }

  return null;
};

exports.verifyToken = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing"
      });
    }

    const decodedUser = decodeFromKnownSecrets(token);

    if (!decodedUser?.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token"
      });
    }

    req.user = decodedUser;
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Token verification failed"
    });
  }
};

exports.optionalAuth = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return next();
    }

    req.user = decodeFromKnownSecrets(token);
    next();
  } catch {
    next();
  }
};

exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  if (req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Super Admin access required"
    });
  }

  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated"
    });
  }

  if (!["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Admin access required"
    });
  }

  next();
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const allowedRoles = roles.map((role) => String(role).toUpperCase());

    if (!allowedRoles.includes(String(req.user.role || "").toUpperCase())) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    next();
  };
};

exports.ownerOrAdmin = (paramField = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated"
      });
    }

    const userId = String(req.user.id || "");
    const resourceId = String(req.params[paramField] || "");

    if (userId === resourceId || ["ADMIN", "SUPER_ADMIN"].includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Not authorized"
    });
  };
};

exports.normalizeDecodedUser = normalizeDecodedUser;
exports.decodeFromKnownSecrets = decodeFromKnownSecrets;
