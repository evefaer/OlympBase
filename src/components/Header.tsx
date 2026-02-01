import { Link, useLocation } from "react-router-dom";
import { Rocket, Calendar, List, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", label: "Главная", icon: null },
  { path: "/calendar", label: "Календарь", icon: Calendar },
  { path: "/list", label: "Список", icon: List },
];

export function Header() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="icon-box-outline">
            <Rocket className="w-5 h-5" />
          </div>
          <span className="text-xl font-semibold text-foreground">OlimpBase</span>
        </Link>

        <div className="flex items-center gap-4">
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

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Переключить тему</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
