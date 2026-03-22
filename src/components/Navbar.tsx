"use client";
import Link from "next/link";
import { Home, BarChart2, Plus, History, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/expenseTracker", icon: Home, label: "Home" },
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/history", icon: History, label: "History" },
  { href: "/settings", icon: Settings, label: "More" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-3 pb-3">
      <div className="max-w-md mx-auto">
        <div className="bg-background/92 backdrop-blur-xl border border-border/50 shadow-[0_-4px_30px_rgba(0,0,0,0.10)] dark:shadow-[0_-4px_30px_rgba(0,0,0,0.4)] rounded-2xl flex items-center px-2 py-1.5">
          {navItems.slice(0, 2).map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}

          <Link
            href="/addExpense"
            className="mx-2 bg-primary hover:bg-primary/90 size-14 rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus size={24} className="text-primary-foreground" strokeWidth={2.5} />
          </Link>

          {navItems.slice(2).map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
