// src/app/dashboard/financeiro/fechamento-caixa/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Lock,
    Eye,
    Printer,
    Search,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Check,
    Unlock,
    ShoppingCart,
    DollarSign,
    CreditCard,
    Banknote,
    ArrowUpCircle,
    ArrowDownCircle,
    RefreshCw
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
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function FechamentoCaixaPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [closings, setClosings] = useState([]);
    const [openCaixas, setOpenCaixas] = useState([]);
    const [selectedCaixa, setSelectedCaixa] = useState(null);
    const [caixaDetalhes, setCaixaDetalhes] = useState(null);
    const [saldoFinal, setSaldoFinal] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOpenCaixas();
    }, []);

    const fetchOpenCaixas = async () => {
        try {
            const { data } = await api.get('/caixa/abertos');
            setOpenCaixas(data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchClosings = async () => {
        try {
            const { data } = await api.get(`/financeiro/fechamentos?inicio=${dateStart}&fim=${dateEnd}`);
            setClosings(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao buscar fechamentos.", variant: "destructive" });
        }
    };

    const handleSelectCaixa = async (caixa) => {
        setSelectedCaixa(caixa);
        setLoading(true);
        try {
            const { data } = await api.get(`/caixa/${caixa.id}/detalhes`);
            setCaixaDetalhes(data);
            setSaldoFinal(data.resumo?.saldoCalculado?.toFixed(2) || "0");
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao carregar detalhes do caixa.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleFecharCaixa = async () => {
        if (!selectedCaixa) return;
        setLoading(true);
        try {
            await api.post(`/caixa/${selectedCaixa.id}/fechar`, { saldo_final: parseFloat(saldoFinal) });
            toast({ title: "Sucesso", description: "Caixa fechado com sucesso!", className: "bg-primary text-primary-foreground" });
            setSelectedCaixa(null);
            setCaixaDetalhes(null);
            setSaldoFinal("");
            fetchOpenCaixas();
            fetchClosings();
        } catch (error) {
            toast({ title: "Erro", description: error.response?.data?.error || "Erro ao fechar caixa.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        if (status === "Correto") return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Correto</Badge>;
        if (status === "Divergente") return <Badge variant="destructive" className="border-none"><AlertCircle className="w-3 h-3 mr-1" /> Falta</Badge>;
        if (status === "Sobras") return <Badge className="bg-primary hover:bg-primary/90 border-none"><AlertCircle className="w-3 h-3 mr-1" /> Sobra</Badge>;
        if (status === "Aberto") return <Badge variant="outline" className="border-amber-500 text-amber-600"><Unlock className="w-3 h-3 mr-1" /> Aberto</Badge>;
        return <Badge variant="outline">{status}</Badge>;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Fechamento de Caixa</h1>
                <p className="text-sm text-muted-foreground">
                    Realize o fechamento diário e audite os históricos de conferência.
                </p>
            </div>

            {/* --- CAIXAS EM ABERTO --- */}
            {openCaixas.length > 0 && (
                <Card className="border-t-4 border-t-amber-500 shadow-sm">
                    <CardHeader className="pb-3 border-b border-gray-100 bg-amber-50">
                        <CardTitle className="text-base font-bold text-amber-700 flex items-center gap-2">
                            <Unlock className="h-5 w-5" /> Caixas em Aberto ({openCaixas.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {openCaixas.map((caixa) => (
                                <div
                                    key={caixa.id}
                                    onClick={() => handleSelectCaixa(caixa)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedCaixa?.id === caixa.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-primary/50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-lg text-primary">#{caixa.id}</span>
                                        <Badge variant="outline" className="border-amber-500 text-amber-600">Aberto</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1"><strong>Operador:</strong> {caixa.usuario}</p>
                                    <p className="text-xs text-gray-500 mb-2"><strong>Abertura:</strong> {caixa.abertura}</p>
                                    <div className="flex justify-between text-sm">
                                        <span>Saldo Inicial:</span>
                                        <span className="font-medium">{formatCurrency(caixa.saldoInicial)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Entradas:</span>
                                        <span className="font-medium text-emerald-600">+{formatCurrency(caixa.entradasDinheiro)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Sangrias:</span>
                                        <span className="font-medium text-red-600">-{formatCurrency(caixa.sangrias)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-bold border-t mt-2 pt-2">
                                        <span>Saldo Atual:</span>
                                        <span className="text-primary">{formatCurrency(caixa.saldoAtual)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- DETALHES DO CAIXA SELECIONADO --- */}
            {selectedCaixa && caixaDetalhes && (
                <Card className="border-t-4 border-t-primary shadow-sm">
                    <CardHeader className="pb-3 border-b border-gray-100 bg-primary/5">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                                <Eye className="h-5 w-5" /> Detalhes do Caixa #{selectedCaixa.id}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedCaixa(null); setCaixaDetalhes(null); }}>
                                Fechar
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 space-y-6">

                        {/* Resumo do Caixa */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <Banknote className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                                <p className="text-xs text-gray-500">Dinheiro</p>
                                <p className="font-bold text-emerald-600">{formatCurrency(caixaDetalhes.resumo?.dinheiro)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <CreditCard className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                                <p className="text-xs text-gray-500">Crédito</p>
                                <p className="font-bold">{formatCurrency(caixaDetalhes.resumo?.credito)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <CreditCard className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                                <p className="text-xs text-gray-500">Débito</p>
                                <p className="font-bold">{formatCurrency(caixaDetalhes.resumo?.debito)}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <DollarSign className="h-5 w-5 mx-auto mb-1 text-gray-500" />
                                <p className="text-xs text-gray-500">PIX</p>
                                <p className="font-bold">{formatCurrency(caixaDetalhes.resumo?.pix)}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                <ArrowUpCircle className="h-5 w-5 mx-auto mb-1 text-emerald-500" />
                                <p className="text-xs text-gray-500">Suprimentos</p>
                                <p className="font-bold text-emerald-600">{formatCurrency(caixaDetalhes.resumo?.totalSuprimentos)}</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg text-center">
                                <ArrowDownCircle className="h-5 w-5 mx-auto mb-1 text-red-500" />
                                <p className="text-xs text-gray-500">Sangrias</p>
                                <p className="font-bold text-red-600">{formatCurrency(caixaDetalhes.resumo?.totalSangrias)}</p>
                            </div>
                        </div>

                        {/* Vendas */}
                        <div>
                            <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4" /> Vendas ({caixaDetalhes.resumo?.totalVendas || 0})
                            </h3>
                            {caixaDetalhes.vendas?.length > 0 ? (
                                <div className="overflow-x-auto max-h-60 overflow-y-auto border rounded-lg">
                                    <Table>
                                        <TableHeader className="bg-gray-50 sticky top-0">
                                            <TableRow>
                                                <TableHead className="text-xs">Código</TableHead>
                                                <TableHead className="text-xs">Data</TableHead>
                                                <TableHead className="text-xs">Cliente</TableHead>
                                                <TableHead className="text-xs">Vendedor(a)</TableHead>
                                                <TableHead className="text-xs">Pagamento</TableHead>
                                                <TableHead className="text-xs text-right">Total</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {caixaDetalhes.vendas.map((venda) => (
                                                <TableRow key={venda.id} className="text-xs">
                                                    <TableCell className="font-mono">{venda.codigo}</TableCell>
                                                    <TableCell>{venda.data}</TableCell>
                                                    <TableCell>{venda.cliente}</TableCell>
                                                    <TableCell className="font-medium text-primary">{venda.vendedor}</TableCell>
                                                    <TableCell>
                                                        {venda.pagamentos?.map(p => p.metodo).join(', ') || '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">{formatCurrency(venda.total)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">Nenhuma venda registrada neste caixa.</p>
                            )}
                        </div>

                        {/* Fechamento */}
                        <div className="border-t pt-4">
                            <h3 className="font-bold text-sm text-primary mb-3 flex items-center gap-2">
                                <Lock className="h-4 w-4" /> Fechar Caixa
                            </h3>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <Label className="text-xs">Saldo Calculado (Esperado)</Label>
                                    <Input
                                        value={formatCurrency(caixaDetalhes.resumo?.saldoCalculado)}
                                        disabled
                                        className="bg-gray-100"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs">Saldo Final Informado (Contado)</Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={saldoFinal}
                                        onChange={(e) => setSaldoFinal(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <Button
                                    onClick={() => setIsConfirmOpen(true)}
                                    className="bg-primary hover:bg-primary/90"
                                    disabled={loading}
                                >
                                    <Lock className="h-4 w-4 mr-2" />
                                    Fechar Caixa
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* --- SELEÇÃO DE PERÍODO (Histórico) --- */}
            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100 bg-primary/5">
                    <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                        <Search className="h-5 w-5" /> Buscar Histórico de Fechamentos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-primary">Início do Período</Label>
                            <Input
                                type="date"
                                value={dateStart}
                                onChange={e => setDateStart(e.target.value)}
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-primary">Fim do Período</Label>
                            <Input
                                type="date"
                                value={dateEnd}
                                onChange={e => setDateEnd(e.target.value)}
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                        <Button onClick={fetchClosings} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10">
                            <Search className="h-4 w-4 mr-2" />
                            BUSCAR
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- HISTÓRICO (Tabela) --- */}
            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100 bg-white flex flex-row justify-between items-center">
                    <CardTitle className="text-base font-bold text-primary">
                        Fechamentos de Caixa Realizados
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchOpenCaixas}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            <TableRow>
                                <TableHead className="w-[80px] font-bold text-primary text-xs text-center">Ação</TableHead>
                                <TableHead className="font-bold text-primary text-xs">ID</TableHead>
                                <TableHead className="font-bold text-primary text-xs">Data de Abertura</TableHead>
                                <TableHead className="font-bold text-primary text-xs">Data de Fechamento</TableHead>
                                <TableHead className="font-bold text-primary text-xs">Operador</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-center">Status</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-right">Valor Esperado</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-right">Valor Confirmado</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-right">Diferença</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {closings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                        {dateStart && dateEnd
                                            ? "Nenhum fechamento encontrado no período selecionado."
                                            : "Selecione um período e clique em BUSCAR para ver o histórico."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                closings.map((close) => (
                                    <TableRow key={close.id} className="hover:bg-slate-50 text-xs border-b border-gray-100">
                                        <TableCell className="text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" title="Visualizar Detalhes">
                                                    <Eye className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100" title="Imprimir Comprovante">
                                                    <Printer className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-gray-600">#{close.id}</TableCell>
                                        <TableCell className="text-gray-600">{close.abertura}</TableCell>
                                        <TableCell className="text-gray-600">{close.fechamento}</TableCell>
                                        <TableCell className="font-medium uppercase text-gray-700">{close.usuario}</TableCell>
                                        <TableCell className="text-center">
                                            {getStatusBadge(close.status)}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-gray-700">{formatCurrency(close.esperado)}</TableCell>
                                        <TableCell className="text-right font-medium text-primary">{formatCurrency(close.confirmado)}</TableCell>
                                        <TableCell className={`text-right font-bold ${close.dif < 0 ? 'text-red-600' : close.dif > 0 ? 'text-primary' : 'text-gray-400'}`}>
                                            {formatCurrency(close.dif)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Modal de Confirmação */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="border-l-4 border-l-primary sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-primary">
                            <AlertTriangle className="h-5 w-5" /> Confirmar Fechamento?
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            Você está prestes a fechar o caixa #{selectedCaixa?.id}.
                            <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-md text-sm">
                                <div className="flex justify-between"><span>Saldo Esperado:</span><span className="font-medium">{formatCurrency(caixaDetalhes?.resumo?.saldoCalculado)}</span></div>
                                <div className="flex justify-between"><span>Saldo Informado:</span><span className="font-medium">{formatCurrency(parseFloat(saldoFinal))}</span></div>
                                <div className="flex justify-between border-t mt-2 pt-2">
                                    <span>Diferença:</span>
                                    <span className={`font-bold ${(parseFloat(saldoFinal) - (caixaDetalhes?.resumo?.saldoCalculado || 0)) < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {formatCurrency(parseFloat(saldoFinal) - (caixaDetalhes?.resumo?.saldoCalculado || 0))}
                                    </span>
                                </div>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleFecharCaixa} disabled={loading}>
                            <Check className="mr-2 h-4 w-4" /> Confirmar e Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}