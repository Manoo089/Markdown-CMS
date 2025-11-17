"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type UpdatePostInput = {
  postId: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type: string;
  published: boolean;
};

export async function updatePost(data: UpdatePostInput) {
  try {
    // Prüfe ob Slug bereits von ANDEREM Post genutzt wird
    const existingPost = await prisma.post.findUnique({
      where: { slug: data.slug },
    });

    if (existingPost && existingPost.id !== data.postId) {
      return { error: "A post with this slug already exists" };
    }

    // Post updaten
    const post = await prisma.post.update({
      where: { id: data.postId },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        type: data.type,
        published: data.published,
        publishedAt:
          data.published && !existingPost?.published
            ? new Date() // Setze publishedAt nur beim ersten Publish
            : existingPost?.publishedAt,
      },
    });

    // 3. Cache invalidieren
    revalidatePath("/dashboard");

    return { success: true, postId: post.id };
  } catch (error) {
    console.error("Failed to update post:", error);
    return { error: "Failed to update post. Please try again." };
  }
}
