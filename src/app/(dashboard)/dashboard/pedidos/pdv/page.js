// src/app/dashboard/pedidos/pdv/page.js
"use client";

import { useState, useEffect, useRef } from "react";
import {
    Search,
    User,
    Barcode,
    Trash2,
    CreditCard,
    Banknote,
    Plus,
    RotateCcw,
    Save,
    Truck,
    MoreHorizontal,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function PDVPage() {
    const { toast } = useToast();

    // --- STATE ---
    const [items, setItems] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [selectedSeller, setSelectedSeller] = useState("");
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(""); // ID or Object? Let's store ID
    const [clientSearch, setClientSearch] = useState("");

    // Product Search
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isSearchingProduct, setIsSearchingProduct] = useState(false);

    // Checkout
    const [descontoTipo, setDescontoTipo] = useState("percent");
    const [descontoValor, setDescontoValor] = useState(0);
    const [frete, setFrete] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("DINHEIRO"); // Default
    const [isProcessing, setIsProcessing] = useState(false);

    const barcodeInputRef = useRef(null);

    // --- EFFECTS ---
    useEffect(() => {
        loadInitialData();
    }, []);

    // Focus barcode input on mount
    useEffect(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    }, []);

    const loadInitialData = async () => {
        try {
            // Fetch Sellers (Users) - assuming /users endpoint or similar. 
            // If not available, we might need to use a specific endpoint.
            // Let's try /usuarios if exists, or just mock for now if not sure.
            // Actually, we can use /pessoas?is_vendedor=true if that concept exists, or just current user.
            // For now, let's assume we can get users. If not, I'll check routes.
            // I'll check /usuarios route existence later. For now, I'll try to fetch from /pessoas (maybe sellers are there?)
            // Or just use a static list if I can't find it.
            // Wait, `VendasService` uses `userId` from token.
            // But the UI allows selecting a seller.
            // I'll leave seller selection as "Loja" (current user) for now or try to fetch.

            // Fetch Clients
            const clientsRes = await api.get('/pessoas?is_cliente=true');
            setClients(clientsRes.data);

        } catch (err) {
            console.error("Erro ao carregar dados iniciais", err);
        }
    };

    // --- ACTIONS ---

    const handleSearchProduct = async () => {
        if (!barcodeInput.trim()) return;

        setIsSearchingProduct(true);
        try {
            // Search by barcode (codigo_etiqueta) or name
            const res = await api.get('/catalogo/pecas', {
                params: { search: barcodeInput, status: 'DISPONIVEL' }
            });

            const foundProducts = res.data;

            if (foundProducts.length === 0) {
                toast({
                    title: "Produto não encontrado",
                    description: "Nenhum produto disponível com este código ou nome.",
                    variant: "destructive"
                });
                setBarcodeInput("");
                return;
            }

            // If exact match or only one result, add immediately
            // If multiple, maybe show a selector? For PDV, usually exact match is best.
            // Let's pick the first one for now or exact match.
            const product = foundProducts[0];

            // Check if already in cart
            if (items.find(i => i.pecaId === product.id)) {
                toast({
                    title: "Item já adicionado",
                    description: "Este item já está no carrinho.",
                    variant: "warning"
                });
                setBarcodeInput("");
                return;
            }

            addItemToCart(product);
            setBarcodeInput("");

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

    const addItemToCart = (product) => {
        const newItem = {
            pecaId: product.id,
            codigo: product.codigo_etiqueta,
            descricao: product.descricao_curta || product.nome || "Produto sem nome",
            preco: parseFloat(product.preco_venda),
            qtd: 1 // Unique items usually 1
        };
        setItems([...items, newItem]);
        toast({
            title: "Item adicionado",
            description: `${newItem.descricao} adicionado ao carrinho.`,
            className: "bg-green-600 text-white border-none"
        });
    };

    const handleRemoveItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleFinishSale = async () => {
        if (items.length === 0) {
            toast({ title: "Carrinho vazio", description: "Adicione itens antes de finalizar.", variant: "destructive" });
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                clienteId: selectedClient || null,
                itens: items.map(i => ({
                    pecaId: i.pecaId,
                    valor_unitario_venda: i.preco
                })),
                pagamentos: [
                    {
                        metodo: paymentMethod,
                        valor: total,
                        parcelas: 1 // Default 1 for now
                    }
                ],
                origemVendaId: null, // Optional
                canal: "LOJA_FISICA"
            };

            const res = await api.post('/vendas/pdv', payload);

            toast({
                title: "Venda Concluída!",
                description: `Pedido ${res.data.codigo_pedido} gerado com sucesso.`,
                className: "bg-green-600 text-white border-none"
            });

            // Reset
            setItems([]);
            setBarcodeInput("");
            setDescontoValor(0);
            setFrete(0);
            setSelectedClient("");
            setClientSearch("");

        } catch (err) {
            console.error(err);
            toast({
                title: "Erro ao finalizar venda",
                description: err.response?.data?.error || "Ocorreu um erro inesperado.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // --- CALCULATIONS ---
    const subtotal = items.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
    const descontoCalculado = descontoTipo === "percent" ? (subtotal * descontoValor) / 100 : parseFloat(descontoValor || 0);
    const total = Math.max(0, subtotal - descontoCalculado + parseFloat(frete || 0));

    // Filter clients for search
    const filteredClients = clients.filter(c =>
        c.nome.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.cpf_cnpj && c.cpf_cnpj.includes(clientSearch))
    );

    return (
        <div className="space-y-6 pb-10 animate-in fade-in duration-500">

            {/* --- 1. BARRA DE CONTEXTO (Topo Branco) --- */}
            <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
                    {/* Seleção de Vendedor */}
                    <div className="w-full md:w-[280px] space-y-1.5">
                        <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Venda atribuída para</Label>
                        <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                            <SelectTrigger className="h-10 bg-muted/20 border-muted-foreground/20">
                                <SelectValue placeholder="Usuário Logado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="loja">Usuário Logado</SelectItem>
                                {/* Add more sellers if fetched */}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Seleção de Cliente */}
                    <div className="w-full flex-1 space-y-1.5">
                        <Label className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Cliente</Label>
                        <div className="flex gap-2 relative">
                            <div className="relative flex-1">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar Cliente (Nome/CPF)..."
                                    className="pl-10 h-10 bg-muted/20 border-muted-foreground/20"
                                    value={clientSearch}
                                    onChange={e => {
                                        setClientSearch(e.target.value);
                                        if (!e.target.value) setSelectedClient("");
                                    }}
                                />
                                {clientSearch && !selectedClient && filteredClients.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border shadow-lg rounded-md mt-1 z-50 max-h-[200px] overflow-auto">
                                        {filteredClients.map(c => (
                                            <div
                                                key={c.id}
                                                className="p-2 hover:bg-primary/5 cursor-pointer text-sm"
                                                onClick={() => {
                                                    setSelectedClient(c.id);
                                                    setClientSearch(c.nome);
                                                }}
                                            >
                                                {c.nome} <span className="text-gray-400 text-xs">({c.cpf_cnpj || 'Sem CPF'})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button size="icon" className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Data */}
                <div className="text-right hidden md:block pl-6 border-l">
                    <span className="text-xs text-muted-foreground block uppercase font-bold">Data</span>
                    <span className="font-mono text-xl font-bold text-primary">
                        {new Date().toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* --- 2. GRID PRINCIPAL (Produtos + Checkout) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* COLUNA DA ESQUERDA (Lista de Produtos) - Span 8 */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Input de Busca Grande */}
                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <Barcode className="absolute left-4 top-3.5 h-6 w-6 text-primary" />
                                    <Input
                                        ref={barcodeInputRef}
                                        placeholder="Bipe o código de barras ou digite o nome..."
                                        className="pl-12 h-14 text-lg shadow-inner bg-muted/10 border-primary/20 focus-visible:ring-primary"
                                        value={barcodeInput}
                                        onChange={(e) => setBarcodeInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearchProduct();
                                        }}
                                        autoFocus
                                    />
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleSearchProduct}
                                    disabled={isSearchingProduct}
                                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-primary/20 shadow-lg"
                                >
                                    {isSearchingProduct ? <Loader2 className="h-5 w-5 animate-spin" /> : "ADICIONAR"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabela de Itens */}
                    <Card className="shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                        <div className="p-0 overflow-auto flex-1">
                            <Table>
                                <TableHeader className="bg-muted/30">
                                    <TableRow>
                                        <TableHead className="w-[60px] text-center">#</TableHead>
                                        <TableHead>Descrição do Produto</TableHead>
                                        <TableHead className="w-[120px] text-right">Unitário</TableHead>
                                        <TableHead className="w-[120px] text-right">Total</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.map((item, index) => (
                                        <TableRow key={index} className="group hover:bg-primary/5 transition-colors">
                                            <TableCell className="text-center font-mono text-xs text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-foreground text-base">{item.descricao}</span>
                                                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded w-fit mt-1">
                                                        SKU: {item.codigo}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-muted-foreground">
                                                R$ {item.preco.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-foreground text-lg">
                                                R$ {(item.preco * item.qtd).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {/* Linha Vazia para manter altura */}
                                    {items.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                                Nenhum item adicionado. Bipe um produto para começar.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="bg-muted/20 border-t p-3 flex justify-between items-center px-6">
                            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                                {items.length} itens no carrinho
                            </span>
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => setItems([])}
                                className="text-muted-foreground hover:text-destructive h-auto p-0"
                            >
                                Limpar carrinho
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* COLUNA DA DIREITA (Checkout) - Span 4 */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    <Card className="shadow-lg border-primary/20 overflow-hidden flex flex-col sticky top-24">

                        {/* Header Azul */}
                        <div className="bg-primary p-6 text-primary-foreground">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-lg font-bold">Resumo do Pedido</h3>
                                <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">Em Aberto</Badge>
                            </div>
                            <p className="text-primary-foreground/80 text-xs">Confira os valores antes de finalizar</p>
                        </div>

                        <CardContent className="p-6 space-y-6 bg-white">

                            {/* Valores */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Desconto</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                value={descontoValor}
                                                onChange={(e) => setDescontoValor(e.target.value)}
                                                className="h-9 pr-8 text-right"
                                            />
                                            <button
                                                onClick={() => setDescontoTipo(descontoTipo === 'percent' ? 'fixed' : 'percent')}
                                                className="absolute left-2 top-1.5 text-xs font-bold text-primary hover:text-primary/80 bg-primary/10 px-1 rounded"
                                            >
                                                {descontoTipo === 'percent' ? '%' : 'R$'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs">Frete</Label>
                                        <div className="relative">
                                            <Truck className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                value={frete}
                                                onChange={(e) => setFrete(e.target.value)}
                                                className="h-9 pl-8 text-right"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                <div className="flex justify-between items-baseline pt-2">
                                    <span className="text-sm font-bold text-muted-foreground uppercase">Total Final</span>
                                    <span className="text-4xl font-extrabold text-primary tracking-tight">
                                        R$ {total.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Formas de Pagamento */}
                            <div className="space-y-3">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Pagamento</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button
                                        variant={paymentMethod === 'CARTAO_CREDITO' ? 'default' : 'outline'}
                                        onClick={() => setPaymentMethod('CARTAO_CREDITO')}
                                        className={`justify-start gap-2 h-10 ${paymentMethod === 'CARTAO_CREDITO' ? 'bg-primary text-primary-foreground' : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'}`}
                                    >
                                        <CreditCard className="h-4 w-4" /> Cartão
                                    </Button>
                                    <Button
                                        variant={paymentMethod === 'DINHEIRO' ? 'default' : 'outline'}
                                        onClick={() => setPaymentMethod('DINHEIRO')}
                                        className={`justify-start gap-2 h-10 ${paymentMethod === 'DINHEIRO' ? 'bg-green-600 text-white' : 'hover:border-green-300 hover:bg-green-50'}`}
                                    >
                                        <Banknote className="h-4 w-4" /> Dinheiro
                                    </Button>
                                    <Button
                                        variant={paymentMethod === 'PIX' ? 'default' : 'outline'}
                                        onClick={() => setPaymentMethod('PIX')}
                                        className={`justify-start gap-2 h-10 ${paymentMethod === 'PIX' ? 'bg-orange-600 text-white' : 'hover:border-orange-300 hover:bg-orange-50'}`}
                                    >
                                        <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">P</div> Pix
                                    </Button>
                                    <Button
                                        variant={paymentMethod === 'CREDITO_LOJA' ? 'default' : 'outline'}
                                        onClick={() => setPaymentMethod('CREDITO_LOJA')}
                                        className="justify-start gap-2 h-10"
                                    >
                                        <MoreHorizontal className="h-4 w-4" /> Crédito
                                    </Button>
                                </div>
                            </div>

                        </CardContent>

                        <CardFooter className="p-4 bg-slate-50 flex flex-col gap-3 border-t">
                            <Button
                                size="lg"
                                onClick={handleFinishSale}
                                disabled={isProcessing}
                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg shadow-green-200"
                            >
                                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : "CONCLUIR VENDA (F5)"}
                            </Button>

                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button variant="outline" className="w-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300">
                                    <Save className="mr-2 h-4 w-4" /> Pré-Venda
                                </Button>
                                <Button variant="outline" className="w-full border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 hover:text-red-700">
                                    Cancelar
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            {/* --- 3. LISTA DE PRÉ-VENDAS (Rodapé) --- */}
            <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <RotateCcw className="h-5 w-5 text-primary" /> Pré-Vendas Realizadas
                    </h3>
                    <div className="relative w-[250px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Pesquisar pré-venda..." className="pl-9 h-9" />
                    </div>
                </div>

                <Card className="border-none shadow-md">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Vendedor</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Itens</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead className="text-center">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="text-muted-foreground text-sm text-center py-8 hover:bg-transparent">
                                <TableCell colSpan={7}>Nenhuma pré-venda em aberto.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}