import { PersonStanding } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <div className="flex items-center px-4 w-full h-14 border-b sticky top-0 self-start bg-background shadow-md">
      <h1 className="font-bold text-2xl">LOGGED APP</h1>

      <Button asChild variant="outline" size="icon" className="ml-auto rounded-full">
        <Link to="/logger/settings">
          <PersonStanding />
        </Link>
      </Button>
    </div>
  )
}