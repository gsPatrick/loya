"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard, ShoppingCart, Shirt, Users, Banknote, Megaphone,
    Settings, LogOut, Package, ShoppingBag, ChevronDown, History,
    RotateCcw, ClipboardList, Grid3X3, BarChart2, Tag, Ruler,
    LineChart, TrendingUp, HandCoins, Wallet, Calculator,
    FileBarChart, ArrowRightLeft, LockKeyhole, ShoppingBasket,
    FolderPlus, Palette, Layers, Maximize, HelpCircle, FileText,
    MapPin, Globe, Landmark, TicketPercent, ScrollText, CreditCard, Printer
} from "lucide-react";
import {
    Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Restricted from "@/components/auth/Restricted";

const navItems = [
    {
        title: "Visão Geral",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Pedidos & Vendas",
        icon: ShoppingCart,
        children: [
            { title: "PDV (Nova Venda)", href: "/dashboard/pedidos/pdv", icon: ShoppingCart },
            { title: "Histórico de Pedidos", href: "/dashboard/pedidos/revisao", icon: History },
            { title: "Devolução de Peça", href: "/dashboard/pedidos/devolucao", icon: RotateCcw },
            { title: "Relatório de Vendas", href: "/dashboard/pedidos/vendidas-periodo", icon: FileText },
        ]
    },
    {
        title: "Logística",
        href: "/dashboard/pedidos/sacolinhas",
        icon: ShoppingBag,
    },
    {
        title: "Consultas & BI",
        icon: ClipboardList,
        children: [
            { title: "Grade de Estoque", href: "/dashboard/consultas/grade", icon: Grid3X3 },
            { title: "Análise de Estoque", href: "/dashboard/consultas/analise-estoque", icon: LineChart },
            { title: "Categorias Vendidas", href: "/dashboard/consultas/categorias-vendidas", icon: BarChart2 },
            { title: "Marcas Vendidas", href: "/dashboard/consultas/marcas-vendidas", icon: Tag },
            { title: "Tamanhos Vendidos", href: "/dashboard/consultas/tamanhos-vendidos", icon: Ruler },
            { title: "Análise de Vendas", href: "/dashboard/consultas/analise-vendas", icon: TrendingUp },
            { title: "Performance Vendedor", href: "/dashboard/consultas/performance-vendedor", icon: Users },
        ]
    },
    {
        title: "Gestão Financeira",
        icon: Landmark,
        children: [
            { title: "Controle Financeiro", href: "/dashboard/financeiro/controle", icon: Wallet },
            { title: "Comissões", href: "/dashboard/financeiro/comissoes", icon: Users },
            { title: "DRE Gerencial", href: "/dashboard/financeiro/apuracao", icon: FileBarChart },
            { title: "Análise de Recebíveis", href: "/dashboard/financeiro/recebiveis", icon: HandCoins },
            { title: "Entradas e Saídas", href: "/dashboard/financeiro/entradas-saidas", icon: ArrowRightLeft },
            { title: "Fechamento de Caixa", href: "/dashboard/financeiro/fechamento-caixa", icon: LockKeyhole },
            { title: "Vendas por Fornecedor", href: "/dashboard/financeiro/vendas-fornecedor", icon: ShoppingBasket },
        ]
    },
    {
        title: "Cadastros Gerais",
        icon: FolderPlus,
        children: [
            { title: "Clientes", href: "/dashboard/cadastros/pessoas?type=Clientes", icon: Users },
            { title: "Fornecedores", href: "/dashboard/cadastros/pessoas?type=Fornecedores", icon: Users },
            { title: "Pessoas (CRM)", href: "/dashboard/cadastros/pessoas", icon: Users },
            { title: "Peças (Estoque)", href: "/dashboard/cadastros/pecas-cadastro", icon: Shirt },
            { title: "Imprimir Etiqueta", href: "/dashboard/cadastros/etiquetas", icon: Printer },
            { title: "Importação de Dados", href: "/dashboard/cadastros/importacao", icon: FolderPlus }, // Novo
            { title: "Tamanhos", href: "/dashboard/cadastros/tamanhos", icon: Ruler },
            { title: "Cores", href: "/dashboard/cadastros/cores", icon: Palette },
            { title: "Categorias", href: "/dashboard/cadastros/categorias", icon: Layers },
            { title: "Dimensões Padrão", href: "/dashboard/cadastros/dimensoes", icon: Maximize },
            { title: "Marcas", href: "/dashboard/cadastros/marcas", icon: Tag },
            { title: "Motivos", href: "/dashboard/cadastros/motivos", icon: HelpCircle },
            { title: "Políticas", href: "/dashboard/cadastros/politicas", icon: FileText },
            { title: "Locais de Estoque", href: "/dashboard/cadastros/locais", icon: MapPin },
            { title: "Origem de Venda", href: "/dashboard/cadastros/origem", icon: Globe },
            { title: "Contas Fornecedores", href: "/dashboard/cadastros/contas-bancarias", icon: Landmark },
        ]
    },
    {
        title: "Cadastros Financeiros", // Nova Categoria Solicitada
        icon: Wallet,
        children: [
            { title: "Contas Financeiras", href: "/dashboard/financeiro-cadastro/contas", icon: Landmark },
            { title: "Formas de Pagamento", href: "/dashboard/financeiro-cadastro/formas-pagamento", icon: CreditCard },
            { title: "Receitas e Despesas", href: "/dashboard/financeiro-cadastro/receitas-despesas", icon: ScrollText },
        ]
    },
    {
        title: "Marketing",
        icon: Megaphone,
        children: [
            { title: "Campanhas Promo", href: "/dashboard/marketing/campanhas", icon: TicketPercent },
        ]
    },
    {
        title: "Equipe",
        href: "/dashboard/equipe",
        icon: Users,
        restricted: true, // Marker for custom rendering
        roles: ['ADMIN']
    },
    {
        title: "Configurações",
        href: "/dashboard/configuracoes",
        icon: Settings,
    },
];

import { useSystemTheme } from "@/components/providers/SystemThemeProvider";

export function Sidebar(props) {
    return (
        <Suspense fallback={<div className="h-screen w-64 bg-background border-r" />}>
            <SidebarContent {...props} />
        </Suspense>
    );
}

function SidebarContent({ className, setIsOpen }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { themeConfig } = useSystemTheme();

    const currentFullRoute = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Logic to check if a link is active considering query parameters
    const isLinkActive = (href) => {
        if (href.includes('?')) {
            return currentFullRoute === href;
        }
        // General link (without ?) only active if pathname matches AND there are no query params active
        return pathname === href && !searchParams.toString();
    };

    // Fallback to defaults if context is missing (shouldn't happen)
    const config = {
        SYSTEM_NAME: themeConfig?.SYSTEM_NAME || "Loja Simples",
        SYSTEM_LOGO: themeConfig?.SYSTEM_LOGO || null
    };

    const renderNavItem = (item) => {
        if (item.children) {
            const isActiveParent = item.children.some(child => isLinkActive(child.href));
            return (
                <Collapsible key={item.title} defaultOpen={isActiveParent} className="w-full">
                    <CollapsibleTrigger className={cn(
                        "flex items-center w-full justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-muted text-muted-foreground hover:text-foreground group",
                        isActiveParent && "text-primary font-semibold bg-primary/5"
                    )}>
                        <div className="flex items-center gap-3">
                            <item.icon className={cn("h-4 w-4 shrink-0 group-hover:text-primary", isActiveParent && "text-primary")} />
                            {item.title}
                        </div>
                        <ChevronDown className="h-3 w-3 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 space-y-1 mt-1 data-[state=open]:animate-slideDown border-l border-muted ml-2">
                        {item.children.map(child => (
                            <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setIsOpen?.(false)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                                    isLinkActive(child.href)
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {child.icon && <child.icon className="h-3.5 w-3.5 opacity-70" />}
                                {child.title}
                            </Link>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            );
        }
        if (item.restricted) {
            return (
                <Restricted roles={item.roles} fallback={null} key={item.href}>
                    <Link
                        href={item.href}
                        onClick={() => setIsOpen?.(false)}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                            isLinkActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className={cn("h-4 w-4 shrink-0 group-hover:text-primary", isLinkActive(item.href) && "text-primary")} />
                        {item.title}
                    </Link>
                </Restricted>
            );
        }

        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen?.(false)}
                className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group",
                    isLinkActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
            >
                <item.icon className={cn("h-4 w-4 shrink-0 group-hover:text-primary", isLinkActive(item.href) && "text-primary")} />
                {item.title}
            </Link>
        );
    };

    return (
        <div className={cn("flex flex-col h-full min-h-screen bg-background border-r", className)}>
            <div className="h-16 flex items-center px-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
                    {config.SYSTEM_LOGO ? (
                        <img src={config.SYSTEM_LOGO} alt="Logo" className="h-8 w-auto object-contain" />
                    ) : (
                        <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                            <Package className="w-5 h-5" />
                        </div>
                    )}
                    <span>{config.SYSTEM_NAME || 'Loja Simples'}</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-muted">
                <nav className="space-y-1">
                    {navItems.map(item => renderNavItem(item))}
                </nav>
            </div>
            <div className="p-4 border-t mt-auto bg-muted/10">
                <button className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors w-full p-2 hover:bg-red-50 rounded-md">
                    <LogOut className="h-4 w-4" />
                    Sair do Sistema
                </button>
            </div>
        </div>
    );
}