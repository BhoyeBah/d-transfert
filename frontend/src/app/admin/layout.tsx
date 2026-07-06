import { redirect } from "next/navigation";

import { AdminShell } from "@/components/layout/admin-shell";
import { getMe } from "@/lib/data/me";
import { UnauthenticatedError } from "@/lib/api-error";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let me: Awaited<ReturnType<typeof getMe>>;

  try {
    me = await getMe();
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      redirect("/login");
    }
    throw error;
  }

  if (!me.is_super_admin) {
    redirect("/dashboard");
  }

  return <AdminShell fullName={me.full_name}>{children}</AdminShell>;
}
