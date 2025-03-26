// middlewares/verifyToken.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header("Authorization");
    
    // If no token is provided, respond with an error
    if (!token) {
        return res.status(401).json({ success: false, message: "Access denied. No token provided." });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
        
        // Attach decoded user information to the request object
        req.user = decoded;
        
        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(400).json({ success: false, message: "Invalid token." });
    }
};

module.exports = verifyToken;
