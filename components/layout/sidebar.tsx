"use client";

import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, Home, ScrollText, Users2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    label: "Courses",
    icon: BookOpen,
    href: "/courses",
  },
  {
    label: "Homework",
    icon: ScrollText,
    href: "/homework",
  },
  {
    label: "Grades",
    icon: GraduationCap,
    href: "/grades",
  },
  {
    label: "Staff",
    icon: Users2,
    href: "/staff",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-muted/40">
      <div className="flex flex-1 flex-col gap-2 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              pathname === route.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground"
            )}
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}