import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'zwembad_secr3t_k3y_for_dev_only';

export class AuthService {
  static async login(email, password) {
    const user = query('SELECT * FROM users WHERE email = ?', [email])[0];
    if (!user) {
      throw new Error('User not found');
    }

    // For initial seeder where we haven't hashed passwords yet:
    // We check if it's a plain text match or a hashed match
    // In production, we should only support hashed.
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
    } else {
        // Fallback for seeder plain text passwords
        isMatch = (password === user.password);
    }

    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        color: user.color
      }
    };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
}
