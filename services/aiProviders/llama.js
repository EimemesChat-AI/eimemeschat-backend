import axios from 'axios';

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions';

export const callLlama = async (messages) => {
  try {
    const response = await axios.post(
      TOGETHER_API_URL,
      {
        model: 'meta-llama/Llama-2-70b-chat-hf',
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Llama error:', error);
    throw new Error('Failed to get response from Llama');
  }
};

// Streaming version
export const callLlamaStream = async function* (messages) {
  const response = await axios.post(
    TOGETHER_API_URL,
    {
      model: 'meta-llama/Llama-2-70b-chat-hf',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.LLAMA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream',
    }
  );

  const stream = response.data;
  for await (const chunk of stream) {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          yield parsed.choices[0].delta.content;
        } catch (e) {}
      }
    }
  }
};
