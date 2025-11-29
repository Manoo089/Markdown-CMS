import { Column } from "@/types/column-alignment";
import { OrganizationWithCounts } from "@/types/organization-table-columns";
import { TextCell, LinkCell } from "@/ui/TableCell";

export const organizationColumns: Column<OrganizationWithCounts>[] = [
  {
    key: "name",
    label: "Organization",
    render: (org) => (
      <LinkCell href={`/admin/organizations/${org.id}`}>{org.name}</LinkCell>
    ),
  },
  {
    key: "slug",
    label: "Slug",
    render: (org) => (
      <TextCell variant="mono" size="sm">
        {org.slug}
      </TextCell>
    ),
  },
  {
    key: "users",
    label: "Users",
    render: (org) => <TextCell size="sm">{org._count.users}</TextCell>,
  },
  {
    key: "posts",
    label: "Posts",
    render: (org) => <TextCell size="sm">{org._count.posts}</TextCell>,
  },
  {
    key: "apiKeys",
    label: "API Keys",
    render: (org) => <TextCell size="sm">{org._count.apiKeys}</TextCell>,
  },
  {
    key: "createdAt",
    label: "Created",
    render: (org) => (
      <TextCell variant="muted" size="sm">
        {new Date(org.createdAt).toLocaleDateString()}
      </TextCell>
    ),
  },
  {
    key: "actions",
    label: "Actions",
    align: "right",
    render: (org) => (
      <LinkCell href={`/admin/organizations/${org.id}`}>
        View Details →
      </LinkCell>
    ),
  },
];
