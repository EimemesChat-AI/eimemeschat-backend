import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

router.get('/profile', verifyToken, async (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', verifyToken, async (req, res) => {
  const { username } = req.body;
  if (username) {
    req.user.username = username;
    await req.user.save();
  }
  res.json({ user: req.user });
});

router.delete('/account', verifyToken, async (req, res) => {
  await Conversation.deleteMany({ userId: req.user._id });
  await User.deleteOne({ _id: req.user._id });
  // Note: Firebase user remains; you may want to delete it separately
  res.json({ message: 'Account deleted' });
});

export default router;
