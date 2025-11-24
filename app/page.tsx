import { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: APP_NAME,
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-text mb-4">MDCMS API</h1>
        <p className="text-text-subtle mb-8">Headless CMS Backend - API & Dashboard</p>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover transition"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/login"
            className="block w-full px-6 py-3 bg-surface text-text rounded-lg font-semibold hover:bg-surface-hover transition"
          >
            Login
          </Link>
        </div>

        <div className="mt-12 text-left bg-surface rounded-lg p-6 shadow border border-border">
          <h2 className="font-bold text-lg mb-4">API Endpoints</h2>
          <ul className="space-y-2 text-sm text-text-muted font-mono">
            <li>GET /api/v1/posts</li>
            <li>GET /api/v1/posts/:slug</li>
            <li>GET /api/v1/settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
