// src/app/dashboard/pedidos/pdv/page.js
"use client";
// forcing build retry

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
    Loader2,
    ShoppingBag,
    History,
    UserPlus,

    ArrowRight,
    Edit
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
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
    const [saldoPermuta, setSaldoPermuta] = useState(null);
    const [loadingSaldo, setLoadingSaldo] = useState(false);

    // Caixa State
    const [caixaAberto, setCaixaAberto] = useState(null);
    const [caixaModalOpen, setCaixaModalOpen] = useState(false);
    const [fecharCaixaModalOpen, setFecharCaixaModalOpen] = useState(false);
    const [saldoInicial, setSaldoInicial] = useState("");
    const [saldoFinal, setSaldoFinal] = useState("");

    // Product Search
    const [barcodeInput, setBarcodeInput] = useState("");
    const [isSearchingProduct, setIsSearchingProduct] = useState(false);
    const [productSuggestions, setProductSuggestions] = useState([]);

    // Checkout
    const [descontoTipo, setDescontoTipo] = useState("percent");
    const [descontoValor, setDescontoValor] = useState(0);
    const [frete, setFrete] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("DINHEIRO"); // Default
    const [parcelas, setParcelas] = useState(1); // Credit card installments
    const [voucherAmount, setVoucherAmount] = useState(0); // Amount to pay with voucher
    const [isProcessing, setIsProcessing] = useState(false);

    // Sacolinha Integration
    const [activeSacolinha, setActiveSacolinha] = useState(null); // The current active sacolinha object
    const [sacolinhaModalOpen, setSacolinhaModalOpen] = useState(false);
    const [existingSacolinhas, setExistingSacolinhas] = useState([]);
    const [isLoadingSacolinhas, setIsLoadingSacolinhas] = useState(false);

    // Price Editing State
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [newPriceInput, setNewPriceInput] = useState("");

    // New Client Modal State
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [newClientData, setNewClientData] = useState({
        nome: "",
        cpf_cnpj: "",
        telefone_whatsapp: "",
        email: "",
        is_cliente: true
    });
    const [isCreatingClient, setIsCreatingClient] = useState(false);

    // Multi-Payment State
    const [addedPayments, setAddedPayments] = useState([]);
    const [paymentInputValue, setPaymentInputValue] = useState(""); // Amount to add
    const [tempParcelas, setTempParcelas] = useState(1);
    const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

    const barcodeInputRef = useRef(null);

    // --- CALCULATIONS ---
    const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.preco * item.qtd), 0), [items]);
    const descontoCalculado = useMemo(() => descontoTipo === "percent" ? (subtotal * descontoValor) / 100 : parseFloat(descontoValor || 0), [subtotal, descontoTipo, descontoValor]);
    const total = useMemo(() => Math.max(0, subtotal - descontoCalculado + parseFloat(frete || 0)), [subtotal, descontoCalculado, frete]);

    const isSaldoInsuficiente = useMemo(() => paymentMethod === 'VOUCHER_PERMUTA' && (!saldoPermuta || parseFloat(saldoPermuta.saldo) < total), [paymentMethod, saldoPermuta, total]);

    // --- EFFECTS ---
    useEffect(() => {
        checkCaixaStatus();
        loadInitialData();
    }, []);

    // Update payment input value based on remaining
    useEffect(() => {
        const paid = addedPayments.reduce((acc, p) => acc + parseFloat(p.valor), 0);
        const remaining = Math.max(0, total - paid);
        setPaymentInputValue(remaining.toFixed(2));
    }, [total, addedPayments]);

    const checkCaixaStatus = async () => {
        try {
            const res = await api.get('/caixa/status');
            if (res.data) {
                setCaixaAberto(res.data);
            } else {
                setCaixaAberto(null);
                setCaixaModalOpen(true); // Force open modal if closed
            }
        } catch (err) {
            console.error("Erro ao verificar caixa", err);
        }
    };

    const handleAbrirCaixa = async () => {
        if (!saldoInicial) return;
        try {
            const res = await api.post('/caixa/abrir', { saldo_inicial: parseFloat(saldoInicial) });
            setCaixaAberto(res.data);
            setCaixaModalOpen(false);
            toast({
                title: "Caixa Aberto",
                description: "Você pode iniciar as vendas.",
                className: "bg-green-600 text-white border-none"
            });
        } catch (err) {
            toast({
                title: "Erro ao abrir caixa",
                description: err.response?.data?.error || "Tente novamente.",
                variant: "destructive"
            });
        }
    };

    const handleAddPayment = (method, amount) => {
        const val = parseFloat(amount || 0);
        if (val <= 0) return;

        const paidSoFar = addedPayments.reduce((acc, p) => acc + parseFloat(p.valor), 0);
        if (paidSoFar + val > total + 0.01) {
            toast({ title: "Valor Excedido", description: "O total dos pagamentos não pode superar o total do pedido.", variant: "destructive" });
            return;
        }

        const newPayment = {
            id: Date.now(),
            metodo: method,
            valor: val,
            parcelas: method === 'CREDITO' ? tempParcelas : 1
        };

        setAddedPayments([...addedPayments, newPayment]);
        setTempParcelas(1); // Reset
    };

    const handleRemovePayment = (id) => {
        setAddedPayments(addedPayments.filter(p => p.id !== id));
    };

    const handleFecharCaixa = async () => {
        if (!saldoFinal) return;
        try {
            const res = await api.post('/caixa/fechar', { saldo_final: parseFloat(saldoFinal) });
            setCaixaAberto(null); // Close locally
            setFecharCaixaModalOpen(false);
            toast({
                title: "Caixa Fechado",
                description: `Caixa fechado com sucesso. Diferença: R$ ${res.data.diferenca_quebra}`,
                className: "bg-blue-600 text-white border-none"
            });
        } catch (err) {
            toast({
                title: "Erro ao fechar caixa",
                description: err.response?.data?.error || "Tente novamente.",
                variant: "destructive"
            });
        }
    };

    // Focus barcode input on mount
    useEffect(() => {
        if (barcodeInputRef.current && caixaAberto) {
            barcodeInputRef.current.focus();
        }
    }, [caixaAberto]);


    // ...

    const loadInitialData = async () => {
        try {
            // No longer fetching 10k products at once for efficiency
            // setAllProducts is removed
        } catch (err) {
            console.error("Erro ao carregar dados iniciais", err);
        }
    };

    // ...



    useEffect(() => {
        if (selectedClient) {
            fetchSaldoPermuta(selectedClient);
            // Trigger Sacolinha Options
            handleClientSelection(selectedClient);
        } else {
            setSaldoPermuta(null);
            setActiveSacolinha(null);
            setItems([]);
        }
    }, [selectedClient]);

    const handleClientSelection = async (clientId) => {
        setIsLoadingSacolinhas(true);
        try {
            const res = await api.get('/vendas/sacolinhas', {
                params: { clienteId: clientId, status: 'ABERTA' }
            });
            setExistingSacolinhas(res.data);
            setSacolinhaModalOpen(true);
        } catch (err) {
            console.error("Erro ao buscar sacolinhas", err);
        } finally {
            setIsLoadingSacolinhas(false);
        }
    };

    const handleCreateSacolinha = async () => {
        try {
            const res = await api.post('/vendas/sacolinhas/abrir', { clienteId: selectedClient });
            setActiveSacolinha(res.data);
            setItems([]); // New sacolinha starts empty
            setSacolinhaModalOpen(false);
            toast({
                title: "Nova Sacolinha",
                description: "Sacolinha aberta! Os itens adicionados agora serão salvos nela.",
                className: "bg-cyan-600 text-white border-none"
            });
        } catch (err) {
            toast({ title: "Erro", description: "Não foi possível criar sacolinha.", variant: "destructive" });
        }
    };

    const handleSelectExistingSacolinha = (sacolinha) => {
        setActiveSacolinha(sacolinha);
        // Load items from sacolinha into PDV
        const formattedItems = (sacolinha.itens || []).map(i => ({
            pecaId: i.id,
            codigo: i.codigo_etiqueta,
            descricao: i.descricao_curta || i.nome,
            preco: parseFloat(i.preco_venda_sacolinha || i.preco_venda),
            qtd: 1
        }));
        setItems(formattedItems);
        setSacolinhaModalOpen(false);
        toast({
            title: "Sacolinha Selecionada",
            description: `Retomando sacolinha #${sacolinha.id}.`,
            className: "bg-blue-600 text-white border-none"
        });
    };

    const handleProceedNormalSale = () => {
        setActiveSacolinha(null);
        setSacolinhaModalOpen(false);
        toast({
            title: "Venda Direta",
            description: "Modo de venda normal ativado.",
        });
    };

    const handleCreateClient = async () => {
        if (!newClientData.nome) {
            toast({ title: "Erro", description: "O nome é obrigatório.", variant: "destructive" });
            return;
        }

        setIsCreatingClient(true);
        try {
            const res = await api.post('/pessoas', newClientData);
            const createdClient = res.data;

            // Selection:
            setSelectedClient(createdClient.id);
            setClientSearch(createdClient.nome);
            setClients([]); // Clear list

            setIsClientModalOpen(false);
            setNewClientData({
                nome: "",
                cpf_cnpj: "",
                telefone_whatsapp: "",
                email: "",
                is_cliente: true
            });

            toast({
                title: "Cliente Criado",
                description: `${createdClient.nome} foi cadastrado e selecionado.`,
                className: "bg-green-600 text-white border-none"
            });
        } catch (err) {
            toast({
                title: "Erro ao criar cliente",
                description: err.response?.data?.error || "Verifique os dados (CPF/E-mail duplicados?).",
                variant: "destructive"
            });
        } finally {
            setIsCreatingClient(false);
        }
    };

    const fetchSaldoPermuta = async (clientId) => {
        setLoadingSaldo(true);
        try {
            const res = await api.get(`/pessoas/${clientId}/saldo-permuta`);
            setSaldoPermuta(res.data);
        } catch (err) {
            console.error("Erro ao buscar saldo", err);
            toast({
                title: "Erro ao buscar saldo",
                description: "Não foi possível verificar o saldo de permuta.",
                variant: "destructive"
            });
        } finally {
            setLoadingSaldo(false);
        }
    };

    // --- ACTIONS ---

    // --- RESTOCK MODAL STATE ---
    const [restockModalOpen, setRestockModalOpen] = useState(false);
    const [productToRestock, setProductToRestock] = useState(null);
    const [restockQuantity, setRestockQuantity] = useState(1);
    const [isRestocking, setIsRestocking] = useState(false);

    const handleSearchProduct = async () => {
        if (!barcodeInput.trim()) return;

        // More robust normalization: "TAG 123", "TAG123", "TAG-123" -> "TAG-123"
        let normalizedInput = barcodeInput.trim();
        if (/^TAG\s*[- ]?\s*\d+$/i.test(normalizedInput)) {
            const digits = normalizedInput.match(/\d+/)[0];
            normalizedInput = `TAG-${digits}`;
        }

        setIsSearchingProduct(true);
        try {
            // Fetch all matches first
            const res = await api.get('/catalogo/pecas', {
                params: { search: normalizedInput }
            });
            // Handle paginated or array response
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

            // STRICT SEARCH LOGIC
            const upperInput = normalizedInput.toUpperCase();

            if (upperInput.startsWith("TAG-")) {
                // Case: User specifically typed/scanned a TAG
                product = foundProducts.find(p => p.codigo_etiqueta && p.codigo_etiqueta.toUpperCase() === upperInput);
            } else {
                // Check for SKU Match (exact match)
                product = foundProducts.find(p => p.sku_ecommerce && p.sku_ecommerce.toUpperCase() === upperInput);

                if (!product) {
                    const numericId = parseInt(normalizedInput, 10);
                    const isNumeric = !isNaN(numericId) && /^\d+$/.test(normalizedInput);

                    if (isNumeric) {
                        // 1. Try exact ID match first
                        product = foundProducts.find(p => p.id === numericId);

                        // 2. Fallback: If no ID matches, but a Tag matches the number
                        if (!product && foundProducts.length === 1) {
                            product = foundProducts[0];
                        } else if (!product) {
                            // Look for exact tag suffix match if multiple results
                            product = foundProducts.find(p => p.codigo_etiqueta && p.codigo_etiqueta.toUpperCase().endsWith(`-${normalizedInput}`));
                        }
                    } else if (foundProducts.length === 1) {
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

            // Item Found - Proceed to Add
            checkAndAddItem(product);
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

    const checkAndAddItem = async (product) => {
        // CHECK STOCK Rule
        if (product.quantidade <= 0 || product.status === 'VENDIDA') {
            setProductToRestock(product);
            setRestockQuantity(1);
            setRestockModalOpen(true);
            return;
        }

        // Check if already in cart
        if (items.find(i => i.pecaId === product.id)) {
            toast({
                title: "Item já adicionado",
                description: "Este item já está no carrinho.",
                variant: "warning"
            });
            return;
        }

        if (activeSacolinha) {
            try {
                await api.post(`/vendas/sacolinhas/${activeSacolinha.id}/itens`, { pecaId: product.id });
                addItemToCart(product); // Also update locally
                playBeep();
            } catch (err) {
                toast({
                    title: "Erro ao adicionar",
                    description: err.response?.data?.error || "Erro ao salvar na sacolinha.",
                    variant: "destructive"
                });
            }
        } else {
            addItemToCart(product);
            playBeep();
        }
    };

    const handleConfirmRestock = async () => {
        if (!productToRestock) return;
        setIsRestocking(true);
        try {
            // Update stock in backend (this triggers status -> DISPONIVEL)
            const newStock = (productToRestock.quantidade || 0) + parseInt(restockQuantity);

            await api.put(`/catalogo/pecas/${productToRestock.id}`, {
                quantidade: newStock
            });

            toast({
                title: "Estoque Atualizado",
                description: `Produto agora tem ${newStock} itens e está DISPONÍVEL.`,
                className: "bg-green-600 text-white border-none"
            });

            // Update local object to reflect change immediately for adding to cart
            const updatedProduct = { ...productToRestock, quantidade: newStock, status: 'DISPONIVEL' };

            // Add to cart immediately
            addItemToCart(updatedProduct);

            setRestockModalOpen(false);
            setProductToRestock(null);

        } catch (err) {
            console.error(err);
            toast({
                title: "Erro ao atualizar estoque",
                description: "Tente novamente.",
                variant: "destructive"
            });
        } finally {
            setIsRestocking(false);
        }
    };

    const addItemToCart = (product) => {
        // ... existing implementation ...
        const newItem = {
            pecaId: product.id,
            codigo: product.codigo_etiqueta,
            descricao: product.descricao_curta || product.nome || "Produto sem nome",
            preco: parseFloat(product.preco_venda_sacolinha || product.preco_venda),
            qtd: 1 // Unique items usually 1
        };
        setItems([...items, newItem]);
        toast({
            title: "Item adicionado",
            description: `${newItem.descricao} adicionado ao carrinho.`,
            className: "bg-green-600 text-white border-none"
        });
    };

    const handleRemoveItem = async (index) => {
        const itemToRemove = items[index];

        if (activeSacolinha) {
            try {
                await api.delete(`/vendas/sacolinhas/${activeSacolinha.id}/itens/${itemToRemove.pecaId}`);
                const newItems = [...items];
                newItems.splice(index, 1);
                setItems(newItems);
                toast({ title: "Item Removido", description: "Removido da sacolinha com sucesso." });
            } catch (err) {
                toast({ title: "Erro", description: "Não foi possível remover da sacolinha.", variant: "destructive" });
            }
        } else {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    }


    const handleUpdateItemPrice = async () => {
        if (editingItemIndex === null) return;
        const cleanPrice = String(newPriceInput).replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const price = parseFloat(cleanPrice);

        if (isNaN(price) || price < 0) {
            toast({ title: "Valor inválido", variant: "destructive" });
            return;
        }

        const itemToUpdate = items[editingItemIndex];

        if (activeSacolinha) {
            try {
                await api.put(`/vendas/sacolinhas/${activeSacolinha.id}/itens/${itemToUpdate.pecaId}/preco`, {
                    preco: price
                });
                toast({ title: "Preço atualizado na sacolinha!", className: "bg-blue-600 text-white border-none" });
            } catch (err) {
                console.error(err);
                toast({ title: "Erro ao atualizar sacolinha", description: "O preço foi alterado apenas localmente.", variant: "destructive" });
            }
        }

        const newItems = [...items];
        newItems[editingItemIndex].preco = price;
        setItems(newItems);
        setEditingItemIndex(null);
        setNewPriceInput("");
        if (!activeSacolinha) toast({ title: "Preço atualizado!", className: "bg-green-600 text-white border-none" });
    };

    const handleFinishSale = async () => {
        if (items.length === 0) {
            toast({ title: "Carrinho vazio", description: "Adicione itens antes de finalizar.", variant: "destructive" });
            return;
        }

        const paidTotal = addedPayments.reduce((acc, p) => acc + parseFloat(p.valor), 0);
        if (Math.abs(paidTotal - total) > 0.01) {
            toast({
                title: "Pagamento Incompleto",
                description: `Faltam R$ ${(total - paidTotal).toFixed(2)} para completar o pagamento.`,
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Calculate Discount Ratio
            // We need to calculate subtotal locally because the state variable 'subtotal'
            // might not be accessible or relies on render cycle.
            const localSubtotal = items.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

            let discountAmount = 0;
            if (descontoTipo === 'percent') {
                discountAmount = (localSubtotal * parseFloat(descontoValor || 0)) / 100;
            } else {
                discountAmount = parseFloat(descontoValor || 0);
            }

            // Ratio of Pay / Subtotal (e.g. 90 / 100 = 0.9)
            // If discount > subtotal, ratio is 0 (free)
            const payRatio = localSubtotal > 0 ? Math.max(0, localSubtotal - discountAmount) / localSubtotal : 1;

            const payload = {
                clienteId: selectedClient || null,
                sacolinhaId: activeSacolinha?.id || null,
                itens: items.map(i => ({
                    pecaId: i.pecaId,
                    valor_unitario_venda: i.preco // Send the cart price (negotiated or catalog)
                })),
                pagamentos: addedPayments,
                origemVendaId: null,
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
            setActiveSacolinha(null);
            setAddedPayments([]); // Reset added payments
            sessionStorage.removeItem('activeSacolinha');

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

    // --- CALCULATIONS (Moved to top) ---
    // const subtotal = items.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
    // const descontoCalculado = ...
    // const total = ...

    const isSaldoInsuficiente = paymentMethod === 'VOUCHER_PERMUTA' && (!saldoPermuta || parseFloat(saldoPermuta.saldo) < total);

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
                                    onChange={async (e) => {
                                        const val = e.target.value;
                                        setClientSearch(val);
                                        if (!val) {
                                            setSelectedClient("");
                                            setClients([]); // Clear list if empty
                                            return;
                                        }

                                        // Debounce or just search if length > 2
                                        if (val.length > 2) {
                                            try {
                                                const res = await api.get('/pessoas', {
                                                    params: { search: val }
                                                });
                                                setClients(res.data);
                                            } catch (err) {
                                                console.error("Erro ao buscar clientes", err);
                                            }
                                        }
                                    }}
                                />
                                {clientSearch && !selectedClient && clients.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border shadow-lg rounded-md mt-1 z-50 max-h-[200px] overflow-auto">
                                        {clients.map(c => (
                                            <div
                                                key={c.id}
                                                className="p-2 hover:bg-primary/5 cursor-pointer text-sm"
                                                onClick={() => {
                                                    setSelectedClient(c.id);
                                                    setClientSearch(c.nome);
                                                    setClients([]); // Close list
                                                }}
                                            >
                                                {c.nome} <span className="text-gray-400 text-xs">({c.cpf_cnpj || 'Sem CPF'})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button
                                size="icon"
                                className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
                                onClick={() => setIsClientModalOpen(true)}
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    {saldoPermuta && (
                        <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                Saldo Permuta: R$ {parseFloat(saldoPermuta.saldo).toFixed(2)}
                            </Badge>
                            {saldoPermuta.proximoVencimento && (
                                <span className="text-[10px] text-muted-foreground">
                                    Vence em {new Date(saldoPermuta.proximoVencimento).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}
                    {activeSacolinha ? (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="animate-pulse h-2 w-2 rounded-full bg-cyan-500" />
                            <Badge className="bg-cyan-600 text-white border-none gap-2 px-3 py-1">
                                <ShoppingBag className="h-4 w-4" /> Sacolinha #{activeSacolinha.id}
                            </Badge>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] border-cyan-200 text-cyan-700 hover:bg-cyan-50" onClick={() => handleClientSelection(selectedClient)}>
                                Trocar
                            </Button>
                            <Button variant="ghost" size="sm" className="text-[10px] text-red-500 h-7 px-2" onClick={() => setActiveSacolinha(null)}>
                                Sair e Venda Direta
                            </Button>
                        </div>
                    ) : selectedClient && (
                        <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline" className="text-slate-500 gap-1 border-dashed">
                                Modo Venda Direta
                            </Badge>
                            <Button variant="link" size="sm" className="h-6 text-[10px] text-cyan-600 p-0" onClick={() => handleClientSelection(selectedClient)}>
                                Criar/Selecionar Sacolinha
                            </Button>
                        </div>
                    )}
                </div>
                {/* Botão Manual Abrir/Fechar Caixa */}
                {!caixaAberto ? (
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            className="h-10 border-red-200 text-red-700 bg-red-50 hover:bg-red-100"
                            onClick={() => setCaixaModalOpen(true)}
                        >
                            <Banknote className="mr-2 h-4 w-4" /> Abrir Caixa
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-end">
                        <Button
                            variant="outline"
                            className="h-10 border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100"
                            onClick={() => setFecharCaixaModalOpen(true)}
                        >
                            <Banknote className="mr-2 h-4 w-4" /> Fechar Caixa
                        </Button>
                    </div>
                )}
            </div>

            {/* Data */}
            <div className="text-right hidden md:block pl-6 border-l">
                <span className="text-xs text-muted-foreground block uppercase font-bold">Data</span>
                <span className="font-mono text-xl font-bold text-primary">
                    {new Date().toLocaleDateString()}
                </span>
            </div>

            {/* --- 2. GRID PRINCIPAL (Produtos + Checkout) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* COLUNA DA ESQUERDA (Lista de Produtos) - Span 8 */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* Input de Busca Grande */}
                    <Card className="border-l-4 border-l-primary shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Barcode className="absolute left-4 top-3.5 h-6 w-6 text-primary" />
                                    <Input
                                        ref={barcodeInputRef}
                                        placeholder="Bipe o código de barras ou digite o nome..."
                                        className="pl-12 h-14 text-lg shadow-inner bg-muted/10 border-primary/20 focus-visible:ring-primary w-full"
                                        value={barcodeInput}
                                        onChange={async (e) => {
                                            const val = e.target.value;
                                            setBarcodeInput(val);

                                            if (!val) {
                                                setProductSuggestions([]);
                                                return;
                                            }

                                            const searchUpper = val.toUpperCase();
                                            const isTagSearch = searchUpper.startsWith("TAG-");
                                            const isNumeric = /^\d+$/.test(val);

                                            try {
                                                // Fetch suggestions from API
                                                const res = await api.get('/catalogo/pecas', {
                                                    params: { search: val, limit: 15 }
                                                });

                                                const foundProducts = res.data.data || res.data;

                                                // Refine results based on user exclusivity rules
                                                const refined = foundProducts.filter(p => {
                                                    // 1. Numeric Input -> Show if ID starts with it OR Tag suffix matches
                                                    if (isNumeric) {
                                                        const idMatch = String(p.id).startsWith(val);
                                                        const tagMatch = p.codigo_etiqueta && p.codigo_etiqueta.includes(val);
                                                        return idMatch || tagMatch;
                                                    }

                                                    // 2. TAG Search -> Show ONLY if Tag/SKU starts with it
                                                    if (isTagSearch) {
                                                        const tMatch = p.codigo_etiqueta && p.codigo_etiqueta.toUpperCase().startsWith(searchUpper);
                                                        const sMatch = p.sku_ecommerce && p.sku_ecommerce.toUpperCase().startsWith(searchUpper);
                                                        return tMatch || sMatch;
                                                    }

                                                    // 3. Text Search -> Show matches that aren't numeric or tagged
                                                    return p.descricao_curta && p.descricao_curta.toLowerCase().includes(val.toLowerCase());
                                                }).slice(0, 10);

                                                setProductSuggestions(refined);
                                            } catch (err) {
                                                console.error("Erro ao buscar sugestões", err);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSearchProduct();
                                        }}
                                        autoFocus
                                    />
                                    {productSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 w-full bg-white border shadow-lg rounded-md mt-1 z-50 max-h-[300px] overflow-auto">
                                            {productSuggestions.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="p-3 hover:bg-primary/5 cursor-pointer border-b last:border-none flex justify-between items-center"
                                                    onClick={() => {
                                                        addItemToCart(p);
                                                        setBarcodeInput("");
                                                        setProductSuggestions([]);
                                                        if (barcodeInputRef.current) barcodeInputRef.current.focus();
                                                    }}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-base">{p.descricao_curta}</span>
                                                        <span className="text-xs text-muted-foreground">ID: {String(p.id).padStart(4, '0')} | SKU: {p.codigo_etiqueta}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="font-bold text-primary">R$ {parseFloat(p.preco_venda).toFixed(2)}</span>
                                                        {p.tamanho && <Badge variant="outline">{p.tamanho.nome}</Badge>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleSearchProduct}
                                    disabled={isSearchingProduct}
                                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-semibold shadow-primary/20 shadow-lg w-full sm:w-auto"
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
                                                <div className="flex items-center justify-end gap-2">
                                                    <span>R$ {item.preco.toFixed(2)}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => {
                                                            setEditingItemIndex(index);
                                                            setNewPriceInput(item.preco.toString());
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                    </Button>
                                                </div>
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
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs uppercase font-bold text-muted-foreground">Adicionar Pagamento</Label>
                                    <div className="flex items-center gap-2 bg-muted/30 px-2 py-1 rounded-md border text-[10px] font-bold">
                                        RESTANTE: <span className="text-primary">R$ {(total - addedPayments.reduce((acc, p) => acc + parseFloat(p.valor), 0)).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-2 top-2 text-xs text-muted-foreground">R$</span>
                                        <Input
                                            type="number"
                                            value={paymentInputValue}
                                            onChange={(e) => setPaymentInputValue(e.target.value)}
                                            className="h-9 pl-7 text-sm"
                                            placeholder="Valor"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddPayment('CREDITO', paymentInputValue)}
                                        className="justify-start gap-2 h-auto min-h-[2.5rem] whitespace-normal py-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
                                    >
                                        <CreditCard className="h-4 w-4 shrink-0" /> <span className="text-left">Cartão</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddPayment('DINHEIRO', paymentInputValue)}
                                        className="justify-start gap-2 h-auto min-h-[2.5rem] whitespace-normal py-2 hover:border-green-300 hover:bg-green-50 text-green-700"
                                    >
                                        <Banknote className="h-4 w-4 shrink-0" /> <span className="text-left">Dinheiro</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddPayment('PIX', paymentInputValue)}
                                        className="justify-start gap-2 h-auto min-h-[2.5rem] whitespace-normal py-2 hover:border-orange-300 hover:bg-orange-50 text-orange-700"
                                    >
                                        <div className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold shrink-0">P</div> <span className="text-left">Pix</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => handleAddPayment('CREDITO_LOJA', paymentInputValue)}
                                        className="justify-start gap-2 h-auto min-h-[2.5rem] whitespace-normal py-2"
                                    >
                                        <MoreHorizontal className="h-4 w-4 shrink-0" /> <span className="text-left">Crédito</span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (!saldoPermuta || parseFloat(saldoPermuta.saldo) <= 0) {
                                                toast({
                                                    title: "Saldo Insuficiente",
                                                    description: "Cliente não possui saldo de permuta.",
                                                    variant: "destructive"
                                                });
                                                return;
                                            }
                                            const amountToAdd = Math.min(parseFloat(paymentInputValue), parseFloat(saldoPermuta.saldo));
                                            handleAddPayment('VOUCHER_PERMUTA', amountToAdd);
                                        }}
                                        className="justify-start gap-2 h-auto min-h-[2.5rem] whitespace-normal py-2 col-span-2 sm:col-span-1 hover:border-purple-300 hover:bg-purple-50 text-purple-700"
                                    >
                                        <RotateCcw className="h-4 w-4 shrink-0" /> <span className="text-left">Voucher Permuta</span>
                                    </Button>
                                </div>

                                {/* Current selection details (Parcelas) if "Cartão" logic is needed BEFORE adding? */}
                                {/* Actually, let's keep it simple: if adding as credit card, it uses tempParcelas. */}
                                <div className="bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-blue-700 uppercase">Se for Cartão:</span>
                                    <div className="flex gap-1 overflow-x-auto">
                                        {[1, 2, 3, 4, 5, 6, 10].map(n => (
                                            <Button
                                                key={n}
                                                size="sm"
                                                variant={tempParcelas === n ? 'default' : 'ghost'}
                                                onClick={() => setTempParcelas(n)}
                                                className={`h-6 px-2 text-[10px] ${tempParcelas === n ? 'bg-blue-600' : ''}`}
                                            >
                                                {n}x
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                {/* List of Added Payments */}
                                {addedPayments.length > 0 && (
                                    <div className="space-y-2 pt-2 border-t border-dashed">
                                        <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pagamentos Selecionados</Label>
                                        <div className="space-y-1">
                                            {addedPayments.map(p => (
                                                <div key={p.id} className="flex justify-between items-center bg-muted/20 p-2 rounded-md border text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold">{p.metodo === 'CREDITO' ? `${p.parcelas}x Cartão` : p.metodo}</span>
                                                        <Badge variant="outline" className="h-4 text-[9px]">R$ {parseFloat(p.valor).toFixed(2)}</Badge>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleRemovePayment(p.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* --- NO CALCULATOR AREA --- */}
                            {paymentMethod === 'VOUCHER_PERMUTA' && (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-3 animate-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-purple-900 font-semibold">Valor do Voucher</Label>
                                        <div className="relative w-32">
                                            <span className="absolute left-2 top-1.5 text-purple-700 font-bold">R$</span>
                                            <Input
                                                type="number"
                                                value={voucherAmount}
                                                onChange={(e) => {
                                                    let val = parseFloat(e.target.value);
                                                    if (isNaN(val)) val = 0;
                                                    // Cap at max balance or total
                                                    const max = Math.min(parseFloat(saldoPermuta.saldo), total);
                                                    if (val > max) val = max;
                                                    setVoucherAmount(val);
                                                }}
                                                className="pl-8 h-8 bg-white border-purple-200 text-right font-bold text-purple-900"
                                            />
                                        </div>
                                    </div>

                                    <Separator className="bg-purple-200" />

                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Total da Venda</span>
                                            <span>R$ {total.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-purple-700 font-medium">
                                            <span>(-) Voucher Aplicado</span>
                                            <span>R$ {voucherAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-lg font-bold text-green-700 pt-1 border-t border-purple-200">
                                            <span>(=) Restante a Pagar</span>
                                            <span>R$ {(total - voucherAmount).toFixed(2)}</span>
                                        </div>
                                        <div className="text-xs text-center text-muted-foreground pt-1">
                                            O restante deve ser pago em <strong>DINHEIRO</strong>.
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* -------------------------- */}

                        </CardContent>

                        <CardFooter className="p-4 bg-slate-50 flex flex-col gap-3 border-t">
                            <Button
                                size="lg"
                                onClick={handleFinishSale}
                                disabled={isProcessing || isSaldoInsuficiente}
                                className={`w-full h-12 font-bold text-base shadow-lg ${isSaldoInsuficiente ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'}`}
                            >
                                {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSaldoInsuficiente ? "SALDO INSUFICIENTE" : (activeSacolinha ? "CONCLUIR EDICÃO SAC." : "CONCLUIR VENDA (F5)"))}
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


            {/* --- MODALS --- */}

            {/* Modal Abrir Caixa */}
            <Dialog open={caixaModalOpen} onOpenChange={(open) => {
                // Prevent closing if no caixa is open
                if (!caixaAberto && !open) return;
                setCaixaModalOpen(open);
            }}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => {
                    if (!caixaAberto) e.preventDefault();
                }}>
                    <DialogHeader>
                        <DialogTitle>Abrir Caixa</DialogTitle>
                        <DialogDescription>
                            Informe o saldo inicial para iniciar as operações.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="saldoInicial" className="text-right">
                                Saldo Inicial
                            </Label>
                            <Input
                                id="saldoInicial"
                                type="number"
                                value={saldoInicial}
                                onChange={(e) => setSaldoInicial(e.target.value)}
                                className="col-span-3"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAbrirCaixa} disabled={saldoInicial === ''}>
                            Abrir Caixa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Fechar Caixa */}
            <Dialog open={fecharCaixaModalOpen} onOpenChange={setFecharCaixaModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Fechar Caixa</DialogTitle>
                        <DialogDescription>
                            Informe o saldo final em dinheiro na gaveta.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="saldoFinal" className="text-right">
                                Saldo Final
                            </Label>
                            <Input
                                id="saldoFinal"
                                type="number"
                                value={saldoFinal}
                                onChange={(e) => setSaldoFinal(e.target.value)}
                                className="col-span-3"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFecharCaixaModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleFecharCaixa} disabled={!saldoFinal} className="bg-red-600 hover:bg-red-700">
                            Fechar Caixa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL RESTOCK --- */}
            <Dialog open={restockModalOpen} onOpenChange={setRestockModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Repor Estoque</DialogTitle>
                        <DialogDescription>
                            O produto <strong>{productToRestock?.descricao_curta}</strong> está sem estoque ou marcado como VENDIDA.
                            <br />
                            Adicione unidades para torná-lo disponível e prosseguir com a venda.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Quantidade a Adicionar</Label>
                            <Input
                                type="number"
                                min="1"
                                value={restockQuantity}
                                onChange={(e) => setRestockQuantity(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRestockModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleConfirmRestock} disabled={isRestocking}>
                            {isRestocking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar e Adicionar à Venda
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL CRIAR CLIENTE --- */}
            <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" /> Novo Cliente
                        </DialogTitle>
                        <DialogDescription>
                            Cadastre rapidamente o cliente para prosseguir com a venda.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                placeholder="Nome do cliente"
                                value={newClientData.nome}
                                onChange={(e) => setNewClientData({ ...newClientData, nome: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="cpf">CPF / CNPJ</Label>
                                <Input
                                    id="cpf"
                                    placeholder="000.000.000-00"
                                    value={newClientData.cpf_cnpj}
                                    onChange={(e) => setNewClientData({ ...newClientData, cpf_cnpj: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">WhatsApp</Label>
                                <Input
                                    id="phone"
                                    placeholder="(00) 00000-0000"
                                    value={newClientData.telefone_whatsapp}
                                    onChange={(e) => setNewClientData({ ...newClientData, telefone_whatsapp: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="cliente@exemplo.com"
                                value={newClientData.email}
                                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsClientModalOpen(false)}>Cancelar</Button>
                        <Button
                            onClick={handleCreateClient}
                            disabled={isCreatingClient || !newClientData.nome}
                            className="bg-primary text-white"
                        >
                            {isCreatingClient ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                            Criar e Selecionar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Escolha da Sacolinha */}
            <Dialog open={sacolinhaModalOpen} onOpenChange={setSacolinhaModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                            <ShoppingBag className="h-6 w-6 text-cyan-600" /> Opções de Sacolinha
                        </DialogTitle>
                        <DialogDescription>
                            O que deseja fazer com esta venda?
                        </DialogDescription>
                    </DialogHeader>

                    {isLoadingSacolinhas ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="h-10 w-10 animate-spin text-cyan-600" />
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <Button
                                className="h-16 flex justify-between px-6 bg-cyan-600 hover:bg-cyan-700 shadow-md transform active:scale-95 transition-all"
                                onClick={handleCreateSacolinha}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 p-2 rounded-lg">
                                        <UserPlus className="h-6 w-6" />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-lg text-white">Criar Sacolinha</div>
                                        <div className="text-xs text-white/70">Iniciar novo rascunho de venda</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-white" />
                            </Button>

                            {existingSacolinhas.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-[11px] uppercase font-bold text-muted-foreground tracking-widest pl-1">Ou continuar existente:</Label>
                                    <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
                                        {existingSacolinhas.map(s => {
                                            const totalSacolinha = (s.itens || []).reduce((acc, item) => {
                                                // Priority: Negotiated Price > Catalog Price
                                                const price = parseFloat(item.preco_venda_sacolinha || item.preco_venda || 0);
                                                return acc + price;
                                            }, 0);

                                            return (
                                                <Button
                                                    key={s.id}
                                                    variant="outline"
                                                    className="h-14 justify-between border-cyan-100 hover:border-cyan-200 hover:bg-cyan-50"
                                                    onClick={() => handleSelectExistingSacolinha(s)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <History className="h-5 w-5 text-cyan-600" />
                                                        <div className="text-left">
                                                            <div className="font-semibold">Sacolinha #{s.id}</div>
                                                            <div className="text-[10px] text-muted-foreground">
                                                                {s.itens?.length || 0} itens • R$ {totalSacolinha.toFixed(2)} • {new Date(s.createdAt).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-cyan-600" />
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            <Button
                                variant="ghost"
                                className="h-14 justify-between hover:bg-slate-100 hover:text-slate-900 border"
                                onClick={handleProceedNormalSale}
                            >
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Plus className="h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">Venda Direta (Sem Sacolinha)</div>
                                        <div className="text-[10px]">Seguir para o checkout da loja agora</div>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            {/* Modal Edit Price */}
            <Dialog open={editingItemIndex !== null} onOpenChange={() => setEditingItemIndex(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Alterar Preço do Item</DialogTitle>
                        <DialogDescription>
                            Defina o preço manualmente para este item nesta venda.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newPrice" className="text-right">
                                Novo Preço
                            </Label>
                            <Input
                                id="newPrice"
                                type="number"
                                step="0.01"
                                value={newPriceInput}
                                onChange={(e) => setNewPriceInput(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingItemIndex(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateItemPrice} className="bg-primary hover:bg-primary/90">
                            Salvar Preço
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}