import { requireAuth } from "@/lib/auth-utils";
import { LogoutButton } from "./LogoutButton";
import { PostsList } from "./posts-list";
import { Suspense } from "react";
import { PostFilters } from "./post-filters";

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">MDCMS Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session?.user?.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PostFilters />

        <Suspense fallback={<div>Loading posts...</div>}>
          <PostsList page={page} status={status} type={type} search={search} />
        </Suspense>
      </main>
    </div>
  );
}
