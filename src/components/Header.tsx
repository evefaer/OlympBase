import { Link, useLocation } from "react-router-dom";
import { Rocket, Calendar, List, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Главная", icon: null },
  { path: "/calendar", label: "Календарь", icon: Calendar },
  { path: "/list", label: "Список", icon: List },
];

export function Header() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="icon-box-outline">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold text-foreground">OlimpBase</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
