"use client";

import { handleSignOut } from "./actions";

export function LogoutButton() {
  return (
    <button
      onClick={() => handleSignOut()}
      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
    >
      Logout
    </button>
  );
}
