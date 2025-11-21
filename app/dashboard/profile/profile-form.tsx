"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import { updateProfile, updatePassword } from "./actions";

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
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage("");
    setProfileError("");

    const result = await updateProfile({ name, email });

    if (result.error) {
      setProfileError(result.error);
    } else {
      setProfileMessage("Profile updated successfully!");

      await update({
        email,
        name,
      });
    }

    setIsSavingProfile(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    // Client-side Validation
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setIsSavingPassword(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      setIsSavingPassword(false);
      return;
    }

    const result = await updatePassword({ currentPassword, newPassword });

    if (result.error) {
      setPasswordError(result.error);
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
      <div className="bg-white rounded-lg shadow p-6">
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

          {profileError && <p className="text-red-600 text-sm">{profileError}</p>}
          {profileMessage && <p className="text-green-600 text-sm">{profileMessage}</p>}

          <Button type="submit" label={isSavingProfile ? "Saving..." : "Save Profile"} disabled={isSavingProfile} />
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
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

          {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
          {passwordMessage && <p className="text-green-600 text-sm">{passwordMessage}</p>}

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
