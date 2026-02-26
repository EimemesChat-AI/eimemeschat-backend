import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const callOpenAI = async (messages, stream = false) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      stream,
    });
    if (stream) {
      return response;
    }
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI error:', error);
    throw new Error('Failed to get response from OpenAI');
  }
};
