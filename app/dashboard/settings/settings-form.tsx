"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "./actions";

interface Props {
  settings: {
    siteTitle: string;
    faviconUrl: string | null;
    logoUrl: string | null;
    seoTitleTemplate: string;
    seoDefaultDescription: string | null;
    ogImageUrl: string | null;
    allowedOrigins: string | null;
  } | null;
}

export function SettingsForm({ settings }: Props) {
  const router = useRouter();

  // Form State mit Defaults
  const [siteTitle, setSiteTitle] = useState(settings?.siteTitle || "My Website");
  const [faviconUrl, setFaviconUrl] = useState(settings?.faviconUrl || "");
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || "");
  const [seoTitleTemplate, setSeoTitleTemplate] = useState(settings?.seoTitleTemplate || "%s | My Website");
  const [seoDefaultDescription, setSeoDefaultDescription] = useState(settings?.seoDefaultDescription || "");
  const [ogImageUrl, setOgImageUrl] = useState(settings?.ogImageUrl || "");
  const [allowedOrigins, setAllowedOrigins] = useState(settings?.allowedOrigins || "");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess(false);

    const result = await updateSettings({
      siteTitle,
      faviconUrl: faviconUrl || undefined,
      logoUrl: logoUrl || undefined,
      seoTitleTemplate,
      seoDefaultDescription: seoDefaultDescription || undefined,
      ogImageUrl: ogImageUrl || undefined,
      allowedOrigins: allowedOrigins || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess(true);
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
      {/* General Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="siteTitle" className="block text-sm font-medium text-gray-700 mb-2">
              Site Title
            </label>
            <input
              id="siteTitle"
              type="text"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="faviconUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Favicon URL
            </label>
            <input
              id="faviconUrl"
              type="url"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://example.com/favicon.ico"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="seoTitleTemplate" className="block text-sm font-medium text-gray-700 mb-2">
              Title Template
            </label>
            <input
              id="seoTitleTemplate"
              type="text"
              value={seoTitleTemplate}
              onChange={(e) => setSeoTitleTemplate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use %s as placeholder for page title. Example: &quot;%s | My Website&quot;
            </p>
          </div>

          <div>
            <label htmlFor="seoDefaultDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Default Meta Description
            </label>
            <textarea
              id="seoDefaultDescription"
              value={seoDefaultDescription}
              onChange={(e) => setSeoDefaultDescription(e.target.value)}
              rows={3}
              placeholder="Default description for pages without their own"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="ogImageUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Default OG Image URL
            </label>
            <input
              id="ogImageUrl"
              type="url"
              value={ogImageUrl}
              onChange={(e) => setOgImageUrl(e.target.value)}
              placeholder="https://example.com/og-image.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Image shown when sharing on social media (recommended: 1200x630px)
            </p>
          </div>
        </div>
      </div>

      {/* API Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">API Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="allowedOrigins" className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Origins (CORS)
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                http(s)://
              </span>

              <input
                id="allowedOrigins"
                type="text"
                value={allowedOrigins}
                onChange={(e) => setAllowedOrigins(e.target.value)}
                placeholder="example.com, app.example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Comma-separated list of domains that can access your API. Use * for all domains.
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">{error}</div>}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md">
          Settings saved successfully!
        </div>
      )}

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </form>
  );
}
