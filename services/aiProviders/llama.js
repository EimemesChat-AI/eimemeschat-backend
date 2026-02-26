import axios from 'axios';

/**
 * Groq API integration for Llama models
 * 
 * Features:
 * - ✅ 100% Free tier available
 * - ✅ No credit card required
 * - ✅ Ultra-fast inference
 * 
 * Get API key: https://console.groq.com
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Available Groq models:
 * - llama3-70b-8192 (Recommended - best performance)
 * - llama3-8b-8192 (Smaller, faster)
 * - mixtral-8x7b-32768 (Mixtral model)
 * - gemma-7b-it (Google's Gemma)
 */
const DEFAULT_MODEL = 'llama3-70b-8192';

/**
 * Call Groq API with messages array
 * @param {Array} messages - Array of {role, content} objects
 * @param {Object} options - Optional parameters
 * @returns {Promise<string>} - AI response text
 */
export const callLlama = async (messages, options = {}) => {
  try {
    const {
      model = DEFAULT_MODEL,
      temperature = 0.7,
      maxTokens = 1024,
      topP = 1,
    } = options;

    console.log(`🦙 Calling Groq with model: ${model}`);

    // Validate API key
    if (!process.env.LLAMA_API_KEY) {
      throw new Error('LLAMA_API_KEY is not set in environment variables');
    }

    const response = await axios.post(
      GROQ_API_URL,
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        top_p: topP,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    // Validate response
    if (!response.data?.choices?.[0]?.message?.content) {
      console.error('Invalid Groq response:', response.data);
      throw new Error('Invalid response from Groq API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    // Detailed error logging
    console.error('❌ Groq API Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Handle specific error types
    if (error.response?.status === 401) {
      throw new Error('Groq: Invalid API key. Get a free key at https://console.groq.com');
    } else if (error.response?.status === 429) {
      throw new Error('Groq: Rate limit exceeded. Free tier allows 60 requests per minute.');
    } else if (error.response?.status === 403) {
      throw new Error('Groq: Access denied. Your account may need approval.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Groq: Request timeout. The service might be slow.');
    }

    // Generic error
    throw new Error(`Groq AI Error: ${error.response?.data?.error?.message || error.message}`);
  }
};

/**
 * Streaming version for Groq (real-time responses)
 * @param {Array} messages - Array of {role, content} objects
 * @param {Object} options - Optional parameters
 * @returns {AsyncGenerator} - Stream of response chunks
 */
export async function* callLlamaStream(messages, options = {}) {
  try {
    const {
      model = DEFAULT_MODEL,
      temperature = 0.7,
      maxTokens = 1024,
    } = options;

    const response = await axios.post(
      GROQ_API_URL,
      {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.LLAMA_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
        timeout: 60000,
      }
    );

    const stream = response.data;
    
    for await (const chunk of stream) {
      const lines = chunk.toString().split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            
            if (content) {
              yield content;
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Groq streaming error:', error);
    throw new Error('Failed to stream from Groq');
  }
}