"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ShoppingBag, ArrowLeft, Search, Plus, Trash2, Loader2,
    User, Clock, Send, PackageCheck, XCircle, Package, Shirt, Barcode, Save, Eye, AlertTriangle, RefreshCw, Copy, Edit
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
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function DetalheSacolinhaPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [sacolinha, setSacolinha] = useState(null);
    const [loading, setLoading] = useState(true);

    // PDV-style search
    const [barcodeInput, setBarcodeInput] = useState("");
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [isSearchingProduct, setIsSearchingProduct] = useState(false);
    const barcodeInputRef = useRef(null);

    const [addingPeca, setAddingPeca] = useState(null);
    const [removingPeca, setRemovingPeca] = useState(null);
    const [confirmRemove, setConfirmRemove] = useState(null);

    // Restock Modal State
    const [restockModalOpen, setRestockModalOpen] = useState(false);
    const [productToRestock, setProductToRestock] = useState(null);

    // Tracking Code State
    const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
    const [trackingCodeInput, setTrackingCodeInput] = useState("");

    // Price Edit State
    const [editingPricePeca, setEditingPricePeca] = useState(null);
    const [newPriceInput, setNewPriceInput] = useState("");
    const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

    // Beep sound
    const playBeep = () => {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = 1200;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio not supported');
        }
    };

    useEffect(() => {
        loadSacolinha();
        loadAllProducts();
    }, [id]);

    useEffect(() => {
        if (sacolinha?.status === 'ABERTA' && barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    }, [sacolinha]);

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

    const loadAllProducts = async () => {
        try {
            const { data } = await api.get('/catalogo/pecas', {
                params: { limit: 10000 }
            });
            setAllProducts(data.data || data || []);
        } catch (err) {
            console.error("Erro ao carregar produtos", err);
        }
    };

    const handleAddItem = async (pecaId) => {
        setAddingPeca(pecaId);
        try {
            await api.post(`/vendas/sacolinhas/${id}/itens`, { pecaId });
            toast({
                title: "✓ Peça adicionada!",
                description: "Item adicionado à sacolinha.",
                className: "bg-green-600 text-white border-none"
            });
            loadSacolinha();
        } catch (err) {
            toast({ title: "Erro", description: err.response?.data?.error || "Erro ao adicionar peça.", variant: "destructive" });
        } finally {
            setAddingPeca(null);
        }
    };

    const handleSearchProduct = async () => {
        if (!barcodeInput.trim()) return;

        setIsSearchingProduct(true);
        try {
            const res = await api.get('/catalogo/pecas', {
                params: { search: barcodeInput }
            });
            const foundProducts = res.data.data || res.data;

            if (foundProducts.length === 0) {
                toast({
                    title: "Produto não encontrado",
                    description: "Nenhum produto encontrado com este código ou nome.",
                    variant: "destructive"
                });
                setBarcodeInput("");
                return;
            }

            const rawInput = barcodeInput.trim();
            const upperInput = rawInput.toUpperCase();
            let product = null;

            if (upperInput.startsWith("TAG-")) {
                product = foundProducts.find(p => p.codigo_etiqueta && p.codigo_etiqueta.toUpperCase() === upperInput);
            } else {
                const numericId = parseInt(rawInput, 10);
                const isNumeric = !isNaN(numericId) && /^\d+$/.test(rawInput);
                if (isNumeric) {
                    product = foundProducts.find(p => p.id === numericId);
                } else if (foundProducts.length === 1) {
                    product = foundProducts[0];
                }
            }

            if (!product) {
                if (foundProducts.length > 1) {
                    toast({
                        title: "Múltiplos produtos encontrados",
                        description: "Use a lista de sugestões para selecionar o item correto.",
                        variant: "warning"
                    });
                } else {
                    toast({
                        title: "Produto não identificado",
                        description: "Verifique se digitou o ID ou TAG corretamente.",
                        variant: "destructive"
                    });
                }
                return;
            }

            if (product.status !== 'DISPONIVEL' || product.quantidade <= 0) {
                setProductToRestock(product);
                setRestockModalOpen(true);
                return;
            }

            if (sacolinha.itens?.find(i => i.id === product.id)) {
                toast({
                    title: "Item já adicionado",
                    description: "Esta peça já está na sacolinha.",
                    variant: "warning"
                });
                setBarcodeInput("");
                return;
            }

            await handleAddItem(product.id);
            playBeep();
            setBarcodeInput("");
            setProductSuggestions([]);

        } catch (err) {
            console.error(err);
            toast({
                title: "Erro ao buscar produto",
                description: "Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsSearchingProduct(false);
            if (barcodeInputRef.current) barcodeInputRef.current.focus();
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setBarcodeInput(value);

        if (value.length < 2) {
            setProductSuggestions([]);
            return;
        }

        const searchLower = value.toLowerCase();
        const upperValue = value.toUpperCase();
        const isTagSearch = upperValue.startsWith("TAG-") || upperValue.startsWith("TAG");
        const numericId = parseInt(value, 10);
        const isNumeric = !isNaN(numericId) && /^\d+$/.test(value);

        const filtered = allProducts.filter(p => {
            if (sacolinha?.itens?.find(i => i.id === p.id)) return false;

            if (isNumeric) {
                const idString = String(p.id);
                if (idString.includes(value) || idString.padStart(4, '0').includes(value)) return true;
            }

            if (isTagSearch) {
                return (p.codigo_etiqueta && p.codigo_etiqueta.toLowerCase().includes(searchLower)) ||
                    (p.sku_ecommerce && p.sku_ecommerce.toLowerCase().includes(searchLower));
            }

            return p.descricao_curta && p.descricao_curta.toLowerCase().includes(searchLower);
        }).slice(0, 10);

        setProductSuggestions(filtered);
    };

    const handleSuggestionClick = async (product) => {
        if (product.status !== 'DISPONIVEL' || product.quantidade <= 0) {
            setProductToRestock(product);
            setRestockModalOpen(true);
            return;
        }
        await handleAddItem(product.id);
        playBeep();
        setBarcodeInput("");
        setProductSuggestions([]);
        if (barcodeInputRef.current) barcodeInputRef.current.focus();
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

    const handleUpdateStatus = async (novoStatus, codigo_rastreio = null) => {
        try {
            await api.put(`/vendas/sacolinhas/${id}/status`, {
                status: novoStatus,
                codigo_rastreio: codigo_rastreio
            });
            toast({ title: "Sucesso", description: `Status atualizado para ${novoStatus}.` });
            loadSacolinha();
            setTrackingDialogOpen(false);
            setTrackingCodeInput("");
        } catch (err) {
            toast({ title: "Erro", description: err.response?.data?.error || "Erro ao atualizar status.", variant: "destructive" });
        }
    };

    const handleUpdatePrice = async () => {
        if (!editingPricePeca) return;
        setIsUpdatingPrice(true);
        try {
            // Remove currency formatting if user pasted it
            const cleanPrice = String(newPriceInput)
                .replace('R$', '')
                .replace(/\./g, '')
                .replace(',', '.')
                .trim();

            await api.put(`/vendas/sacolinhas/${id}/itens/${editingPricePeca.id}/preco`, {
                preco: parseFloat(cleanPrice)
            });
            toast({ title: "Sucesso", description: "Preço atualizado." });
            loadSacolinha();
            setEditingPricePeca(null);
        } catch (err) {
            toast({ title: "Erro", description: "Erro ao atualizar preço.", variant: "destructive" });
        } finally {
            setIsUpdatingPrice(false);
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

    const total = sacolinha.itens?.reduce((acc, i) => acc + parseFloat(i.preco_venda_sacolinha || i.preco_venda || 0), 0) || 0;

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
                            <Button onClick={() => setTrackingDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600">
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
                    {sacolinha.status !== 'ABERTA' && (
                        <Button onClick={() => handleUpdateStatus('ABERTA')} variant="outline" className="text-cyan-600 border-cyan-200">
                            <RefreshCw className="mr-2 h-4 w-4" /> Reabrir
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
                                <p className="text-sm text-gray-500">{sacolinha.cliente?.telefone_whatsapp || '-'}</p>
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

                {sacolinha.status !== 'ABERTA' && (
                    <Card className={`md:col-span-3 border-amber-200 ${sacolinha.codigo_rastreio ? 'bg-amber-50' : 'bg-white border-dashed'}`}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${sacolinha.codigo_rastreio ? 'bg-amber-200 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                                    <Send className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-amber-600 font-bold uppercase tracking-wider">Código de Rastreio</p>
                                    {sacolinha.codigo_rastreio ? (
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-mono font-bold text-amber-900">{sacolinha.codigo_rastreio}</p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-200/50"
                                                onClick={() => {
                                                    setTrackingCodeInput(sacolinha.codigo_rastreio);
                                                    setTrackingDialogOpen(true);
                                                }}
                                            >
                                                <Edit className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">Não informado</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {sacolinha.codigo_rastreio ? (
                                    <Button
                                        variant="outline"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-100 gap-2"
                                        onClick={() => {
                                            navigator.clipboard.writeText(sacolinha.codigo_rastreio);
                                            toast({ title: "Copiado!", description: "Código de rastreio copiado." });
                                        }}
                                    >
                                        <Copy className="h-4 w-4" /> Copiar Código
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-50 gap-2"
                                        onClick={() => {
                                            setTrackingCodeInput("");
                                            setTrackingDialogOpen(true);
                                        }}
                                    >
                                        <Plus className="h-4 w-4" /> Adicionar Rastreio
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* PDV-style Add Items Section (only if ABERTA) */}
            {sacolinha.status === 'ABERTA' && (
                <Card className="border-2 border-primary/20">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="flex items-center gap-2">
                            <Barcode className="h-5 w-5" /> Adicionar Peças
                        </CardTitle>
                        <CardDescription>
                            Digite o código, ID ou TAG e pressione Enter. Peças sem estoque aparecerão em vermelho e podem ser repostas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                ref={barcodeInputRef}
                                placeholder="Código, ID ou TAG da peça... (Enter para adicionar)"
                                className="pl-10 h-12 text-lg"
                                value={barcodeInput}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearchProduct();
                                }}
                                autoFocus
                            />
                            {isSearchingProduct && (
                                <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-primary" />
                            )}

                            {/* Suggestions Dropdown */}
                            {productSuggestions.length > 0 && (
                                <div className="absolute top-full left-0 w-full bg-white border shadow-lg rounded-md mt-1 z-50 max-h-[300px] overflow-auto">
                                    {productSuggestions.map(p => (
                                        <div
                                            key={p.id}
                                            className="p-3 hover:bg-primary/5 cursor-pointer border-b last:border-none flex justify-between items-center"
                                            onClick={() => handleSuggestionClick(p)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                                                    <Shirt className={`h-5 w-5 ${p.status !== 'DISPONIVEL' || p.quantidade <= 0 ? 'text-red-400' : 'text-gray-400'}`} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-medium text-base ${p.status !== 'DISPONIVEL' || p.quantidade <= 0 ? 'text-red-600' : ''}`}>
                                                        {p.descricao_curta}
                                                        {(p.status !== 'DISPONIVEL' || p.quantidade <= 0) && (
                                                            <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full uppercase font-bold">
                                                                Sem Estoque
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ID: {String(p.id).padStart(4, '0')} | TAG: {p.codigo_etiqueta || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`font-bold ${p.status !== 'DISPONIVEL' || p.quantidade <= 0 ? 'text-red-600' : 'text-primary'}`}>
                                                    {formatCurrency(p.preco_venda)}
                                                </span>
                                                {p.tamanho && <Badge variant="outline">{p.tamanho.nome || p.tamanho}</Badge>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
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
                                        <TableCell className="text-right font-semibold">
                                            <div className="flex flex-col items-end">
                                                <span className={item.preco_venda_sacolinha ? "text-amber-600" : ""}>
                                                    {formatCurrency(item.preco_venda_sacolinha || item.preco_venda)}
                                                </span>
                                                {item.preco_venda_sacolinha && (
                                                    <span className="text-xs text-gray-400 line-through">
                                                        {formatCurrency(item.preco_venda)}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        {sacolinha.status === 'ABERTA' && (
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
                                                        onClick={() => {
                                                            setEditingPricePeca(item);
                                                            setNewPriceInput(item.preco_venda_sacolinha || item.preco_venda);
                                                        }}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
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
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
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

            {/* Informational Restock Modal */}
            <Dialog open={restockModalOpen} onOpenChange={setRestockModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Produto sem Estoque
                        </DialogTitle>
                        <DialogDescription>
                            O produto <strong>{productToRestock?.descricao_curta}</strong> está sem unidades disponíveis no sistema (Status: {productToRestock?.status}).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 text-center space-y-4">
                        <p className="text-sm text-gray-500">
                            Para adicionar este item à sacolinha, você precisa primeiro repor o estoque ou alterar o status dele no cadastro de peças.
                        </p>
                    </div>
                    <DialogFooter className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={() => setRestockModalOpen(false)} className="sm:flex-1">
                            Fechar
                        </Button>
                        <Link href={`/dashboard/cadastros/pecas-cadastro?search=${productToRestock?.id}`} className="sm:flex-1">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Eye className="mr-2 h-4 w-4" /> Ver Produto
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Tracking Code Dialog */}
            <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Informar Código de Rastreio</DialogTitle>
                        <DialogDescription>
                            A sacolinha será marcada como <strong>PRONTA</strong>. Opcionalmente, informe o código de rastreio para o cliente.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="tracking-code">Código de Rastreio</Label>
                        <Input
                            id="tracking-code"
                            placeholder="Ex: BR123456789BR"
                            value={trackingCodeInput}
                            onChange={(e) => setTrackingCodeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateStatus('PRONTA', trackingCodeInput);
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={() => handleUpdateStatus(sacolinha.status, trackingCodeInput)} className="bg-amber-500 hover:bg-amber-600">
                            Salvar Rastreio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Price Edit Dialog */}
            <Dialog open={!!editingPricePeca} onOpenChange={() => setEditingPricePeca(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar Preço do Item</DialogTitle>
                        <DialogDescription>
                            Defina o preço negociado para este item nesta sacolinha.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center">
                                <Shirt className="h-6 w-6 text-gray-500" />
                            </div>
                            <div>
                                <p className="font-semibold">{editingPricePeca?.descricao_curta}</p>
                                <p className="text-sm text-gray-500">{editingPricePeca?.codigo_etiqueta}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Preço Negociado (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={newPriceInput}
                                onChange={(e) => setNewPriceInput(e.target.value)}
                                placeholder="0.00"
                            />
                            <p className="text-xs text-gray-500">
                                Preço Original: {formatCurrency(editingPricePeca?.preco_venda)}
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingPricePeca(null)}>Cancelar</Button>
                        <Button onClick={handleUpdatePrice} disabled={isUpdatingPrice} className="bg-amber-600 hover:bg-amber-700">
                            {isUpdatingPrice ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Preço"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}
