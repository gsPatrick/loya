"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Megaphone, Palette, Star, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/inicio", icon: Home, label: "Painel de Controle" },
  { href: "/cardapio", icon: UtensilsCrossed, label: "Cardápio Digital" },
  { href: "/marketing", icon: Megaphone, label: "Marketing" },
  { href: "/aparencia", icon: Palette, label: "Personalização" },
  { href: "/avaliacoes", icon: Star, label: "Avaliações" },
  { href: "/ajustes", icon: Settings, label: "Configurações" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-800">
        {/* Você pode colocar seu logo aqui */}
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">OrdenGO Admin</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400 transition-all hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
              pathname === item.href && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}