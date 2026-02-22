// src/app/dashboard/pedidos/vendidas-periodo/page.js
"use client";

import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    FileSpreadsheet,
    AlertCircle,
    CheckCircle,
    Package,
    DollarSign,
    TrendingDown,
    TrendingUp,
    Banknote,
    ArrowRight,
    Trash2
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
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function PecasVendidasPage() {
    const { toast } = useToast();
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}`;
        api.get(`/relatorios/vendas-detalhadas${params}`)
            .then(res => setSales(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao buscar vendas detalhadas.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    const handleCancelarVenda = async (pedidoId) => {
        if (!confirm(`Tem certeza que deseja CANCELAR a venda #${pedidoId}?\n\nIsso irá:\n• Restaurar todas as peças ao estoque\n• Reverter repasses dos fornecedores\n• Excluir o pedido permanentemente\n\nEsta ação NÃO pode ser desfeita.`)) return;

        setDeletingId(pedidoId);
        try {
            const res = await api.delete(`/vendas/pedidos/${pedidoId}`);
            toast({
                title: "Venda Cancelada",
                description: res.data.message || `Venda #${pedidoId} cancelada com sucesso.`,
                className: "bg-green-600 text-white border-none"
            });
            fetchSales(); // Reload
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: err.response?.data?.error || "Falha ao cancelar venda.", variant: "destructive" });
        } finally {
            setDeletingId(null);
        }
    };

    const handleExportExcel = () => {
        if (sales.length === 0) {
            toast({ title: "Aviso", description: "Nenhum dado para exportar.", variant: "destructive" });
            return;
        }
        const headers = ["Data", "ID Venda", "ID Peça", "Descrição", "Marca", "Categoria", "Tipo", "Fornecedora", "Cliente", "Vlr Vendido", "Taxas", "Impostos", "Repasse", "Líquido", "% Margem"];
        const rows = sales.map(s => [s.data, s.id, s.idAlt, s.desc, s.marca, s.cat, s.tipo, s.fornecedor, s.cliente, parseFloat(s.preco.toFixed(2)), parseFloat(s.taxa.toFixed(2)), parseFloat(s.imposto.toFixed(2)), parseFloat(s.repasse.toFixed(2)), parseFloat(s.loja.toFixed(2)), s.margem.toFixed(1) + '%']);
        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = headers.map(() => ({ wch: 16 }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Vendas Detalhadas');
        XLSX.writeFile(wb, `vendas_${dateStart}_a_${dateEnd}.xlsx`);
    };

    // Calculate Totals
    const totals = sales.reduce((acc, sale) => {
        acc.qtd += 1;
        acc.bruta += sale.preco;
        acc.taxas += sale.taxa + sale.imposto;
        acc.repasses += sale.repasse;
        acc.liquido += sale.loja; // Assuming 'loja' is the net profit
        return acc;
    }, { qtd: 0, bruta: 0, taxas: 0, repasses: 0, liquido: 0 });

    const margemMedia = totals.bruta > 0 ? (totals.liquido / totals.bruta) * 100 : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Relatório de Vendas Detalhado</h1>
                    <p className="text-sm text-muted-foreground">Análise financeira peça a peça no período selecionado.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleExportExcel} variant="outline" className="gap-2 text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200 shadow-sm">
                        <FileSpreadsheet className="h-4 w-4" /> Exportar Excel
                    </Button>
                </div>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="shadow-sm border-primary/10 bg-primary/5">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1 w-full">
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
                                Período de Análise
                            </span>
                            <div className="flex items-center gap-2 bg-white p-1 rounded-md border shadow-sm">
                                <div className="relative flex-1">
                                    <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="border-none focus-visible:ring-0" />
                                </div>
                                <span className="text-muted-foreground font-medium px-2">até</span>
                                <div className="relative flex-1">
                                    <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="border-none focus-visible:ring-0" />
                                </div>
                            </div>
                        </div>

                        <Button onClick={fetchSales} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[140px] h-11 shadow-md">
                            <Filter className="h-4 w-4 mr-2" /> {loading ? "..." : "Filtrar Dados"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. TOTALIZADORES (Cards Coloridos - Estilo Dashboard) --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

                {/* Card Azul - Qtd Peças */}
                <Card className="bg-primary text-primary-foreground border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2 uppercase tracking-wider">
                            <Package className="h-4 w-4" /> Total Peças
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">{totals.qtd}</div>
                    </CardContent>
                </Card>

                {/* Card Indigo - Valor Vendido */}
                <Card className="bg-indigo-600 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2 uppercase tracking-wider">
                            <DollarSign className="h-4 w-4" /> Venda Bruta
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">R$ {totals.bruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>

                {/* Card Vermelho - Saídas (Taxas + Impostos) */}
                <Card className="bg-red-600 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2 uppercase tracking-wider">
                            <TrendingDown className="h-4 w-4" /> Taxas/Impostos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">- R$ {totals.taxas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>

                {/* Card Laranja - Repasses */}
                <Card className="bg-orange-600 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2 uppercase tracking-wider">
                            <Banknote className="h-4 w-4" /> Repasses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-2xl font-bold">- R$ {totals.repasses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    </CardContent>
                </Card>

                {/* Card Verde - Líquido (Destaque) */}
                <Card className="bg-green-600 text-white border-none shadow-lg relative overflow-hidden ring-2 ring-green-600 ring-offset-2">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 flex items-center gap-2 uppercase tracking-wider">
                            <TrendingUp className="h-4 w-4" /> Líquido Loja
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-extrabold">R$ {totals.liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] opacity-80 mt-1">Margem Real: {margemMedia.toFixed(2)}%</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- 3. TABELA GIGANTE (Scrollável) --- */}
            <Card className="shadow-md border-muted overflow-hidden flex flex-col">
                <div className="bg-muted/10 p-3 border-b flex justify-between items-center px-4">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <ArrowRight className="h-3 w-3" /> Role horizontalmente para ver todos os detalhes
                    </span>
                    <div className="relative w-[250px]">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input placeholder="Filtrar nesta lista..." className="pl-8 h-8 text-xs bg-white" />
                    </div>
                </div>

                <div className="overflow-x-auto w-full pb-2 relative">
                    <Table className="min-w-[2700px] border-collapse">
                        <TableHeader className="bg-muted/30 sticky top-0 z-30">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] font-bold">Data</TableHead>
                                <TableHead className="w-[80px]">ID Venda</TableHead>
                                <TableHead className="w-[80px]">ID Peça</TableHead>
                                <TableHead className="w-[100px]">ID Alt</TableHead>
                                <TableHead className="w-[250px]">Descrição</TableHead>
                                <TableHead className="w-[120px]">Marca</TableHead>
                                <TableHead className="w-[120px]">Categoria</TableHead>
                                <TableHead className="w-[120px]">Tipo</TableHead>
                                <TableHead className="w-[150px]">Fornecedora</TableHead>
                                <TableHead className="w-[150px]">Cliente</TableHead>

                                <TableHead className="text-right w-[120px] bg-blue-50 text-blue-700">Vlr Vendido</TableHead>
                                <TableHead className="text-right w-[100px] text-red-600">Taxas</TableHead>
                                <TableHead className="text-right w-[100px] text-red-600">Impostos</TableHead>
                                <TableHead className="text-right w-[120px] text-orange-600">Repasse</TableHead>

                                <TableHead className="text-right w-[120px] bg-green-100 text-green-800 font-bold sticky right-[130px] z-20 border-l shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                                    Líquido
                                </TableHead>
                                <TableHead className="text-right w-[80px] bg-green-100 text-green-800 font-bold sticky right-[50px] z-20 border-l">
                                    % Margem
                                </TableHead>
                                <TableHead className="w-[50px] text-center bg-red-50 text-red-600 font-bold sticky right-0 z-20 border-l">
                                    Ações
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={17} className="text-center py-4">Carregando...</TableCell>
                                </TableRow>
                            ) : sales.length > 0 ? (
                                sales.map((sale, index) => (
                                    <TableRow key={index} className="hover:bg-muted/30 group">
                                        <TableCell className="text-xs text-muted-foreground">{sale.data}</TableCell>
                                        <TableCell className="text-xs font-mono">{sale.id}</TableCell>
                                        <TableCell className="text-xs font-mono">{sale.idAlt}</TableCell>
                                        <TableCell className="text-xs font-mono text-muted-foreground">-</TableCell>
                                        <TableCell className="text-xs font-medium uppercase truncate max-w-[250px]" title={sale.desc}>
                                            {sale.desc}
                                        </TableCell>
                                        <TableCell className="text-xs">{sale.marca}</TableCell>
                                        <TableCell className="text-xs">{sale.cat}</TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant="outline" className="text-[10px] font-normal border-muted text-muted-foreground">
                                                {sale.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs truncate max-w-[150px]">{sale.fornecedor}</TableCell>
                                        <TableCell className="text-xs truncate max-w-[150px]">{sale.cliente}</TableCell>

                                        <TableCell className="text-right text-xs font-bold bg-blue-50/50 text-blue-900">
                                            R$ {sale.preco.toFixed(2)}
                                        </TableCell>

                                        <TableCell className="text-right text-xs text-red-400">-{sale.taxa.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-xs text-red-600 font-medium">-{sale.imposto.toFixed(2)}</TableCell>
                                        <TableCell className="text-right text-xs text-orange-600 font-medium">-{sale.repasse.toFixed(2)}</TableCell>

                                        <TableCell className="text-right text-xs font-bold text-green-700 bg-green-50 sticky right-[130px] z-20 border-l shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] group-hover:bg-green-100 transition-colors">
                                            R$ {sale.loja.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right text-xs font-medium text-green-700 bg-green-50 sticky right-[50px] z-20 border-l group-hover:bg-green-100 transition-colors">
                                            {sale.margem.toFixed(1)}%
                                        </TableCell>
                                        <TableCell className="text-center bg-red-50/30 sticky right-0 z-20 border-l group-hover:bg-red-50 transition-colors">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100"
                                                disabled={deletingId === sale.pedidoId}
                                                onClick={() => handleCancelarVenda(sale.pedidoId || sale.id)}
                                                title="Cancelar venda"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={17} className="text-center py-4">Nenhum registro encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-muted/10 p-3 border-t text-xs text-muted-foreground flex justify-between items-center px-4">
                    <span>Mostrando {sales.length} registros</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Anterior</Button>
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Próximo</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}