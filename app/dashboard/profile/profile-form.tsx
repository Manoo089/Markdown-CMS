"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { updateProfile, updatePassword } from "./actions";
import {
  updatePasswordSchema,
  updateProfileSchema,
  PASSWORD_MIN_LENGTH,
} from "@/lib/schemas/user.schema";

type User = {
  id: string;
  email: string;
  name: string | null;
};

type Props = {
  user: User;
};

export function ProfileForm({ user }: Props) {
  const { update } = useSession();

  // Profile State
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    // Client-side Zod Validation
    const validation = updateProfileSchema.safeParse({ name, email });

    if (!validation.success) {
      setProfileError(validation.error.issues[0].message);
      setIsSavingProfile(false);
      return;
    }

    const result = await updateProfile(validation.data);

    if (result.error) {
      setProfileError(result.error);
    } else {
      setProfileMessage("Profile updated successfully!");

      await update({
        email: validation.data.email,
        name: validation.data.name,
      });
    }

    setIsSavingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage("");
    setPasswordErrors([]);

    // Client-side Zod Validation
    const validation = updatePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      // Alle Fehler anzeigen
      const errors = validation.error.issues.map((issue) => issue.message);
      setPasswordErrors(errors);
      setIsSavingPassword(false);
      return;
    }

    const result = await updatePassword(validation.data);

    if ("errors" in result) {
      setPasswordErrors(result.errors);
    } else if ("error" in result) {
      setPasswordErrors([result.error]);
    } else {
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setIsSavingPassword(false);
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <InputField
            id="name"
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            fullWidth
          />
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />

          {profileError && (
            <p className="text-red-600 text-sm">{profileError}</p>
          )}
          {profileMessage && (
            <p className="text-green-600 text-sm">{profileMessage}</p>
          )}

          <Button
            type="submit"
            label={isSavingProfile ? "Saving..." : "Save Profile"}
            disabled={isSavingProfile}
          />
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-surface rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>

        {/* Password Requirements Info */}
        <div className="mb-4 p-3 bg-surface border border-border rounded text-sm text-text-muted">
          <p className="font-medium mb-1">Password requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>At least {PASSWORD_MIN_LENGTH} characters long</li>
            <li>Contains at least one special character (!@#$%^&* etc.)</li>
          </ul>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <InputField
            id="currentPassword"
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
          />
          <InputField
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
          />
          <InputField
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />

          {passwordErrors.length > 0 && (
            <ul className="list-disc list-inside space-y-1">
              {passwordErrors.map((error, idx) => (
                <li key={idx} className="text-red-600 text-sm">
                  {error}
                </li>
              ))}
            </ul>
          )}

          {passwordMessage && (
            <p className="text-green-600 text-sm">{passwordMessage}</p>
          )}

          <Button
            type="submit"
            label={isSavingPassword ? "Updating..." : "Update Password"}
            disabled={isSavingPassword}
          />
        </form>
      </div>
    </div>
  );
}
