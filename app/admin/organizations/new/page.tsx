import { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/admin-auth";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";
import { CreateOrganizationForm } from "./create-organization-form";
import { Box } from "@/ui/Box";

export const metadata: Metadata = {
  title: "New Organization - Admin",
};

export default async function NewOrganizationPage() {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-danger">🛡️ Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            href="/admin/organizations"
            label="← All Organizations"
            variant="plain"
            color="secondary"
            className="text-sm"
          />
          <ModeToggle />
          <UserMenu name={session.user.name} email={session.user.email} />
        </div>
      </Navigation>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Create New Organization</h2>
          <p className="text-text-muted mt-2">
            Set up a new organization with its own users, content, and API keys
          </p>
        </div>

        <Box>
          <CreateOrganizationForm />
        </Box>
      </main>
    </div>
  );
}
