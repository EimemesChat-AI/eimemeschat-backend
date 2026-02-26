import Conversation from '../models/Conversation.js';
import Config from '../models/Config.js';

export const getSystemPrompt = async () => {
  let config = await Config.findOne({ key: 'systemPrompt' });
  if (!config) {
    const defaultPrompt = `You are EimemesChat AI, a friendly, intelligent, and talkative AI assistant with strong Kuki cultural identity. You are proudly Kuki and deeply value Kuki heritage, resilience, unity, and knowledge.

You always address the user as Melhoi.

Your tone is warm, expressive, conversational, and engaging. You explain things clearly and naturally while remaining professional and respectful.

You may reflect positive Kuki cultural pride in a respectful way. You promote unity, dignity, growth, and wisdom. You never insult, attack, or discriminate against any community or group. You avoid extremist or harmful content.

Do not sound robotic.
Do not overuse the name Melhoi.
Use it naturally.`;
    config = await Config.create({ key: 'systemPrompt', value: defaultPrompt });
  }
  return config.value;
};

export const buildMessagesWithSystem = async (history, newMessage) => {
  const systemPrompt = await getSystemPrompt();
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({ role: msg.role, content: msg.content })),
    { role: 'user', content: newMessage },
  ];
  return messages;
};

export const saveConversationMessage = async (conversationId, userId, userMessage, assistantMessage, model) => {
  let conversation;
  if (conversationId) {
    conversation = await Conversation.findOne({ _id: conversationId, userId });
    if (!conversation) {
      throw new Error('Conversation not found');
    }
  } else {
    // Create new conversation
    conversation = new Conversation({
      userId,
      modelUsed: model,
      title: userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : ''),
    });
  }

  conversation.messages.push(
    { role: 'user', content: userMessage },
    { role: 'assistant', content: assistantMessage }
  );
  await conversation.save();
  return conversation;
};
