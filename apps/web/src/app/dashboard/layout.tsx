"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useDashboardStore } from "@/lib/store";
import { Sidebar } from "@/components/dashboard/sidebar";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useDashboardStore();
  const pathname = usePathname();

  // Screen resize handler to automatically manage sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  // Automatically collapse sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [pathname, setSidebarOpen]);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <Sidebar />
      <main
        className={cn(
          "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen main-content-layout",
          sidebarOpen ? "sidebar-expanded" : "sidebar-collapsed"
        )}
      >
        <div className="p-6 pt-20 md:p-8 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
