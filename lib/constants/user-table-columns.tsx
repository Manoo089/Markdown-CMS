import Badge from "@/ui/Badge";
import { TextCell, LinkCell } from "@/ui/TableCell";
import { Column } from "@/types/column-alignment";
import { UserWithOrganization } from "@/types/user-with-organization";

export const userColumns: Column<UserWithOrganization>[] = [
  {
    key: "name",
    label: "User",
    render: (user) => (
      <TextCell variant="bold">{user.name || "Unnamed User"}</TextCell>
    ),
  },
  {
    key: "email",
    label: "Email",
    render: (user) => (
      <TextCell variant="muted" size="sm">
        {user.email}
      </TextCell>
    ),
  },
  {
    key: "organization",
    label: "Organization",
    render: (user) => (
      <LinkCell href={`/admin/organizations/${user.organizationId}`}>
        {user.organization.name}
      </LinkCell>
    ),
  },
  {
    key: "role",
    label: "Role",
    render: (user) => (
      <Badge value={user.isAdmin ? "admin" : "user"} variant="role" />
    ),
  },
  {
    key: "posts",
    label: "Posts",
    render: (user) => <TextCell size="sm">{user._count.posts}</TextCell>,
  },
  {
    key: "createdAt",
    label: "Joined",
    render: (user) => (
      <TextCell variant="muted" size="sm">
        {new Date(user.createdAt).toLocaleDateString()}
      </TextCell>
    ),
  },
];
