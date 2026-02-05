"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
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

// Roles: ADMIN, GERENTE, CAIXA (Vendedor), ESTOQUISTA
// CAIXA só pode ver Pedidos & Vendas
const navItems = [
    {
        title: "Visão Geral",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ['ADMIN', 'GERENTE'] // Vendedor não vê
    },
    {
        title: "Pedidos & Vendas",
        icon: ShoppingCart,
        roles: ['ADMIN', 'GERENTE', 'CAIXA'], // Todos podem ver
        children: [
            { title: "PDV (Nova Venda)", href: "/dashboard/pedidos/pdv", icon: ShoppingCart },
            { title: "Histórico de Pedidos", href: "/dashboard/pedidos/revisao", icon: History },
            { title: "Devolução de Peça", href: "/dashboard/pedidos/devolucao", icon: RotateCcw },
            { title: "Relatório de Vendas", href: "/dashboard/pedidos/vendidas-periodo", icon: FileText },
        ]
    },
    {
        title: "Sacolinhas",
        icon: ShoppingBag,
        roles: ['ADMIN', 'GERENTE'],
        children: [
            { title: "Painel de Sacolinhas", href: "/dashboard/sacolinhas", icon: ShoppingBag },
            { title: "Nova Sacolinha", href: "/dashboard/sacolinhas/nova", icon: FolderPlus },
        ]
    },
    {
        title: "Consultas & BI",
        icon: ClipboardList,
        roles: ['ADMIN', 'GERENTE'],
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
        roles: ['ADMIN', 'GERENTE'],
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
        roles: ['ADMIN', 'GERENTE'],
        children: [
            { title: "Clientes", href: "/dashboard/cadastros/pessoas?type=Clientes", icon: Users },
            { title: "Fornecedores", href: "/dashboard/cadastros/pessoas?type=Fornecedores", icon: Users },
            { title: "Pessoas (CRM)", href: "/dashboard/cadastros/pessoas", icon: Users },
            { title: "Peças (Estoque)", href: "/dashboard/cadastros/pecas-cadastro", icon: Shirt },
            { title: "Imprimir Etiqueta", href: "/dashboard/cadastros/etiquetas", icon: Printer },
            { title: "Importação de Dados", href: "/dashboard/cadastros/importacao", icon: FolderPlus },
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
        title: "Cadastros Financeiros",
        icon: Wallet,
        roles: ['ADMIN', 'GERENTE'],
        children: [
            { title: "Contas Financeiras", href: "/dashboard/financeiro-cadastro/contas", icon: Landmark },
            { title: "Formas de Pagamento", href: "/dashboard/financeiro-cadastro/formas-pagamento", icon: CreditCard },
            { title: "Receitas e Despesas", href: "/dashboard/financeiro-cadastro/receitas-despesas", icon: ScrollText },
        ]
    },
    {
        title: "Repasses",
        icon: HandCoins,
        roles: ['ADMIN', 'GERENTE'],
        children: [
            { title: "Ficha do Fornecedor", href: "/dashboard/repasses/ficha", icon: Users },
            { title: "Relação de Peças", href: "/dashboard/repasses/relacao-pecas", icon: Shirt },
            { title: "Contas Bancárias", href: "/dashboard/repasses/contas", icon: Landmark },
            { title: "Ranking Fornecedores", href: "/dashboard/consultas/ranking-fornecedores", icon: TrendingUp },
        ]
    },
    {
        title: "Marketing",
        icon: Megaphone,
        roles: ['ADMIN', 'GERENTE'],
        children: [
            { title: "Campanhas Promo", href: "/dashboard/marketing/campanhas", icon: TicketPercent },
        ]
    },
    {
        title: "Equipe",
        href: "/dashboard/equipe",
        icon: Users,
        roles: ['ADMIN'] // Somente admin
    },
    {
        title: "Configurações",
        href: "/dashboard/configuracoes",
        icon: Settings,
        roles: ['ADMIN', 'GERENTE']
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
    const [userRole, setUserRole] = useState('ADMIN');

    useEffect(() => {
        // Get user role from localStorage
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserRole(user.role || 'CAIXA');
            }
        } catch (e) {
            console.error('Error parsing user:', e);
        }
    }, []);

    const currentFullRoute = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Filter nav items based on user role
    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true; // No role restriction
        return item.roles.includes(userRole);
    });

    // Logic to check if a link is active considering query parameters
    const isLinkActive = (href) => {
        if (href.includes('?')) {
            const [basePath, queryStr] = href.split('?');
            if (!pathname.startsWith(basePath)) return false;
            const params = new URLSearchParams(queryStr);
            for (const [key, value] of params) {
                if (searchParams.get(key) !== value) return false;
            }
            return true;
        }
        return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
    };

    const config = themeConfig || {};

    const renderNavItem = (item) => {
        const Icon = item.icon;

        if (item.children) {
            const hasActiveChild = item.children.some(child => isLinkActive(child.href));
            return (
                <Collapsible key={item.title} defaultOpen={hasActiveChild}>
                    <CollapsibleTrigger asChild>
                        <button className={cn(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            hasActiveChild ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary hover:bg-muted"
                        )}>
                            <span className="flex items-center gap-3">
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </span>
                            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                        </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="ml-4 pl-3 border-l border-muted mt-1 space-y-1">
                        {item.children.map(child => {
                            const ChildIcon = child.icon;
                            const isActive = isLinkActive(child.href);
                            return (
                                <Link
                                    key={child.href}
                                    href={child.href}
                                    onClick={() => setIsOpen && setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                        isActive
                                            ? "text-primary font-semibold bg-primary/10"
                                            : "text-muted-foreground hover:text-primary hover:bg-muted"
                                    )}
                                >
                                    <ChildIcon className="h-4 w-4" />
                                    {child.title}
                                </Link>
                            );
                        })}
                    </CollapsibleContent>
                </Collapsible>
            );
        }

        const isActive = isLinkActive(item.href);
        return (
            <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-primary hover:bg-muted"
                )}
            >
                <Icon className="h-4 w-4" />
                {item.title}
            </Link>
        );
    };

    return (
        <div className={cn("flex flex-col h-screen bg-background border-r", className)}>
            <div className="h-16 border-b flex items-center justify-center px-4">
                <div className="flex items-center gap-2 font-semibold text-lg text-primary">
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
                    {filteredNavItems.map(item => renderNavItem(item))}
                </nav>
            </div>
            <div className="p-4 border-t mt-auto bg-muted/10">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors w-full p-2 hover:bg-red-50 rounded-md"
                >
                    <LogOut className="h-4 w-4" />
                    Sair do Sistema
                </button>
            </div>
        </div>
    );
}