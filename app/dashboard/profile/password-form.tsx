"use client";

import { useState } from "react";
import { updatePassword } from "./actions";
import { useActionState } from "@/hooks/useActionState";
import { PASSWORD_MIN_LENGTH } from "@/lib/schemas/user.schema";
import { ErrorList, FieldError, MessageAlert } from "@/components/MessageAlert";
import InputField from "@/ui/InputField";
import Button from "@/ui/Button";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordAction = useActionState();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await passwordAction.execute(
      updatePassword,
      { currentPassword, newPassword, confirmPassword },
      {
        successMessage: "Password updated successfully!",
        onSuccess: () => {
          // Clear form on success
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
      },
    );
  };

  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      <div className="mb-4 p-3 bg-surface border border-border rounded text-sm text-text-muted">
        <p className="font-medium mb-1">Password requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>At least {PASSWORD_MIN_LENGTH} characters long</li>
          <li>Contains at least one special character (!@#$%^&* etc.)</li>
        </ul>
      </div>

      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <MessageAlert
          message={passwordAction.message}
          onDismiss={passwordAction.clearErrors}
        />

        {passwordAction.errors.length > 0 && (
          <ErrorList errors={passwordAction.errors} />
        )}

        <div>
          <InputField
            id="currentPassword"
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            fullWidth
          />
          <FieldError error={passwordAction.fieldErrors.currentPassword} />
        </div>

        <div>
          <InputField
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
          />
          <FieldError error={passwordAction.fieldErrors.newPassword} />
        </div>

        <div>
          <InputField
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />
          <FieldError error={passwordAction.fieldErrors.confirmPassword} />
        </div>

        <Button
          type="submit"
          label={passwordAction.isLoading ? "Updating..." : "Update Password"}
          disabled={passwordAction.isLoading}
        />
      </form>
    </>
  );
}
