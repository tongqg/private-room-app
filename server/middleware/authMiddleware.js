const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

/**
 * Authentication middleware for protected routes
 * Validates the JWT token from the Authorization header
 */
module.exports = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const decodedToken = jwt.verify(token, JWT_SECRET);
    
    // Add user information to the request object
    req.user = {
      userId: decodedToken.userId,
      roomId: decodedToken.roomId,
      isAdmin: decodedToken.isAdmin
    };
    
    // Continue to the protected route
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};