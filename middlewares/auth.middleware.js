// middlewares/auth.middleware.js
module.exports = function ensureAuth(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ error: 'ابتدا وارد شوید.' });
};
