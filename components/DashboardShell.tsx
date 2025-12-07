"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, useCallback } from "react";
import { clsx } from "clsx";
import { ModeToggle } from "@/components/ModeToggle";
import { UserMenu } from "@/components/UserMenu";
import PostsIcon from "@/public/sidemenu/posts.svg";
import CategoriesIcon from "@/public/sidemenu/categories.svg";
import TagsIcon from "@/public/sidemenu/tags.svg";
import SettingsIcon from "@/public/sidemenu/settings.svg";
import ProfileIcon from "@/public/sidemenu/profile.svg";
import AdminIcon from "@/public/sidemenu/admin.svg";
import OrganizationIcon from "@/public/sidemenu/organizations.svg";
import UserIcon from "@/public/sidemenu/users.svg";
import ChevronLeftIcon from "@/public/sidemenu/chevron-left.svg";
import ChevronRightIcon from "@/public/sidemenu/chevron-right.svg";
import HamburgerIcon from "@/public/sidemenu/hamburger.svg";
import CloseIcon from "@/public/sidemenu/close.svg";

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

const iconMenuClassName = "w-5 h-5 shrink-0";
const iconControlClassName = "w-5 h-5";

const Icons = {
  Posts: () => <PostsIcon className={iconMenuClassName} />,
  Categories: () => <CategoriesIcon className={iconMenuClassName} />,
  Tags: () => <TagsIcon className={iconMenuClassName} />,
  Settings: () => <SettingsIcon className={iconMenuClassName} />,
  Profile: () => <ProfileIcon className={iconMenuClassName} />,
  Admin: () => <AdminIcon className={iconMenuClassName} />,
  Organizations: () => <OrganizationIcon className={iconMenuClassName} />,
  Users: () => <UserIcon className={iconMenuClassName} />,
  ChevronLeft: () => <ChevronLeftIcon className={iconControlClassName} />,
  ChevronRight: () => <ChevronRightIcon className={iconControlClassName} />,
  Menu: () => <HamburgerIcon className="w-6 h-6" />,
  Close: () => <CloseIcon className="w-6 h-6" />,
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
