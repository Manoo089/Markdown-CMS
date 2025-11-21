interface UserAvatarProps {
  name?: string | null;
  email: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Generiert Initialen aus Name oder Email
 * - Wenn Name vorhanden: Erste 2 Buchstaben (z.B. "Max Mustermann" → "MM")
 * - Wenn nur Email: Erste 2 Buchstaben vor @ (z.B. "test@example.com" → "TE")
 */
function getInitials(name: string | null | undefined, email: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      // Vor- und Nachname vorhanden
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    // Nur ein Name
    return parts[0].substring(0, 2).toUpperCase();
  }

  // Fallback auf Email
  const emailPrefix = email.split("@")[0];
  return emailPrefix.substring(0, 2).toUpperCase();
}

/**
 * Generiert eine konsistente Hintergrundfarbe basierend auf dem String
 * Verwendet einfaches Hashing für konsistente Farben pro User
 */
function getAvatarColor(str: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-red-500",
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

export function UserAvatar({ name, email, size = "md" }: UserAvatarProps) {
  const initials = getInitials(name, email);
  const colorClass = getAvatarColor(email);

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}
      title={name || email}
    >
      {initials}
    </div>
  );
}
