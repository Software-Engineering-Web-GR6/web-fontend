import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  subtitle,
  isAdmin = true,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="app-noise relative flex h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-teal-200/45 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-10 h-80 w-80 rounded-full bg-amber-200/45 blur-3xl" />

      <Sidebar
        isAdmin={isAdmin}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <Header
          title={title}
          subtitle={subtitle}
          onOpenSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="relative z-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          {children}
        </main>
      </div>

      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] lg:hidden"
        />
      )}
    </div>
  );
};

export default Layout;
