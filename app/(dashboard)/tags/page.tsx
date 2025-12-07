import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TagsClient } from "./tags-client";

export const metadata: Metadata = {
  title: "Tags",
};

export default async function TagsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tags = await prisma.tag.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });

  return <TagsClient initialTags={tags} />;
}
