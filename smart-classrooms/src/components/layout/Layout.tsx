import React from "react";
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
  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top_left,#eef4ff_0,#f8fafc_35%,#f8fafc_100%)]">
      <Sidebar isAdmin={isAdmin} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={title} subtitle={subtitle} />
        <main className="relative z-0 flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
