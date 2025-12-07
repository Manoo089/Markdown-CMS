import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { DataTable } from "@/components/DataTable";
import { userColumns } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All Users - Admin",
};

export default async function AdminUsersPage() {
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
    <>
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
    </>
  );
}
