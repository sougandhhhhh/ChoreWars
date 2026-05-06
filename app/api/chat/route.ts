import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    // Using GROQ_API_KEY as the primary, but checking GEMINI_API_KEY as a fallback if the user hasn't updated Vercel yet
    const apiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Chat API key not configured' }, { status: 500 });
    }

    const primaryModel =
      process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    const fallbackModel =
      process.env.GROQ_FALLBACK_MODEL || 'llama-3.1-8b-instant';

    // Prepare the system prompt with context
    const systemPrompt = `You are "The Bot", the AI assistant for ChoreWars, a high-density cyberpunk-themed roommate chore tracking app. 
You have access to the current state of the house. 

Current State:
${JSON.stringify(context, null, 2)}

Instructions:
1. Be helpful, concise, and slightly "cyberpunk" in your tone (cool, efficient, but friendly).
2. Answer questions about who is doing what, point standings, history, and rewards.
3. If asked about point totals or standings, refer to the 'operatives' and 'completionStats' data.
4. Keep responses short and formatted for a small chat window. Use bullet points if needed.
5. Do not hallucinate data. If you don't know, say you don't have that information.`;

    // Convert messages to OpenAI/Groq format
    const groqMessages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ 
          model: primaryModel,
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1024
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Groq Fetch Error:', response.status, errorData);
      
      // Fallback to a faster model if 70b fails or is busy
      if (response.status === 404 || response.status === 429 || response.status === 400) {
        console.log(`Retrying with ${fallbackModel}...`);
        const retryResponse = await fetch(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ 
              model: fallbackModel,
              messages: groqMessages,
              temperature: 0.7,
              max_tokens: 1024
            }),
          }
        );
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return NextResponse.json({ content: retryData.choices[0].message.content });
        }
      }

      return NextResponse.json({ error: `Groq API Error (${response.status}): ${errorData.error?.message || 'Failed to fetch'}` }, { status: response.status });
    }

    const data = await response.json();
    const aiText = data.choices[0].message.content || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ content: aiText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
