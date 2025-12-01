// src/app/dashboard/pedidos/devolucao/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    RotateCcw,
    AlertTriangle,
    ArrowRightLeft,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

export default function DevolucaoPage() {
    const { toast } = useToast();
    const [soldItems, setSoldItems] = useState([]);
    const [returnedItems, setReturnedItems] = useState([]);
    const [search, setSearch] = useState("");
    const [loadingSearch, setLoadingSearch] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await api.get('/vendas/devolucoes');
            setReturnedItems(res.data);
        } catch (err) {
            console.error(err);
            toast({
                title: "Erro ao carregar histórico",
                description: "Não foi possível buscar as devoluções.",
                variant: "destructive"
            });
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSearch = async () => {
        if (!search.trim()) return;
        setLoadingSearch(true);
        try {
            const res = await api.get('/vendas/itens-vendidos', { params: { search } });
            setSoldItems(res.data);
            if (res.data.length === 0) {
                toast({
                    title: "Nenhum item encontrado",
                    description: "Verifique o código ou descrição.",
                    variant: "warning"
                });
            }
        } catch (err) {
            console.error(err);
            toast({
                title: "Erro na busca",
                description: "Não foi possível buscar os itens.",
                variant: "destructive"
            });
        } finally {
            setLoadingSearch(false);
        }
    };

    const handleDevolver = async (item) => {
        try {
            await api.post('/vendas/devolucao', { pecaId: item.pecaId });

            toast({
                title: "Devolução realizada",
                description: `Peça ${item.peca.descricao_curta} devolvida com sucesso.`,
                className: "bg-green-600 text-white border-none"
            });

            // Remove from sold list
            setSoldItems(soldItems.filter(i => i.id !== item.id));

            // Reload history
            loadHistory();

        } catch (err) {
            console.error(err);
            toast({
                title: "Erro na devolução",
                description: err.response?.data?.error || "Ocorreu um erro.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <RotateCcw className="h-6 w-6 text-primary" />
                    Devolução de Peça Vendida
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Gerencie estornos, trocas e devoluções de peças ao estoque.
                </p>
            </div>

            {/* --- SEÇÃO 1: PEÇAS DISPONÍVEIS PARA DEVOLUÇÃO --- */}
            <Card className="shadow-sm border-primary/20">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg text-primary flex items-center gap-2">
                                <ArrowRightLeft className="h-5 w-5" /> Peças Vendidas
                            </CardTitle>
                            <CardDescription>Busque a peça vendida para iniciar o processo.</CardDescription>
                        </div>
                        <div className="flex gap-2 w-full md:w-[400px]">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por ID, Cliente ou Peça..."
                                    className="pl-9 bg-background"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button onClick={handleSearch} disabled={loadingSearch}>
                                {loadingSearch ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <div className="overflow-auto max-h-[500px]">
                    <Table>
                        <TableHeader className="bg-background">
                            <TableRow>
                                <TableHead className="w-[80px]">ID Peça</TableHead>
                                <TableHead className="min-w-[200px]">Descrição</TableHead>
                                <TableHead>Vendido em</TableHead>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Venda Nº</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="text-right">Valor</TableHead>
                                <TableHead className="w-[140px] text-center">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {soldItems.length === 0 && !loadingSearch && (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        Faça uma busca para encontrar itens vendidos.
                                    </TableCell>
                                </TableRow>
                            )}
                            {soldItems.map((item) => (
                                <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                                            {item.peca?.id}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium text-xs">{item.peca?.descricao_curta || item.peca?.nome}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{moment(item.createdAt).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell className="text-xs">{item.pedido?.vendedor?.nome || '-'}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">#{item.pedido?.codigo_pedido}</TableCell>
                                    <TableCell className="text-xs font-medium text-foreground">{item.pedido?.cliente?.nome || 'Consumidor Final'}</TableCell>
                                    <TableCell className="text-right font-medium">R$ {parseFloat(item.valor_unitario_final).toFixed(2)}</TableCell>
                                    <TableCell className="text-center">

                                        {/* Modal de Confirmação */}
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button size="sm" variant="default" className="w-full h-8 font-semibold shadow-sm">
                                                    Devolver
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2 text-primary">
                                                        <AlertTriangle className="h-5 w-5" /> Confirmar Devolução?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Você está prestes a devolver a peça <strong>{item.peca?.descricao_curta}</strong>.<br /><br />
                                                        Isso irá:<br />
                                                        1. Retornar a peça ao estoque.<br />
                                                        2. Gerar crédito para o cliente <strong>{item.pedido?.cliente?.nome}</strong>.<br />
                                                        3. Estornar a comissão do fornecedor.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDevolver(item)}
                                                        className="bg-primary hover:bg-primary/90"
                                                    >
                                                        Confirmar Devolução
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* --- SEÇÃO 2: HISTÓRICO DE DEVOLUÇÕES --- */}
            <Card className="shadow-sm border-muted opacity-90 mt-8">
                <CardHeader className="bg-muted/10 pb-4 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg text-muted-foreground flex items-center gap-2">
                                <RotateCcw className="h-5 w-5" /> Histórico de Devoluções
                            </CardTitle>
                        </div>
                    </div>
                </CardHeader>

                <div className="overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID Movimento</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>ID Peça</TableHead>
                                <TableHead>Peça</TableHead>
                                <TableHead className="text-right">Motivo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loadingHistory ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : returnedItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Nenhuma devolução registrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                returnedItems.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-muted/50">
                                        <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{moment(item.data_movimento).format('DD/MM/YYYY HH:mm')}</TableCell>
                                        <TableCell className="text-xs font-medium">{item.usuario?.nome || '-'}</TableCell>
                                        <TableCell className="font-mono text-xs">{item.pecaId}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{item.peca?.descricao_curta || item.peca?.nome}</TableCell>
                                        <TableCell className="text-right font-medium text-xs text-muted-foreground">
                                            {item.motivo}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

        </div>
    );
}