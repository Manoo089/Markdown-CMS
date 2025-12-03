/**
 * API Route Utilities
 *
 * Provides wrappers for creating API routes with automatic
 * authentication, CORS handling, and error management.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withCors, handleOptions } from "@/lib/api-cors";
import { Organization, SiteSettings } from "@prisma/client";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Authenticated context passed to API handlers
 */
export type ApiContext = {
  organization: Organization & { settings: SiteSettings | null };
  settings: SiteSettings | null;
};

/**
 * Handler function for authenticated API routes
 */
type ApiHandler = (
  request: NextRequest,
  context: ApiContext,
) => Promise<NextResponse | Response>;

/**
 * Handler function for authenticated API routes with params
 */
type ApiHandlerWithParams<TParams> = (
  request: NextRequest,
  context: ApiContext,
  params: TParams,
) => Promise<NextResponse | Response>;

// ============================================================================
// API KEY VALIDATION
// ============================================================================

type AuthSuccess = {
  organization: Organization & { settings: SiteSettings | null };
  settings: SiteSettings | null;
};

type AuthError = {
  error: string;
  status: number;
};

async function validateApiKey(
  request: NextRequest,
): Promise<AuthSuccess | AuthError> {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "Missing or invalid Authorization header", status: 401 };
  }

  const key = authHeader.replace("Bearer ", "");

  const apiKey = await prisma.apiKey.findUnique({
    where: { key },
    include: {
      organization: {
        include: {
          settings: true,
        },
      },
    },
  });

  if (!apiKey) {
    return { error: "Invalid API key", status: 401 };
  }

  // Update lastUsedAt (fire and forget)
  prisma.apiKey
    .update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(console.error);

  return {
    organization: apiKey.organization,
    settings: apiKey.organization.settings,
  };
}

function isAuthError(auth: AuthSuccess | AuthError): auth is AuthError {
  return "error" in auth;
}

// ============================================================================
// API ROUTE WRAPPER
// ============================================================================

/**
 * Create an authenticated API route handler with automatic CORS
 *
 * @example
 * ```typescript
 * // In route.ts
 * export const GET = apiRoute(async (request, { organization, settings }) => {
 *   const posts = await prisma.post.findMany({
 *     where: { organizationId: organization.id }
 *   });
 *   return NextResponse.json({ data: posts });
 * });
 * ```
 */
export function apiRoute(handler: ApiHandler) {
  return async (request: NextRequest): Promise<Response> => {
    const origin = request.headers.get("origin") || undefined;

    try {
      // Validate API key
      const auth = await validateApiKey(request);

      if (isAuthError(auth)) {
        return withCors(
          NextResponse.json({ error: auth.error }, { status: auth.status }),
          origin,
          "*",
        );
      }

      // Execute handler
      const response = await handler(request, {
        organization: auth.organization,
        settings: auth.settings,
      });

      // Add CORS headers to response
      return withCors(
        response as NextResponse,
        origin,
        auth.settings?.allowedOrigins,
      );
    } catch (error) {
      console.error("[API Error]:", error);

      return withCors(
        NextResponse.json({ error: "Internal server error" }, { status: 500 }),
        origin,
        "*",
      );
    }
  };
}

/**
 * Create an authenticated API route handler with params (for dynamic routes)
 *
 * @example
 * ```typescript
 * // In [slug]/route.ts
 * export const GET = apiRouteWithParams<{ slug: string }>(
 *   async (request, { organization }, { slug }) => {
 *     const post = await prisma.post.findUnique({
 *       where: { organizationId_slug: { organizationId: organization.id, slug } }
 *     });
 *     if (!post) {
 *       return NextResponse.json({ error: "Not found" }, { status: 404 });
 *     }
 *     return NextResponse.json({ data: post });
 *   }
 * );
 * ```
 */
export function apiRouteWithParams<TParams>(
  handler: ApiHandlerWithParams<TParams>,
) {
  return async (
    request: NextRequest,
    { params }: { params: Promise<TParams> },
  ): Promise<Response> => {
    const origin = request.headers.get("origin") || undefined;

    try {
      // Validate API key
      const auth = await validateApiKey(request);

      if (isAuthError(auth)) {
        return withCors(
          NextResponse.json({ error: auth.error }, { status: auth.status }),
          origin,
          "*",
        );
      }

      // Await params (Next.js 15+)
      const resolvedParams = await params;

      // Execute handler
      const response = await handler(
        request,
        {
          organization: auth.organization,
          settings: auth.settings,
        },
        resolvedParams,
      );

      // Add CORS headers to response
      return withCors(
        response as NextResponse,
        origin,
        auth.settings?.allowedOrigins,
      );
    } catch (error) {
      console.error("[API Error]:", error);

      return withCors(
        NextResponse.json({ error: "Internal server error" }, { status: 500 }),
        origin,
        "*",
      );
    }
  };
}

// ============================================================================
// OPTIONS HANDLER
// ============================================================================

/**
 * Create a standard OPTIONS handler for CORS preflight requests
 *
 * @example
 * ```typescript
 * // In route.ts
 * export const OPTIONS = apiOptions();
 * export const GET = apiRoute(async (request, context) => { ... });
 * ```
 */
export function apiOptions() {
  return async (request: NextRequest): Promise<Response> => {
    const origin = request.headers.get("origin") || undefined;
    const auth = await validateApiKey(request);

    if (isAuthError(auth)) {
      return handleOptions(origin, "*");
    }

    return handleOptions(origin, auth.settings?.allowedOrigins);
  };
}

// ============================================================================
// RESPONSE HELPERS
// ============================================================================

/**
 * Create a success response with data
 */
export function apiSuccess<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data }, { status });
}

/**
 * Create a success response with data and metadata (for lists)
 */
export function apiSuccessWithMeta<T>(
  data: T,
  meta: { total: number; limit: number; offset: number },
): NextResponse {
  return NextResponse.json({ data, meta });
}

/**
 * Create an error response
 */
export function apiError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Create a not found response
 */
export function apiNotFound(resource = "Resource"): NextResponse {
  return NextResponse.json({ error: `${resource} not found` }, { status: 404 });
}
