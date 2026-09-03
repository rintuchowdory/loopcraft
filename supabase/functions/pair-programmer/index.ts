const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are an exacting but friendly pair-programming partner. Be specific and reference line-level details in the code you're given. Keep responses focused on the requested action only.`;

const ACTION_PROMPTS = {
  explain: "Explain what this {language} code does, in plain terms, section by section.",
  bugs: "Review this {language} code for bugs, edge cases, and incorrect logic. List each issue found.",
  improve: "Suggest concrete improvements to this {language} code: readability, performance, or idiom. Show the improved version.",
  complete: "This {language} code looks unfinished. Complete it in a way consistent with its existing style.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { code, language, action } = await req.json();

    const instruction = ACTION_PROMPTS[action].replace("{language}", language);
    const userMessage = `${instruction}\n\n\`\`\`${language}\n${code}\n\`\`\``;

    const apiKey = Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is not set. Add it as a Supabase Edge Function secret.");
    }

    const resp = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`AI provider returned ${resp.status}: ${text}`);
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(`Unexpected response shape from AI provider`);
    }

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
