import { NextResponse } from "next/server";

function normalizeOrigin(origin: string): string {
  let trimmed = origin.trim();
  if (!trimmed) return "";

  // Wildcard durchlassen
  if (trimmed === "*") return "*";

  // https:// hinzufügen wenn fehlt
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    trimmed = `https://${trimmed}`;
  }

  // Trailing slash entfernen
  return trimmed.replace(/\/$/, "");
}

export function corsHeaders(origin?: string, allowedOrigins?: string | null) {
  let allowOrigin = "*";

  // Wenn keine allowedOrigins gesetzt (null), nichts erlauben
  if (allowedOrigins === null || allowedOrigins === undefined) {
    allowOrigin = "";
  } else if (allowedOrigins === "*") {
    // Explizit Wildcard gesetzt
    allowOrigin = "*";
  } else if (allowedOrigins && origin) {
    // Liste von Origins prüfen
    const origins = allowedOrigins.split(",").map((o) => normalizeOrigin(o));

    if (origins.includes("*")) {
      allowOrigin = origin;
    } else if (origins.includes(origin)) {
      allowOrigin = origin;
    }
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function withCors(response: NextResponse, origin?: string, allowedOrigins?: string | null) {
  const headers = corsHeaders(origin, allowedOrigins);

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Für OPTIONS Preflight Requests
export function handleOptions(origin?: string, allowedOrigins?: string | null) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin, allowedOrigins),
  });
}
