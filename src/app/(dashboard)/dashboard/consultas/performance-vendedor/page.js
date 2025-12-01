"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    FileSpreadsheet,
    Trophy,
    Target,
    Clock,
    List,
    TrendingUp,
    Users,
    Award,
    AlertTriangle,
    Flag,
    Star,
    Info,
    CreditCard,
    Repeat,
    DollarSign,
    Settings,
    Heart,
    Shuffle,
    ShoppingCart,
    ChevronDown,
    PieChart
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
    AreaChart,
    Area,
    ComposedChart
} from "recharts";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { EmptyChartPlaceholder } from "@/components/ui/empty-chart-placeholder";

export default function PerformanceVendedorPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [sellersData, setSellersData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        api.get(`/relatorios/performance-vendedor?inicio=${dateStart}&fim=${dateEnd}`)
            .then(res => {
                setSellersData(res.data);
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar performance.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    // --- Process Data ---

    // 1. Score Board
    const scoreBoard = sellersData.map((s, idx) => ({
        rank: idx + 1,
        nome: s.nome,
        score: s.score,
        status: s.score > 80 ? "Bom" : s.score > 50 ? "Regular" : "Crítico",
        color: s.score > 80 ? "text-amber-600" : s.score > 50 ? "text-yellow-500" : "text-red-600",
        icon: s.score > 80 ? Star : s.score > 50 ? Flag : AlertTriangle,
        badgeBg: s.score > 80 ? "bg-amber-100 text-amber-700" : s.score > 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700",
        isOpen: idx === 0,
        metrics: {
            financeiro: { val: (s.faturamento / 1000), max: 40 }, // Mock logic
            eficiencia: { val: 15, max: 25 },
            fidelizacao: { val: 10, max: 20 },
            diversificacao: { val: 5, max: 10 },
            volume: { val: s.vendas / 10, max: 5 }
        }
    }));

    // 2. KPIs Gerais
    const totalFaturamento = sellersData.reduce((acc, s) => acc + s.faturamento, 0);
    const totalVendas = sellersData.reduce((acc, s) => acc + s.vendas, 0);
    const ticketMedioGeral = totalVendas > 0 ? totalFaturamento / totalVendas : 0;
    const totalMargem = sellersData.reduce((acc, s) => acc + (s.margem || 0), 0);

    // Mock Data for Charts (Keep existing mocks for now as backend doesn't provide this yet)
    const weekData = [
        { name: "Segunda", faturamento: 4500, vendas: 30 },
        { name: "Terça", faturamento: 6200, vendas: 45 },
        { name: "Quarta", faturamento: 8100, vendas: 52 },
        { name: "Quinta", faturamento: 3500, vendas: 25 },
        { name: "Sexta", faturamento: 12000, vendas: 80 },
        { name: "Sábado", faturamento: 1500, vendas: 10 },
        { name: "Domingo", faturamento: 0, vendas: 0 },
    ];
    const hourlyData = [
        { name: "08-10h", faturamento: 1200 },
        { name: "10-12h", faturamento: 12800 },
        { name: "12-14h", faturamento: 5500 },
        { name: "14-16h", faturamento: 5400 },
        { name: "16-18h", faturamento: 4200 },
        { name: "18-20h", faturamento: 800 },
        { name: "20-22h", faturamento: 200 },
    ];
    const topLists = {
        clientes: [
            { nome: "Patricia Demétrio", valor: 605.00 },
            { nome: "CLAUDIA ZIEMELS", valor: 520.00 },
            { nome: "KATIA REGINA CAMILOTTI", valor: 390.00 },
            { nome: "LIVIA COSER ADORNO", valor: 390.00 },
            { nome: "GABRIELABELLA", valor: 355.00 },
        ],
        categorias: [
            { nome: "calças", valor: 1325.00, qtd: 6 },
            { nome: "IMPORTACAO", valor: 1150.00, qtd: 6 },
            { nome: "SHORTS", valor: 320.00, qtd: 4 },
            { nome: "BLUSAS", valor: 425.00, qtd: 4 },
            { nome: "VESTIDOS", valor: 885.00, qtd: 4 },
        ],
        marcas: [
            { nome: "GARIMPO", valor: 745.00, qtd: 6 },
            { nome: "USE", valor: 155.00, qtd: 3 },
            { nome: "NIKE", valor: 255.00, qtd: 2 },
            { nome: "EQUIVOCO", valor: 140.00, qtd: 1 },
            { nome: "TRYA", valor: 290.00, qtd: 1 },
        ]
    };

    // Componente Auxiliar para os Cards de Métricas do Score
    const ScoreMetricCard = ({ icon: Icon, title, value, max }) => (
        <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div>
                <div className="flex items-center gap-2 mb-3 text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                    <Icon className="h-3 w-3" /> {title} <Info className="h-3 w-3 ml-auto text-gray-300" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{value.toFixed(2)}</div>
                <div className="text-[10px] text-gray-400 mb-3">de {max} pontos</div>
            </div>
            <Progress
                value={(value / max) * 100}
                className="h-2 bg-gray-100"
                indicatorClassName="bg-emerald-500"
            />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Performance por Vendedor</h1>
                <p className="text-sm text-muted-foreground">
                    Acompanhamento de metas, ranking e indicadores de produtividade do time.
                </p>
            </div>

            {/* Filtros */}
            <Card className="shadow-sm border-muted">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs text-muted-foreground">Data Inicial</Label>
                            <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="bg-muted/10" />
                        </div>
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs text-muted-foreground">Data Final</Label>
                            <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="bg-muted/10" />
                        </div>
                        <Button onClick={fetchData} disabled={loading} className="bg-primary hover:bg-primary/90 text-white min-w-[140px]">
                            {loading ? "Carregando..." : "Gerar Relatório"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* KPIS Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-emerald-50 border-l-4 border-emerald-500 shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1">
                            Faturamento Total <Info className="h-3 w-3" />
                        </p>
                        <div className="text-2xl font-bold text-foreground mt-1">R$ {totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] text-muted-foreground">No período selecionado</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-l-4 border-l-primary shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-primary uppercase flex items-center gap-1">
                            Total de Vendas <Info className="h-3 w-3" />
                        </p>
                        <div className="text-2xl font-bold text-foreground mt-1">{totalVendas}</div>
                        <p className="text-[10px] text-muted-foreground">Vendas realizadas</p>
                    </CardContent>
                </Card>
                <Card className="bg-cyan-50 border-l-4 border-cyan-500 shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-cyan-700 uppercase flex items-center gap-1">
                            Ticket Médio <Info className="h-3 w-3" />
                        </p>
                        <div className="text-2xl font-bold text-foreground mt-1">R$ {ticketMedioGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] text-muted-foreground">Por venda</p>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-l-4 border-orange-500 shadow-sm">
                    <CardContent className="p-5">
                        <p className="text-xs font-bold text-orange-700 uppercase flex items-center gap-1">
                            Margem Contrib. <Info className="h-3 w-3" />
                        </p>
                        <div className="text-2xl font-bold text-foreground mt-1">R$ {totalMargem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] text-muted-foreground">Estimado</p>
                    </CardContent>
                </Card>
            </div>

            {/* Área de Conteúdo */}
            <div className="bg-white rounded-lg border border-muted shadow-sm p-1">
                <Tabs defaultValue="detalhado" className="w-full">
                    <TabsList className="w-full justify-start bg-white border-b rounded-none h-auto p-0 px-4 gap-6 overflow-x-auto">
                        <TabsTrigger value="score" className="py-3 gap-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none font-medium">
                            <Trophy className="h-4 w-4" /> Score TicTag
                        </TabsTrigger>
                        <TabsTrigger value="detalhado" className="py-3 gap-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none font-medium">
                            <List className="h-4 w-4" /> Detalhamento Completo
                        </TabsTrigger>
                        <TabsTrigger value="temporal" className="py-3 gap-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none font-medium">
                            <Clock className="h-4 w-4" /> Performance Temporal
                        </TabsTrigger>
                        <TabsTrigger value="top" className="py-3 gap-2 data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none font-medium">
                            <Award className="h-4 w-4" /> Top Listas
                        </TabsTrigger>
                    </TabsList>

                    <div className="p-6 bg-slate-50 min-h-[500px]">

                        {/* --- ABA 1: SCORE TICTAG --- */}
                        <TabsContent value="score" className="mt-0 space-y-6">
                            <div className="bg-primary/10 border border-primary/20 rounded-md p-4 flex items-start gap-3">
                                <Trophy className="h-5 w-5 text-primary mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-bold text-primary">Score TicTag - Metodologia Científica</h4>
                                    <p className="text-xs text-primary/80 mt-1">
                                        Ranking baseado em 5 categorias ponderadas.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {scoreBoard.map((vendedor) => (
                                    <Collapsible key={vendedor.rank} defaultOpen={vendedor.isOpen} className="bg-white rounded-xl border border-muted shadow-sm overflow-hidden">
                                        <CollapsibleTrigger className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-6">
                                                <div className="text-3xl font-black text-purple-300">#{vendedor.rank}</div>
                                                <vendedor.icon className={`h-10 w-10 ${vendedor.color}`} />
                                                <div className="text-left">
                                                    <h3 className="text-lg font-bold text-gray-800 uppercase">{vendedor.nome}</h3>
                                                    <Badge className={`mt-1 hover:bg-opacity-80 ${vendedor.badgeBg} border-none`}>
                                                        {vendedor.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-right flex items-center gap-4">
                                                <div>
                                                    <div className={`text-4xl font-black ${vendedor.color}`}>{vendedor.score.toFixed(1)}</div>
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold text-center">pontos</p>
                                                </div>
                                                <ChevronDown className="h-5 w-5 text-gray-300 group-data-[state=open]:rotate-180 transition-transform duration-300" />
                                            </div>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="border-t border-dashed border-gray-100 p-6 bg-slate-50/30">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                                <ScoreMetricCard icon={DollarSign} title="Resultado Financeiro" value={vendedor.metrics.financeiro.val} max={vendedor.metrics.financeiro.max} />
                                                <ScoreMetricCard icon={Settings} title="Eficiência Operacional" value={vendedor.metrics.eficiencia.val} max={vendedor.metrics.eficiencia.max} />
                                                <ScoreMetricCard icon={Heart} title="Fidelização de Clientes" value={vendedor.metrics.fidelizacao.val} max={vendedor.metrics.fidelizacao.max} />
                                                <ScoreMetricCard icon={Shuffle} title="Diversificação" value={vendedor.metrics.diversificacao.val} max={vendedor.metrics.diversificacao.max} />
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                            </div>
                        </TabsContent>

                        {/* --- ABA 2: DETALHAMENTO --- */}
                        <TabsContent value="detalhado" className="mt-0">
                            <Card className="border-none shadow-none bg-white">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-purple-50 hover:bg-purple-50">
                                            <TableHead className="font-bold text-primary">Vendedor</TableHead>
                                            <TableHead className="text-center text-primary font-bold">Vendas</TableHead>
                                            <TableHead className="text-right text-primary font-bold">Faturamento</TableHead>
                                            <TableHead className="text-right text-primary font-bold">Ticket Médio</TableHead>
                                            <TableHead className="text-center text-primary font-bold">Peças</TableHead>
                                            <TableHead className="text-right text-primary font-bold">Descontos</TableHead>
                                            <TableHead className="text-right text-primary font-bold">Comissões</TableHead>
                                            <TableHead className="text-right text-primary font-bold">Margem</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sellersData.map((s, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50">
                                                <TableCell className="font-medium">{s.nome}</TableCell>
                                                <TableCell className="text-center">{s.vendas}</TableCell>
                                                <TableCell className="text-right font-medium">R$ {s.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right">R$ {s.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-center">{s.pecas}</TableCell>
                                                <TableCell className="text-right text-red-500">{s.descontos.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-orange-600">{s.comissao.toFixed(2)}</TableCell>
                                                <TableCell className="text-right font-bold text-emerald-600">R$ {s.margem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Total Row */}
                                        <TableRow className="bg-slate-100 font-bold border-t-2 border-slate-200 hover:bg-slate-100">
                                            <TableCell>TOTAL</TableCell>
                                            <TableCell className="text-center">{totalVendas}</TableCell>
                                            <TableCell className="text-right">{totalFaturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-right">{ticketMedioGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-center">-</TableCell>
                                            <TableCell className="text-right">-</TableCell>
                                            <TableCell className="text-right">-</TableCell>
                                            <TableCell className="text-right text-emerald-700">{totalMargem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>
                        </TabsContent>

                        {/* --- ABA 3: TEMPORAL (MOCK) --- */}
                        <TabsContent value="temporal" className="mt-0">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="shadow-sm border-none bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-base text-purple-700 flex items-center gap-2">
                                            <CalendarIcon className="h-4 w-4" /> Performance por Dia da Semana
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[300px]">
                                            {weekData && weekData.length > 0 ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <ComposedChart data={weekData}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis dataKey="name" fontSize={12} />
                                                        <YAxis yAxisId="left" orientation="left" stroke="var(--color-primary)" fontSize={11} tickFormatter={(val) => `R$${val}`} />
                                                        <Tooltip />
                                                        <Bar yAxisId="left" dataKey="faturamento" name="Faturamento" fill="var(--color-primary)" barSize={30} radius={[4, 4, 0, 0]} />
                                                    </ComposedChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <EmptyChartPlaceholder height="100%" message="Sem dados temporais" />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* --- ABA 4: TOP LISTAS (MOCK) --- */}
                        <TabsContent value="top" className="mt-0">
                            <div className="space-y-8">
                                <div className="bg-white rounded-lg p-6 shadow-sm border border-muted">
                                    <div className="flex items-center gap-2 mb-4 text-purple-700 font-bold border-b pb-2">
                                        <Users className="h-5 w-5" /> Dados Globais (Exemplo)
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white border rounded-md p-4">
                                            <h5 className="text-xs font-bold text-purple-600 uppercase mb-3 flex items-center gap-2"><Users className="h-3 w-3" /> Top 5 Clientes</h5>
                                            <ul className="space-y-3">
                                                {topLists.clientes.map((c, i) => (
                                                    <li key={i} className="flex justify-between text-xs border-b border-dashed border-gray-100 pb-1 last:border-0">
                                                        <span className="font-medium text-slate-700 flex gap-2">
                                                            <span className="text-purple-300 font-bold">#{i + 1}</span> {c.nome}
                                                        </span>
                                                        <span className="text-emerald-600 font-bold">R$ {c.valor.toFixed(2)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                    </div>
                </Tabs>
            </div>
        </div>
    );
}