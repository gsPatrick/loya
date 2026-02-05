"use client";

import { useState, useEffect } from "react";
import {
    ShoppingBag, Search, Plus, Eye, Edit, Trash2, Send,
    PackageCheck, Clock, XCircle, MoreHorizontal, Loader2, RefreshCw, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SacolinhasPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [sacolinhas, setSacolinhas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: "all", search: "" });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, sacolinha: null });

    useEffect(() => {
        loadSacolinhas();
    }, []);

    const loadSacolinhas = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.search) params.search = filters.search;
            const { data } = await api.get('/vendas/sacolinhas', { params });
            setSacolinhas(data || []);
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Não foi possível carregar as sacolinhas.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, novoStatus) => {
        try {
            await api.put(`/vendas/sacolinhas/${id}/status`, { status: novoStatus });
            toast({ title: "Sucesso", description: `Status atualizado para ${novoStatus}.` });
            loadSacolinhas();
        } catch (err) {
            toast({ title: "Erro", description: err.response?.data?.error || "Erro ao atualizar status.", variant: "destructive" });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            ABERTA: "bg-cyan-100 text-cyan-700 border-cyan-200",
            PRONTA: "bg-amber-100 text-amber-700 border-amber-200",
            ENVIADA: "bg-blue-100 text-blue-700 border-blue-200",
            FECHADA: "bg-green-100 text-green-700 border-green-200",
            FECHADA_VIRAR_PEDIDO: "bg-green-100 text-green-700 border-green-200",
            CANCELADA: "bg-gray-100 text-gray-500 border-gray-200"
        };
        const labels = {
            ABERTA: "Aberta",
            PRONTA: "Pronta",
            ENVIADA: "Enviada",
            FECHADA: "Fechada",
            FECHADA_VIRAR_PEDIDO: "Fechada",
            CANCELADA: "Cancelada"
        };
        return <Badge variant="outline" className={styles[status] || "bg-gray-100"}>{labels[status] || status}</Badge>;
    };

    const stats = {
        abertas: sacolinhas.filter(s => s.status === 'ABERTA').length,
        prontas: sacolinhas.filter(s => s.status === 'PRONTA').length,
        enviadas: sacolinhas.filter(s => s.status === 'ENVIADA').length,
        fechadas: sacolinhas.filter(s => ['FECHADA', 'FECHADA_VIRAR_PEDIDO'].includes(s.status)).length,
    };

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6" /> Gestão de Sacolinhas
                    </h1>
                    <p className="text-sm text-gray-500">Controle de sacolinhas de clientes para envio</p>
                </div>
                <Link href="/dashboard/sacolinhas/nova">
                    <Button className="bg-primary hover:bg-primary/90">
                        <Plus className="mr-2 h-4 w-4" /> Nova Sacolinha
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-cyan-500 text-white border-none shadow-md">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" /> Abertas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.abertas}</div>
                    </CardContent>
                </Card>

                <Card className="bg-amber-500 text-white border-none shadow-md">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Prontas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.prontas}</div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-600 text-white border-none shadow-md">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <Send className="h-4 w-4" /> Enviadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.enviadas}</div>
                    </CardContent>
                </Card>

                <Card className="bg-green-600 text-white border-none shadow-md">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-medium opacity-90 uppercase tracking-wider flex items-center gap-2">
                            <PackageCheck className="h-4 w-4" /> Fechadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <div className="text-3xl font-bold">{stats.fechadas}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por cliente..."
                                    className="pl-9"
                                    value={filters.search}
                                    onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                                />
                            </div>
                        </div>
                        <Select value={filters.status} onValueChange={(v) => setFilters(p => ({ ...p, status: v }))}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="aberta">Abertas</SelectItem>
                                <SelectItem value="pronta">Prontas</SelectItem>
                                <SelectItem value="enviada">Enviadas</SelectItem>
                                <SelectItem value="fechada">Fechadas</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={loadSacolinhas} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="text-center">Itens</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Rastreio</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Criada em</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
                                    </TableCell>
                                </TableRow>
                            ) : sacolinhas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                        Nenhuma sacolinha encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sacolinhas.map((sac) => (
                                    <TableRow key={sac.id} className="hover:bg-muted/30">
                                        <TableCell className="font-mono text-xs">#{sac.id}</TableCell>
                                        <TableCell className="font-medium">{sac.cliente?.nome || 'Cliente'}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{sac.itens?.length || 0}</Badge>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(sac.status)}</TableCell>
                                        <TableCell>
                                            {sac.codigo_rastreio ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="font-mono cursor-pointer hover:bg-secondary/80 gap-1"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(sac.codigo_rastreio);
                                                        toast({ title: "Copiado!", description: "Código de rastreio copiado para a área de transferência." });
                                                    }}
                                                >
                                                    <Copy className="h-3 w-3" /> {sac.codigo_rastreio}
                                                </Badge>
                                            ) : (
                                                <span className="text-gray-300 text-xs">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(sac.itens?.reduce((acc, i) => acc + parseFloat(i.preco_venda || 0), 0))}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {new Date(sac.createdAt).toLocaleDateString('pt-BR')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => router.push(`/dashboard/sacolinhas/${sac.id}`)}>
                                                        <Eye className="mr-2 h-4 w-4" /> Ver Detalhes
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {sac.status === 'ABERTA' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(sac.id, 'PRONTA')}>
                                                            <Clock className="mr-2 h-4 w-4 text-amber-600" />
                                                            <span className="text-amber-600">Marcar como Pronta</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {sac.status === 'PRONTA' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(sac.id, 'ENVIADA')}>
                                                            <Send className="mr-2 h-4 w-4 text-blue-600" />
                                                            <span className="text-blue-600">Marcar como Enviada</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {sac.status === 'ENVIADA' && (
                                                        <DropdownMenuItem onClick={() => handleUpdateStatus(sac.id, 'FECHADA')}>
                                                            <PackageCheck className="mr-2 h-4 w-4 text-green-600" />
                                                            <span className="text-green-600">Marcar como Fechada</span>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {sac.status === 'ABERTA' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleUpdateStatus(sac.id, 'CANCELADA')}
                                                                className="text-red-600"
                                                            >
                                                                <XCircle className="mr-2 h-4 w-4" /> Cancelar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
