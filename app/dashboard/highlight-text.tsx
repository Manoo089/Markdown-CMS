"use client";

interface Props {
  text: string;
  search: string;
}

export function HighlightText({ text, search }: Props) {
  // Kein Suchbegriff? Einfach Text zurückgeben
  if (!search.trim()) {
    return <>{text}</>;
  }

  // Text in Teile splitten (case-insensitive)
  const regex = new RegExp(`(${escapeRegex(search)})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        // Prüfen ob dieser Teil dem Suchbegriff entspricht
        if (part.toLowerCase() === search.toLowerCase()) {
          return (
            <mark key={index} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">
              {part}
            </mark>
          );
        }
        return part;
      })}
    </>
  );
}

// Regex-Sonderzeichen escapen (z.B. wenn jemand "C++" sucht)
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
