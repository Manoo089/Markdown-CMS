import { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Button from "@/ui/Button";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

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
    { label: "Total Posts", value: postsCount, href: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-danger">🛡️ Admin Panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button
            href="/dashboard"
            label="← Back to Dashboard"
            variant="plain"
            color="secondary"
            className="text-sm"
          />
          <ModeToggle />
          <UserMenu name={session.user.name} email={session.user.email} />
        </div>
      </Navigation>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </main>
    </div>
  );
}
