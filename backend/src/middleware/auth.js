import { AuthService } from '../services/AuthService.js';

export const checkRole = (allowedRoles) => (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'Authentication required (JWT)' });
  }

  const decoded = AuthService.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  if (!allowedRoles.includes(decoded.role) && !allowedRoles.includes('any')) {
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }

  req.user = decoded;
  next();
};
