// src/app/dashboard/financeiro/entradas-saidas/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    ArrowRightLeft,
    TrendingUp,
    TrendingDown,
    Calculator
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import api from "@/services/api";

export default function EntradasSaidasPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [dateStart, setDateStart] = useState(firstDay);
    const [dateEnd, setDateEnd] = useState(lastDay);
    const [compareMode, setCompareMode] = useState("mes");
    const [contas, setContas] = useState([]);
    const [contaSelecionada, setContaSelecionada] = useState("todas");
    const [financialData, setFinancialData] = useState({
        receitas: { atual: 0, anterior: 0 },
        despesas: { atual: 0, anterior: 0 },
    });

    useEffect(() => {
        // Carregar contas reais
        api.get('/cadastros/contas-loja').then(res => setContas(res.data)).catch(err => console.error("Erro ao carregar contas", err));
        loadData();
    }, []); // Initial load

    const loadData = async () => {
        try {
            const { data } = await api.get(`/financeiro/entradas-saidas?inicio=${dateStart}&fim=${dateEnd}&compareMode=${compareMode}&contaId=${contaSelecionada}`);
            setFinancialData(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Cálculos
    const diferencaAtual = financialData.receitas.atual - financialData.despesas.atual;
    const diferencaAnterior = financialData.receitas.anterior - financialData.despesas.anterior;

    const calcDelta = (atual, anterior) => {
        if (anterior === 0) return 0;
        return ((atual - anterior) / anterior) * 100;
    };

    const deltaReceitas = calcDelta(financialData.receitas.atual, financialData.receitas.anterior);
    const deltaDespesas = calcDelta(financialData.despesas.atual, financialData.despesas.anterior);
    const deltaDiferenca = calcDelta(diferencaAtual, diferencaAnterior);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Entradas e Saídas do Período</h1>
                <p className="text-sm text-muted-foreground">
                    Visão consolidada do fluxo de caixa e comparação entre períodos.
                </p>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100 bg-purple-50/30">
                    <CardTitle className="text-base font-bold text-purple-700 flex items-center gap-2">
                        <Filter className="h-5 w-5" /> Filtro
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row gap-6 items-end">

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-purple-700">Início do Período</Label>
                            <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-purple-700">Fim do Período</Label>
                            <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>

                        <div className="grid gap-1.5 flex-[1.5] w-full">
                            <Label className="text-xs font-bold text-purple-700">Conta Financeira</Label>
                            <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">TODAS AS CONTAS</SelectItem>
                                    {contas.map(conta => (
                                        <SelectItem key={conta.id} value={String(conta.id)}>{conta.nome_banco} - {conta.agencia}/{conta.conta}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2 w-full lg:w-auto min-w-[200px]">
                            <Label className="text-xs font-bold text-purple-700">Comparar com:</Label>
                            <RadioGroup defaultValue="mes" className="flex gap-4" onValueChange={setCompareMode}>
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

                        <Button onClick={loadData} className="bg-purple-600 hover:bg-purple-700 text-white font-bold min-w-[140px] h-10">
                            CALCULAR
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. TABELA DE APURAÇÃO --- */}
            <Card className="border-t-4 border-t-purple-400 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100 bg-purple-50/30">
                    <CardTitle className="text-base font-bold text-purple-600 flex items-center gap-2">
                        <ArrowRightLeft className="h-5 w-5" /> Apuração de Entradas e Saídas
                    </CardTitle>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow className="border-b-2 border-purple-100">
                                <TableHead className="w-[40%] font-bold text-purple-600 text-sm py-4 pl-6">Informação Financeira</TableHead>
                                <TableHead className="text-right font-bold text-purple-600 text-sm py-4">Período Atual (R$)</TableHead>
                                <TableHead className="text-right font-bold text-purple-600 text-sm py-4">Período Comparativo (R$)</TableHead>
                                <TableHead className="text-right font-bold text-purple-600 text-sm py-4 pr-6 w-[100px]">Δ%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>

                            {/* Receitas */}
                            <TableRow className="hover:bg-green-50/30 border-b border-gray-100 h-14">
                                <TableHead className="font-bold text-gray-800 text-base pl-6">Total Receitas</TableHead>
                                <TableCell className="text-right text-base text-gray-900 font-medium">
                                    {financialData.receitas.atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right text-base text-gray-500">
                                    {financialData.receitas.anterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className={`text-right font-bold pr-6 ${deltaReceitas >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {deltaReceitas > 0 ? '+' : ''}{deltaReceitas.toFixed(2)}%
                                </TableCell>
                            </TableRow>

                            {/* Despesas */}
                            <TableRow className="hover:bg-red-50/30 border-b border-gray-100 h-14">
                                <TableHead className="font-bold text-gray-800 text-base pl-6">Total Despesas</TableHead>
                                <TableCell className="text-right text-base text-gray-900 font-medium">
                                    {financialData.despesas.atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className="text-right text-base text-gray-500">
                                    {financialData.despesas.anterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className={`text-right font-bold pr-6 ${deltaDespesas <= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {/* Para despesa, reduzir (negativo) é bom (verde) */}
                                    {deltaDespesas > 0 ? '+' : ''}{deltaDespesas.toFixed(2)}%
                                </TableCell>
                            </TableRow>

                            {/* Diferença (Saldo) */}
                            <TableRow className="bg-gray-50 h-16 border-t-2 border-gray-200">
                                <TableHead className="font-black text-gray-900 text-lg pl-6">Diferença</TableHead>
                                <TableCell className={`text-right text-lg font-bold ${diferencaAtual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {diferencaAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className={`text-right text-lg font-bold ${diferencaAnterior >= 0 ? 'text-gray-600' : 'text-gray-400'}`}>
                                    {diferencaAnterior.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </TableCell>
                                <TableCell className={`text-right font-black text-sm pr-6 ${deltaDiferenca >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {deltaDiferenca > 0 ? '+' : ''}{deltaDiferenca.toFixed(2)}%
                                </TableCell>
                            </TableRow>

                        </TableBody>
                    </Table>
                </div>
            </Card>

        </div>
    );
}