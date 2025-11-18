import { NextResponse } from "next/server";

export function corsHeaders(origin?: string, allowedOrigins?: string | null) {
  let allowOrigin = "*";

  if (allowedOrigins && origin) {
    const origins = allowedOrigins.split(",").map((o) => o.trim());
    if (origins.includes(origin)) {
      allowOrigin = origin;
    } else if (!origins.includes("*")) {
      // Origin nicht in der Liste und kein Wildcard
      allowOrigin = "";
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
