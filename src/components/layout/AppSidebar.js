"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  BarChart3, Settings, ChevronLeft, LogOut, Menu,
  Box, Truck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useSystemTheme } from "@/components/providers/SystemThemeProvider";

export function AppSidebar({ className }) {
  const { themeConfig } = useSystemTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  // ...

  // Debug
  console.log("AppSidebar themeConfig:", themeConfig);

  // Componente de Logo Reutilizável (Inlined for stability)
  const renderLogo = (showText) => (
    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
      <div className="bg-primary/20 p-2 rounded-xl text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]">
        {themeConfig?.SYSTEM_LOGO ? (
          <img src={themeConfig.SYSTEM_LOGO} alt="Logo" className="size-6 object-contain" />
        ) : (
          <Box className="size-6" />
        )}
      </div>
      {showText && <span className="animate-in fade-in duration-300">{themeConfig?.SYSTEM_NAME || 'Loya'}</span>}
    </div>
  );

  // Componente de Link de Navegação
  const NavItem = ({ item, collapsed }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden mb-1",
          isActive
            ? "bg-primary text-white shadow-lg shadow-primary/25"
            : "hover:bg-white/50 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground",
          collapsed && "justify-center px-0"
        )}
      >
        <item.icon className={cn("size-5 shrink-0 transition-colors", isActive ? "text-white" : "group-hover:text-primary")} />
        {!collapsed && (
          <span className="font-medium text-sm whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
            {item.label}
          </span>
        )}
        {isActive && !collapsed && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
        )}
      </Link>
    );
  };

  // --- RENDER MOBILE (SHEET) ---
  if (isMobile) {
    return (
      <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden glass fixed top-4 left-4 z-50 rounded-xl">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 border-r border-white/10 glass bg-white/80 dark:bg-black/80 backdrop-blur-xl">
          <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
          <div className="h-full flex flex-col p-4">
            <div className="h-20 flex items-center px-2">
              {renderLogo(true)}
            </div>
            <nav className="flex-1 overflow-y-auto py-6">
              {menuItems.map((item) => <NavItem key={item.href} item={item} collapsed={false} />)}
            </nav>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 border border-white/20">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">Admin</p>
                  <p className="text-xs text-muted-foreground truncate">Logout</p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // --- RENDER DESKTOP (SIDEBAR) ---
  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex flex-col glass rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border-white/20 dark:border-white/10 shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-black/40",
        isCollapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Header */}
      <div className={cn("h-20 flex items-center border-b border-white/5 relative transition-all", isCollapsed ? "justify-center" : "px-6 justify-start")}>
        {renderLogo(!isCollapsed)}

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-8 size-6 rounded-full bg-background border shadow-sm z-50 hover:bg-primary hover:text-white transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronLeft className={cn("size-3 transition-transform duration-300", isCollapsed && "rotate-180")} />
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-hide">
        {menuItems.map((item) => <NavItem key={item.href} item={item} collapsed={isCollapsed} />)}
      </nav>

      {/* Footer Profile */}
      <div className="p-3 mt-auto">
        <div className={cn(
          "flex items-center gap-3 p-2 rounded-xl transition-all duration-300",
          isCollapsed ? "justify-center bg-transparent" : "bg-white/40 dark:bg-white/5 border border-white/10"
        )}>
          <Avatar className={cn("border-2 border-white/50 cursor-pointer transition-all hover:scale-105", isCollapsed ? "size-10" : "size-9")}>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <>
              <div className="flex-1 overflow-hidden animate-in fade-in">
                <p className="text-sm font-semibold truncate leading-none">Admin User</p>
                <p className="text-[10px] text-muted-foreground truncate mt-1">admin@loja.com</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8 shrink-0 hover:bg-destructive/10 hover:text-destructive rounded-lg">
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}