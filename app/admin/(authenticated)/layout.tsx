import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/app/lib/server/admin-auth";

export default async function AdminAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  return <>{children}</>;
}
