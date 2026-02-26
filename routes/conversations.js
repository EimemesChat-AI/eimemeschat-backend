import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

router.get('/', verifyToken, async (req, res) => {
  const conversations = await Conversation.find({ userId: req.user._id })
    .sort({ updatedAt: -1 })
    .select('title modelUsed updatedAt');
  res.json(conversations);
});

router.get('/:id', verifyToken, async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user._id });
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json(conversation);
});

router.post('/', verifyToken, async (req, res) => {
  const { title, modelUsed } = req.body;
  const conversation = new Conversation({
    userId: req.user._id,
    title: title || 'New Chat',
    modelUsed: modelUsed || 'chatgpt',
  });
  await conversation.save();
  res.status(201).json(conversation);
});

router.put('/:id', verifyToken, async (req, res) => {
  const { title } = req.body;
  const conversation = await Conversation.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { title },
    { new: true }
  );
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json(conversation);
});

router.delete('/:id', verifyToken, async (req, res) => {
  const result = await Conversation.deleteOne({ _id: req.params.id, userId: req.user._id });
  if (result.deletedCount === 0) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json({ message: 'Deleted' });
});

export default router;
