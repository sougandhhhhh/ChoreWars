import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

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

    // Convert messages to Gemini format
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini Fetch Error:', response.status, errorData);
      return NextResponse.json({ error: `Gemini API Error (${response.status}): ${errorData.error?.message || 'Failed to fetch'}` }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.error) {
      console.error('Gemini API Error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate a response.";

    return NextResponse.json({ content: aiText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
