import { randomBytes } from "crypto";

export function generateApiKey(): string {
  // Prefix für einfache Identifikation
  const prefix = "org";
  // 32 random bytes = 64 hex characters
  const random = randomBytes(32).toString("hex");
  return `${prefix}_${random}`;
}
