"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Calculator,
    Info,
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowRight,
    Filter,
} from "lucide-react";

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import AIAnalysisSection from "./AIAnalysisSection";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function ApuracaoResultadoPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(firstDay);
    const [dateEnd, setDateEnd] = useState(lastDay);
    const [compareMode, setCompareMode] = useState("mes"); // mes ou ano

    const [currentData, setCurrentData] = useState(null);
    const [previousData, setPreviousData] = useState(null);
    const [loading, setLoading] = useState(false);

    const calculateDates = () => {
        const start = new Date(dateStart);
        const end = new Date(dateEnd);

        // Calculate previous period based on compareMode
        let prevStart = new Date(start);
        let prevEnd = new Date(end);

        if (compareMode === "mes") {
            prevStart.setMonth(prevStart.getMonth() - 1);
            prevEnd.setMonth(prevEnd.getMonth() - 1);
        } else {
            prevStart.setFullYear(prevStart.getFullYear() - 1);
            prevEnd.setFullYear(prevEnd.getFullYear() - 1);
        }

        return {
            current: { start: dateStart, end: dateEnd },
            previous: { start: prevStart.toISOString().split('T')[0], end: prevEnd.toISOString().split('T')[0] }
        };
    };

    const fetchData = async () => {
        setLoading(true);
        const dates = calculateDates();

        try {
            const [currRes, prevRes] = await Promise.all([
                api.get(`/financeiro/dre?inicio=${dates.current.start}&fim=${dates.current.end}`),
                api.get(`/financeiro/dre?inicio=${dates.previous.start}&fim=${dates.previous.end}`)
            ]);
            setCurrentData(currRes.data);
            setPreviousData(prevRes.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao calcular DRE.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial load? Maybe wait for user to click Calculate
        // fetchData();
    }, []);

    const calcDelta = (atual, anterior) => {
        if (!anterior || anterior === 0) return 0;
        return ((atual - anterior) / anterior) * 100;
    };

    // Helper to build rows
    const buildRows = () => {
        if (!currentData || !previousData) return [];

        const rows = [
            { label: "( + ) Vendas em Dinheiro (Real)", atual: currentData.receitaVendasReal, anterior: previousData.receitaVendasReal },
            { label: "( + ) Vendas em Permuta (Crédito)", atual: currentData.receitaVendasPermuta, anterior: previousData.receitaVendasPermuta },
            { label: "( = ) Venda Bruta Total", atual: currentData.receitaVendas, anterior: previousData.receitaVendas, isTotal: true },
            { label: "( + ) Receita de Frete", atual: currentData.receitaFrete, anterior: previousData.receitaFrete },
            { label: "( - ) Devolução de Vendas", atual: currentData.totalDevolucoes, anterior: previousData.totalDevolucoes },
        ];

        // Add dynamic expenses
        const allCategories = new Set([
            ...Object.keys(currentData.despesasPorCategoria || {}),
            ...Object.keys(previousData.despesasPorCategoria || {})
        ]);

        allCategories.forEach(cat => {
            rows.push({
                label: `( - ) ${cat}`,
                atual: currentData.despesasPorCategoria?.[cat] || 0,
                anterior: previousData.despesasPorCategoria?.[cat] || 0
            });
        });

        return rows;
    };

    const rows = buildRows();
    const totalAtual = currentData?.lucroLiquido || 0;
    const totalAnterior = previousData?.lucroLiquido || 0;
    const totalDelta = calcDelta(totalAtual, totalAnterior);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Apuração de Resultado Econômico Mensal</h1>
                <p className="text-sm text-muted-foreground">
                    Comparativo de desempenho financeiro entre períodos.
                </p>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100 bg-primary/5">
                    <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filtros
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-6 items-end">

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-primary">Início do Período</Label>
                            <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-primary">Fim do Período</Label>
                            <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>

                        <div className="grid gap-2 w-full lg:w-auto">
                            <Label className="text-xs font-bold text-primary">Comparar com:</Label>
                            <RadioGroup value={compareMode} className="flex gap-4" onValueChange={setCompareMode}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="mes" id="mes" />
                                    <Label htmlFor="mes" className="text-sm cursor-pointer">Mês Passado</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="ano" id="ano" />
                                    <Label htmlFor="ano" className="text-sm cursor-pointer">Ano Passado</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button onClick={fetchData} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[140px] h-10">
                            {loading ? "Calculando..." : "CALCULAR"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. TABELA DE APURAÇÃO --- */}
            {currentData && (
                <Card className="border-t-4 border-t-primary shadow-sm overflow-hidden">
                    <CardHeader className="pb-3 border-b border-gray-100 bg-primary/5">
                        <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                            <Calculator className="h-5 w-5" /> Apuração de Resultado do Período
                        </CardTitle>
                    </CardHeader>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-white">
                                <TableRow className="border-b-2 border-primary/20">
                                    <TableHead className="w-[40%] font-bold text-primary text-sm py-4">Informação Financeira</TableHead>
                                    <TableHead className="text-right font-bold text-primary text-sm py-4">
                                        Período Atual (R$)<br />
                                        <span className="text-[10px] text-muted-foreground font-normal">De {dateStart} até {dateEnd}</span>
                                    </TableHead>
                                    <TableHead className="text-right font-bold text-primary text-sm py-4">
                                        Período Comparativo (R$)<br />
                                        <span className="text-[10px] text-muted-foreground font-normal">Comparativo</span>
                                    </TableHead>
                                    <TableHead className="text-right font-bold text-primary text-sm py-4 w-[100px]">Δ%</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.map((row, idx) => {
                                    const delta = calcDelta(row.atual, row.anterior);
                                    const isPositive = delta > 0;

                                    const isExpense = row.label.includes("( - )");
                                    let deltaColor = "text-gray-500";
                                    if (delta !== 0) {
                                        if (isExpense) {
                                            deltaColor = isPositive ? "text-red-600" : "text-emerald-600";
                                        } else {
                                            deltaColor = isPositive ? "text-emerald-600" : "text-red-600";
                                        }
                                    }

                                    return (
                                        <TableRow key={idx} className={`hover:bg-primary/5 border-b border-gray-100 text-sm ${row.isSub ? 'bg-gray-50/50' : ''} ${row.isTotal ? 'bg-primary/10 font-bold border-t border-primary/20' : ''}`}>
                                            <TableCell className={`py-3 font-medium ${row.isSub ? 'text-gray-500 pl-8 text-xs' : 'text-gray-700'} ${row.isTotal ? 'text-primary' : ''}`}>{row.label}</TableCell>
                                            <TableCell className="py-3 text-right text-gray-900">{row.atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="py-3 text-right text-gray-500">{row.anterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className={`py-3 text-right font-bold ${deltaColor}`}>
                                                {delta === 0 ? (
                                                    <span className="text-gray-300">-</span>
                                                ) : (
                                                    `(${delta.toFixed(2)}%)`
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}

                                {/* LINHA DE TOTAL */}
                                <TableRow className="bg-gray-50 font-bold text-base border-t-2 border-gray-300">
                                    <TableCell className="py-4">Resultado Líquido</TableCell>
                                    <TableCell className="py-4 text-right text-gray-900">{totalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="py-4 text-right text-gray-500">{totalAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className={`py-4 text-right ${totalDelta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                        ({totalDelta.toFixed(2)}%)
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer Informativo */}
                    <div className="bg-primary/5 p-4 border-t border-primary/10 flex items-start gap-3 m-4 rounded-md">
                        <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm text-primary leading-relaxed">
                            <strong>Observação:</strong> Este relatório separa a <strong>receita de produtos</strong> da <strong>receita de frete</strong> para análise econômica.
                        </p>
                    </div>
                </Card>
            )}

            {/* --- 3. ANÁLISE DE IA --- */}
            {currentData && <AIAnalysisSection data={currentData} />}

        </div>
    );
}