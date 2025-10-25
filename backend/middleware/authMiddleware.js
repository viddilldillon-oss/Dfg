const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "No token provided" });

  if (token.startsWith("Bearer ")) token = token.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, isAdmin }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  return res.status(403).json({ message: "Not authorized as admin" });
};

module.exports = { protect, admin };