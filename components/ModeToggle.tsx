"use client";

import { useTheme } from "next-themes";
import Moon from "@/public/moon.svg";
import Sun from "@/public/sun.svg";
import System from "@/public/system.svg";
import dynamic from "next/dynamic";

function ModeToggleInner() {
  const { theme, setTheme } = useTheme();

  const handleClick = () => {
    if (theme === "system") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors overflow-hidden"
      aria-label="Toggle theme"
    >
      {theme === "system" ? <System /> : theme === "dark" ? <Moon /> : <Sun />}
    </button>
  );
}

export const ModeToggle = dynamic(() => Promise.resolve(ModeToggleInner), {
  ssr: false,
  loading: () => <div className="p-2 w-10 h-10" aria-hidden="true" />,
});
