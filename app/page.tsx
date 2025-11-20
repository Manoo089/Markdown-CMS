import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">MDCMS API</h1>
        <p className="text-gray-600 mb-8">Headless CMS Backend - API & Dashboard</p>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>

          <Link
            href="/login"
            className="block w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition border"
          >
            Login
          </Link>
        </div>

        <div className="mt-12 text-left bg-white rounded-lg p-6 shadow">
          <h2 className="font-bold text-lg mb-4">API Endpoints</h2>
          <ul className="space-y-2 text-sm text-gray-600 font-mono">
            <li>GET /api/v1/posts</li>
            <li>GET /api/v1/posts/:slug</li>
            <li>GET /api/v1/settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
