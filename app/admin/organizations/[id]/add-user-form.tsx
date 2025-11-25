"use client";

import { useState } from "react";
import { addUserToOrganization } from "./actions";
import Button from "@/ui/Button";
import InputField from "@/ui/InputField";
import CheckboxField from "@/ui/CheckboxField";

interface Props {
  organizationId: string;
}

export function AddUserForm({ organizationId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const result = await addUserToOrganization(organizationId, {
      email,
      name: name || null,
      password,
      isAdmin,
    });

    setIsLoading(false);

    if (result.error) {
      setMessage({ type: "error", text: result.error });
    } else {
      setMessage({ type: "success", text: "User created successfully!" });
      // Reset form
      setEmail("");
      setName("");
      setPassword("");
      setIsAdmin(false);

      // Close form after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setMessage(null);
      }, 2000);
    }
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
          onClick={() => {
            setIsOpen(false);
            setMessage(null);
          }}
          className="text-text-muted hover:text-text"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
        />

        <InputField
          id="name"
          type="text"
          label="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
        />

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

        <CheckboxField
          id="privileges"
          label="Grant Admin privileges"
          checked={isAdmin}
          onChange={(e) => setIsAdmin(e.target.checked)}
          //   helpText="Admins can access the admin panel and manage all organizations"
        />

        {message && (
          <div
            className={`p-4 rounded ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="submit"
            label={isLoading ? "Creating..." : "Create User"}
            disabled={isLoading}
          />
          <Button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setMessage(null);
            }}
            label="Cancel"
            variant="outline"
          />
        </div>
      </form>
    </div>
  );
}
