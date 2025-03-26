// /middlewares/authMiddleware.js
module.exports = (req, res, next) => {
    const userId = sessionStorage.getItem("userUUID"); // Example of getting userId from session
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.userUUID = userId; // Attach userId to the request for later use
    next();
  };
  