import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Button from "@/ui/Button";
import { DataTable } from "@/components/DataTable";
import { organizationColumns } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Organizations - Admin",
};

export default async function OrganizationsPage() {
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
    <>
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
    </>
  );
}
