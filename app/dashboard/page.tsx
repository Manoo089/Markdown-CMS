import { requireAuth } from "@/lib/auth-utils";
import { PostsList } from "./posts-list";
import { Suspense } from "react";
import { PostFilters } from "./post-filters";
import Button from "@/ui/Button";
import Navigation from "@/components/Navigation";
import { UserMenu } from "@/components/UserMenu";
import { ModeToggle } from "@/components/ModeToggle";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

interface Props {
  searchParams: Promise<{
    page?: string;
    status?: string;
    type?: string;
    search?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await requireAuth();
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const status = params.status || "all";
  const type = params.type || "all";
  const search = params.search || "";

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <h1 className="text-xl font-bold">MDCMS Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button
            href="/dashboard/settings"
            label="Site Settings"
            variant="plain"
            color="secondary"
            className="text-sm"
          />

          <ModeToggle />

          <UserMenu name={session.user.name} email={session.user.email} />
        </div>
      </Navigation>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostFilters />

        <Suspense
          fallback={<div className="text-text-muted">Loading posts...</div>}
        >
          <PostsList
            page={page}
            status={status}
            type={type}
            search={search}
            organizationId={session.user.organizationId}
          />
        </Suspense>
      </main>
    </div>
  );
}
