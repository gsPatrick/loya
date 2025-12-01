"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Download,
    Search,
    DollarSign,
    Percent,
    UserCheck,
    FileText
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function ComissoesVendedoresPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [selectedVendedor, setSelectedVendedor] = useState("todos");
    const [vendedores, setVendedores] = useState([]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchVendedores();
        fetchData();
    }, []);

    const fetchVendedores = () => {
        // Fetch suppliers who have sales to populate the dropdown
        api.get(`/relatorios/vendas-fornecedor?inicio=${dateStart}&fim=${dateEnd}`)
            .then(res => {
                // Extract unique suppliers
                const uniqueVendedores = res.data.map(v => ({ id: v.id, nome: v.nome }));
                setVendedores(uniqueVendedores);
            })
            .catch(err => console.error("Erro ao buscar vendedores", err));
    };

    const fetchData = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}&fornecedorId=${selectedVendedor}`;
        api.get(`/relatorios/comissoes${params}`)
            .then(res => setData(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar comissões.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    // Calculate Totals
    const totals = data.reduce((acc, item) => {
        acc.venda += item.venda;
        acc.base += item.base;
        acc.desc += item.desc;
        acc.outros += item.outros;
        acc.comissao += item.comissao;
        return acc;
    }, { venda: 0, base: 0, desc: 0, outros: 0, comissao: 0 });

    const avgCommission = totals.venda > 0 ? (totals.comissao / totals.venda) * 100 : 0;

    // Filter by search term
    const filteredData = data.filter(item =>
        item.vendedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Relatório de Comissões</h1>
                <p className="text-sm text-muted-foreground">
                    Detalhamento de vendas e cálculo de comissões por período e vendedor.
                </p>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-[1.5] w-full">
                            <Label className="text-xs font-bold text-purple-700">Vendedor</Label>
                            <Select value={selectedVendedor} onValueChange={setSelectedVendedor}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Todos os Vendedores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os Vendedores</SelectItem>
                                    {vendedores.map((v, idx) => (
                                        <SelectItem key={idx} value={v.id ? v.id.toString() : `nome-${v.nome}`}>
                                            {v.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-purple-700">Data Início</Label>
                            <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-purple-700">Data Fim</Label>
                            <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="bg-gray-50 border-gray-200" />
                        </div>

                        <Button onClick={fetchData} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold min-w-[120px]">
                            <Filter className="h-4 w-4 mr-2" /> {loading ? "..." : "FILTRAR"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. KPIS DE RESUMO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary text-primary-foreground border-none shadow-md">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-primary-foreground/80 text-xs font-bold uppercase">Total de Vendas</p>
                            <div className="text-2xl font-bold mt-1">R$ {totals.venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-emerald-600 text-white border-none shadow-md">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-emerald-100 text-xs font-bold uppercase">Total Comissões (A Pagar)</p>
                            <div className="text-2xl font-bold mt-1">R$ {totals.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-600 text-white border-none shadow-md">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-xs font-bold uppercase">% Média Comissão</p>
                            <div className="text-2xl font-bold mt-1">{avgCommission.toFixed(2)}%</div>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Percent className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- 3. LISTAGEM DETALHADA --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" /> Extrato de Comissões
                    </h3>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-[250px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por ID ou Vendedor..."
                                className="pl-9 h-9"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 text-green-700 border-green-200 hover:bg-green-50 h-9">
                            <Download className="h-4 w-4" /> Excel
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="font-bold text-gray-700 text-xs w-[90px]">Data</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs w-[90px]">ID Venda</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs">Vendedor</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs text-right">Venda (R$)</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs text-right">Base Comiss.</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs text-right">Desc.</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs text-right">Outros</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-right bg-purple-50">Comissão (R$)</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs text-right w-[60px]">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-4">Carregando...</TableCell>
                                </TableRow>
                            ) : filteredData.length > 0 ? (
                                filteredData.map((row, idx) => (
                                    <TableRow key={idx} className="hover:bg-slate-50 text-xs border-b border-gray-100">
                                        <TableCell className="text-gray-500">{row.data}</TableCell>
                                        <TableCell className="font-mono text-purple-600">{row.id}</TableCell>
                                        <TableCell className="font-medium text-gray-700 uppercase">{row.vendedor}</TableCell>
                                        <TableCell className="text-right text-gray-700">{row.venda.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-gray-500">{row.base.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-red-400">{row.desc.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-gray-400">{row.outros.toFixed(2)}</TableCell>
                                        <TableCell className="text-right font-bold text-emerald-600 bg-purple-50/50">{row.comissao.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-gray-500">{row.pct > 0 ? row.pct.toFixed(2) : "-"}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-4">Nenhum registro encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>

                        {/* FOOTER COM TOTAIS */}
                        <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                            <TableRow className="hover:bg-slate-100">
                                <TableCell colSpan={3} className="font-bold text-sm text-gray-800 text-right uppercase py-4">
                                    TOTAIS
                                </TableCell>
                                <TableCell className="text-right font-bold text-xs text-gray-800">{totals.venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right font-bold text-xs text-gray-800">{totals.base.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right font-bold text-xs text-red-600">{totals.desc.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right font-bold text-xs text-gray-800">{totals.outros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right font-bold text-sm text-emerald-700 bg-purple-100">{totals.comissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                <TableCell className="text-right font-bold text-xs text-gray-800">{avgCommission.toFixed(2)}</TableCell>
                            </TableRow>
                        </tfoot>
                    </Table>
                </div>
            </Card>

        </div>
    );
}