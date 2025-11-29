import { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";
import { DataTable } from "@/components/DataTable";
import { organizationColumns } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Organizations - Admin",
};

export default async function OrganizationsPage() {
  const session = await requireAdmin();

  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
          posts: true,
          apiKeys: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-danger">🛡️ Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            href="/admin"
            label="← Admin Dashboard"
            variant="plain"
            color="secondary"
            className="text-sm"
          />
          <ModeToggle />
          <UserMenu name={session.user.name} email={session.user.email} />
        </div>
      </Navigation>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold">Organizations</h2>
            <p className="text-text-muted mt-2">
              Manage all organizations in the system ({organizations.length})
            </p>
          </div>
          <Button href="/admin/organizations/new" label="+ New Organization" />
        </div>

        <DataTable
          columns={organizationColumns}
          data={organizations}
          keyExtractor={(org) => org.id}
          emptyMessage="No organizations yet. Create your first one!"
          emptyAction={{
            label: "Create Organization",
            href: "/admin/organizations/new",
          }}
        />
      </main>
    </div>
  );
}
