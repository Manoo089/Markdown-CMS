"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreatePostInput = {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  published: boolean;
  authorId: string;
};

export async function createPost(data: CreatePostInput) {
  try {
    // 1. Prüfe ob Slug bereits existiert
    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost) {
      return { error: "A post with this slug already exists" };
    }

    // 2. Post erstellen
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
        authorId: data.authorId,
      },
    });

    // 3. Cache invalidieren (wichtig für ISR/SSG später)
    revalidatePath("/dashboard");

    return { success: true, postId: post.id };
  } catch (error) {
    console.error("Failed to create post:", error);
    return { error: "Failed to create post. Please try again." };
  }
}
