import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      organizationId: string;
    };
  }

  interface User {
    id: string;
    organizationId: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    organizationId: string;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    organizationId: string;
  }
}
