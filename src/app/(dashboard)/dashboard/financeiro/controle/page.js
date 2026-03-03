"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Plus,
    Download,
    RefreshCw,
    Search,
    Info,
    ListFilter
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

export default function ControleFinanceiroPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);
    const [transactions, setTransactions] = useState([]);
    const [contas, setContas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedConta, setSelectedConta] = useState("todas");
    const [selectedTipo, setSelectedTipo] = useState("todos");

    // Form State
    const [formData, setFormData] = useState({
        data: new Date().toISOString().split('T')[0],
        tipo: "PAGAR",
        descricao: "",
        valor: "",
        categoriaId: null // Not fully implemented in UI yet, but backend supports it
    });

    useEffect(() => {
        fetchContas();
        fetchTransactions();
    }, []);

    const fetchContas = () => {
        api.get('/financeiro/contas')
            .then(res => setContas(res.data))
            .catch(err => console.error("Erro ao buscar contas", err));
    };

    const fetchTransactions = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}&tipo=${selectedTipo}`;
        api.get(`/financeiro/transacoes${params}`)
            .then(res => setTransactions(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar transações.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    const handleCreateTransaction = () => {
        if (!formData.descricao || !formData.valor) {
            toast({ title: "Erro", description: "Preencha descrição e valor.", variant: "destructive" });
            return;
        }

        const payload = {
            descricao: formData.descricao,
            valor: parseFloat(formData.valor.replace(',', '.')),
            tipo: formData.tipo,
            data_vencimento: formData.data,
            status: 'ABERTO' // Default to open
        };

        api.post('/financeiro/transacoes', payload)
            .then(() => {
                toast({ title: "Sucesso", description: "Transação lançada." });
                fetchTransactions();
                setFormData({ ...formData, descricao: "", valor: "" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao lançar transação.", variant: "destructive" });
            });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Controle Financeiro</h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie o fluxo de caixa, lançamentos e conciliações bancárias.
                </p>
            </div>

            {/* --- 1. FILTROS DE CONSULTA --- */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100 bg-purple-50/30">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-base font-bold text-purple-700 flex items-center gap-2">
                            <ListFilter className="h-5 w-5" /> Filtros de Consulta
                        </CardTitle>
                        <span className="text-xs text-green-600 font-semibold flex items-center gap-1 cursor-pointer hover:underline">
                            <Info className="h-3 w-3" /> Entendendo o Controle Financeiro
                        </span>
                    </div>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-4 items-end">

                        <div className="grid gap-1.5 flex-[1.5] w-full">
                            <Label className="text-xs font-bold text-purple-700">Conta Financeira</Label>
                            <Select value={selectedConta} onValueChange={setSelectedConta}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Escolha a Conta Financeira" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">Todas as Contas</SelectItem>
                                    {contas.map(c => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.banco} - {c.conta}</SelectItem>
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

                        <div className="grid gap-1.5 flex-[1.5] w-full">
                            <Label className="text-xs font-bold text-purple-700">Tipo</Label>
                            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
                                <SelectTrigger className="bg-gray-50 border-gray-200">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="receita">Receitas</SelectItem>
                                    <SelectItem value="despesa">Despesas</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={fetchTransactions} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold min-w-[120px]">
                            <ListFilter className="h-4 w-4 mr-2" /> {loading ? "..." : "LISTAR"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. LANÇAMENTO DE TRANSAÇÕES --- */}
            <Card className="border-t-4 border-t-purple-400 shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100 bg-purple-50/30">
                    <CardTitle className="text-base font-bold text-purple-600 flex items-center gap-2">
                        <Plus className="h-5 w-5" /> Lançamento de Transações
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">

                    {/* Linha 1 */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-[200px] space-y-1.5">
                            <Label className="text-xs font-bold text-purple-700">Data da Transação</Label>
                            <Input type="date" className="bg-gray-50" value={formData.data} onChange={e => setFormData({ ...formData, data: e.target.value })} />
                        </div>

                        <div className="flex-1 space-y-1.5">
                            <Label className="text-xs font-bold text-purple-700">Receita/Despesa</Label>
                            <Select value={formData.tipo} onValueChange={v => setFormData({ ...formData, tipo: v })}>
                                <SelectTrigger className="bg-gray-50">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="RECEBER">Receita (Receber)</SelectItem>
                                    <SelectItem value="PAGAR">Despesa (Pagar)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Linha 2 */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-[2] space-y-1.5 w-full">
                            <Label className="text-xs font-bold text-purple-700">Descrição</Label>
                            <Input className="bg-gray-50" placeholder="Descrição da Transação" value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} />
                        </div>

                        <div className="flex-1 space-y-1.5 w-full">
                            <Label className="text-xs font-bold text-purple-700">Valor R$</Label>
                            <Input className="bg-gray-50" placeholder="0,00" value={formData.valor} onChange={e => setFormData({ ...formData, valor: e.target.value })} />
                        </div>

                        <Button onClick={handleCreateTransaction} className="bg-purple-600 hover:bg-purple-700 text-white font-bold min-w-[140px]">
                            <Plus className="h-4 w-4 mr-2" /> LANÇAR
                        </Button>
                    </div>

                </CardContent>
            </Card>

            {/* --- 3. LISTA DE TRANSAÇÕES --- */}
            <Card className="border-t-4 border-t-purple-300 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100 bg-white px-5 pt-5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <CardTitle className="text-base font-bold text-purple-500">
                            Lista de Transações
                        </CardTitle>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button variant="outline" className="gap-2 text-green-700 border-green-200 hover:bg-green-50 flex-1 md:flex-none">
                                <Download className="h-4 w-4" /> Exportar Excel
                            </Button>
                            <Button variant="outline" className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 flex-1 md:flex-none">
                                <RefreshCw className="h-4 w-4" /> Conciliação Automática
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-purple-50/50">
                            <TableRow>
                                <TableHead className="font-bold text-purple-700 text-xs">Data Trans.</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Competência</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Tipo</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Categoria</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs min-w-[200px]">Descrição</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-right">Valor</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Conta</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs">Documento</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-right">Saldo</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Status</TableHead>
                                <TableHead className="font-bold text-purple-700 text-xs text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={11} className="text-center py-4">Carregando...</TableCell></TableRow>
                            ) : transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id} className="hover:bg-gray-50 text-xs">
                                        <TableCell>{tx.data}</TableCell>
                                        <TableCell>{tx.competencia}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={tx.tipo === 'Receita' ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                                                {tx.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-600">{tx.categoria}</TableCell>
                                        <TableCell className="font-medium text-gray-700 uppercase">{tx.desc}</TableCell>
                                        <TableCell className={`text-right font-bold ${tx.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'}`}>
                                            R$ {Math.abs(tx.valor).toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-gray-600">{tx.conta}</TableCell>
                                        <TableCell className="text-gray-500">{tx.doc}</TableCell>
                                        <TableCell className="text-right font-medium text-primary">R$ {tx.saldo.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            {tx.status === 'Conciliado' ? (
                                                <Badge className="bg-emerald-500 hover:bg-emerald-600 h-5 px-1.5 text-[10px]">Conciliado</Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-gray-200 text-gray-600 hover:bg-gray-300 h-5 px-1.5 text-[10px]">{tx.status}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-primary">
                                                <Search className="h-3 w-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={11} className="text-center py-4">Nenhuma transação encontrada.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

        </div>
    );
}