import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./categories-client";

export const metadata: Metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const categories = await prisma.category.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { posts: true, children: true } },
    },
    orderBy: { name: "asc" },
  });

  return <CategoriesClient initialCategories={categories} />;
}
