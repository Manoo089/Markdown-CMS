"use client";

import { useState } from "react";
import { addUserToOrganization } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import CheckboxField from "@/ui/CheckboxField";
import { useActionState } from "@/hooks/useActionState";
import { MessageAlert, FieldError } from "@/components/MessageAlert";

interface Props {
  organizationId: string;
}

export function AddUserForm({ organizationId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const addUserAction = useActionState<
    {
      organizationId: string;
      email: string;
      name: string | null;
      password: string;
      isAdmin: boolean;
    },
    void
  >();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addUserAction.execute(
      addUserToOrganization,
      {
        organizationId,
        email,
        name: name || null,
        password,
        isAdmin,
      },
      {
        successMessage: "User created successfully!",
        onSuccess: () => {
          // Reset form
          setEmail("");
          setName("");
          setPassword("");
          setIsAdmin(false);

          // Close form after 2 seconds
          setTimeout(() => {
            setIsOpen(false);
            addUserAction.clearErrors();
          }, 2000);
        },
      },
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    addUserAction.clearErrors();
  };

  if (!isOpen) {
    return (
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        label="+ Add User"
        variant="solid"
      />
    );
  }

  return (
    <div className="bg-surface-hover rounded-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold text-lg">Add New User</h4>
        <button
          onClick={handleClose}
          className="text-text-muted hover:text-text"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <MessageAlert
          message={addUserAction.message}
          onDismiss={addUserAction.clearErrors}
        />

        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
        />
        <FieldError error={addUserAction.fieldErrors.email} />

        <InputField
          id="name"
          type="text"
          label="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />
        <FieldError error={addUserAction.fieldErrors.name} />

        <InputField
          id="password"
          type="text"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 8 characters"
          description="User can change this later"
          required
        />
        <FieldError error={addUserAction.fieldErrors.password} />

        <CheckboxField
          id="privileges"
          label="Grant Admin privileges"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            label={addUserAction.isLoading ? "Creating..." : "Create User"}
            disabled={addUserAction.isLoading}
          />
          <Button
            type="button"
            onClick={handleClose}
            label="Cancel"
            variant="outline"
          />
        </div>
      </form>
    </div>
  );
}
