import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import PasswordForm from "./password-form";

export const metadata: Metadata = {
  title: "My Profile",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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
    <>
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
    </>
  );
}
