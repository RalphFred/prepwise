import { DashboardSidebar } from "@/components/shared/DashboardSidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen w-full flex">
      <div className="w-auto">
        <DashboardSidebar />
      </div>
      <div className="flex-1">{children}</div>
    </main>
  );
}
