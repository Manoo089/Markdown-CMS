"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSettings } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import TextareaField from "@/ui/TextareaField";
import { useActionState } from "@/hooks/useActionState";
import { FieldError, MessageAlert } from "@/components/MessageAlert";

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
  const [siteTitle, setSiteTitle] = useState(
    settings?.siteTitle || "My Website",
  );
  const [faviconUrl, setFaviconUrl] = useState(settings?.faviconUrl || "");
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || "");
  const [seoTitleTemplate, setSeoTitleTemplate] = useState(
    settings?.seoTitleTemplate || "%s | My Website",
  );
  const [seoDefaultDescription, setSeoDefaultDescription] = useState(
    settings?.seoDefaultDescription || "",
  );
  const [ogImageUrl, setOgImageUrl] = useState(settings?.ogImageUrl || "");
  const [allowedOrigins, setAllowedOrigins] = useState(
    settings?.allowedOrigins || "",
  );

  const settingsAction = useActionState();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await settingsAction.execute(
      updateSettings,
      {
        siteTitle,
        faviconUrl: faviconUrl || undefined,
        logoUrl: logoUrl || undefined,
        seoTitleTemplate,
        seoDefaultDescription: seoDefaultDescription || undefined,
        ogImageUrl: ogImageUrl || undefined,
        allowedOrigins: allowedOrigins || undefined,
      },
      {
        successMessage: "Settings saved successfully!",
        onSuccess: () => {
          router.refresh();
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* General Settings */}
      <div>
        <h3 className="text-lg font-semibold text-text mb-4">General</h3>
        <div className="space-y-4">
          <InputField
            id="siteTitle"
            type="text"
            label="Site Title"
            value={siteTitle}
            required
            fullWidth
            onChange={(e) => setSiteTitle(e.target.value)}
          />
          <FieldError error={settingsAction.fieldErrors.siteTitle} />

          <InputField
            id="logoUrl"
            type="url"
            label="Logo URL"
            value={logoUrl}
            placeholder="https://example.com/logo.png"
            fullWidth
            onChange={(e) => setLogoUrl(e.target.value)}
          />
          <FieldError error={settingsAction.fieldErrors.logoUrl} />

          <InputField
            id="faviconUrl"
            type="url"
            label="Favicon URL"
            value={faviconUrl}
            placeholder="https://example.com/favicon.ico"
            fullWidth
            onChange={(e) => setFaviconUrl(e.target.value)}
          />
          <FieldError error={settingsAction.fieldErrors.faviconUrl} />
        </div>
      </div>

      {/* SEO Settings */}
      <div>
        <h3 className="text-lg font-semibold text-text mb-4">SEO</h3>
        <div className="space-y-4">
          <InputField
            id="seoTitleTemplate"
            type="text"
            label="Title Template"
            value={seoTitleTemplate}
            placeholder="https://example.com/favicon.ico"
            description='Use %s as placeholder for page title. Example: "%s | My Website'
            required
            fullWidth
            onChange={(e) => setSeoTitleTemplate(e.target.value)}
          />
          <FieldError error={settingsAction.fieldErrors.seoTitleTemplate} />

          <TextareaField
            id="seoDefaultDescription"
            label="Default Meta Description"
            value={seoDefaultDescription}
            placeholder="Default description for pages without their own"
            rows={3}
            fullWidth
            onChange={(e) => setSeoDefaultDescription(e.target.value)}
          />
          <FieldError
            error={settingsAction.fieldErrors.seoDefaultDescription}
          />

          <InputField
            id="ogImageUrl"
            type="url"
            label="Default OG Image URL"
            value={ogImageUrl}
            placeholder="https://example.com/og-image.png"
            description="Image shown when sharing on social media (recommended: 1200x630px)"
            fullWidth
            onChange={(e) => setOgImageUrl(e.target.value)}
          />
          <FieldError error={settingsAction.fieldErrors.ogImageUrl} />
        </div>
      </div>

      {/* API Settings */}
      <div>
        <h3 className="text-lg font-semibold text-text mb-4">API Settings</h3>
        <div className="space-y-4">
          <InputField
            id="allowedOrigins"
            type="text"
            label="Allowed Origins (CORS)"
            value={allowedOrigins}
            placeholder="example.com, app.example.com"
            startAddon="http(s)://"
            description="Comma-separated list of domains that can access your API. Use * for all domains."
            fullWidth
            onChange={(e) => setAllowedOrigins(e.target.value)}
          />
          <FieldError error={settingsAction.fieldErrors.allowedOrigins} />
        </div>
      </div>

      <MessageAlert
        message={settingsAction.message}
        onDismiss={settingsAction.clearErrors}
      />

      <div>
        <Button
          type="submit"
          label={settingsAction.isLoading ? "Saving..." : "Save Settings"}
          disabled={settingsAction.isLoading}
          variant="solid"
          color="primary"
        />
      </div>
    </form>
  );
}
