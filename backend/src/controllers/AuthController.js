import { AuthService } from '../services/AuthService.js';

export class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  static async me(req, res) {
    // req.user is set by middleware
    res.json({ user: req.user });
  }
}
