"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Download,
    Info,
    Search,
    CreditCard,
    DollarSign,
    Percent,
    CalendarClock
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { EmptyChartPlaceholder } from "@/components/ui/empty-chart-placeholder";

export default function AnaliseRecebiveisPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0]);
    const [receivables, setReceivables] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        api.get(`/financeiro/recebiveis?inicio=${dateStart}&fim=${dateEnd}`)
            .then(res => {
                setReceivables(res.data);
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar recebíveis.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    // --- Process Data ---

    // 1. KPIs
    const totalBruto = receivables.reduce((acc, r) => acc + parseFloat(r.valor_bruto), 0);
    const totalLiquido = receivables.reduce((acc, r) => acc + parseFloat(r.valor_liquido), 0);
    const totalTaxas = totalBruto - totalLiquido;
    const taxaMedia = totalBruto > 0 ? (totalTaxas / totalBruto) * 100 : 0;

    // 2. Chart Data (Group by Month of Previsao)
    const chartDataMap = {};
    receivables.forEach(r => {
        const date = new Date(r.data_previsao);
        const key = `${date.toLocaleString('default', { month: 'short' })}/${date.getFullYear().toString().substr(2)}`;

        if (!chartDataMap[key]) {
            chartDataMap[key] = { name: key, bruto: 0, taxas: 0, liquido: 0, sortDate: date };
        }
        const bruto = parseFloat(r.valor_bruto);
        const liquido = parseFloat(r.valor_liquido);
        chartDataMap[key].bruto += bruto;
        chartDataMap[key].liquido += liquido;
        chartDataMap[key].taxas += (bruto - liquido);
    });
    const chartData = Object.values(chartDataMap).sort((a, b) => a.sortDate - b.sortDate);

    // 3. Summary Data (Group by Method)
    const summaryMap = {};
    receivables.forEach(r => {
        const method = r.metodo || 'OUTROS';
        if (!summaryMap[method]) {
            summaryMap[method] = { metodo: method, parcelas: 0, bruto: 0, taxas: 0, liquido: 0 };
        }
        const bruto = parseFloat(r.valor_bruto);
        const liquido = parseFloat(r.valor_liquido);
        summaryMap[method].parcelas += 1; // Assuming 1 row = 1 installment/payment
        summaryMap[method].bruto += bruto;
        summaryMap[method].liquido += liquido;
        summaryMap[method].taxas += (bruto - liquido);
    });
    const summaryData = Object.values(summaryMap).map(s => ({
        ...s,
        media: s.bruto > 0 ? (s.taxas / s.bruto) * 100 : 0
    }));

    // 4. Detailed Data
    const detailedData = receivables.map(r => ({
        data: new Date(r.data_venda).toLocaleDateString('pt-BR'),
        venda: r.codigo_pedido,
        cliente: "CLIENTE FINAL", // Backend doesn't send client name in this endpoint yet, or need to check
        meio: r.metodo,
        bruto: parseFloat(r.valor_bruto),
        taxa: parseFloat(r.valor_bruto) - parseFloat(r.valor_liquido),
        liq: parseFloat(r.valor_liquido),
        pct: parseFloat(r.taxa_aplicada)
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Análise de Recebíveis e Custos Financeiros</h1>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium cursor-pointer hover:underline">
                    <Info className="h-4 w-4" /> Entendendo a análise de recebíveis
                </div>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-purple-700">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs text-muted-foreground">Data Início</Label>
                            <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs text-muted-foreground">Data Fim</Label>
                            <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>
                        <Button onClick={fetchData} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]">
                            {loading ? "Carregando..." : "Aplicar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. KPIS (2 Linhas) --- */}
            <div className="space-y-4">
                {/* Linha 1 - Verde */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-emerald-500 text-white border-none shadow-md">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            <p className="text-emerald-100 text-sm font-medium mt-1">Total a Receber (Bruto)</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500 text-white border-none shadow-md">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold">R$ {totalTaxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                            <p className="text-emerald-100 text-sm font-medium mt-1">Total de Taxas</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-emerald-500 text-white border-none shadow-md">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                            <h3 className="text-2xl font-bold">{taxaMedia.toFixed(2)}%</h3>
                            <p className="text-emerald-100 text-sm font-medium mt-1">Taxa Média</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* --- 3. GRÁFICO --- */}
            <Card className="shadow-sm border-purple-200">
                <CardHeader className="pb-2 border-b border-gray-100">
                    <CardTitle className="text-base font-bold text-purple-600">Análise Gráfica</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[350px] w-full">
                        {chartData && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" fontSize={12} stroke="#6b7280" />
                                    <YAxis
                                        fontSize={11}
                                        stroke="#6b7280"
                                        tickFormatter={(value) => `R$ ${value}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        formatter={(value) => `R$ ${value.toFixed(2)}`}
                                    />
                                    <Legend verticalAlign="top" height={36} />
                                    <Bar dataKey="bruto" name="Valor Bruto" fill="#4ade80" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="taxas" name="Taxas" fill="#f87171" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="liquido" name="Valor Líquido" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartPlaceholder height="100%" message="Sem dados de recebíveis para o período" />
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* --- 4. TABELA RESUMO --- */}
            <Card className="shadow-sm border-purple-200 overflow-hidden">
                <CardHeader className="pb-2 border-b border-gray-100 bg-white">
                    <CardTitle className="text-base font-bold text-purple-600">Resumo por Meio de Pagamento</CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-purple-500">
                            <TableRow>
                                <TableHead className="text-white font-bold text-xs">Meio de Pagamento</TableHead>
                                <TableHead className="text-white font-bold text-center text-xs">Qtd. Transações</TableHead>
                                <TableHead className="text-white font-bold text-right text-xs">Valor Bruto</TableHead>
                                <TableHead className="text-white font-bold text-right text-xs">Total Taxas</TableHead>
                                <TableHead className="text-white font-bold text-right text-xs">Valor Líquido</TableHead>
                                <TableHead className="text-white font-bold text-center text-xs">Taxa Média %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {summaryData.map((item, index) => (
                                <TableRow key={index} className="hover:bg-purple-50/20 text-xs border-b border-gray-100">
                                    <TableCell className="font-bold text-gray-800">{item.metodo}</TableCell>
                                    <TableCell className="text-center">{item.parcelas}</TableCell>
                                    <TableCell className="text-right">R$ {item.bruto.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">R$ {item.taxas.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">R$ {item.liquido.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">{item.media.toFixed(2)}%</TableCell>
                                </TableRow>
                            ))}
                            {/* Footer Total */}
                            <TableRow className="bg-primary/10 font-bold border-t-2 border-primary/20 hover:bg-primary/20">
                                <TableCell className="text-primary">TOTAL</TableCell>
                                <TableCell className="text-center text-primary">{receivables.length}</TableCell>
                                <TableCell className="text-right text-primary">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right text-primary">R$ {totalTaxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right text-primary">R$ {totalLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-center text-primary">{taxaMedia.toFixed(2)}%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* --- 5. TABELA DETALHADA --- */}
            <Card className="shadow-sm border-purple-200 overflow-hidden">
                <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-purple-600">Dados Detalhados</h3>
                    <Button className="bg-green-600 hover:bg-green-700 text-white gap-2 h-8 text-xs">
                        <Download className="h-4 w-4" /> Exportar Excel
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-purple-400">
                            <TableRow>
                                <TableHead className="text-white font-bold text-xs w-[100px]">Data Venda</TableHead>
                                <TableHead className="text-white font-bold text-xs w-[80px]">Nº Venda</TableHead>
                                <TableHead className="text-white font-bold text-xs">Meio de Pagamento</TableHead>
                                <TableHead className="text-white font-bold text-xs text-right">Valor Bruto</TableHead>
                                <TableHead className="text-white font-bold text-xs text-right">Taxa</TableHead>
                                <TableHead className="text-white font-bold text-xs text-right">Valor Líquido</TableHead>
                                <TableHead className="text-white font-bold text-xs text-center w-[80px]">Taxa %</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {detailedData.map((row, idx) => (
                                <TableRow key={idx} className="hover:bg-purple-50/20 text-xs border-b border-gray-100 even:bg-gray-50/50">
                                    <TableCell className="text-gray-600">{row.data}</TableCell>
                                    <TableCell className="text-gray-600">{row.venda}</TableCell>
                                    <TableCell className="text-gray-600">{row.meio}</TableCell>
                                    <TableCell className="text-right text-gray-700">R$ {row.bruto.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-gray-700">R$ {row.taxa.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-gray-700">R$ {row.liq.toFixed(2)}</TableCell>
                                    <TableCell className="text-center text-gray-700">{row.pct.toFixed(2)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

        </div>
    );
}