import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard-header";
import { TemplateSelector } from "@/components/template-selector";

export default async function NewResumePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Choose a Template</h1>
        <TemplateSelector userId={session.user.id} />
      </main>
    </div>
  );
}
