import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Button from "@/ui/Button";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  // Statistiken laden
  const [organizationsCount, usersCount, postsCount] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.post.count(),
  ]);

  const stats = [
    {
      label: "Organizations",
      value: organizationsCount,
      href: "/admin/organizations",
    },
    { label: "Total Users", value: usersCount, href: "/admin/users" },
    { label: "Total Posts", value: postsCount, href: "/" },
  ];

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-text-muted">
          Manage organizations, users, and system settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-surface rounded-lg p-6 shadow border border-border hover:border-primary transition"
          >
            <div className="text-text-muted text-sm font-medium">
              {stat.label}
            </div>
            <div className="text-3xl font-bold mt-2">{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-lg p-6 shadow border border-border">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            href="/admin/organizations/new"
            label="+ New Organization"
            variant="solid"
            className="w-full"
          />
          <Button
            href="/admin/organizations"
            label="Manage Organizations"
            variant="solid"
            className="w-full"
          />
          <Button
            href="/admin/users"
            label="View All Users"
            variant="solid"
            className="w-full"
          />
        </div>
      </div>
    </>
  );
}
