"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  ChartSpline,
  SquarePen,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

const mainRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Study",
    icon: BookOpen,
    href: "/study",
  },
  {
    label: "Exams",
    icon: SquarePen,
    href: "/exams",
  },
  {
    label: "Analytics",
    icon: ChartSpline,
    href: "/analytics",
  },
];

const bottomRoutes = [
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const supabase = createClient();

  // Handle mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Logout failed", {
          description: error.message,
        });
        return;
      }
      router.push("/sign-in");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.svg"
            alt="logo"
            width={100}
            height={100}
            className="size-10"
          />
          {!isCollapsed && (
            <h2 className="text-2xl font-bold text-green-700">Prepwise</h2>
          )}
        </div>
      </div>

      {/* Main Navigation Section */}
      <div className="flex-1 p-4">
        <nav className="space-y-2">
          {mainRoutes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-neutral-100",
                  isActive
                    ? "bg-neutral-100 text-green-700"
                    : "text-neutral-600",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? route.label : undefined}
              >
                <route.icon className="size-5" />
                {!isCollapsed && route.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Navigation Section */}
      <div className="p-4">
        {!isCollapsed && (
          <div className="text-xs text-neutral-600 mb-2 px-4">MENU</div>
        )}
        <nav className="space-y-2">
          {bottomRoutes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-neutral-100",
                  isActive
                    ? "bg-neutral-100 text-green-700"
                    : "text-neutral-600",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? route.label : undefined}
              >
                <route.icon className="size-5" />
                {!isCollapsed && route.label}
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-red-50 text-red-600 hover:text-red-700",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <LogOut className="size-5" />
            {!isCollapsed && "Logout"}
          </button>
        </nav>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
            isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileOpen(false)}
        />

        {/* Mobile Sidebar */}
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-[250px] transform bg-white transition-transform duration-300 ease-in-out md:hidden",
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent />
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-30 md:hidden flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-white shadow-sm hover:bg-neutral-100"
        >
          <PanelLeft size={20} />
        </button>
      </>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full border-r border-neutral-200 transition-all duration-300",
        isCollapsed ? "w-[80px]" : "w-[250px]"
      )}
    >
      {/* Collapse Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm hover:bg-neutral-100"
      >
        {isCollapsed ? (
          <ChevronRight className="size-4" />
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </button>
      <SidebarContent />
    </div>
  );
}
