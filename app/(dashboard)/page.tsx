import { requireAuth } from "@/lib/auth-utils";
import { PostsList } from "./posts-list";
import { Suspense } from "react";
import { PostFilters } from "./post-filters";
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
    <>
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
    </>
  );
}
