export function generateSlug(text: string): string {
  const germanMap: Record<string, string> = {
    ä: "ae",
    ö: "oe",
    ü: "ue",
    Ä: "Ae",
    Ö: "Oe",
    Ü: "Ue",
    ß: "ss",
  };

  let slug = text;

  Object.entries(germanMap).forEach(([umlaut, replacement]) => {
    slug = slug.replace(new RegExp(umlaut, "g"), replacement);
  });

  slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
