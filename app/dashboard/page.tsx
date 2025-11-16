import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold">MDCMS Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{session.user.email}</span>
              {/* Logout Button kommt gleich */}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome, {session.user.name || session.user.email}!</h2>
          <p className="text-gray-600">You are successfully logged in. 🎉</p>
        </div>
      </main>
    </div>
  );
}
