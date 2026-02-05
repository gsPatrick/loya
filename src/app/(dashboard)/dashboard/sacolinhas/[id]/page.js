"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ShoppingBag, ArrowLeft, Search, Plus, Trash2, Loader2,
    User, Clock, Send, PackageCheck, XCircle, Package, Shirt
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function DetalheSacolinhaPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [sacolinha, setSacolinha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchPeca, setSearchPeca] = useState("");
    const [pecasDisponiveis, setPecasDisponiveis] = useState([]);
    const [searchingPecas, setSearchingPecas] = useState(false);
    const [addingPeca, setAddingPeca] = useState(null);
    const [removingPeca, setRemovingPeca] = useState(null);
    const [confirmRemove, setConfirmRemove] = useState(null);

    useEffect(() => {
        loadSacolinha();
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchPeca.length >= 3) {
                searchPecas(searchPeca);
            } else {
                setPecasDisponiveis([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchPeca]);

    const loadSacolinha = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/vendas/sacolinhas/${id}`);
            setSacolinha(data);
        } catch (err) {
            toast({ title: "Erro", description: "Sacolinha não encontrada.", variant: "destructive" });
            router.push('/dashboard/sacolinhas');
        } finally {
            setLoading(false);
        }
    };

    const searchPecas = async (search) => {
        setSearchingPecas(true);
        try {
            const { data } = await api.get('/cadastros/pecas', {
                params: { search, status: 'DISPONIVEL', limit: 20 }
            });
            setPecasDisponiveis(data.rows || data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setSearchingPecas(false);
        }
    };

    const handleAddItem = async (pecaId) => {
        setAddingPeca(pecaId);
        try {
            await api.post(`/vendas/sacolinhas/${id}/itens`, { pecaId });
            toast({ title: "Sucesso", description: "Peça adicionada à sacolinha!" });
            setSearchPeca("");
            setPecasDisponiveis([]);
            loadSacolinha();
        } catch (err) {
            toast({ title: "Erro", description: err.response?.data?.error || "Erro ao adicionar peça.", variant: "destructive" });
        } finally {
            setAddingPeca(null);
        }
    };

    const handleRemoveItem = async (pecaId) => {
        setRemovingPeca(pecaId);
        try {
            await api.delete(`/vendas/sacolinhas/${id}/itens/${pecaId}`);
            toast({ title: "Sucesso", description: "Peça removida da sacolinha." });
            loadSacolinha();
        } catch (err) {
            toast({ title: "Erro", description: err.response?.data?.error || "Erro ao remover peça.", variant: "destructive" });
        } finally {
            setRemovingPeca(null);
            setConfirmRemove(null);
        }
    };

    const handleUpdateStatus = async (novoStatus) => {
        try {
            await api.put(`/vendas/sacolinhas/${id}/status`, { status: novoStatus });
            toast({ title: "Sucesso", description: `Status atualizado para ${novoStatus}.` });
            loadSacolinha();
        } catch (err) {
            toast({ title: "Erro", description: err.response?.data?.error || "Erro ao atualizar status.", variant: "destructive" });
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            ABERTA: { bg: "bg-cyan-100 text-cyan-700", icon: ShoppingBag },
            PRONTA: { bg: "bg-amber-100 text-amber-700", icon: Clock },
            ENVIADA: { bg: "bg-blue-100 text-blue-700", icon: Send },
            FECHADA: { bg: "bg-green-100 text-green-700", icon: PackageCheck },
            CANCELADA: { bg: "bg-gray-100 text-gray-500", icon: XCircle }
        };
        const s = styles[status] || styles.ABERTA;
        const Icon = s.icon;
        return (
            <Badge className={`${s.bg} gap-1`}>
                <Icon className="h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!sacolinha) return null;

    const total = sacolinha.itens?.reduce((acc, i) => acc + parseFloat(i.preco_venda || 0), 0) || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/sacolinhas">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                            <ShoppingBag className="h-6 w-6" /> Sacolinha #{sacolinha.id}
                        </h1>
                        <p className="text-sm text-gray-500">Detalhes e gerenciamento da sacolinha</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {sacolinha.status === 'ABERTA' && (
                        <>
                            <Button onClick={() => handleUpdateStatus('PRONTA')} className="bg-amber-500 hover:bg-amber-600">
                                <Clock className="mr-2 h-4 w-4" /> Marcar Pronta
                            </Button>
                            <Button onClick={() => handleUpdateStatus('CANCELADA')} variant="outline" className="text-red-500 border-red-200">
                                <XCircle className="mr-2 h-4 w-4" /> Cancelar
                            </Button>
                        </>
                    )}
                    {sacolinha.status === 'PRONTA' && (
                        <Button onClick={() => handleUpdateStatus('ENVIADA')} className="bg-blue-500 hover:bg-blue-600">
                            <Send className="mr-2 h-4 w-4" /> Marcar Enviada
                        </Button>
                    )}
                    {sacolinha.status === 'ENVIADA' && (
                        <Button onClick={() => handleUpdateStatus('FECHADA')} className="bg-green-500 hover:bg-green-600">
                            <PackageCheck className="mr-2 h-4 w-4" /> Fechar Sacolinha
                        </Button>
                    )}
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Cliente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-semibold">{sacolinha.cliente?.nome}</p>
                                <p className="text-sm text-gray-500">{sacolinha.cliente?.telefone || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            {getStatusBadge(sacolinha.status)}
                            <span className="text-sm text-gray-500">
                                Criada em {new Date(sacolinha.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">Total</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-3">
                            <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
                            <Badge variant="secondary">{sacolinha.itens?.length || 0} itens</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Items Section (only if ABERTA) */}
            {sacolinha.status === 'ABERTA' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5" /> Adicionar Peças
                        </CardTitle>
                        <CardDescription>Busque peças disponíveis para adicionar à sacolinha</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por código ou descrição da peça..."
                                className="pl-9"
                                value={searchPeca}
                                onChange={(e) => setSearchPeca(e.target.value)}
                            />
                        </div>

                        {searchingPecas && (
                            <div className="text-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                            </div>
                        )}

                        {pecasDisponiveis.length > 0 && (
                            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
                                {pecasDisponiveis.map((peca) => (
                                    <div key={peca.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                <Shirt className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{peca.codigo_etiqueta}</p>
                                                <p className="text-sm text-gray-500">{peca.descricao_curta}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-primary">{formatCurrency(peca.preco_venda)}</span>
                                            <Button
                                                size="sm"
                                                onClick={() => handleAddItem(peca.id)}
                                                disabled={addingPeca === peca.id}
                                            >
                                                {addingPeca === peca.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Plus className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {searchPeca.length >= 3 && !searchingPecas && pecasDisponiveis.length === 0 && (
                            <p className="text-center text-gray-500 py-4">Nenhuma peça disponível encontrada.</p>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Items Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" /> Itens da Sacolinha
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Código</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Cor</TableHead>
                                <TableHead className="text-right">Preço</TableHead>
                                {sacolinha.status === 'ABERTA' && <TableHead className="w-[60px]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!sacolinha.itens?.length ? (
                                <TableRow>
                                    <TableCell colSpan={sacolinha.status === 'ABERTA' ? 6 : 5} className="h-32 text-center text-gray-500">
                                        Nenhum item adicionado ainda.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sacolinha.itens.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-mono text-sm">{item.codigo_etiqueta}</TableCell>
                                        <TableCell>{item.descricao_curta || '-'}</TableCell>
                                        <TableCell>{item.tamanho?.nome || item.tamanho || '-'}</TableCell>
                                        <TableCell>{item.cor?.nome || item.cor || '-'}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatCurrency(item.preco_venda)}</TableCell>
                                        {sacolinha.status === 'ABERTA' && (
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => setConfirmRemove(item)}
                                                    disabled={removingPeca === item.id}
                                                >
                                                    {removingPeca === item.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Total Footer */}
                    <div className="border-t p-4 bg-muted/30 flex justify-between items-center">
                        <span className="text-gray-500">{sacolinha.itens?.length || 0} itens</span>
                        <div className="text-right">
                            <span className="text-sm text-gray-500">Total:</span>
                            <span className="ml-2 text-xl font-bold text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirm Remove Dialog */}
            <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Deseja remover a peça <strong>{confirmRemove?.codigo_etiqueta}</strong> da sacolinha?
                            A peça voltará a ficar disponível para venda.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => handleRemoveItem(confirmRemove.id)}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
