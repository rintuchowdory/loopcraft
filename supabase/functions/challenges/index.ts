const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const GEN_PROMPT = `You are a coding challenge generator. Create a single {difficulty} {language} coding challenge. Respond as JSON with these fields: title, description, starter_code, solution, hints. The starter_code should have a placeholder function with a pass statement. The hints should be a single helpful sentence. Keep the description concise.`;

const GRADE_PROMPT = `You are a code grader. Evaluate the submitted code against the challenge. Respond as JSON with: status ("passed" or "failed"), feedback (2-3 sentences), score (0-100 integer). Be fair but thorough.`;

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
    throw new Error("Unexpected response shape from AI provider");
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
    const url = new URL(req.url);
    const path = url.pathname.replace("/functions/v1/challenges", "");
    const body = await req.json();

    if (path === "/generate") {
      const messages = [
        { role: "system", content: GEN_PROMPT.replace("{difficulty}", body.difficulty).replace("{language}", body.language) },
        { role: "user", content: `Generate a ${body.difficulty} ${body.language} challenge.` },
      ];
      const content = await chatCompletion(messages, 0.7);
      const data = parseJsonResponse(content);
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (path === "/grade") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      const challengeResp = await fetch(`${supabaseUrl}/rest/v1/challenges?id=eq.${body.challenge_id}&select=*`, {
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
        },
      });
      const challengeData = await challengeResp.json();
      const challenge = challengeData[0];

      const messages = [
        { role: "system", content: GRADE_PROMPT },
        { role: "user", content: `Challenge: ${challenge.title}\nDescription: ${challenge.description}\nReference solution: ${challenge.solution || "N/A"}\n\nSubmitted ${body.language} code:\n\`\`\`\n${body.code}\n\`\`\`` },
      ];
      const content = await chatCompletion(messages, 0.3);
      const data = parseJsonResponse(content);

      const status = data.status === "passed" ? "passed" : "failed";
      const feedback = data.feedback || "No feedback available.";
      const score = parseInt(String(data.score || 0), 10);

      await fetch(`${supabaseUrl}/rest/v1/challenge_submissions`, {
        method: "POST",
        headers: {
          "apikey": serviceKey,
          "Authorization": `Bearer ${serviceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challenge_id: body.challenge_id,
          code: body.code,
          status,
          feedback,
          score,
        }),
      });

      return new Response(
        JSON.stringify({ status, feedback, score }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown path: " + path }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
