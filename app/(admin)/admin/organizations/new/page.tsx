import { Metadata } from "next";
import { CreateOrganizationForm } from "./create-organization-form";
import { Box } from "@/ui/Box";

export const metadata: Metadata = {
  title: "New Organization - Admin",
};

export default async function NewOrganizationPage() {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Create New Organization</h2>
        <p className="text-text-muted mt-2">
          Set up a new organization with its own users, content, and API keys
        </p>
      </div>

      <Box>
        <CreateOrganizationForm />
      </Box>
    </>
  );
}
