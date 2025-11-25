"use client";

import { handleSignOut } from "./actions";
import Button from "@/ui/Button";

export function LogoutButton() {
  return (
    <Button
      type="button"
      onClick={() => handleSignOut()}
      label="Logout"
      color="danger"
    />
  );
}
