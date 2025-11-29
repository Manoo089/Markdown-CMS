import { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";
import { DataTable } from "@/components/DataTable";
import { userColumns } from "@/lib/constants/user-table-columns";

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

        <DataTable
          columns={userColumns}
          data={users}
          keyExtractor={(user) => user.id}
          emptyMessage="No users found."
        />
      </main>
    </div>
  );
}
