"use client";

import { cn } from "@/lib/utils";
import { BookOpen, GraduationCap, Home, ScrollText, Users2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={cn(
        "flex h-full flex-col border-r bg-muted/40 transition-all duration-300",
        isCollapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      <div className="flex justify-end p-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-6 w-6"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
              pathname === route.href
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? route.label : undefined}
          >
            <route.icon className="h-4 w-4" />
            {!isCollapsed && route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}