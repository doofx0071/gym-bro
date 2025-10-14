// Example usage of Groq and Mistral AI services
import { callAI, callGroq, callMistral, AIMessage } from '@/lib/ai';

// Example 1: Basic AI conversation with automatic fallback
export async function basicAIChat() {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful fitness assistant. Provide concise, actionable advice.'
    },
    {
      role: 'user',
      content: 'What are the best exercises for building core strength?'
    }
  ];

  try {
    // This will use Groq by default, fallback to Mistral if Groq fails
    const response = await callAI(messages);
    console.log(`Response from ${response.provider} (${response.model}):`);
    console.log(response.content);
    return response;
  } catch (error) {
    console.error('AI request failed:', error);
    throw error;
  }
}

// Example 2: Using specific provider (Groq for speed)
export async function quickResponse() {
  const messages: AIMessage[] = [
    {
      role: 'user',
      content: 'Give me a quick 5-minute warm-up routine'
    }
  ];

  try {
    // Force Groq for fastest response
    const response = await callGroq(messages, {
      temperature: 0.8,
      max_tokens: 500
    });
    
    console.log('Quick response from Groq:');
    console.log(response.content);
    return response;
  } catch (error) {
    console.error('Groq request failed:', error);
    throw error;
  }
}

// Example 3: Using specific provider (Mistral for detailed responses)
export async function detailedAdvice() {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: 'You are an experienced personal trainer. Provide detailed, comprehensive fitness advice with scientific backing.'
    },
    {
      role: 'user',
      content: 'Create a detailed 12-week muscle building program for an intermediate lifter'
    }
  ];

  try {
    // Use Mistral for detailed, comprehensive responses
    const response = await callMistral(messages, {
      temperature: 0.7,
      max_tokens: 2000
    });
    
    console.log('Detailed response from Mistral:');
    console.log(response.content);
    return response;
  } catch (error) {
    console.error('Mistral request failed:', error);
    throw error;
  }
}

// Example 4: Comparison between providers
export async function compareProviders() {
  const messages: AIMessage[] = [
    {
      role: 'user',
      content: 'What are the benefits of compound exercises vs isolation exercises?'
    }
  ];

  try {
    console.log('Getting responses from both providers...');
    
    // Get response from Groq
    const groqResponse = await callGroq(messages, { max_tokens: 800 });
    console.log('\n--- GROQ RESPONSE ---');
    console.log(groqResponse.content);
    console.log('Tokens used:', groqResponse.usage?.total_tokens);

    // Get response from Mistral
    const mistralResponse = await callMistral(messages, { max_tokens: 800 });
    console.log('\n--- MISTRAL RESPONSE ---');
    console.log(mistralResponse.content);
    console.log('Tokens used:', mistralResponse.usage?.total_tokens);

    return {
      groq: groqResponse,
      mistral: mistralResponse
    };
  } catch (error) {
    console.error('Provider comparison failed:', error);
    throw error;
  }
}

// Example 5: Using AI in a Next.js API route
export async function createAPIExample() {
  // This would go in pages/api/ai-chat.ts or app/api/ai-chat/route.ts
  const exampleAPICode = `
// pages/api/ai-chat.ts (Pages Router) or app/api/ai-chat/route.ts (App Router)
import { NextRequest, NextResponse } from 'next/server';
import { callAI, AIMessage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { messages, provider } = await request.json();
    
    const response = await callAI(messages as AIMessage[], {
      provider: provider || 'groq',
      temperature: 0.7,
      max_tokens: 1000,
      fallback: true
    });

    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
`;

  console.log('Example API Route code:');
  console.log(exampleAPICode);
  return exampleAPICode;
}

// Example 6: React hook for AI chat
export function createReactHookExample() {
  const hookCode = `
// hooks/use-ai-chat.ts
import { useState } from 'react';
import { AIMessage, AIResponse } from '@/lib/ai';

export function useAIChat() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string, provider: 'groq' | 'mistral' = 'groq') => {
    setLoading(true);
    setError(null);

    const userMessage: AIMessage = { role: 'user', content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, provider })
      });

      const data = await response.json();
      
      if (data.success) {
        const aiMessage: AIMessage = { role: 'assistant', content: data.data.content };
        setMessages([...newMessages, aiMessage]);
        return data.data;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  };
}
`;

  console.log('Example React Hook code:');
  console.log(hookCode);
  return hookCode;
}
