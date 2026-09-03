const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are a coding concept explainer. The learner asks about a programming concept. Explain it in clear, beginner-friendly terms with a short code example. Then provide a quiz question to test understanding, along with the answer. Respond as JSON with fields: explanation, quiz_question, quiz_answer.`;

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
    const { concept, language } = await req.json();

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
          { role: "user", content: `Explain the concept: ${concept} (in ${language})` },
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
      throw new Error("Unexpected response shape from AI provider");
    }

    const parsed = parseJsonResponse(content);

    return new Response(
      JSON.stringify({
        explanation: parsed.explanation || "",
        quiz_question: parsed.quiz_question || "",
        quiz_answer: parsed.quiz_answer || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
