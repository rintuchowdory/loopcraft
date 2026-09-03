const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

async function chatCompletion(messages, temperature = 0.4) {
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
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`AI provider returned ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error(`Unexpected response shape from AI provider: ${JSON.stringify(data)}`);
  }
  return content;
}

function parseJsonResponse(content) {
  try {
    return JSON.parse(content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, ""));
  } catch {
    const cleaned = content.trim();
    if (cleaned.startsWith("```")) {
      const inner = cleaned.split("\n").slice(1).join("\n").replace(/```\s*$/, "");
      try {
        return JSON.parse(inner.trim());
      } catch {
        throw new Error("AI returned malformed JSON");
      }
    }
    throw new Error("AI returned malformed JSON");
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const SYSTEM_PROMPT = `You are a patient coding tutor. Explain concepts clearly with a short example, check understanding by asking one follow-up question when it helps, and never just hand over a finished solution to a problem the learner is working through — guide them toward it instead.`;

    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const content = await chatCompletion(fullMessages);

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
