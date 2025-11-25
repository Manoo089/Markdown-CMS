import { isAdmin } from "@/lib/admin/admin-auth";
import Link from "next/link";

interface Props {
  children: React.ReactNode;
}

export default async function Navigation({ children }: Props) {
  const userIsAdmin = await isAdmin();

  return (
    <nav className="bg-surface shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {children}

          {userIsAdmin && (
            <Link
              href="/admin"
              className="ml-4 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              🛡️ Admin Panel
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
