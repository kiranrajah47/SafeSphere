const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'responder')) {
    return next();
  }
  return res.status(403).json({ 
    success: false, 
    message: 'Forbidden: Access restricted to Administrators or Responders' 
  });
};

module.exports = { requireAdmin };
