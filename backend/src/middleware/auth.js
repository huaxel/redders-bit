import { query } from '../db.js';

export const checkRole = (allowedRoles) => (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    // For dev MVP, if no header, assume Admin (User 1)
    req.user = { id: 1, role: 'admin' };
    return next();
  }

  const user = query('SELECT * FROM users WHERE id = ?', [userId])[0];
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  if (!allowedRoles.includes(user.role) && !allowedRoles.includes('any')) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = user;
  next();
};
