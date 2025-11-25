"use client";

import { useState } from "react";
import { deleteUser, toggleUserAdmin } from "./actions";

interface Props {
  userId: string;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
  organizationId: string;
}

export function UserActionsMenu({
  userId,
  userName,
  userEmail,
  isAdmin,
  organizationId,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleAdmin = async () => {
    setIsLoading(true);
    const result = await toggleUserAdmin(userId, !isAdmin);
    setIsLoading(false);

    if (result.error) {
      alert(result.error);
    }
    setIsOpen(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteUser(userId);

    if (result.error) {
      alert(result.error);
      setIsLoading(false);
    }
    // Success - page will revalidate
  };

  if (showDeleteConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600 dark:text-red-400">
          Delete {userName || userEmail}?
        </span>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isLoading ? "Deleting..." : "Confirm"}
        </button>
        <button
          onClick={() => setShowDeleteConfirm(false)}
          className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-700 rounded hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm rounded hover:bg-surface-hover transition"
      >
        ⋮
      </button>

      {isOpen && (
        <>
          {/* Overlay zum Schließen */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg z-20">
            <button
              onClick={handleToggleAdmin}
              disabled={isLoading}
              className="w-full px-4 py-2 text-left text-sm hover:bg-surface-hover transition disabled:opacity-50"
            >
              {isAdmin ? "Remove Admin" : "Make Admin"}
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(true);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  );
}
