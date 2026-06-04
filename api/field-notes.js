const MAX_BODY_BYTES = 128 * 1024;

const rangeLabels = {
  shenanigans: {
    1: "1 - keep it civil",
    2: "2 - only if supervised",
    3: "3 - persuade me",
    4: "4 - I hear the plot",
    5: "5 - hand me the quest"
  },
  type2: {
    1: "1 - soft life only",
    2: "2 - mild inconvenience",
    3: "3 - medium rare suffering",
    4: "4 - funny after showering",
    5: "5 - laughter through pain"
  }
};

const profileMap = {
  planner: "Quietly Reliable Cartographer",
  caretaker: "Morale Infrastructure Specialist",
  adventurer: "High-Variance Side Quester",
  drifter: "Vibe-Literate Wanderer",
  comfort: "Soft-Life Strategist"
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanText(value, maxLength = 1600) {
  if (typeof value !== "string") return "";

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function cleanArray(value, maxItems = 24) {
  const raw = Array.isArray(value) ? value : value ? [value] : [];

  return raw
    .map((item) => cleanText(item, 180))
    .filter(Boolean)
    .slice(0, maxItems);
}

function cleanRange(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) return "3";
  return String(parsed);
}

function cleanData(input = {}) {
  return {
    name: cleanText(input.name, 120),
    contact: cleanText(input.contact, 180),
    windows: cleanArray(input.windows),
    dates: cleanText(input.dates),
    duration: cleanText(input.duration, 80),
    expectations: cleanArray(input.expectations),
    avoid: cleanText(input.avoid),
    activities: cleanArray(input.activities),
    wildcard: cleanText(input.wildcard),
    shenanigans: cleanRange(input.shenanigans),
    type2: cleanRange(input.type2),
    line: cleanText(input.line),
    budget: cleanText(input.budget, 80),
    budgetWhy: cleanText(input.budgetWhy),
    sideways: cleanText(input.sideways, 120),
    morning: cleanText(input.morning, 120),
    decision: cleanText(input.decision, 120),
    needs: cleanText(input.needs),
    request: cleanText(input.request),
    anythingElse: cleanText(input.anythingElse),
    policyConsent: cleanText(input.policyConsent, 20),
    companyWebsite: cleanText(input.companyWebsite, 120)
  };
}

function list(value) {
  if (Array.isArray(value)) return value.length ? value.join(", ") : "None selected";
  return value || "Not answered";
}

function scoreProfile(data) {
  const scores = {
    planner: 0,
    caretaker: 0,
    adventurer: 0,
    drifter: 0,
    comfort: 0
  };

  const shenanigans = Number(data.shenanigans || 3);
  const type2 = Number(data.type2 || 3);

  if (shenanigans >= 4) scores.adventurer += 3;
  if (type2 >= 4) scores.adventurer += 2;
  if (shenanigans <= 2) scores.comfort += 2;
  if (type2 <= 2) scores.comfort += 2;

  const signals = [
    data.sideways,
    data.morning,
    data.decision,
    ...data.expectations,
    ...data.activities
  ].filter(Boolean).join(" | ");

  if (/Stabilize|Early start|Research|planned|anchor/i.test(signals)) scores.planner += 4;
  if (/Refuel|Slow breakfast|Read the room|Low-stress|Massage|spa/i.test(signals)) scores.caretaker += 4;
  if (/Side quest|Bold opener|weird|Unexpected|Escape room|Theme park|Go-karting|supper/i.test(signals)) scores.adventurer += 4;
  if (/Observe|Whatever|wandering|Photo-worthy|Cafe crawl|Thrifting|Nature/i.test(signals)) scores.drifter += 4;
  if (/Low-stress|Slow breakfast|Massage|spa|Comfort/i.test(signals)) scores.comfort += 2;

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  return profileMap[winner];
}

function buildSummary(data) {
  const profile = scoreProfile(data);
  const shenaniganLabel = rangeLabels.shenanigans[data.shenanigans || 3];
  const type2Label = rangeLabels.type2[data.type2 || 3];

  return {
    profile,
    text: [
      "Johor Bahru Trip Readout",
      "=========================",
      "",
      `Name: ${data.name || "Not answered"}`,
      `Contact: ${data.contact || "Not answered"}`,
      `Traveler read: ${profile}`,
      "",
      "Schedule",
      `- Possible windows: ${list(data.windows)}`,
      `- Specific date notes: ${data.dates || "Not answered"}`,
      `- Ideal duration: ${data.duration || "Not answered"}`,
      "",
      "Trip Expectations",
      `- Success looks like: ${list(data.expectations)}`,
      `- Please avoid: ${data.avoid || "Not answered"}`,
      "",
      "Activities",
      `- Votes for: ${list(data.activities)}`,
      `- Wildcard nomination: ${data.wildcard || "Not answered"}`,
      "",
      "Chaos, Type 2 Fun, and Limits",
      `- Shenanigan tolerance: ${shenaniganLabel}`,
      `- Type 2 fun capacity: ${type2Label}`,
      `- Hard line: ${data.line || "Not answered"}`,
      "",
      "Budget",
      `- Memorable activity spend: ${data.budget || "Not answered"}`,
      `- Worth stretching budget for: ${data.budgetWhy || "Not answered"}`,
      "",
      "Travel Instincts",
      `- When plans go sideways: ${data.sideways || "Not answered"}`,
      `- Ideal morning: ${data.morning || "Not answered"}`,
      `- Group decision style: ${data.decision || "Not answered"}`,
      `- Needs or constraints: ${data.needs || "Not answered"}`,
      "",
      "Final Notes",
      `- One-sentence itinerary request: ${data.request || "Not answered"}`,
      `- Anything else: ${data.anythingElse || "Not answered"}`
    ].join("\n")
  };
}

function sendJson(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(body));
}

function getAllowedOrigins(req) {
  const origins = new Set();
  const host = req.headers.host;
  const forwardedProto = req.headers["x-forwarded-proto"];

  if (host) {
    const proto = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    origins.add(`${proto}://${host}`);
    if (host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
      origins.add(`http://${host}`);
    }
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.ALLOWED_ORIGIN) {
    process.env.ALLOWED_ORIGIN
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
      .forEach((origin) => origins.add(origin));
  }

  return origins;
}

function hasAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  return getAllowedOrigins(req).has(origin);
}

function readJson(req) {
  if (req.body && typeof req.body === "object") {
    return Promise.resolve(req.body);
  }

  if (typeof req.body === "string") {
    return Promise.resolve(JSON.parse(req.body || "{}"));
  }

  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      body += chunk;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    req.on("error", reject);
  });
}

function parseExtraJson() {
  if (!process.env.EMAIL_ENDPOINT_EXTRA_JSON) return {};

  try {
    return JSON.parse(process.env.EMAIL_ENDPOINT_EXTRA_JSON);
  } catch (error) {
    throw new Error("EMAIL_ENDPOINT_EXTRA_JSON must be valid JSON.");
  }
}

function compactObject(object) {
  return Object.fromEntries(
    Object.entries(object).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );
}

async function forwardEmail({ data, summary, req }) {
  const endpointUrl = process.env.EMAIL_ENDPOINT_URL;
  if (!endpointUrl) {
    throw new Error("Email forwarding is not configured.");
  }

  const submittedAt = new Date().toISOString();
  const to = process.env.EMAIL_TO
    ? process.env.EMAIL_TO.split(",").map((email) => email.trim()).filter(Boolean)
    : undefined;
  const subjectPrefix = process.env.EMAIL_SUBJECT_PREFIX || "JB trip questionnaire";
  const subject = `${subjectPrefix}: ${data.name || "anonymous friend"}`;
  const headers = {
    "Content-Type": "application/json"
  };

  if (process.env.EMAIL_ENDPOINT_TOKEN) {
    const headerName = process.env.EMAIL_ENDPOINT_AUTH_HEADER || "Authorization";
    const token = process.env.EMAIL_ENDPOINT_TOKEN;
    headers[headerName] = headerName.toLowerCase() === "authorization" && !/^\w+\s+/.test(token)
      ? `Bearer ${token}`
      : token;
  }

  const endpointBody = {
    ...parseExtraJson(),
    subject,
    text: summary.text,
    html: `<pre style="white-space:pre-wrap;font:14px/1.5 system-ui,sans-serif">${escapeHtml(summary.text)}</pre>`,
    submittedAt,
    source: "jb-trip-questionnaire",
    sourceUrl: req.headers.referer,
    profile: summary.profile,
    response: data
  };

  if (to && to.length) endpointBody.to = to;
  if (process.env.EMAIL_FROM) endpointBody.from = process.env.EMAIL_FROM;
  if (data.contact.includes("@") && !endpointBody.reply_to) endpointBody.reply_to = data.contact;

  const endpointResponse = await fetch(endpointUrl, {
    method: process.env.EMAIL_ENDPOINT_METHOD || "POST",
    headers,
    body: JSON.stringify(compactObject(endpointBody))
  });

  if (!endpointResponse.ok) {
    const detail = await endpointResponse.text().catch(() => "");
    console.error("Email endpoint failed", {
      status: endpointResponse.status,
      detail: detail.slice(0, 500)
    });
    throw new Error(`Email endpoint returned ${endpointResponse.status}.`);
  }
}

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "Use POST." });
    return;
  }

  if (!hasAllowedOrigin(req)) {
    sendJson(res, 403, { ok: false, error: "This submission origin is not allowed." });
    return;
  }

  try {
    const body = await readJson(req);
    const data = cleanData(body.data || {});

    if (data.companyWebsite) {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (data.policyConsent !== "yes") {
      sendJson(res, 400, { ok: false, error: "Consent is required before sending." });
      return;
    }

    if (!data.name) {
      sendJson(res, 400, { ok: false, error: "Name or alias is required." });
      return;
    }

    const summary = buildSummary(data);
    await forwardEmail({ data, summary, req });
    sendJson(res, 200, { ok: true, profile: summary.profile });
  } catch (error) {
    console.error("Submission failed", error);
    sendJson(res, 500, { ok: false, error: "The response could not be emailed. Please try again." });
  }
}

module.exports = handler;
module.exports._test = {
  buildSummary,
  cleanData,
  scoreProfile
};
