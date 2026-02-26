import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Config from '../models/Config.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/stats', async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalMessages = await Conversation.aggregate([
    { $unwind: '$messages' },
    { $count: 'total' },
  ]);
  const usageByModel = await Conversation.aggregate([
    { $group: { _id: '$modelUsed', count: { $sum: { $size: '$messages' } } } },
  ]);
  res.json({ totalUsers, totalMessages: totalMessages[0]?.total || 0, usageByModel });
});

router.get('/users', async (req, res) => {
  const users = await User.find().select('-__v');
  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  await Conversation.deleteMany({ userId: req.params.id });
  await User.deleteOne({ _id: req.params.id });
  res.json({ message: 'User deleted' });
});

router.put('/limits', async (req, res) => {
  const { chatgpt, llama, gemini } = req.body;
  await Config.findOneAndUpdate(
    { key: 'dailyLimits' },
    { value: { chatgpt, llama, gemini } },
    { upsert: true }
  );
  res.json({ message: 'Limits updated' });
});

router.get('/system-prompt', async (req, res) => {
  const config = await Config.findOne({ key: 'systemPrompt' });
  res.json({ prompt: config?.value || '' });
});

router.put('/system-prompt', async (req, res) => {
  const { prompt } = req.body;
  await Config.findOneAndUpdate(
    { key: 'systemPrompt' },
    { value: prompt },
    { upsert: true }
  );
  res.json({ message: 'System prompt updated' });
});

export default router;
