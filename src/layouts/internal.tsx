import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

import { Header } from "@/components/tw/header";
import { AppSidebar } from "@/components/tw/sidebar/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

function InternalLayout() {
  const { t } = useTranslation("common");

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-step-1 focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-[3px] focus:ring-ring/40"
      >
        {t("a11y.skipToContent")}
      </a>

      <AppSidebar />

      <SidebarInset id="main-content">
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center border-b bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex h-full w-full max-w-[1280px] items-center gap-1 px-3 sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-1 h-4" />
            <Header />
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default InternalLayout;
