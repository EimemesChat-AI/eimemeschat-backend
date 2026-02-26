import { auth } from '../config/firebaseAdmin.js';
import User from '../models/User.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        message: 'Please log in to access this resource'
      });
    }

    // Verify Firebase token
    const decoded = await auth.verifyIdToken(token);
    req.firebaseUID = decoded.uid;

    // Find or create user in MongoDB
    let user = await User.findOne({ firebaseUID: decoded.uid });
    
    if (!user) {
      // Create new user
      user = new User({
        firebaseUID: decoded.uid,
        email: decoded.email,
        username: decoded.email?.split('@')[0] || 'user_' + Date.now(),
      });
      await user.save();
      console.log(`✅ New user created: ${user.email}`);
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error.message);
    
    // Handle specific Firebase errors
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token expired, please log in again' });
    } else if (error.code === 'auth/argument-error') {
      return res.status(401).json({ error: 'Invalid token format' });
    }
    
    return res.status(401).json({ error: 'Authentication failed' });
  }
};