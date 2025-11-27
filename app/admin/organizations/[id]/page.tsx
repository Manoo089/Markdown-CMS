import { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";
import { EditOrganizationForm } from "./edit-organization-form";
import { DeleteOrganizationButton } from "./delete-organization-button";
import { AddUserForm } from "./add-user-form";
import { UserActionsMenu } from "./user-actions-menu";

export const metadata: Metadata = {
  title: "Organization Details - Admin",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrganizationDetailPage({ params }: Props) {
  const session = await requireAdmin();
  const { id } = await params;

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      posts: {
        select: {
          id: true,
          title: true,
          published: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      apiKeys: {
        select: {
          id: true,
          name: true,
          lastUsedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
      settings: true,
      _count: {
        select: {
          users: true,
          posts: true,
          apiKeys: true,
        },
      },
    },
  });

  if (!organization) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-red-500">🛡️ Admin Panel</h1>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold">{organization.name}</h2>
            <p className="text-text-muted mt-1 font-mono text-sm">
              /{organization.slug}
            </p>
          </div>
          <DeleteOrganizationButton
            organizationId={organization.id}
            organizationName={organization.name}
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface rounded-lg p-6 shadow border border-border">
            <div className="text-text-muted text-sm">Users</div>
            <div className="text-3xl font-bold mt-2">
              {organization._count.users}
            </div>
          </div>
          <div className="bg-surface rounded-lg p-6 shadow border border-border">
            <div className="text-text-muted text-sm">Posts</div>
            <div className="text-3xl font-bold mt-2">
              {organization._count.posts}
            </div>
          </div>
          <div className="bg-surface rounded-lg p-6 shadow border border-border">
            <div className="text-text-muted text-sm">API Keys</div>
            <div className="text-3xl font-bold mt-2">
              {organization._count.apiKeys}
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-surface rounded-lg p-6 shadow border border-border">
          <h3 className="text-xl font-bold mb-4">Organization Settings</h3>
          <EditOrganizationForm organization={organization} />
        </div>

        {/* Users List */}
        <div className="bg-surface rounded-lg p-6 shadow border border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              Users ({organization._count.users})
            </h3>
            <AddUserForm organizationId={organization.id} />
          </div>

          {organization.users.length === 0 ? (
            <p className="text-text-muted">
              No users in this organization yet.
            </p>
          ) : (
            <div className="space-y-2">
              {organization.users.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-3 rounded border border-border hover:bg-surface-hover transition"
                >
                  <div>
                    <div className="font-medium">
                      {user.name || "Unnamed User"}
                      {user.isAdmin && (
                        <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-text-muted">{user.email}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-text-muted">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                    <UserActionsMenu
                      userId={user.id}
                      userName={user.name || ""}
                      userEmail={user.email}
                      isAdmin={user.isAdmin}
                      organizationId={organization.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        <div className="bg-surface rounded-lg p-6 shadow border border-border">
          <h3 className="text-xl font-bold mb-4">Recent Posts (Last 10)</h3>
          {organization.posts.length === 0 ? (
            <p className="text-text-muted">No posts yet.</p>
          ) : (
            <div className="space-y-2">
              {organization.posts.map((post) => (
                <div
                  key={post.id}
                  className="flex justify-between items-center p-3 rounded border border-border hover:bg-surface-hover transition"
                >
                  <div className="font-medium">{post.title}</div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        post.published
                          ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                          : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                    <span className="text-sm text-text-muted">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* API Keys */}
        <div className="bg-surface rounded-lg p-6 shadow border border-border">
          <h3 className="text-xl font-bold mb-4">
            API Keys ({organization._count.apiKeys})
          </h3>
          {organization.apiKeys.length === 0 ? (
            <p className="text-text-muted">No API keys created yet.</p>
          ) : (
            <div className="space-y-2">
              {organization.apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="flex justify-between items-center p-3 rounded border border-border"
                >
                  <div>
                    <div className="font-medium">{key.name}</div>
                    <div className="text-sm text-text-muted">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm text-text-muted">
                    {key.lastUsedAt
                      ? `Last used ${new Date(key.lastUsedAt).toLocaleDateString()}`
                      : "Never used"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
