import Breadcrumbs from "./breadcrumbs";
import { UserMenu } from "./UserMenu";

export function Header() {
  return (
    <div className="flex min-w-0 items-center justify-between w-full gap-4">
      <Breadcrumbs />
      <UserMenu />
    </div>
  );
}
