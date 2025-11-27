import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      organizationId: string;
      isAdmin: boolean;
    };
  }

  interface User {
    id: string;
    organizationId: string;
    email: string;
    name?: string | null;
    isAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organizationId: string;
    email: string;
    name?: string | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    organizationId: string;
  }
}
