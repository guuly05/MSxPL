import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeMatch } from "../shared/analysis.js";
import { getMatch } from "../shared/matches.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const app = express();
const port = Number(process.env.PORT || 4178);
const requestLimit = Math.max(1, Number(process.env.AI_REQUESTS_PER_MINUTE || 8));
const recentRequests = new Map();

app.disable("x-powered-by");
app.use(express.json({ limit: "12kb" }));

function isFoundryConfigured() {
  return Boolean(
    process.env.AZURE_FOUNDRY_ENDPOINT &&
    process.env.AZURE_FOUNDRY_API_KEY &&
    process.env.AZURE_FOUNDRY_DEPLOYMENT
  );
}

function allowAiRequest(request) {
  const now = Date.now();
  const key = request.ip || "local";
  const previous = recentRequests.get(key) || [];
  const active = previous.filter((stamp) => now - stamp < 60_000);
  if (active.length >= requestLimit) {
    recentRequests.set(key, active);
    return false;
  }
  active.push(now);
  recentRequests.set(key, active);
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [key, stamps] of recentRequests.entries()) {
    const active = stamps.filter((stamp) => now - stamp < 60_000);
    if (active.length) recentRequests.set(key, active);
    else recentRequests.delete(key);
  }
}, 120_000).unref();

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    product: "Turning Point Finder",
    foundryConfigured: isFoundryConfigured(),
    explanationMode: isFoundryConfigured() ? "microsoft-foundry" : "local-fallback"
  });
});

app.post("/api/explain", async (request, response) => {
  if (!allowAiRequest(request)) {
    return response.status(429).json({ error: "RATE_LIMITED", message: "Please wait a minute before generating another explanation." });
  }

  const { matchId, candidateId, viewMode } = request.body || {};
  if (typeof matchId !== "string" || typeof candidateId !== "string" || !["fan", "analyst"].includes(viewMode)) {
    return response.status(400).json({ error: "INVALID_REQUEST" });
  }

  const match = getMatch(matchId);
  if (!match) return response.status(404).json({ error: "MATCH_NOT_FOUND" });

  const analysis = analyzeMatch(match);
  const candidate = analysis.candidates.find((item) => item.id === candidateId);
  if (!candidate) return response.status(404).json({ error: "CANDIDATE_NOT_FOUND" });

  if (!isFoundryConfigured()) {
    return response.status(503).json({ error: "FOUNDRY_NOT_CONFIGURED" });
  }

  const facts = candidate.evidence.map((item) => ({ id: item.id, fact: item.detail }));
  const context = {
    match: match.home.name + " vs " + match.away.name,
    minute: candidate.event.minute,
    event: candidate.event.title,
    confidence: candidate.confidence,
    viewMode,
    impactScore: candidate.impactScore,
    facts
  };
  const endpoint = process.env.AZURE_FOUNDRY_ENDPOINT.replace(/\/+$/, "");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const foundryResponse = await fetch(endpoint + "/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.AZURE_FOUNDRY_API_KEY
      },
      body: JSON.stringify({
        model: process.env.AZURE_FOUNDRY_DEPLOYMENT,
        messages: [
          {
            role: "system",
            content: "Write a concise match explanation from the supplied structured facts only. Do not invent statistics, events, player names, or causes. Return a JSON object with a narrative of at most 65 words and claims, an array of 1 to 3 objects. Each claim must have text and evidenceIds. Each evidenceIds value must be copied from the provided facts. The fan view is plain and engaging; the analyst view is precise and evidence-focused. If the facts do not support a strong claim, say so."
          },
          {
            role: "user",
            content: JSON.stringify(context)
          }
        ],
        temperature: 0.2,
        max_completion_tokens: 220,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    if (!foundryResponse.ok) {
      return response.status(502).json({ error: "FOUNDRY_REQUEST_FAILED", status: foundryResponse.status });
    }
    const payload = await foundryResponse.json();
    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string") return response.status(502).json({ error: "FOUNDRY_RESPONSE_INVALID" });

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      return response.status(502).json({ error: "FOUNDRY_RESPONSE_INVALID" });
    }

    const validEvidenceIds = new Set(facts.map((item) => item.id));
    const claims = Array.isArray(result.claims) ? result.claims.slice(0, 3) : [];
    const validClaims = claims.filter((claim) =>
      claim &&
      typeof claim.text === "string" &&
      claim.text.length > 10 &&
      claim.text.length <= 220 &&
      Array.isArray(claim.evidenceIds) &&
      claim.evidenceIds.length > 0 &&
      claim.evidenceIds.every((id) => validEvidenceIds.has(id))
    );
    const narrative = typeof result.narrative === "string" ? result.narrative.trim() : "";
    if (!narrative || narrative.length > 600 || !validClaims.length) {
      return response.status(502).json({ error: "FOUNDRY_RESPONSE_UNGROUNDED" });
    }

    return response.json({
      provider: "microsoft-foundry",
      narrative,
      claims: validClaims,
      usage: payload.usage ? {
        promptTokens: payload.usage.prompt_tokens,
        completionTokens: payload.usage.completion_tokens
      } : undefined
    });
  } catch (error) {
    const errorCode = error?.name === "AbortError" ? "FOUNDRY_TIMEOUT" : "FOUNDRY_UNAVAILABLE";
    return response.status(502).json({ error: errorCode });
  } finally {
    clearTimeout(timeout);
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(rootDir, "dist")));
  app.use((_request, response) => response.sendFile(path.join(rootDir, "dist", "index.html")));
} else {
  const vite = await createViteServer({
    configFile: path.join(rootDir, "vite.config.js"),
    server: { middlewareMode: true },
    appType: "spa"
  });
  app.use(vite.middlewares);
}

app.listen(port, "0.0.0.0", () => {
  console.log("Turning Point Finder is available on http://localhost:" + port);
});
