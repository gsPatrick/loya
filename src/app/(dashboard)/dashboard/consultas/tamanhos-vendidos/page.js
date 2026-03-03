// src/app/dashboard/consultas/tamanhos-vendidos/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Download,
    Ruler,
    Scale,
    PieChart,
    ArrowUpRight,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { EmptyChartPlaceholder } from "@/components/ui/empty-chart-placeholder";

export default function TamanhosVendidosPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState("2025-10-01");
    const [dateEnd, setDateEnd] = useState("2025-11-29");
    const [filterCategory, setFilterCategory] = useState("all");
    const [rawData, setRawData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/relatorios/vendas-tamanho?inicio=${dateStart}&fim=${dateEnd}`);
            setRawData(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao carregar dados.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // Filtro Lógico
    const filteredData = filterCategory === "all"
        ? rawData
        : rawData.filter(item => item.category === filterCategory);

    // Ordenação Padrão (Maior Qtd para Menor)
    const sortedData = [...filteredData].sort((a, b) => b.qtd - a.qtd);

    // Cálculos KPI
    const totalPecas = sortedData.reduce((acc, item) => acc + item.qtd, 0);
    const totalValor = sortedData.reduce((acc, item) => acc + item.valor, 0);
    const topSize = sortedData[0];

    // Top 3 Concentração
    const top3Qtd = sortedData.slice(0, 3).reduce((acc, item) => acc + item.qtd, 0);
    const concentration = totalPecas > 0 ? ((top3Qtd / totalPecas) * 100).toFixed(1) : 0;

    // Cores para o Gráfico (Gradiente roxo/azul)
    const COLORS = ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-xl text-xs z-50">
                    <p className="font-bold text-base mb-2 text-primary uppercase flex items-center gap-2">
                        <Ruler className="h-4 w-4" /> Tamanho {label}
                    </p>
                    <div className="flex flex-col gap-1">
                        <p className="text-foreground font-semibold">
                            Volume: <span className="text-primary">{payload[0].value} peças</span>
                        </p>
                        <p className="text-muted-foreground">
                            Faturamento: R$ {payload[0].payload.valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
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
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Tamanhos Mais Vendidos</h1>
                    <p className="text-sm text-muted-foreground">Análise de grade para entender o perfil do seu público.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                        <Download className="h-4 w-4" /> Exportar Dados
                    </Button>
                </div>
            </div>

            {/* --- 1. CARDS DE KPI --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Tamanho Campeão */}
                <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-br from-white to-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Tamanho Campeão (Vol.)
                            <Ruler className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <div className="text-4xl font-black text-primary">{topSize?.size || '-'}</div>
                            <span className="text-sm text-muted-foreground mb-1.5">
                                ({topSize?.qtd || 0} un.)
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">O tamanho com maior saída no período.</p>
                    </CardContent>
                </Card>

                {/* Card 2: Faturamento do Top 1 */}
                <Card className="border-l-4 border-l-violet-500 shadow-sm bg-gradient-to-br from-white to-violet-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Faturamento do Campeão
                            <Scale className="h-4 w-4 text-violet-600" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-violet-700">
                            R$ {(topSize?.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Representa {totalValor > 0 ? ((topSize?.valor / totalValor) * 100).toFixed(1) : 0}% do faturamento total.
                        </p>
                    </CardContent>
                </Card>

                {/* Card 3: Concentração */}
                <Card className="border-l-4 border-l-fuchsia-500 shadow-sm bg-gradient-to-br from-white to-fuchsia-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Concentração (Top 3)
                            <PieChart className="h-4 w-4 text-fuchsia-600" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-fuchsia-700">{concentration}%</div>
                        <div className="flex gap-1 mt-1">
                            {sortedData.slice(0, 3).map((s, i) => (
                                <Badge key={i} variant="outline" className="text-xs bg-white/50 border-fuchsia-200">
                                    {s.size}
                                </Badge>
                            ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Das vendas concentradas nestes tamanhos.</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- 2. FILTROS --- */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">

                        <div className="grid gap-1.5 flex-[2] w-full">
                            <Label className="text-xs font-medium text-muted-foreground">Tipo de Grade / Categoria</Label>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="h-9 bg-muted/10">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todas as Grades</SelectItem>
                                    <SelectItem value="letras">Roupas (Letras - P/M/G)</SelectItem>
                                    <SelectItem value="numeros">Roupas (Números - 36/38...)</SelectItem>
                                    <SelectItem value="unico">Tamanho Único</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5 flex-[3] w-full">
                            <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" /> Período
                            </Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => setDateStart(e.target.value)}
                                    className="bg-muted/10 h-9"
                                />
                                <span className="text-muted-foreground">-</span>
                                <Input
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                    className="bg-muted/10 h-9"
                                />
                            </div>
                        </div>

                        <Button onClick={fetchData} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px] h-9">
                            <Filter className="h-4 w-4 mr-2" /> {loading ? "..." : "Atualizar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 3. GRÁFICO --- */}
            <Card className="shadow-md border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <Scale className="h-5 w-5 text-primary" /> Distribuição de Vendas por Tamanho
                    </CardTitle>
                    <CardDescription>Volume de peças vendidas ordenado por popularidade.</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[400px] w-full">
                        {sortedData && sortedData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={sortedData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="size"
                                        tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }}
                                        interval={0}
                                    />
                                    <YAxis
                                        orientation="left"
                                        stroke="var(--color-primary)"
                                        fontSize={11}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />

                                    <Bar
                                        dataKey="qtd"
                                        name="Quantidade"
                                        radius={[4, 4, 0, 0]}
                                        barSize={40}
                                    >
                                        {sortedData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index < 3 ? 'var(--color-primary)' : '#d8b4fe'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartPlaceholder height="100%" message="Sem dados de tamanhos para o período" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* --- 4. TABELA DETALHADA --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="p-4 border-b bg-muted/5 flex justify-between items-center">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Ruler className="h-4 w-4 text-muted-foreground" /> Detalhamento da Grade
                    </h3>
                    <div className="relative w-[200px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Buscar tamanho..." className="pl-9 h-9 bg-background" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead className="w-[80px] text-center">Tamanho</TableHead>
                                <TableHead className="text-right text-primary font-bold">Quantidade</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead className="text-right">Ticket Médio</TableHead>
                                <TableHead className="w-[200px]">Share (Volume)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedData.map((item, index) => (
                                <TableRow key={index} className="hover:bg-muted/30">
                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`font-bold text-sm min-w-[30px] justify-center ${index < 3 ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-foreground'}`}>
                                            {item.size}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary">{item.qtd}</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-right text-xs">R$ {item.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${totalPecas > 0 ? (item.qtd / totalPecas) * 100 : 0}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] w-8 text-right text-muted-foreground font-medium">
                                                {totalPecas > 0 ? ((item.qtd / totalPecas) * 100).toFixed(1) : 0}%
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