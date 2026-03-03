"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingCart, History, RotateCcw, FileText,
    TrendingUp, Clock, DollarSign, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import api from "@/services/api";

export default function VendedorHomePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        vendasHoje: 0,
        totalHoje: 0,
        ultimaVenda: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user info
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                setUser(JSON.parse(userStr));
            }
        } catch (e) { }

        // Load quick stats
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const { data } = await api.get('/dashboard/resumo');
            setStats({
                vendasHoje: data.resumoVendas?.totalPedidosHoje || 0,
                totalHoje: data.resumoVendas?.faturamentoHoje || 0,
                ultimaVenda: null
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Bom dia";
        if (hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    const quickActions = [
        {
            title: "Nova Venda",
            description: "Abrir o PDV para registrar uma venda",
            icon: ShoppingCart,
            href: "/dashboard/pedidos/pdv",
            color: "bg-green-500 hover:bg-green-600",
            primary: true
        },
        {
            title: "Histórico de Pedidos",
            description: "Ver pedidos anteriores",
            icon: History,
            href: "/dashboard/pedidos/revisao",
            color: "bg-blue-500 hover:bg-blue-600"
        },
        {
            title: "Devolução",
            description: "Registrar devolução de peça",
            icon: RotateCcw,
            href: "/dashboard/pedidos/devolucao",
            color: "bg-orange-500 hover:bg-orange-600"
        },
        {
            title: "Relatório de Vendas",
            description: "Consultar vendas do período",
            icon: FileText,
            href: "/dashboard/pedidos/vendidas-periodo",
            color: "bg-purple-500 hover:bg-purple-600"
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header de Boas Vindas */}
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-white/80 text-sm">{getGreeting()},</p>
                        <h1 className="text-2xl font-bold">{user?.nome || 'Vendedor(a)'}</h1>
                        <p className="text-white/70 text-sm mt-1">
                            <Clock className="inline h-3 w-3 mr-1" />
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Rápidos */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-green-500">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Vendas Hoje</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.vendasHoje}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Hoje</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalHoje)}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <DollarSign className="h-6 w-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Acesso Rápido</h2>

                {/* Botão Principal - Nova Venda */}
                <Link href="/dashboard/pedidos/pdv" className="block">
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all cursor-pointer shadow-md hover:shadow-lg">
                        <CardContent className="py-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                    <ShoppingCart className="h-7 w-7" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">Nova Venda</h3>
                                    <p className="text-white/80 text-sm">Abrir o PDV para registrar uma venda</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Outros botões */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {quickActions.slice(1).map((action) => {
                        const Icon = action.icon;
                        return (
                            <Link key={action.href} href={action.href}>
                                <Card className="hover:shadow-md transition-all cursor-pointer h-full border-l-4" style={{ borderLeftColor: action.color.includes('blue') ? '#3b82f6' : action.color.includes('orange') ? '#f97316' : '#a855f7' }}>
                                    <CardContent className="py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-10 w-10 rounded-lg ${action.color.replace('hover:bg-', 'bg-').split(' ')[0].replace('bg-', 'bg-')}/10 flex items-center justify-center`}>
                                                <Icon className="h-5 w-5 text-gray-700" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                                <p className="text-xs text-gray-500">{action.description}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Dica do Dia */}
            <Card className="bg-amber-50 border-amber-200">
                <CardContent className="py-4">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                            💡
                        </div>
                        <div>
                            <h4 className="font-medium text-amber-900">Dica</h4>
                            <p className="text-sm text-amber-800">
                                Use o atalho <kbd className="px-1.5 py-0.5 bg-amber-200 rounded text-xs font-mono">F2</kbd> no PDV para finalizar a venda rapidamente!
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
