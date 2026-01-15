import { Outlet } from "react-router";

import { Header } from "@/components/tw/header";

function InternalLayout() {

  return (
    <div className="flex flex-col min-h-screen items-center">
      <Header />

      <div className="max-w-[1500px] p-4 w-full">
        <Outlet />
      </div>
    </div>
  )
}

export default InternalLayout;