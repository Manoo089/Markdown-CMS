import { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";

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

        {organizations.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg shadow border border-border">
            <p className="text-text-muted mb-4">
              No organizations yet. Create your first one!
            </p>
            <Button
              href="/admin/organizations/new"
              label="Create Organization"
            />
          </div>
        ) : (
          <div className="bg-surface rounded-lg shadow border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-hover">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    API Keys
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {organizations.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-surface-hover transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {org.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted text-sm font-mono">
                      {org.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {org._count.users}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {org._count.posts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {org._count.apiKeys}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted text-sm">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Link
                        href={`/admin/organizations/${org.id}`}
                        className="text-primary hover:underline"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
