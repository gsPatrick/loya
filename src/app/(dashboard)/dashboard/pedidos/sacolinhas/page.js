// src/app/dashboard/pedidos/sacolinhas/page.js
"use client";

import { useState, useEffect } from "react";
import {
    ShoppingBag,
    Search,
    Filter,
    Printer,
    FileText,
    Truck,
    PackageCheck,
    XCircle,
    Clock,
    Send,
    MoreHorizontal,
    AlertTriangle,
    Check,
    MapPin,
    Loader2
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import moment from "moment";

export default function SacolinhasPage() {
    const { toast } = useToast();
    const [sacolinhas, setSacolinhas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: "all",
        search: ""
    });

    useEffect(() => {
        loadSacolinhas();
    }, [filters]);

    const loadSacolinhas = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.search) params.search = filters.search;

            const res = await api.get('/vendas/sacolinhas', { params });
            setSacolinhas(res.data);
        } catch (err) {
            console.error(err);
            toast({
                title: "Erro ao carregar sacolinhas",
                description: "Não foi possível buscar os dados.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Helper para cores de status
    const getStatusColor = (status) => {
        switch (status) {
            case "ABERTA": return "bg-cyan-100 text-cyan-700 hover:bg-cyan-200 border-cyan-200";
            case "PRONTA": return "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200";
            case "FECHADA":
            case "FECHADA_VIRAR_PEDIDO": return "bg-green-100 text-green-700 hover:bg-green-200 border-green-200";
            case "ENVIADA": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
            case "CANCELADA": return "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    // Funções de ação
    const handleAction = async (type, id) => {
        try {
            if (type === 'fechar') {
                await api.put(`/vendas/sacolinhas/${id}/fechar`);
                toast({ title: "Sacolinha fechada", description: "Status atualizado para FECHADA." });
                loadSacolinhas();
            } else {
                toast({
                    title: "Funcionalidade em desenvolvimento",
                    description: `Ação: ${type} para sacolinha ${id}`,
                    variant: "default"
                });
            }
        } catch (err) {
            toast({
                title: "Erro na ação",
                description: err.response?.data?.error || "Ocorreu um erro.",
                variant: "destructive"
            });
        }
    };

    // Estatísticas
    const stats = {
        abertas: sacolinhas.filter(s => s.status === 'ABERTA').length,
        prontas: sacolinhas.filter(s => s.status === 'PRONTA').length,
        fechadas: sacolinhas.filter(s => s.status === 'FECHADA' || s.status === 'FECHADA_VIRAR_PEDIDO').length,
        enviadas: sacolinhas.filter(s => s.status === 'ENVIADA').length,
        canceladas: sacolinhas.filter(s => s.status === 'CANCELADA').length,
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestão de Sacolinhas</h1>
                <p className="text-sm text-muted-foreground">Controle de envios, fechamento de pacotes e logística.</p>
            </div>

            {/* --- 1. ESTATÍSTICAS --- */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-cyan-500 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" /> Abertas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.abertas}</div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-500 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Prontas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.prontas}</div>
                    </CardContent>
                </Card>

                <Card className="bg-green-600 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <PackageCheck className="h-4 w-4" /> Fechadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.fechadas}</div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-600 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <Send className="h-4 w-4" /> Enviadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.enviadas}</div>
                    </CardContent>
                </Card>

                <Card className="bg-slate-600 text-white border-none shadow-md relative overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <XCircle className="h-4 w-4" /> Canceladas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.canceladas}</div>
                    </CardContent>
                </Card>
            </div>

            {/* --- 2. FILTROS --- */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1 w-full md:w-auto">
                            <span className="text-xs font-medium text-muted-foreground">Status da Sacolinha</span>
                            <Select
                                value={filters.status}
                                onValueChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Todos os status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos</SelectItem>
                                    <SelectItem value="aberta">Aberta</SelectItem>
                                    <SelectItem value="pronta">Pronta</SelectItem>
                                    <SelectItem value="enviada">Enviada</SelectItem>
                                    <SelectItem value="fechada">Fechada</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5 flex-1 w-full md:w-auto">
                            <span className="text-xs font-medium text-muted-foreground">Cliente</span>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome..."
                                    className="pl-9"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                        </div>
                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]"
                            onClick={loadSacolinhas}
                        >
                            <Filter className="h-4 w-4 mr-2" /> Filtrar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 3. LISTAGEM --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[150px] text-center font-bold text-foreground">Logística</TableHead>
                                <TableHead>ID Sacolinha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Itens</TableHead>
                                <TableHead className="text-right">Total (R$)</TableHead>
                                <TableHead>Criada em</TableHead>
                                <TableHead>Enviada em</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : sacolinhas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                        Nenhuma sacolinha encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sacolinhas.map((sac) => (
                                    <TableRow key={sac.id} className="group hover:bg-muted/30 transition-colors">

                                        {/* === COLUNA DE AÇÕES LOGÍSTICAS (COM MODAIS) === */}
                                        <TableCell className="text-center">
                                            <TooltipProvider delayDuration={100}>
                                                <div className="flex items-center justify-center gap-1">

                                                    {/* 1. MODAL ETIQUETA (ROXO) */}
                                                    <AlertDialog>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className={`h-8 w-8 transition-all ${sac.temEtiqueta ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' : 'text-muted-foreground/40 hover:bg-purple-50 hover:text-purple-600'}`}
                                                                    >
                                                                        <Printer className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Gerar Etiqueta</p></TooltipContent>
                                                        </Tooltip>
                                                        <AlertDialogContent className="border-l-4 border-l-purple-600">
                                                            <AlertDialogHeader>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="p-2 bg-purple-100 rounded-full text-purple-600">
                                                                        <Printer className="h-6 w-6" />
                                                                    </div>
                                                                    <AlertDialogTitle className="text-purple-700">Gerar Etiqueta de Envio</AlertDialogTitle>
                                                                </div>
                                                                <AlertDialogDescription>
                                                                    Você está prestes a gerar a etiqueta ZPL para a sacolinha <strong>{sac.id}</strong> do cliente <strong>{sac.cliente?.nome}</strong>.<br /><br />
                                                                    Verifique se o endereço está atualizado antes de prosseguir.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Voltar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleAction('etiqueta', sac.id)}
                                                                    className="bg-purple-600 hover:bg-purple-700"
                                                                >
                                                                    <Printer className="mr-2 h-4 w-4" /> Gerar Etiqueta
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    {/* 2. MODAL NOTA FISCAL (VERDE) */}
                                                    <AlertDialog>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className={`h-8 w-8 transition-all ${sac.temNF ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'text-muted-foreground/40 hover:bg-green-50 hover:text-green-600'}`}
                                                                    >
                                                                        <FileText className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Emitir NF</p></TooltipContent>
                                                        </Tooltip>
                                                        <AlertDialogContent className="border-l-4 border-l-green-600">
                                                            <AlertDialogHeader>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="p-2 bg-green-100 rounded-full text-green-600">
                                                                        <FileText className="h-6 w-6" />
                                                                    </div>
                                                                    <AlertDialogTitle className="text-green-700">Emitir Nota Fiscal (NFC-e)</AlertDialogTitle>
                                                                </div>
                                                                <AlertDialogDescription>
                                                                    Confirmar emissão fiscal para <strong>{sac.cliente?.nome}</strong> no valor de <strong>R$ {sac.itens?.reduce((acc, i) => acc + parseFloat(i.preco_venda), 0).toFixed(2)}</strong>?<br /><br />
                                                                    <span className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded text-xs font-medium border border-amber-100">
                                                                        <AlertTriangle className="h-3 w-3" /> Atenção: Esta ação enviará os dados para a SEFAZ e não poderá ser desfeita facilmente.
                                                                    </span>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleAction('nf', sac.id)}
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                >
                                                                    <Check className="mr-2 h-4 w-4" /> Emitir Nota
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                    {/* 3. MODAL FRETE (AMARELO/LARANJA) */}
                                                    <AlertDialog>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className={`h-8 w-8 transition-all ${sac.freteCalculado ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'text-muted-foreground/40 hover:bg-amber-50 hover:text-amber-600'}`}
                                                                    >
                                                                        <Truck className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Calcular Frete</p></TooltipContent>
                                                        </Tooltip>
                                                        <AlertDialogContent className="border-l-4 border-l-amber-500">
                                                            <AlertDialogHeader>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                                                                        <Truck className="h-6 w-6" />
                                                                    </div>
                                                                    <AlertDialogTitle className="text-amber-700">Calcular Frete</AlertDialogTitle>
                                                                </div>
                                                                <AlertDialogDescription>
                                                                    Simular opções de envio para o endereço cadastrado de <strong>{sac.cliente?.nome}</strong>?
                                                                    <div className="mt-4 p-3 bg-muted rounded-md text-xs text-foreground flex items-start gap-2">
                                                                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                                                                        <span>Endereço de destino: {sac.cliente?.endereco || 'Endereço não cadastrado'}</span>
                                                                    </div>
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Fechar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleAction('frete', sac.id)}
                                                                    className="bg-amber-500 hover:bg-amber-600"
                                                                >
                                                                    <Search className="mr-2 h-4 w-4" /> Cotar Fretes
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>

                                                </div>
                                            </TooltipProvider>
                                        </TableCell>

                                        {/* RESTANTE DA LINHA */}
                                        <TableCell className="font-mono text-xs">{sac.id}</TableCell>
                                        <TableCell className="font-medium text-sm">{sac.cliente?.nome || 'Cliente Desconhecido'}</TableCell>

                                        <TableCell>
                                            <Badge variant="outline" className={`font-semibold border ${getStatusColor(sac.status)}`}>
                                                {sac.status}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-mono bg-muted text-foreground hover:bg-muted">
                                                {sac.itens?.length || 0}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-right font-bold text-foreground">
                                            {sac.itens?.reduce((acc, i) => acc + parseFloat(i.preco_venda), 0).toFixed(2)}
                                        </TableCell>

                                        <TableCell className="text-xs text-muted-foreground">{moment(sac.createdAt).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{sac.enviada || '-'}</TableCell>

                                        <TableCell>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="bg-muted/10 p-3 border-t text-xs text-muted-foreground flex justify-between items-center px-4">
                    <span>Mostrando {sacolinhas.length} registros</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Anterior</Button>
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Próximo</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}