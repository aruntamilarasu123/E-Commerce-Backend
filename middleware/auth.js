const jwt = require('jsonwebtoken');

module.exports = (requiredRole = null) => {
  return (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (requiredRole && decoded.role?.toLowerCase() !== requiredRole.toLowerCase()) {
        return res.status(403).json({ message: 'Access denied for this role' });
      }

      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};
