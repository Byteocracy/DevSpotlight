import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { LayoutDashboard, Compass, User, Bell, Users } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const guestNavItems = [
  { title: "Home", href: "/", icon: Compass },
  { title: "Project Feed", href: "/feed", icon: LayoutDashboard },
];

const authNavItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Explore", href: "/feed", icon: Compass },
  { title: "Profile", href: "/profile", icon: User },
  { title: "Requests", href: "/requests", icon: Users },
  { title: "Notifications", href: "/notifications", icon: Bell },
];

export function Sidebar({ className, open }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const items = isAuthenticated ? authNavItems : guestNavItems;

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-border bg-background transition-transform duration-200 ease-in-out md:static md:translate-x-0",
        open ? "translate-x-0 pt-14" : "-translate-x-full",
        className
      )}
    >
      <div className="flex h-full flex-col overflow-y-auto px-4 py-6">
        <nav className="space-y-1.5">
          {items.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-[15px]", 
                    isActive ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
