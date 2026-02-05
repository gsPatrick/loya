"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ShoppingBag, ArrowLeft, Search, Plus, Trash2, Loader2,
    User, Clock, Send, PackageCheck, XCircle, Package, Shirt, Barcode
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

    // PDV-style search
    const [barcodeInput, setBarcodeInput] = useState("");
    const [productSuggestions, setProductSuggestions] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [isSearchingProduct, setIsSearchingProduct] = useState(false);
    const barcodeInputRef = useRef(null);

    const [addingPeca, setAddingPeca] = useState(null);
    const [removingPeca, setRemovingPeca] = useState(null);
    const [confirmRemove, setConfirmRemove] = useState(null);

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

    // Focus barcode input when sacolinha is open
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
            setAllProducts(data || []);
        } catch (err) {
            console.error("Erro ao carregar produtos", err);
        }
    };

    // PDV-style search on Enter
    const handleSearchProduct = async () => {
        if (!barcodeInput.trim()) return;

        setIsSearchingProduct(true);
        try {
            const res = await api.get('/catalogo/pecas', {
                params: { search: barcodeInput }
            });
            const foundProducts = res.data;

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

            // STRICT SEARCH LOGIC (same as PDV)
            if (upperInput.startsWith("TAG-")) {
                product = foundProducts.find(p => p.codigo_etiqueta && p.codigo_etiqueta.toUpperCase() === upperInput);
            } else {
                const numericId = parseInt(rawInput, 10);
                const isNumeric = !isNaN(numericId) && /^\d+$/.test(rawInput);

                if (isNumeric) {
                    product = foundProducts.find(p => p.id === numericId);
                } else {
                    if (foundProducts.length === 1) {
                        product = foundProducts[0];
                    }
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

            // Validate product
            if (product.status !== 'DISPONIVEL') {
                toast({
                    title: "Peça indisponível",
                    description: `Esta peça está com status ${product.status}.`,
                    variant: "destructive"
                });
                setBarcodeInput("");
                return;
            }

            // Check if already in sacolinha
            if (sacolinha.itens?.find(i => i.id === product.id)) {
                toast({
                    title: "Item já adicionado",
                    description: "Esta peça já está na sacolinha.",
                    variant: "warning"
                });
                setBarcodeInput("");
                return;
            }

            // Add item
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

    // Real-time suggestions filtering
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
            // Only show DISPONIVEL items
            if (p.status !== 'DISPONIVEL') return false;
            // Exclude items already in sacolinha
            if (sacolinha?.itens?.find(i => i.id === p.id)) return false;

            // ID Match
            if (isNumeric) {
                const idString = String(p.id);
                const paddedId = idString.padStart(4, '0');
                if (idString.includes(value) || paddedId.includes(value)) {
                    return true;
                }
            }

            // TAG Match
            if (isTagSearch) {
                return (
                    (p.codigo_etiqueta && p.codigo_etiqueta.toLowerCase().includes(searchLower)) ||
                    (p.sku_ecommerce && p.sku_ecommerce.toLowerCase().includes(searchLower))
                );
            }

            // Description match
            return p.descricao_curta && p.descricao_curta.toLowerCase().includes(searchLower);
        }).slice(0, 10);

        setProductSuggestions(filtered);
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

    const handleSuggestionClick = async (product) => {
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
            </div>

            {/* PDV-style Add Items Section (only if ABERTA) */}
            {sacolinha.status === 'ABERTA' && (
                <Card className="border-2 border-primary/20">
                    <CardHeader className="bg-primary/5">
                        <CardTitle className="flex items-center gap-2">
                            <Barcode className="h-5 w-5" /> Adicionar Peças
                        </CardTitle>
                        <CardDescription>
                            Digite o código, ID ou TAG e pressione Enter. Use o leitor de código de barras para adicionar rapidamente.
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
                                                    <Shirt className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-base">{p.descricao_curta}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        ID: {String(p.id).padStart(4, '0')} | TAG: {p.codigo_etiqueta || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-primary">{formatCurrency(p.preco_venda)}</span>
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
                                        Nenhum item adicionado ainda. Use a busca acima para adicionar peças.
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
