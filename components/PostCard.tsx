import { DeleteButton } from "@/app/(dashboard)/delete-button";
import { HighlightText } from "@/app/(dashboard)/highlight-text";
import { PostCardType } from "@/types/post-card";
import Badge from "@/ui/Badge";
import Button from "@/ui/Button";

interface Props extends PostCardType {
  search: string;
}

export default function PostCard({ post, search }: Props) {
  return (
    <div className="p-6 hover:bg-surface-hover transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1 text-text">{post.title}</h3>
          {post.excerpt && (
            <p className="text-text-muted text-sm mb-2">
              <HighlightText text={post.excerpt} search={search} />
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>By {post.author.name || post.author.email}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>•</span>

            {/* Type Badge */}
            <Badge value={post.type} variant="type" />
            <span>•</span>
            <Badge
              value={post.published ? "published" : "draft"}
              variant="status"
            />

            {/* Category Badge */}
            {post.category && (
              <>
                <span>•</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {post.category.name}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="ml-4 flex gap-3">
          <Button
            href={`/posts/${post.id}/edit`}
            variant="plain"
            label="Edit"
            className="text-sm"
          />
          <DeleteButton postId={post.id} postTitle={post.title} />
        </div>
      </div>
    </div>
  );
}
