import { NavLink } from "react-router-dom";
import { appNav } from "@/app/nav";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {appNav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground",
                )
              }
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
