"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { updateProfile } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { useActionState } from "@/hooks/useActionState";
import { FieldError, MessageAlert } from "@/components/MessageAlert";

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Props = {
  user: User;
};

export function ProfileForm({ user }: Props) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);

  const { update } = useSession();
  const profileAction = useActionState();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await profileAction.execute(
      updateProfile,
      { name, email },
      {
        successMessage: "Profile updated successfully",
        onSuccess: async () => {
          await update({ email, name });
        },
      },
    );
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <form onSubmit={handleProfileSubmit} className="space-y-4">
        <MessageAlert
          message={profileAction.message}
          onDismiss={profileAction.clearErrors}
        />

        <InputField
          id="name"
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          fullWidth
        />
        <FieldError error={profileAction.fieldErrors.name} />

        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <FieldError error={profileAction.fieldErrors.email} />

        <Button
          type="submit"
          label={profileAction.isLoading ? "Saving..." : "Save Profile"}
          disabled={profileAction.isLoading}
        />
      </form>
    </>
  );
}
