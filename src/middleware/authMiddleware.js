const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.cookies.token;
    let token = null;
    if (authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
    else if (req.cookies && req.cookies.token) token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Not authorized, token missing' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authorized, user not found' });
    req.user = user;
    next();
  } catch (error) {
    console.error('auth error', error);
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};
module.exports = authMiddleware;