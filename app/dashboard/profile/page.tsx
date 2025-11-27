import { Metadata } from "next";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";
import Button from "@/ui/Button";
import Navigation from "@/components/Navigation";
import PasswordForm from "./password-form";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation>
        <div className="flex items-center gap-4">
          <Button
            href="/dashboard"
            label="← Back to Dashboard"
            variant="plain"
            color="secondary"
          />
        </div>
      </Navigation>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-text-subtle mt-2">
            Manage your account settings and password
          </p>
        </div>
        <div className="bg-surface rounded-lg shadow p-6">
          <div className="space-y-8">
            <ProfileForm user={user} />

            <PasswordForm />
          </div>
        </div>
      </main>
    </div>
  );
}
