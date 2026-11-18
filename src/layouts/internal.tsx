import { Outlet } from "react-router";

import { Header } from "@/components/tw/header";
import { ImportNotifications } from "@/components/tw/import/ImportNotifications";
import { AppSidebar } from "@/components/tw/sidebar/AppSidebar";
import { SyncRunProvider } from "@/components/tw/sync/SyncRunProvider";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function InternalLayout() {
  return (
    <SyncRunProvider>
      <SidebarProvider>
        <ImportNotifications />
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-9 shrink-0 items-center gap-1 border-b bg-background px-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-3" />
            <Header />
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SyncRunProvider>
  );
}

export default InternalLayout;
