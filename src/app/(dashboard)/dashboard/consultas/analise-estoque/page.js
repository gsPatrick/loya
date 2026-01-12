"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    DollarSign,
    Package,
    ShoppingCart,
    TrendingUp,
    Download,
    Layers,
    AlertCircle,
    Tag
} from "lucide-react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { EmptyChartPlaceholder } from "@/components/ui/empty-chart-placeholder";

export default function AnaliseEstoquePage() {
    const { toast } = useToast();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        api.get('/relatorios/analise-estoque')
            .then(res => setData(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar análise de estoque.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    }, []);

    if (!data) return <div className="p-10">Carregando...</div>;

    // 1. KPIs
    const kpis = [
        { title: "Total de Peças", value: data.kpis.totalPecas, icon: Package, color: "text-primary", bg: "bg-primary/10" },
        { title: "Preço Médio", value: `R$ ${data.kpis.precoMedio.toFixed(2)}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-100" },
        { title: "Tempo Médio em Estoque", value: `${data.kpis.tempoMedioEstoque} dias`, icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
        { title: "Tempo Médio até Venda", value: `${data.kpis.tempoMedioVenda} dias`, icon: ShoppingCart, color: "text-purple-600", bg: "bg-purple-100" },
    ];

    // Colors for charts
    const COLORS = ["#4f46e5", "#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#6b7280"];

    // Helper to add colors
    const addColors = (items) => items.map((item, idx) => ({ ...item, color: COLORS[idx % COLORS.length] }));

    const statusData = addColors(data.statusData);
    const priceData = addColors(data.priceData);
    const timeData = addColors(data.timeData);
    const categoryData = addColors(data.categoryData);

    // --- COMPONENTES AUXILIARES ---

    // Tooltip customizado para os gráficos
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg text-xs z-50">
                    <p className="font-bold mb-1">{payload[0].name}</p>
                    <p className="text-muted-foreground">
                        Qtd: <span className="font-bold text-foreground">{payload[0].value}</span>
                    </p>
                    <p className="text-muted-foreground">
                        Share: <span className="font-bold text-foreground">
                            {(payload[0].payload.percent * 100).toFixed(1)}%
                        </span>
                    </p>
                </div>
            );
        }
        return null;
    };

    // Componente de Card de Gráfico + Tabela (para poucos itens)
    const ChartAnalysisCard = ({ title, icon: Icon, data, total }) => (
        <Card className="shadow-sm border-muted flex flex-col">
            <CardHeader className="pb-2 bg-muted/5 border-b">
                <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
                    <Icon className="h-4 w-4 text-primary" /> {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col">
                {/* Área do Gráfico */}
                <div className="h-[250px] w-full bg-white relative">
                    {data && data.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60} // Donut Style
                                        outerRadius={80}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Texto Central do Donut */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center pointer-events-none">
                                <span className="text-xs text-muted-foreground block">Total</span>
                                <span className="text-xl font-bold text-foreground">{total.toLocaleString()}</span>
                            </div>
                        </>
                    ) : (
                        <EmptyChartPlaceholder height="100%" message="Sem dados" />
                    )}
                </div>

                {/* Tabela Resumo Abaixo do Gráfico */}
                <div className="border-t">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                <TableHead className="h-8 text-xs font-bold">Faixa/Categoria</TableHead>
                                <TableHead className="h-8 text-xs font-bold text-right">Qtd</TableHead>
                                <TableHead className="h-8 text-xs font-bold text-right">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, idx) => (
                                <TableRow key={idx} className="hover:bg-muted/5 text-xs">
                                    <TableCell className="py-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        {item.name}
                                    </TableCell>
                                    <TableCell className="py-2 text-right">{item.value.toLocaleString()}</TableCell>
                                    <TableCell className="py-2 text-right text-muted-foreground">
                                        {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );

    // Componente especial para Categorias (com legenda customizada para muitos itens)
    const CategoryChartCard = ({ title, icon: Icon, data, total }) => {
        // Gerar mais cores para suportar muitas categorias
        const EXTENDED_COLORS = [
            "#4f46e5", "#10b981", "#06b6d4", "#f59e0b", "#ef4444", "#6b7280",
            "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#22d3ee",
            "#a855f7", "#f43f5e", "#0ea5e9", "#eab308", "#64748b", "#d946ef",
            "#2dd4bf", "#fb923c", "#4ade80", "#38bdf8", "#c084fc", "#fb7185",
            "#34d399", "#fbbf24", "#60a5fa", "#a78bfa", "#f472b6", "#2563eb"
        ];

        const coloredData = data.map((item, idx) => ({
            ...item,
            color: EXTENDED_COLORS[idx % EXTENDED_COLORS.length]
        }));

        return (
            <Card className="shadow-sm border-muted flex flex-col">
                <CardHeader className="pb-2 bg-muted/5 border-b">
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase">
                        <Icon className="h-4 w-4 text-primary" /> {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                    {/* Área do Gráfico */}
                    <div className="h-[200px] w-full bg-white relative">
                        {coloredData && coloredData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={coloredData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={70}
                                            paddingAngle={1}
                                            dataKey="value"
                                        >
                                            {coloredData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={1} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Texto Central do Donut */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <span className="text-xs text-muted-foreground block">Total</span>
                                    <span className="text-xl font-bold text-foreground">{total.toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <EmptyChartPlaceholder height="100%" message="Sem dados" />
                        )}
                    </div>

                    {/* Legenda Customizada com Scroll */}
                    <div className="px-3 py-2 border-t bg-muted/5">
                        <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                            {coloredData.map((item, idx) => (
                                <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white border shadow-sm whitespace-nowrap"
                                    style={{ borderColor: item.color }}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Tabela Resumo com Scroll */}
                    <div className="border-t max-h-[180px] overflow-y-auto">
                        <Table>
                            <TableHeader className="sticky top-0 bg-white z-10">
                                <TableRow className="bg-muted/10 hover:bg-muted/10">
                                    <TableHead className="h-8 text-xs font-bold">Faixa/Categoria</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-right">Qtd</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-right">%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coloredData.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/5 text-xs">
                                        <TableCell className="py-1.5 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="truncate max-w-[120px]" title={item.name}>{item.name}</span>
                                        </TableCell>
                                        <TableCell className="py-1.5 text-right">{item.value.toLocaleString()}</TableCell>
                                        <TableCell className="py-1.5 text-right text-muted-foreground">
                                            {total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Análise de Estoque</h1>
                    <p className="text-sm text-muted-foreground">
                        Visão panorâmica da saúde do estoque, envelhecimento e fornecedores.
                    </p>
                </div>
                <Button variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                    <Download className="h-4 w-4" /> Relatório Completo
                </Button>
            </div>

            {/* --- 1. KPIS SUPERIORES --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="border-none shadow-sm relative overflow-hidden">
                        <div className={`absolute right-0 top-0 h-full w-1 ${kpi.bg}`} />
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{kpi.title}</p>
                                <div className="text-2xl font-bold text-foreground mt-1">{kpi.value}</div>
                            </div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                                <kpi.icon className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* --- 2. GRID DE GRÁFICOS (2x2) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Gráfico 1: Status */}
                <ChartAnalysisCard
                    title="Análise por Status"
                    icon={AlertCircle}
                    data={statusData}
                    total={data.kpis.totalPecas}
                />

                {/* Gráfico 2: Faixa de Preço */}
                <ChartAnalysisCard
                    title="Análise por Faixa de Preço"
                    icon={DollarSign}
                    data={priceData}
                    total={data.kpis.totalPecas}
                />

                {/* Gráfico 3: Tempo em Estoque */}
                <ChartAnalysisCard
                    title="Análise por Tempo em Estoque"
                    icon={Clock}
                    data={timeData}
                    total={data.kpis.totalPecas} // Note: This total might differ if we only count available items for time in stock, but for simplicity using totalPecas or sum of timeData
                />

                {/* Gráfico 4: Categoria (componente especial para muitos itens) */}
                <CategoryChartCard
                    title="Análise por Categoria"
                    icon={Layers}
                    data={categoryData}
                    total={data.kpis.totalPecas}
                />
            </div>

            {/* --- 3. TABELA DE FORNECEDORES (Ranking) --- */}
            <Card className="shadow-md border-primary/10">
                <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                                <TrendingUp className="h-5 w-5" /> Top 10 Fornecedores
                            </CardTitle>
                            <CardDescription>
                                Ranking baseado em valor de estoque e performance de vendas.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-background hover:bg-background">
                                <TableHead className="font-bold text-primary">Fornecedor</TableHead>
                                <TableHead className="text-center font-bold text-muted-foreground">Peças em Estoque</TableHead>
                                <TableHead className="text-center font-bold text-muted-foreground">Peças Vendidas</TableHead>
                                <TableHead className="text-center font-bold text-emerald-600">Taxa Conversão</TableHead>
                                <TableHead className="text-right font-bold text-primary">Valor em Estoque</TableHead>
                                <TableHead className="text-right font-bold text-muted-foreground">Margem Média</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.suppliersData.map((item, index) => (
                                <TableRow key={index} className="hover:bg-muted/30">
                                    <TableCell className="font-medium text-xs uppercase">{item.nome}</TableCell>
                                    <TableCell className="text-center text-xs">{item.estoque}</TableCell>
                                    <TableCell className="text-center text-xs">{item.vendidas}</TableCell>
                                    <TableCell className="text-center text-xs">
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            {item.conversao.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-bold text-primary">
                                        R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-right text-xs">
                                        {item.margem.toFixed(1)}%
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

        </div>
    );
}