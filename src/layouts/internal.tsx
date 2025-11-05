import { Outlet } from "react-router";

import { Header } from "@/components/tw/header";

function InternalLayout() { 

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="max-w-[1500px]">
        <Outlet />
      </div>
    </div>
  )
}

export default InternalLayout;