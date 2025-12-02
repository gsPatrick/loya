"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Download,
    TrendingUp,
    DollarSign,
    Package,
    ArrowUpRight,
    Trophy,
    Search
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function CategoriasVendidasPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(firstDay);
    const [dateEnd, setDateEnd] = useState(lastDay);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}`;
        api.get(`/relatorios/vendas-categoria${params}`)
            .then(res => setData(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar dados de categorias.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    // Cálculos Rápidos para os Cards
    const totalVendas = data.reduce((acc, item) => acc + item.valor, 0);
    const totalPecas = data.reduce((acc, item) => acc + item.qtd, 0);
    const topCategoria = data.length > 0 ? data[0] : { name: "N/A", valor: 0, qtd: 0 };

    // Custom Tooltip para o Gráfico
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-4 border rounded-lg shadow-lg text-xs">
                    <p className="font-bold text-base mb-2 text-primary uppercase">{label}</p>
                    <div className="flex flex-col gap-1">
                        <p className="text-primary font-semibold">
                            Valor: <span className="text-foreground">R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </p>
                        <p className="text-emerald-600 font-semibold">
                            Quantidade: <span className="text-foreground">{payload[1].value} peças</span>
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Categorias Mais Vendidas</h1>
                    <p className="text-sm text-muted-foreground">Análise comparativa de desempenho entre departamentos.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                        <Download className="h-4 w-4" /> Exportar Relatório
                    </Button>
                </div>
            </div>

            {/* --- 1. CARDS DE KPI (Resumo) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-br from-white to-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Faturamento Total (Período)
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">Soma de todas as categorias</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-gradient-to-br from-white to-emerald-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Peças Vendidas
                            <Package className="h-4 w-4 text-emerald-600" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">{totalPecas}</div>
                        <p className="text-xs text-muted-foreground mt-1">Volume total movimentado</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm bg-gradient-to-br from-white to-amber-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Categoria Campeã
                            <Trophy className="h-4 w-4 text-amber-600" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-700 truncate">{topCategoria.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                                {totalVendas > 0 ? ((topCategoria.valor / totalVendas) * 100).toFixed(1) : 0}% do total
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- 2. FILTROS --- */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1 w-full">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" /> Período de Análise
                            </span>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => setDateStart(e.target.value)}
                                    className="bg-muted/10"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                    className="bg-muted/10"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={fetchData} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                                {loading ? "Carregando..." : "Atualizar"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- 3. GRÁFICO (DUAL AXIS) --- */}
            <Card className="shadow-md border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground">Performance por Categoria</CardTitle>
                    <CardDescription>Relação entre Valor Financeiro (R$) e Volume Físico (Qtd)</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[450px] w-full">
                        {data && data.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        tick={{ fontSize: 10, fill: '#6b7280' }}
                                        interval={0}
                                    />
                                    {/* Eixo Y Esquerdo: Valor R$ */}
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        stroke="var(--color-primary)"
                                        fontSize={11}
                                        tickFormatter={(val) => `R$${val / 1000}k`}
                                    />
                                    {/* Eixo Y Direito: Quantidade */}
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#10b981"
                                        fontSize={11}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                    {/* Barra Azul/Roxa: Valor */}
                                    <Bar
                                        yAxisId="left"
                                        dataKey="valor"
                                        name="Valor Vendido (R$)"
                                        fill="var(--color-primary)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />

                                    {/* Barra Verde: Quantidade */}
                                    <Bar
                                        yAxisId="right"
                                        dataKey="qtd"
                                        name="Quantidade (Peças)"
                                        fill="#10b981"
                                        radius={[4, 4, 0, 0]}
                                        barSize={20}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartPlaceholder height="100%" message="Sem dados de categorias para o período" />
                        )}
                    </div>
                    <div className="text-center text-xs text-muted-foreground mt-4 italic">
                        (*) Exibindo as Top 15 categorias por volume financeiro.
                    </div>
                </CardContent>
            </Card>

            {/* --- 4. TABELA DETALHADA --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="p-4 border-b bg-muted/5 flex justify-between items-center">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" /> Detalhamento dos Dados
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead className="w-[50px] text-center">Rank</TableHead>
                                <TableHead>Categoria</TableHead>
                                <TableHead className="text-right text-emerald-600 font-bold">Quantidade</TableHead>
                                <TableHead className="text-right text-primary font-bold">Valor Total</TableHead>
                                <TableHead className="text-right">Ticket Médio</TableHead>
                                <TableHead className="w-[150px]">Representatividade</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((item, index) => (
                                <TableRow key={index} className="hover:bg-muted/30">
                                    <TableCell className="text-center font-mono text-muted-foreground text-xs">{index + 1}º</TableCell>
                                    <TableCell className="font-medium text-xs">{item.name}</TableCell>
                                    <TableCell className="text-right text-xs">{item.qtd}</TableCell>
                                    <TableCell className="text-right text-xs font-bold text-primary">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right text-xs">R$ {item.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${totalVendas > 0 ? (item.valor / totalVendas) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] w-8 text-right text-muted-foreground">
                                                {totalVendas > 0 ? ((item.valor / totalVendas) * 100).toFixed(0) : 0}%
                                            </span>
                                        </div>
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