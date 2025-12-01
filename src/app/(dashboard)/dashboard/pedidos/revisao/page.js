// src/app/dashboard/pedidos/revisao/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    FileText,
    AlertOctagon,
    Calendar as CalendarIcon,
    Filter,
    Download,
    ChevronDown,
    ShoppingBag,
    CreditCard,
    User,
    X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function RevisaoPedidosPage() {
    const { toast } = useToast();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        setLoading(true);
        let params = "";
        if (dateStart && dateEnd) params += `?inicio=${dateStart}&fim=${dateEnd}`;
        if (searchTerm) params += params ? `&search=${searchTerm}` : `?search=${searchTerm}`;

        api.get(`/vendas/pedidos${params}`)
            .then(res => setOrders(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao buscar pedidos.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Histórico de Vendas</h1>
                    <p className="text-sm text-muted-foreground">Consulte, baixe PDFs ou realize estornos de vendas passadas.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" /> Exportar Relatório
                    </Button>
                </div>
            </div>

            {/* --- 1. FILTROS (Card Limpo) --- */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1">
                            <span className="text-xs font-medium text-muted-foreground">Período</span>
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                                </div>
                                <span className="text-muted-foreground">-</span>
                                <div className="relative flex-1">
                                    <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-1.5 flex-1">
                            <span className="text-xs font-medium text-muted-foreground">Buscar</span>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Pesquisar por ID, Cliente ou Vendedor..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button onClick={fetchOrders} disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]">
                            <Filter className="h-4 w-4 mr-2" /> {loading ? "..." : "Filtrar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. TABELA PRINCIPAL --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Vendedor(a)</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Pagamento</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">Carregando...</TableCell>
                                </TableRow>
                            ) : orders.length > 0 ? (
                                orders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className={`cursor-pointer transition-colors ${selectedOrder?.id === order.id ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted/50"}`}
                                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                                    >
                                        <TableCell className="font-mono font-medium text-primary">#{order.codigo || order.id}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{order.data}</TableCell>
                                        <TableCell className="text-sm">{order.vendedor}</TableCell>
                                        <TableCell className="text-sm font-medium">{order.cliente}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal text-xs border-primary/20 text-primary bg-primary/10">
                                                {order.pagamento}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-foreground">
                                            R$ {order.valor.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Ver PDF">
                                                    <FileText className="h-4 w-4" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-medium">
                                                    Estornar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-4">Nenhum pedido encontrado.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {/* Paginação simples */}
                <div className="bg-muted/20 border-t p-3 flex justify-between items-center px-6 text-xs text-muted-foreground">
                    <span>Mostrando {orders.length} registros</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Anterior</Button>
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Próximo</Button>
                    </div>
                </div>
            </Card>

            {/* --- 3. DETALHES DA SELEÇÃO (Aparece embaixo ao clicar) --- */}
            {selectedOrder && (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center justify-between mb-4 mt-8">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                            <ShoppingBag className="h-5 w-5" /> Detalhes da Venda #{selectedOrder.codigo || selectedOrder.id}
                        </h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(null)} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4 mr-1" /> Fechar Detalhes
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* Coluna 1: Lista de Peças */}
                        <Card className="md:col-span-2 border-l-4 border-l-primary shadow-md">
                            <CardHeader className="bg-muted/10 pb-3">
                                <CardTitle className="text-base text-foreground">Itens Vendidos</CardTitle>
                                <CardDescription>Peças que saíram do estoque nesta operação.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Peça</TableHead>
                                            <TableHead>Fornecedor (Consignação)</TableHead>
                                            <TableHead className="text-right">Preço</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedOrder.itens.map((item, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                                                <TableCell className="font-medium text-sm">{item.desc}</TableCell>
                                                <TableCell className="text-xs text-primary">{item.fornecedor}</TableCell>
                                                <TableCell className="text-right font-medium">R$ {item.preco.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                            <CardFooter className="bg-muted/10 justify-end py-3 border-t">
                                <div className="flex gap-4 text-sm">
                                    <span className="text-muted-foreground">Qtd: <strong className="text-foreground">{selectedOrder.itens.length}</strong></span>
                                    <span className="text-muted-foreground">Subtotal: <strong className="text-foreground">R$ {selectedOrder.valor.toFixed(2)}</strong></span>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Coluna 2: Financeiro */}
                        <Card className="md:col-span-1 border-l-4 border-l-green-500 shadow-md h-fit">
                            <CardHeader className="bg-muted/10 pb-3">
                                <CardTitle className="text-base text-foreground flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Pagamento
                                </CardTitle>
                                <CardDescription>Dados da transação financeira.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">

                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">Forma</span>
                                    <Badge variant="outline" className="uppercase font-bold border-green-200 text-green-700 bg-green-50">
                                        {selectedOrder.pagamento}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center border-b pb-2">
                                    <span className="text-sm text-muted-foreground">Data</span>
                                    <span className="text-sm font-medium">{selectedOrder.data}</span>
                                </div>

                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm font-bold text-foreground">Valor Recebido</span>
                                    <span className="text-xl font-bold text-green-600">R$ {selectedOrder.valor.toFixed(2)}</span>
                                </div>

                                <div className="pt-4 mt-4 bg-yellow-50 p-3 rounded-md border border-yellow-100">
                                    <div className="flex items-start gap-2">
                                        <AlertOctagon className="h-4 w-4 text-yellow-600 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-yellow-700">Atenção ao Estornar</p>
                                            <p className="text-[10px] text-yellow-600 leading-tight">
                                                Ao estornar, o valor será debitado do caixa do dia e as peças voltarão para &quot;À Venda&quot;.
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="destructive" className="w-full mt-3 h-8 text-xs shadow-none">
                                        Confirmar Estorno
                                    </Button>
                                </div>

                            </CardContent>
                        </Card>

                    </div>
                </div>
            )}
        </div>
    );
}