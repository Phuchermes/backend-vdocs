const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const parts = authHeader.split(" ");
    const token = parts.length === 1 ? parts[0] : parts[1];
    if (!token) return res.status(401).json({ error: "Token empty" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });
      req.user = decoded;
      next();
    });

  } catch (err) {
    return res.status(500).json({ error: "Verify error" });
  }
};
