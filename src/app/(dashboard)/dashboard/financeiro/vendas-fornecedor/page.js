"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Download,
    Search,
    User,
    ShoppingBag,
    RotateCcw,
    X
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
// Select removed - using searchable input instead
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function VendasPorFornecedorPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [selectedFornecedor, setSelectedFornecedor] = useState("todos");
    const [fornecedores, setFornecedores] = useState([]);
    const [fornecedorSearch, setFornecedorSearch] = useState("");
    const [showFornecedorList, setShowFornecedorList] = useState(false);
    const [salesData, setSalesData] = useState([]);
    const [returnsData, setReturnsData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFornecedores();
        fetchData();
    }, []);

    const fetchFornecedores = () => {
        api.get(`/relatorios/vendas-fornecedor?inicio=${dateStart}&fim=${dateEnd}`)
            .then(res => {
                const uniqueFornecedores = res.data.map(v => ({ id: v.id, nome: v.nome }));
                setFornecedores(uniqueFornecedores);
            })
            .catch(err => console.error("Erro ao buscar fornecedores", err));
    };

    const fetchData = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}&fornecedorId=${selectedFornecedor}`;
        api.get(`/relatorios/vendas-repasse${params}`)
            .then(res => {
                setSalesData(res.data.vendas);
                setReturnsData(res.data.devolucoes);
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar vendas.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    const handleExportVendas = () => {
        if (salesData.length === 0) {
            toast({ title: "Aviso", description: "Nenhuma venda para exportar.", variant: "destructive" });
            return;
        }
        const headers = ["Data", "Venda", "Id Peça", "Peça", "Marca", "Fornecedor", "Cliente", "Valor", "Forma 1", "Forma 2", "C%", "Repasse"];
        const rows = salesData.map(s => [s.data, s.venda, s.idPeca, s.peca, s.marca, s.fornecedor, s.cliente, s.valor.toFixed(2), s.f1, s.f2, s.comissao + '%', s.repasse.toFixed(2)]);
        const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendas_fornecedor_${dateStart}_a_${dateEnd}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportDevolucoes = () => {
        if (returnsData.length === 0) {
            toast({ title: "Aviso", description: "Nenhuma devolução para exportar.", variant: "destructive" });
            return;
        }
        const headers = ["Data", "Venda", "Id Peça", "Peça", "Marca", "Fornecedor", "Cliente", "Valor", "Forma 1", "Forma 2", "C%", "Repasse"];
        const rows = returnsData.map(s => [s.data, s.venda, s.idPeca, s.peca, s.marca, s.fornecedor, s.cliente, s.valor.toFixed(2), s.f1, s.f2, s.comissao + '%', s.repasse.toFixed(2)]);
        const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
        const BOM = '\uFEFF';
        const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `devolucoes_fornecedor_${dateStart}_a_${dateEnd}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Totais Vendas
    const totalVendas = salesData.reduce((acc, curr) => acc + curr.valor, 0);
    const totalRepasse = salesData.reduce((acc, curr) => acc + curr.repasse, 0);

    // Totais Devoluções
    const totalDevolvido = returnsData.reduce((acc, curr) => acc + curr.valor, 0);
    const totalRepasseDev = returnsData.reduce((acc, curr) => acc + curr.repasse, 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Vendas por Fornecedor</h1>
                <p className="text-sm text-muted-foreground">
                    Relatório detalhado de vendas e devoluções para cálculo de repasse aos fornecedores.
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
                    <div className="flex flex-col gap-4">

                        {/* Linha 1: Fornecedor */}
                        <div className="grid gap-1.5 w-full">
                            <Label className="text-xs font-bold text-purple-700">Fornecedor (deixe vazio para todos)</Label>
                            <div className="relative">
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-purple-400" />
                                        <Input
                                            type="text"
                                            placeholder="Digite para buscar fornecedor..."
                                            value={fornecedorSearch}
                                            onChange={(e) => {
                                                setFornecedorSearch(e.target.value);
                                                setShowFornecedorList(true);
                                                if (!e.target.value) {
                                                    setSelectedFornecedor("todos");
                                                }
                                            }}
                                            onFocus={() => setShowFornecedorList(true)}
                                            className="pl-9 bg-gray-50 border-gray-200"
                                        />
                                        {fornecedorSearch && (
                                            <button
                                                onClick={() => {
                                                    setFornecedorSearch("");
                                                    setSelectedFornecedor("todos");
                                                    setShowFornecedorList(false);
                                                }}
                                                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {showFornecedorList && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-[250px] overflow-y-auto">
                                        <button
                                            className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${selectedFornecedor === 'todos' ? 'bg-purple-100 font-bold text-purple-700' : ''}`}
                                            onClick={() => {
                                                setSelectedFornecedor("todos");
                                                setFornecedorSearch("");
                                                setShowFornecedorList(false);
                                            }}
                                        >
                                            Todos os Fornecedores
                                        </button>
                                        {fornecedores
                                            .filter(f => !fornecedorSearch || f.nome.toLowerCase().includes(fornecedorSearch.toLowerCase()))
                                            .map((f, idx) => (
                                                <button
                                                    key={idx}
                                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 border-t border-gray-100 ${selectedFornecedor === (f.id ? f.id.toString() : `nome-${f.nome}`) ? 'bg-purple-100 font-bold text-purple-700' : ''}`}
                                                    onClick={() => {
                                                        setSelectedFornecedor(f.id ? f.id.toString() : `nome-${f.nome}`);
                                                        setFornecedorSearch(f.nome);
                                                        setShowFornecedorList(false);
                                                    }}
                                                >
                                                    {f.nome}
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Linha 2: Datas e Botão */}
                        <div className="flex flex-col md:flex-row gap-4 items-end">
                            <div className="grid gap-1.5 flex-1 w-full">
                                <Label className="text-xs font-bold text-purple-700">Início do Período</Label>
                                <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="bg-gray-50 border-gray-200" />
                            </div>

                            <div className="grid gap-1.5 flex-1 w-full">
                                <Label className="text-xs font-bold text-purple-700">Fim do Período</Label>
                                <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="bg-gray-50 border-gray-200" />
                            </div>

                            <Button onClick={fetchData} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold min-w-[140px] h-10">
                                {loading ? "..." : "LISTAR"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. TABELA DE VENDAS COM REPASSE --- */}
            <Card className="border-t-4 border-t-purple-400 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100 bg-white flex flex-row justify-between items-center px-5 pt-5">
                    <CardTitle className="text-base font-bold text-purple-600 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" /> Vendas com Repasse
                    </CardTitle>
                    <Button onClick={handleExportVendas} variant="outline" size="sm" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                        <Download className="h-4 w-4" /> Exportar para Excel
                    </Button>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-purple-50">
                            <TableRow>
                                <TableHead className="font-bold text-purple-700 text-xs">Data</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Venda</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Id Peça</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Peça</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Marca</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Fornecedor</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Cliente</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-right">Valor</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Forma 1</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Forma 2</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">C%</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-right">Repasse</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={12} className="text-center py-4">Carregando...</TableCell></TableRow>
                            ) : salesData.length > 0 ? (
                                salesData.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-purple-50/10 text-xs border-b border-gray-100">
                                        <TableCell className="text-gray-500">{item.data}</TableCell>
                                        <TableCell className="text-center font-mono text-purple-600">{item.venda}</TableCell>
                                        <TableCell className="text-center font-mono text-gray-500">{item.idPeca}</TableCell>
                                        <TableCell className="font-medium text-gray-700 uppercase">{item.peca}</TableCell>
                                        <TableCell className="text-gray-600">{item.marca}</TableCell>
                                        <TableCell className="text-gray-600">{item.fornecedor}</TableCell>
                                        <TableCell className="text-gray-600">{item.cliente}</TableCell>
                                        <TableCell className="text-right font-bold text-gray-800">R$ {item.valor.toFixed(2)}</TableCell>
                                        <TableCell className="text-center text-gray-500">{item.f1}</TableCell>
                                        <TableCell className="text-center text-gray-500">{item.f2}</TableCell>
                                        <TableCell className="text-center text-gray-500">{item.comissao}%</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600">R$ {item.repasse.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={12} className="text-center py-4">Nenhuma venda encontrada.</TableCell></TableRow>
                            )}

                            {/* Totais */}
                            <TableRow className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                <TableCell colSpan={7} className="text-right py-3 text-sm">Total</TableCell>
                                <TableCell className="text-right py-3 text-sm">R$ {totalVendas.toFixed(2)}</TableCell>
                                <TableCell colSpan={3}></TableCell>
                                <TableCell className="text-right py-3 text-sm text-emerald-700">R$ {totalRepasse.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* --- 3. TABELA DE VENDAS DEVOLVIDAS --- */}
            <Card className="border-t-4 border-t-purple-400 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100 bg-white flex flex-row justify-between items-center px-5 pt-5">
                    <CardTitle className="text-base font-bold text-purple-600 flex items-center gap-2">
                        <RotateCcw className="h-5 w-5" /> Vendas de Peças Devolvidas
                    </CardTitle>
                    <Button onClick={handleExportDevolucoes} variant="outline" size="sm" className="gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                        <Download className="h-4 w-4" /> Exportar para Excel
                    </Button>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-purple-50">
                            <TableRow>
                                <TableHead className="font-bold text-purple-700 text-xs">Data</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Venda</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Id Peça</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Peça</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Marca</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Fornecedor</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Cliente</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-right">Valor</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Forma 1</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Forma 2</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">C%</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-right">Repasse</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={12} className="text-center py-4">Carregando...</TableCell></TableRow>
                            ) : returnsData.length > 0 ? (
                                returnsData.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-red-50/10 text-xs border-b border-gray-100">
                                        <TableCell className="text-gray-500">{item.data}</TableCell>
                                        <TableCell className="text-center font-mono text-purple-600">{item.venda}</TableCell>
                                        <TableCell className="text-center font-mono text-gray-500">{item.idPeca}</TableCell>
                                        <TableCell className="font-medium text-gray-700 uppercase">{item.peca}</TableCell>
                                        <TableCell className="text-gray-600">{item.marca}</TableCell>
                                        <TableCell className="text-gray-600">{item.fornecedor}</TableCell>
                                        <TableCell className="text-gray-600">{item.cliente}</TableCell>
                                        <TableCell className="text-right font-bold text-gray-800">R$ {item.valor.toFixed(2)}</TableCell>
                                        <TableCell className="text-center text-gray-500">{item.f1}</TableCell>
                                        <TableCell className="text-center text-gray-500">{item.f2}</TableCell>
                                        <TableCell className="text-center text-gray-500">{item.comissao}%</TableCell>
                                        <TableCell className="text-right font-bold text-red-600">R$ {item.repasse.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={12} className="text-center py-4">Nenhuma devolução encontrada.</TableCell></TableRow>
                            )}

                            {/* Totais */}
                            <TableRow className="bg-gray-50 font-bold border-t-2 border-gray-200">
                                <TableCell colSpan={7} className="text-right py-3 text-sm">Total</TableCell>
                                <TableCell className="text-right py-3 text-sm">R$ {totalDevolvido.toFixed(2)}</TableCell>
                                <TableCell colSpan={3}></TableCell>
                                <TableCell className="text-right py-3 text-sm text-red-700">R$ {totalRepasseDev.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </Card>

        </div>
    );
}