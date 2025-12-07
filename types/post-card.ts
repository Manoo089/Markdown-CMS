export interface PostCardType {
  post: {
    id: string;
    excerpt: string | null;
    title: string;
    author: {
      name: string | null;
      email: string;
    };
    createdAt: Date;
    type: string;
    published: boolean;
    category: {
      id: string;
      name: string;
    } | null;
    tags: {
      id: string;
      name: string;
    }[];
  };
}
