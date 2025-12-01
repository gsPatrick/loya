"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Download,
    DollarSign,
    Package,
    Trophy,
    Search,
    Tag,
    TrendingUp
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
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

export default function MarcasVendidasPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}`;
        api.get(`/relatorios/vendas-marca${params}`)
            .then(res => setAllData(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar dados de marcas.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    // Filtra para a tabela baseado na busca
    const filteredData = allData.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dados para o Gráfico (Top 10 apenas para não poluir)
    const chartData = allData.slice(0, 10);

    // Cálculos Rápidos
    const totalVendas = allData.reduce((acc, item) => acc + item.valor, 0);
    const totalPecas = allData.reduce((acc, item) => acc + item.qtd, 0);
    const topMarca = allData.length > 0 ? allData[0] : { name: "N/A", valor: 0, qtd: 0 };

    // Custom Tooltip
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-xl text-xs z-50">
                    <p className="font-bold text-base mb-2 text-primary uppercase flex items-center gap-2">
                        <Tag className="h-4 w-4" /> {label}
                    </p>
                    <div className="flex flex-col gap-1">
                        <p className="text-primary font-semibold">
                            Faturamento: <span className="text-foreground">R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </p>
                        <p className="text-pink-600 font-semibold">
                            Volume: <span className="text-foreground">{payload[1].value} peças</span>
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
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Marcas Mais Vendidas</h1>
                    <p className="text-sm text-muted-foreground">Ranking de desempenho por marca (Curadoria).</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2 text-primary border-primary/20 hover:bg-primary/5">
                        <Download className="h-4 w-4" /> Exportar Lista
                    </Button>
                </div>
            </div>

            {/* --- 1. CARDS DE KPI --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Marca Top */}
                <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-br from-white to-primary/5 relative overflow-hidden">
                    <div className="absolute top-[-10px] right-[-10px] opacity-5 rotate-12">
                        <Trophy className="h-32 w-32 text-primary" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Marca Campeã (Top 1)
                            <Trophy className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-primary truncate">{topMarca.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                                R$ {topMarca.valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {totalVendas > 0 ? ((topMarca.valor / totalVendas) * 100).toFixed(1) : 0}% do faturamento
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Faturamento Total */}
                <Card className="border-l-4 border-l-primary shadow-sm bg-gradient-to-br from-white to-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Faturamento das Marcas
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-xs text-muted-foreground mt-1">Soma das vendas no período selecionado</p>
                    </CardContent>
                </Card>

                {/* Card 3: Volume de Peças */}
                <Card className="border-l-4 border-l-pink-500 shadow-sm bg-gradient-to-br from-white to-pink-50/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                            Peças de Marca
                            <Tag className="h-4 w-4 text-pink-600" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-pink-700">{totalPecas}</div>
                        <p className="text-xs text-muted-foreground mt-1">Itens vendidos com marca identificada</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- 2. FILTROS --- */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1 w-full">
                            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3" /> Período
                            </span>
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

                        <div className="flex gap-2">
                            <Button onClick={fetchData} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px] h-9">
                                {loading ? "Carregando..." : "Atualizar"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- 3. GRÁFICO --- */}
            <Card className="shadow-md border-primary/10">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Top 10 Marcas
                    </CardTitle>
                    <CardDescription>Comparativo entre Valor (R$) e Volume (Qtd) das principais marcas.</CardDescription>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[400px] w-full">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                        tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }}
                                        interval={0}
                                    />
                                    <YAxis
                                        yAxisId="left"
                                        orientation="left"
                                        stroke="var(--color-primary)"
                                        fontSize={11}
                                        tickFormatter={(val) => `R$${val / 1000}k`}
                                    />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        stroke="#db2777" // Pink-600
                                        fontSize={11}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                    <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                    <Bar
                                        yAxisId="left"
                                        dataKey="valor"
                                        name="Valor Vendido (R$)"
                                        fill="var(--color-primary)"
                                        radius={[4, 4, 0, 0]}
                                        barSize={24}
                                    />
                                    <Bar
                                        yAxisId="right"
                                        dataKey="qtd"
                                        name="Volume (Peças)"
                                        fill="#db2777"
                                        radius={[4, 4, 0, 0]}
                                        barSize={24}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartPlaceholder height="100%" message="Sem dados de marcas para o período" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* --- 4. TABELA DETALHADA --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="p-4 border-b bg-muted/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                        <Tag className="h-4 w-4 text-muted-foreground" /> Detalhamento por Marca
                    </h3>
                    <div className="relative w-full md:w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar marca na lista..."
                            className="pl-9 h-9 bg-background"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead className="w-[60px] text-center">Posição</TableHead>
                                <TableHead>Marca</TableHead>
                                <TableHead className="text-right text-pink-600 font-bold">Qtd. Peças</TableHead>
                                <TableHead className="text-right text-primary font-bold">Total Vendido</TableHead>
                                <TableHead className="text-right">Ticket Médio</TableHead>
                                <TableHead className="w-[180px]">Share (Participação)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((item, index) => {
                                    // Calcula o rank baseado no array original (não no filtrado)
                                    const realRank = allData.findIndex(x => x.name === item.name) + 1;

                                    return (
                                        <TableRow key={index} className="hover:bg-muted/30">
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className="font-mono bg-white text-muted-foreground border-muted">
                                                    #{realRank}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-bold text-xs uppercase">{item.name}</TableCell>
                                            <TableCell className="text-right text-xs">{item.qtd}</TableCell>
                                            <TableCell className="text-right text-xs font-bold text-primary">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-right text-xs">R$ {item.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary to-purple-400"
                                                            style={{ width: `${totalVendas > 0 ? (item.valor / totalVendas) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] w-8 text-right text-muted-foreground font-medium">
                                                        {totalVendas > 0 ? ((item.valor / totalVendas) * 100).toFixed(1) : 0}%
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Nenhuma marca encontrada com o termo "{searchTerm}"
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="bg-muted/10 p-2 text-xs text-muted-foreground text-center border-t">
                    Mostrando {filteredData.length} de {allData.length} marcas registradas no período.
                </div>
            </Card>
        </div>
    );
}