"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    Download,
    Trophy,
    TrendingUp,
    TrendingDown,
    Minus,
    UserCheck,
    AlertTriangle,
    UserX,
    User,
    ShoppingBag,
    Info
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export default function RankingClientesPage() {
    const { toast } = useToast();
    const [selectedClient, setSelectedClient] = useState(null);
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [clients, setClients] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPurchases, setLoadingPurchases] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}`;
        api.get(`/relatorios/ranking-clientes${params}`)
            .then(res => setClients(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar ranking de clientes.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    const fetchPurchases = (clientId) => {
        setLoadingPurchases(true);
        api.get(`/relatorios/historico-cliente/${clientId}`)
            .then(res => setPurchases(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar histórico de compras.", variant: "destructive" });
            })
            .finally(() => setLoadingPurchases(false));
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        fetchPurchases(client.id);
    };

    const filteredClients = clients.filter(c =>
        c.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toString().includes(searchTerm) ||
        c.cel.includes(searchTerm)
    );

    // Helper de Tendência
    const getTrendIcon = (type) => {
        if (type === "UP") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
        if (type === "DOWN") return <TrendingDown className="h-4 w-4 text-rose-500" />;
        return <Minus className="h-4 w-4 text-slate-400" />;
    };

    // Helper de Status (Badge)
    const getStatusBadge = (status) => {
        switch (status) {
            case "ATIVO": return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">Ativo</Badge>;
            case "EM RISCO": return <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200">Em Risco</Badge>;
            case "INATIVO": return <Badge className="bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200">Inativo</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const countStatus = (status) => clients.filter(c => c.status === status).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-purple-700 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Ranking de Clientes
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Análise RFV (Recência, Frequência, Valor) e histórico de compras.
                    </p>
                </div>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white shadow-sm">
                    <Download className="h-4 w-4" /> Exportar Excel
                </Button>
            </div>

            {/* --- 1. CARDS DE STATUS RFV (Coloridos e Grandes) --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

                {/* Ativos */}
                <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-gradient-to-br from-white to-emerald-50/50">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-emerald-100 p-3 rounded-full mb-3 text-emerald-600">
                            <UserCheck className="h-6 w-6" />
                        </div>
                        <div className="text-3xl font-bold text-emerald-700">{countStatus('ATIVO')}</div>
                        <div className="text-xs font-bold text-emerald-600 uppercase tracking-wide mt-1 flex items-center gap-1">
                            Ativos <span className="opacity-70 font-normal">(≤30 dias)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Em Risco */}
                <Card className="border-l-4 border-l-amber-500 shadow-sm bg-gradient-to-br from-white to-amber-50/50">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-amber-100 p-3 rounded-full mb-3 text-amber-600">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="text-3xl font-bold text-amber-700">{countStatus('EM RISCO')}</div>
                        <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mt-1 flex items-center gap-1">
                            Em Risco <span className="opacity-70 font-normal">(31-90 dias)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Inativos */}
                <Card className="border-l-4 border-l-rose-500 shadow-sm bg-gradient-to-br from-white to-rose-50/50">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-rose-100 p-3 rounded-full mb-3 text-rose-600">
                            <UserX className="h-6 w-6" />
                        </div>
                        <div className="text-3xl font-bold text-rose-700">{countStatus('INATIVO')}</div>
                        <div className="text-xs font-bold text-rose-600 uppercase tracking-wide mt-1 flex items-center gap-1">
                            Inativos <span className="opacity-70 font-normal">(&gt;90 dias)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Sem Compras */}
                <Card className="border-l-4 border-l-slate-400 shadow-sm bg-gradient-to-br from-white to-slate-50/50">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="bg-slate-100 p-3 rounded-full mb-3 text-slate-500">
                            <User className="h-6 w-6" />
                        </div>
                        <div className="text-3xl font-bold text-slate-600">0</div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">
                            Sem Compras
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- 2. FILTROS E PESQUISA --- */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1 w-full">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Filtro de Data</span>
                            <div className="flex items-center gap-2 bg-white p-1 rounded-md border shadow-sm h-10">
                                <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="border-none shadow-none h-8" />
                                <span className="text-muted-foreground font-medium px-1">até</span>
                                <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="border-none shadow-none h-8" />
                            </div>
                        </div>

                        <div className="grid gap-1.5 flex-[2] w-full">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Pesquisar Cliente</span>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Nome, telefone ou ID..."
                                    className="pl-9 h-10"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button onClick={fetchClients} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px] h-10 font-bold">
                            <Filter className="h-4 w-4 mr-2" /> {loading ? "..." : "Filtrar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 3. TABELA PRINCIPAL (RANKING) --- */}
            <Card className="shadow-md border-muted overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[80px] font-bold text-xs text-slate-700">Id</TableHead>
                                <TableHead className="w-[100px] font-bold text-xs text-slate-700">Desde</TableHead>
                                <TableHead className="font-bold text-xs text-slate-700">Cliente</TableHead>
                                <TableHead className="font-bold text-xs text-slate-700">Cel</TableHead>
                                <TableHead className="w-[100px] font-bold text-xs text-slate-700">Ult.Compra</TableHead>
                                <TableHead className="text-center w-[60px] font-bold text-xs text-slate-700">Dias <Info className="inline h-3 w-3 text-muted-foreground" /></TableHead>
                                <TableHead className="text-center w-[100px] font-bold text-xs text-slate-700">Status</TableHead>
                                <TableHead className="text-center w-[80px] font-bold text-xs text-slate-700">Freq/Mês</TableHead>
                                <TableHead className="text-center w-[80px] font-bold text-xs text-slate-700">Tendência</TableHead>
                                <TableHead className="text-right w-[120px] font-bold text-xs text-slate-700">Compras (R$)</TableHead>
                                <TableHead className="text-center w-[100px] font-bold text-xs text-slate-700">Qtd. Compras</TableHead>
                                <TableHead className="text-right w-[100px] font-bold text-xs text-purple-700 bg-purple-50">Tkt Médio</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredClients.map((client) => (
                                <TableRow
                                    key={client.id}
                                    className={`cursor-pointer transition-colors ${selectedClient?.id === client.id ? "bg-purple-50 hover:bg-purple-100 border-l-4 border-l-purple-600" : "hover:bg-slate-50"}`}
                                    onClick={() => handleClientSelect(client)}
                                >
                                    <TableCell className="font-mono text-xs text-muted-foreground">{client.id}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{client.desde}</TableCell>
                                    <TableCell className="font-bold text-sm text-foreground">{client.cliente}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{client.cel}</TableCell>
                                    <TableCell className="text-xs">{client.ultCompra}</TableCell>
                                    <TableCell className="text-center font-bold text-xs">{client.dias}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(client.status)}</TableCell>
                                    <TableCell className="text-center text-xs">{client.freq}</TableCell>
                                    <TableCell className="text-center flex justify-center pt-3">{getTrendIcon(client.tendencia)}</TableCell>
                                    <TableCell className="text-right font-medium">R$ {client.compras.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                    <TableCell className="text-center text-xs">{client.qtd}</TableCell>
                                    <TableCell className="text-right font-bold text-purple-700 bg-purple-50">
                                        R$ {client.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* --- 4. DETALHES DE COMPRA (RODAPÉ CONDICIONAL) --- */}
            {selectedClient ? (
                <Card className="border-t-4 border-t-purple-600 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="bg-purple-50/50 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                                <ShoppingBag className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg text-purple-800">Peças Compradas</CardTitle>
                                <CardDescription>Histórico detalhado de <strong>{selectedClient.cliente}</strong></CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[100px]">Venda</TableHead>
                                        <TableHead className="w-[120px]">Data</TableHead>
                                        <TableHead>Descrição do Item</TableHead>
                                        <TableHead className="text-right w-[120px]">Preço</TableHead>
                                        <TableHead className="text-right w-[120px]">Desconto</TableHead>
                                        <TableHead className="text-right w-[120px]">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingPurchases ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4">Carregando histórico...</TableCell>
                                        </TableRow>
                                    ) : purchases.length > 0 ? (
                                        purchases.map((p, idx) => (
                                            <TableRow key={idx} className="hover:bg-slate-50">
                                                <TableCell className="font-mono text-xs text-purple-600 font-bold">#{p.venda}</TableCell>
                                                <TableCell className="text-xs">{p.data}</TableCell>
                                                <TableCell className="text-sm font-medium uppercase text-slate-700">{p.descricao}</TableCell>
                                                <TableCell className="text-right text-xs">R$ {p.preco.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-xs text-red-500">- R$ {p.desconto.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-sm font-bold text-slate-900">R$ {p.total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-4">Nenhuma compra encontrada no período.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                /* Empty State */
                <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                    <p className="text-muted-foreground text-sm">Selecione um cliente na tabela acima para ver o histórico de peças compradas.</p>
                </div>
            )}

        </div>
    );
}