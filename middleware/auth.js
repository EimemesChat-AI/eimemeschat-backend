import { auth } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await auth.verifyIdToken(token);
    req.firebaseUID = decoded.uid;

    let user = await User.findOne({ firebaseUID: decoded.uid });
    if (!user) {
      user = new User({
        firebaseUID: decoded.uid,
        email: decoded.email,
        username: decoded.email.split('@')[0],
      });
      await user.save();
    }
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
