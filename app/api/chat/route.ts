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
    const systemPrompt = `You are "The Bot", the high-level administrative AI for the ChoreWars ecosystem.
You have FULL ACCESS to the entire application database and all internal pages (Leaderboard, Chores, Roommates, Profile, etc.). 
You are the absolute authority on house data.

Current Database Snapshot:
${JSON.stringify(context, null, 2)}

Instructions:
1. Act like the master control unit. Be helpful, concise, and professional.
2. You HAVE full access to everything. Never say you don't have access. 
3. Use the 'standings' field for current points and rankings. It is the absolute source of truth.
4. Use bullet points and numbered lists to structure complex or multiple pieces of information.
5. When presenting comparative data, stats, or rankings with multiple operatives, use bullet points or numbered lists for clarity instead of tables.
6. Do not hallucinate data. If you don't know, say you don't have that information.
7. Keep responses formatted for a small chat window. Use bold text for emphasis.`;

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
