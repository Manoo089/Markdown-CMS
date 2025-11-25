import { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";

export const metadata: Metadata = {
  title: "All Users - Admin",
};

export default async function AdminUsersPage() {
  const session = await requireAdmin();

  const users = await prisma.user.findMany({
    include: {
      organization: {
        select: {
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          posts: true,
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
        <div className="mb-6">
          <h2 className="text-3xl font-bold">All Users</h2>
          <p className="text-text-muted mt-2">
            Overview of all users across all organizations ({users.length})
          </p>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-12 bg-surface rounded-lg shadow border border-border">
            <p className="text-text-muted">No users found.</p>
          </div>
        ) : (
          <div className="bg-surface rounded-lg shadow border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-hover">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-surface-hover transition"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">
                        {user.name || "Unnamed User"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted text-sm">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/organizations/${user.organizationId}`}
                        className="text-primary hover:underline"
                      >
                        {user.organization.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isAdmin ? (
                        <span className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user._count.posts}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-text-muted text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
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
