export type UserWithOrganization = {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  organizationId: string;
  organization: {
    name: string;
    slug: string;
  };
  _count: {
    posts: number;
  };
};
