"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, useCallback } from "react";
import { clsx } from "clsx";
import { ModeToggle } from "@/components/ModeToggle";
import { UserMenu } from "@/components/UserMenu";

// ============================================================================
// TYPES
// ============================================================================

interface DashboardShellProps {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  isAdmin: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavContentProps {
  sections: NavSection[];
  pathname: string;
  collapsed: boolean;
}

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  Posts: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
      />
    </svg>
  ),
  Categories: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  Tags: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  ),
  Settings: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  Profile: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  ),
  Admin: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  ),
  Organizations: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
  Users: () => (
    <svg
      className="w-5 h-5 shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  ChevronLeft: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 19l-7-7 7-7"
      />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  ),
  Menu: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  ),
  Close: () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  ),
};

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

const STORAGE_KEY = "mdcms-sidebar-collapsed";

function useLocalStorage(key: string, defaultValue: boolean) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) callback();
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    const stored = localStorage.getItem(key);
    return stored === "true";
  }, [key]);

  const getServerSnapshot = useCallback(() => defaultValue, [defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (newValue: boolean) => {
      localStorage.setItem(key, String(newValue));
      // Dispatch storage event to trigger re-render
      window.dispatchEvent(new StorageEvent("storage", { key }));
    },
    [key],
  );

  return [value, setValue] as const;
}

function isActiveRoute(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/posts");
  }
  return pathname.startsWith(href);
}

// ============================================================================
// NAV CONTENT COMPONENT (defined outside main component to avoid re-creation)
// ============================================================================

function NavContent({ sections, pathname, collapsed }: NavContentProps) {
  return (
    <nav className="space-y-6">
      {sections.map((section) => (
        <div key={section.title}>
          {!collapsed && (
            <h3 className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              {section.title}
            </h3>
          )}
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActiveRoute(item.href, pathname)
                      ? "bg-primary text-white"
                      : "text-text hover:bg-surface-hover",
                    collapsed && "justify-center",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function DashboardShell({
  children,
  userName,
  userEmail,
  isAdmin,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useLocalStorage(STORAGE_KEY, false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Toggle collapsed state
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(!isCollapsed);
  }, [isCollapsed, setIsCollapsed]);

  // Close mobile menu handler
  const closeMobileMenu = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Toggle mobile menu handler
  const toggleMobileMenu = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  // Build navigation sections
  const contentSection: NavSection = {
    title: "Content",
    items: [
      { label: "Posts", href: "/", icon: <Icons.Posts /> },
      { label: "Categories", href: "/categories", icon: <Icons.Categories /> },
      { label: "Tags", href: "/tags", icon: <Icons.Tags /> },
    ],
  };

  const settingsSection: NavSection = {
    title: "Settings",
    items: [
      { label: "Site Settings", href: "/settings", icon: <Icons.Settings /> },
      { label: "Profile", href: "/profile", icon: <Icons.Profile /> },
    ],
  };

  const adminSection: NavSection = {
    title: "Admin",
    items: [
      { label: "Dashboard", href: "/admin", icon: <Icons.Admin /> },
      {
        label: "Organizations",
        href: "/admin/organizations",
        icon: <Icons.Organizations />,
      },
      { label: "Users", href: "/admin/users", icon: <Icons.Users /> },
    ],
  };

  const sections = isAdmin
    ? [contentSection, settingsSection, adminSection]
    : [contentSection, settingsSection];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-16 bg-surface border-b border-border px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-hover transition-colors"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <Icons.Close /> : <Icons.Menu />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">MDCMS</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu name={userName} email={userEmail} />
        </div>
      </header>

      <div className="flex">
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={clsx(
            "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-surface border-r border-border z-40 transform transition-transform duration-300 lg:hidden overflow-y-auto",
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="p-4">
            <NavContent
              sections={sections}
              pathname={pathname}
              collapsed={false}
            />
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside
          className={clsx(
            "hidden lg:flex flex-col bg-surface border-r border-border min-h-[calc(100vh-4rem)] transition-all duration-300",
            isCollapsed ? "w-16" : "w-64",
          )}
        >
          {/* Collapse Toggle Button */}
          <div
            className={clsx(
              "p-2 border-b border-border flex",
              isCollapsed ? "justify-center" : "justify-end",
            )}
          >
            <button
              onClick={toggleCollapsed}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-hover transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
            </button>
          </div>

          {/* Navigation */}
          <div className="p-4 flex-1 overflow-y-auto">
            <NavContent
              sections={sections}
              pathname={pathname}
              collapsed={isCollapsed}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}
