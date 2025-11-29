export type OrganizationWithCounts = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  _count: {
    users: number;
    posts: number;
    apiKeys: number;
  };
};
