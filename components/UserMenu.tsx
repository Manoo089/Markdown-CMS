"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { UserAvatar } from "@/components/UserAvatar";
import { handleSignOut } from "@/app/(dashboard)/actions";
import ChevronIcon from "@/public/chevron.svg";

interface UserMenuProps {
  name?: string | null;
  email: string;
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    await handleSignOut();
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors"
        aria-label="User menu"
      >
        <UserAvatar name={name} email={email} size="md" />
        <div className="text-left hidden sm:block">
          {name && <div className="text-sm font-medium text-text">{name}</div>}
          <div className="text-xs text-text-muted">{email}</div>
        </div>

        <ChevronIcon
          className={`w-5 h-5 text-text-subtle transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border py-1 z-50">
          {/* User Info (mobile only - on desktop it's already visible) */}
          <div className="px-4 py-3 border-b border-border sm:hidden">
            <div className="text-sm font-medium text-text">
              {name || "User"}
            </div>
            <div className="text-xs text-text-muted truncate">{email}</div>
          </div>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-text hover:bg-surface-hover transition-colors"
            onClick={() => setIsOpen(false)}
          >
            My Profile
          </Link>

          <hr className="my-1 border-border" />

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger-light transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
