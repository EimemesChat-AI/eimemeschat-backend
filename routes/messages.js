import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { checkAndUpdateLimit } from '../services/limiter.js';
import { buildMessagesWithSystem, saveConversationMessage } from '../services/conversationService.js';
import { callOpenAI } from '../services/aiProviders/openai.js';
import { callGemini } from '../services/aiProviders/gemini.js';
import { callLlama } from '../services/aiProviders/llama.js';
import Conversation from '../models/Conversation.js';

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { message, conversationId, model } = req.body;
  if (!message || !model) {
    return res.status(400).json({ error: 'Message and model are required' });
  }

  try {
    const limitCheck = await checkAndUpdateLimit(req.user, model);
    if (!limitCheck.allowed) {
      return res.status(429).json({ error: limitCheck.message });
    }

    let history = [];
    if (conversationId) {
      const conversation = await Conversation.findOne({ _id: conversationId, userId: req.user._id });
      if (conversation) {
        history = conversation.messages;
      }
    }

    const messages = await buildMessagesWithSystem(history, message);

    let aiResponse;
    switch (model) {
      case 'chatgpt':
        aiResponse = await callOpenAI(messages);
        break;
      case 'gemini':
        aiResponse = await callGemini(messages);
        break;
      case 'llama':
        aiResponse = await callLlama(messages);
        break;
      default:
        return res.status(400).json({ error: 'Invalid model' });
    }

    const savedConversation = await saveConversationMessage(
      conversationId,
      req.user._id,
      message,
      aiResponse,
      model
    );

    res.json({
      message: aiResponse,
      conversationId: savedConversation._id,
    });
  } catch (error) {
    console.error('Message error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;
