import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export const callGemini = async (messages) => {
  try {
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini error:', error);
    throw new Error('Failed to get response from Gemini');
  }
};

// For streaming (if needed)
export const callGeminiStream = async function* (messages) {
  const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
  const result = await model.generateContentStream(prompt);
  for await (const chunk of result.stream) {
    yield chunk.text();
  }
};
