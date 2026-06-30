import { Outlet } from "react-router";

import { Header } from "@/components/tw/header";
import { AppSidebar } from "@/components/tw/sidebar/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function InternalLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <Header />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 ">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default InternalLayout;