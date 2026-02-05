"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, AlertTriangle, Shirt, Save, Trash2, Edit, RefreshCw, Eye, Filter, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import api, { API_URL } from "@/services/api";

// Helper component for Measurements
const MeasurementsInput = ({ value = [], onChange }) => {
    const addMeasurement = () => {
        onChange([...value, { nome: "", valor: "" }]);
    };

    const removeMeasurement = (index) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const updateMeasurement = (index, field, newVal) => {
        const newMeasurements = [...value];
        newMeasurements[index] = { ...newMeasurements[index], [field]: newVal };
        onChange(newMeasurements);
    };

    const loadStandard = () => {
        onChange([
            { nome: "Busto", valor: "" },
            { nome: "Cintura", valor: "" },
            { nome: "Quadril", valor: "" },
            { nome: "Comprimento", valor: "" }
        ]);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-primary" /> Medidas do Produto
                </Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={loadStandard}
                    className="text-xs text-primary hover:bg-primary/10 h-8"
                >
                    <Star className="h-3 w-3 mr-1 fill-primary" /> Carregar Favoritos (Padrão)
                </Button>
            </div>
            <div className="space-y-2">
                {value.map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-gray-50/50 p-2 rounded-lg border border-dashed border-gray-200">
                        <Input
                            placeholder="Nome (ex: Busto)"
                            value={m.nome}
                            onChange={(e) => updateMeasurement(idx, 'nome', e.target.value)}
                            className="flex-1 bg-white h-9 text-sm"
                        />
                        <Input
                            placeholder="Valor"
                            value={m.valor}
                            onChange={(e) => updateMeasurement(idx, 'valor', e.target.value)}
                            className="flex-1 bg-white h-9 text-sm"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeMeasurement(idx)} className="text-gray-400 hover:text-red-500 h-9 w-9">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={addMeasurement} className="h-8 text-xs">
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Medida
                    </Button>
                </div>
            </div>
        </div>
    );
};

function CadastroPecasContent() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const fornecedorIdParam = searchParams.get('fornecedorId');

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Filters State
    const [filterFornecedor, setFilterFornecedor] = useState(fornecedorIdParam || "");
    const [filterTamanho, setFilterTamanho] = useState("");
    const [filterMarca, setFilterMarca] = useState("");
    const [filterCategoria, setFilterCategoria] = useState("");
    const [filterTipoAquisicao, setFilterTipoAquisicao] = useState("TODOS");
    const [filterStatus, setFilterStatus] = useState("TODOS");

    // Modal Details State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    // Form State
    const [form, setForm] = useState({
        descricao_curta: "",
        description: "",
        tamanhoId: "",
        corId: "",
        marcaId: "",
        categoriaId: "",
        fornecedorId: "",
        preco_venda: "",
        tipo_aquisicao: "CONSIGNACAO",
        quantidade: 1,
        sync_ecommerce: true,
        is_accessory: false,
        peso_kg: "",
        altura_cm: "",
        largura_cm: "",
        profundidade_cm: "",
        fotos: [],
        medidas: [
            { nome: "Busto", valor: "" },
            { nome: "Cintura", valor: "" },
            { nome: "Quadril", valor: "" },
            { nome: "Comprimento", valor: "" }
        ]
    });

    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
    const [duplicateSearch, setDuplicateSearch] = useState("");
    const [duplicateResults, setDuplicateResults] = useState([]);
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
    const [isDamageReportOpen, setIsDamageReportOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Data Lists
    const [tamanhos, setTamanhos] = useState([]);
    const [cores, setCores] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [dimensoes, setDimensoes] = useState([]);
    const [items, setItems] = useState([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const ITEMS_PER_PAGE = 20;

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [syncingId, setSyncingId] = useState(null);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Load dropdown data once on mount
    useEffect(() => {
        loadDropdownData();
    }, []);

    // Load items when page or search changes
    useEffect(() => {
        loadItems();
    }, [currentPage, debouncedSearch, fornecedorIdParam, filterFornecedor, filterTamanho, filterMarca, filterCategoria, filterTipoAquisicao, filterStatus]);

    const loadDropdownData = async () => {
        try {
            const [tamRes, corRes, marcaRes, catRes, fornRes, dimRes] = await Promise.all([
                api.get('/cadastros/tamanhos'),
                api.get('/cadastros/cores'),
                api.get('/cadastros/marcas'),
                api.get('/cadastros/categorias'),
                api.get('/pessoas?is_fornecedor=true&simple=true'),
                api.get('/cadastros/dimensoes')
            ]);
            setTamanhos(tamRes.data);
            setCores(corRes.data);
            setMarcas(marcaRes.data);
            setCategorias(catRes.data);
            setFornecedores(fornRes.data);
            setDimensoes(dimRes.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao carregar dados auxiliares.", variant: "destructive" });
        }
    };

    const loadItems = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE
            });
            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }
            if (fornecedorIdParam && !filterFornecedor) {
                // If URL param exists but filter state is empty (initial load), use ID param
                // Effectively handled by initializing state, but let's be safe:
                params.append('fornecedorId', fornecedorIdParam);
            } else if (filterFornecedor) {
                params.append('fornecedorId', filterFornecedor);
            }

            if (filterTamanho) params.append('tamanhoId', filterTamanho);
            if (filterMarca) params.append('marcaId', filterMarca);
            if (filterCategoria) params.append('categoriaId', filterCategoria);
            if (filterTipoAquisicao && filterTipoAquisicao !== 'TODOS') params.append('tipo_aquisicao', filterTipoAquisicao);
            if (filterStatus && filterStatus !== 'TODOS') params.append('status', filterStatus);

            const res = await api.get(`/catalogo/pecas?${params.toString()}`);
            // New paginated response format
            if (res.data.data) {
                setItems(res.data.data);
                setTotalPages(res.data.totalPages || 1);
                setTotalItems(res.data.total || 0);
            } else {
                // Fallback for legacy array response
                setItems(res.data);
                setTotalPages(1);
                setTotalItems(res.data.length);
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao carregar peças.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = () => {
        if (!form.descricao_curta || !form.preco_venda) {
            toast({ title: "Erro", description: "Preencha a descrição e o preço.", variant: "destructive" });
            return;
        }

        const payload = {
            ...form,
            descricao_curta: form.descricao_curta.toUpperCase(),
            tamanhoId: form.tamanhoId || null,
            corId: form.corId || null,
            marcaId: form.marcaId || null,
            categoriaId: form.categoriaId || null,
            fornecedorId: form.fornecedorId || null,
            quantidade: form.quantidade || 1,
            sync_ecommerce: form.sync_ecommerce,
            is_accessory: form.is_accessory,
            peso_kg: form.peso_kg,
            altura_cm: form.altura_cm,
            largura_cm: form.largura_cm,
            profundidade_cm: form.profundidade_cm,
            medidas: form.medidas
        };

        api.post('/catalogo/pecas', payload)
            .then(res => {
                // Reload items from server to get updated list with pagination
                loadItems();
                setForm({
                    descricao_curta: "",
                    description: "",
                    tamanhoId: "",
                    corId: "",
                    marcaId: "",
                    categoriaId: "",
                    fornecedorId: form.fornecedorId, // Persiste o fornecedor
                    preco_venda: "",
                    tipo_aquisicao: "CONSIGNACAO",
                    quantidade: 1,
                    sync_ecommerce: true,
                    is_accessory: false,
                    peso_kg: "",
                    altura_cm: "",
                    largura_cm: "",
                    profundidade_cm: "",
                    fotos: [],
                    medidas: [
                        { nome: "Busto", valor: "" },
                        { nome: "Cintura", valor: "" },
                        { nome: "Quadril", valor: "" },
                        { nome: "Comprimento", valor: "" }
                    ]
                });
                toast({ title: "Sucesso", description: "Peça cadastrada.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao cadastrar peça.", variant: "destructive" });
            });
    };

    const handleImageUpload = async (e, isEdit = false) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newFotos = [];
        toast({ title: "Enviando...", description: `Enviando ${files.length} imagens.` });

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await api.post('/catalogo/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                const fullUrl = `${API_URL.replace('/api/v1', '')}${res.data.url}`;
                newFotos.push(fullUrl);
            } catch (err) {
                console.error(err);
                toast({ title: "Erro", description: `Erro ao enviar ${file.name}.`, variant: "destructive" });
            }
        }

        if (newFotos.length > 0) {
            if (isEdit) {
                setEditForm(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...newFotos] }));
            } else {
                setForm(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...newFotos] }));
            }
            toast({ title: "Sucesso", description: `${newFotos.length} imagens enviadas.` });
        }
    };

    const removeImage = (index, isEdit = false) => {
        if (isEdit) {
            setEditForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
        } else {
            setForm(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
        }
    };

    const handleDelete = () => {
        api.delete(`/catalogo/pecas/${currentItem.id}`)
            .then(() => {
                loadItems(); // Reload from server
                setIsDeleteOpen(false);
                toast({ title: "Removido", description: "Peça removida.", className: "bg-red-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover peça (Verifique se a rota existe).", variant: "destructive" });
            });
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setEditForm({
            descricao_curta: item.descricao_curta,
            description: item.descricao_detalhada || "",
            preco_venda: item.preco_venda,
            quantidade: item.quantidade || 1,
            sync_ecommerce: item.sync_ecommerce !== undefined ? item.sync_ecommerce : true,
            tamanhoId: item.tamanhoId ? String(item.tamanhoId) : "",
            corId: item.corId ? String(item.corId) : "",
            marcaId: item.marcaId ? String(item.marcaId) : "",
            categoriaId: item.categoriaId ? String(item.categoriaId) : "",
            fornecedorId: item.fornecedorId ? String(item.fornecedorId) : "",
            tipo_aquisicao: item.tipo_aquisicao || "COMPRA",
            fotos: item.fotos ? item.fotos.map(f => f.url) : [],
            medidas: item.medidas || []
        });
        if (item.fotos && item.fotos.length > 0 && typeof item.fotos[0] === 'object') {
            setEditForm(prev => ({ ...prev, fotos: item.fotos.map(f => f.url) }));
        }
        setIsEditOpen(true);
    };

    const saveEdit = () => {
        api.put(`/catalogo/pecas/${currentItem.id}`, editForm)
            .then(res => {
                loadItems(); // Reload from server
                setIsEditOpen(false);
                toast({ title: "Sucesso", description: "Peça atualizada.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar peça.", variant: "destructive" });
            });
    };

    const handleSync = async (item) => {
        setSyncingId(item.id);
        try {
            await api.post(`/catalogo/pecas/${item.id}/sync`);
            toast({ title: "Sincronizado", description: "Produto enviado para o E-commerce.", className: "bg-green-600 text-white border-none" });
            setItems(items.map(i => i.id === item.id ? { ...i, sync_ecommerce: true } : i));
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Falha na sincronização.", variant: "destructive" });
        } finally {
            setSyncingId(null);
        }
    };

    const loadHistory = async (item) => {
        setCurrentItem(item);
        setIsHistoryOpen(true);
        setIsLoadingHistory(true);
        try {
            const res = await api.get(`/estoque/historico/${item.id}`);
            setHistory(res.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao carregar histórico.", variant: "destructive" });
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleDuplicateSelect = (item) => {
        setForm(prev => ({
            ...prev,
            descricao_curta: `CÓPIA: ${item.descricao_curta}`,
            description: item.descricao_detalhada || "",
            tamanhoId: item.tamanhoId || "",
            corId: item.corId || "",
            marcaId: item.marcaId || "",
            categoriaId: item.categoriaId || "",
            fornecedorId: form.fornecedorId || item.fornecedorId || "", // Prefere o atual persistente
            preco_venda: item.preco_venda || "",
            tipo_aquisicao: item.tipo_aquisicao || "CONSIGNACAO",
            quantidade: 1,
            peso_kg: item.peso_kg || "",
            altura_cm: item.altura_cm || "",
            largura_cm: item.largura_cm || "",
            profundidade_cm: item.profundidade_cm || "",
            fotos: [], // Fotos não costumam ser duplicadas
            medidas: item.medidas || [
                { nome: "Busto", valor: "" },
                { nome: "Cintura", valor: "" },
                { nome: "Quadril", valor: "" },
                { nome: "Comprimento", valor: "" }
            ]
        }));
        setIsDuplicateDialogOpen(false);
        toast({ title: "Duplicado", description: "Dados preenchidos com os do produto selecionado." });
    };

    const fetchDuplicateResults = async (search) => {
        if (!search) return;
        try {
            const res = await api.get(`/catalogo/pecas?search=${search}&limit=5`);
            setDuplicateResults(Array.isArray(res.data) ? res.data : (res.data.data || []));
        } catch (err) {
            console.error("Erro ao buscar produtos para duplicar:", err);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isDuplicateDialogOpen && duplicateSearch) {
                fetchDuplicateResults(duplicateSearch);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [duplicateSearch, isDuplicateDialogOpen]);

    const confirmExitSupplier = () => {
        setIsExitConfirmOpen(false);
        setIsDamageReportOpen(true);
    };

    const handleNotifyAvaria = async (hasDamage) => {
        if (hasDamage && form.fornecedorId) {
            try {
                const forn = fornecedores.find(f => String(f.id) === String(form.fornecedorId));
                await api.post('/cadastros/notificacoes', {
                    mensagem: `AVARIA: Produto do fornecedor ${forn?.nome || 'desconhecido'} reportado com avaria no cadastro.`,
                    tipo: 'ALERTA'
                });
                toast({ title: "Notificado", description: "Lembrete de avaria criado e fornecedor marcado." });
            } catch (err) {
                console.error("Erro ao criar lembrete de avaria:", err);
            }
        }
        setIsDamageReportOpen(false);
        setForm(prev => ({ ...prev, fornecedorId: "" }));
    };

    const handleDimensionSelect = (dimId, isEdit = false) => {
        const dim = dimensoes.find(d => String(d.id) === dimId);
        if (!dim) return;

        if (isEdit) {
            setEditForm(prev => ({
                ...prev,
                peso_kg: dim.peso_kg,
                altura_cm: dim.altura_cm,
                largura_cm: dim.largura_cm,
                profundidade_cm: dim.comprimento_cm // Map comprimento_cm to profundidade_cm
            }));
        } else {
            setForm(prev => ({
                ...prev,
                peso_kg: dim.peso_kg,
                altura_cm: dim.altura_cm,
                largura_cm: dim.largura_cm,
                profundidade_cm: dim.comprimento_cm // Map comprimento_cm to profundidade_cm
            }));
        }
    };

    const getName = (list, id) => list.find(i => i.id === id)?.nome || "-";

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Cadastro Simplificado de Peças</h1>
            </div>

            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <Label>Descrição Curta (Título)</Label>
                            <Input value={form.descricao_curta} onChange={e => setForm({ ...form, descricao_curta: e.target.value })} placeholder="Ex: Vestido Longo..." />
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo Aquisição</Label>
                            <Select value={form.tipo_aquisicao} onValueChange={v => setForm({ ...form, tipo_aquisicao: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="COMPRA">Compra</SelectItem>
                                    <SelectItem value="CONSIGNACAO">Consignação</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Preço Venda (R$)</Label>
                            <Input type="number" value={form.preco_venda} onChange={e => setForm({ ...form, preco_venda: e.target.value })} placeholder="0.00" />
                        </div>

                        <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <Input type="number" min="1" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: e.target.value })} placeholder="1" />
                        </div>

                        <div className="space-y-2">
                            <Label>Tamanho</Label>
                            <SearchableSelect
                                options={tamanhos}
                                value={form.tamanhoId}
                                onValueChange={v => setForm({ ...form, tamanhoId: v })}
                                placeholder="Selecione tamanho"
                                searchPlaceholder="Buscar tamanho..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <SearchableSelect
                                options={cores}
                                value={form.corId}
                                onValueChange={v => setForm({ ...form, corId: v })}
                                placeholder="Selecione cor"
                                searchPlaceholder="Buscar cor..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <SearchableSelect
                                options={marcas}
                                value={form.marcaId}
                                onValueChange={v => setForm({ ...form, marcaId: v })}
                                placeholder="Selecione marca"
                                searchPlaceholder="Buscar marca..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <SearchableSelect
                                options={categorias}
                                value={form.categoriaId}
                                onValueChange={v => setForm({ ...form, categoriaId: v })}
                                placeholder="Selecione categoria"
                                searchPlaceholder="Buscar categoria..."
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2 relative group">
                            <Label>Fornecedor</Label>
                            <div className="flex gap-2">
                                <SearchableSelect
                                    options={fornecedores}
                                    value={form.fornecedorId}
                                    onValueChange={v => {
                                        if (!v && form.fornecedorId) {
                                            setIsExitConfirmOpen(true);
                                        } else {
                                            setForm({ ...form, fornecedorId: v });
                                        }
                                    }}
                                    placeholder="Selecione fornecedor"
                                    searchPlaceholder="Buscar fornecedor..."
                                />
                                {form.fornecedorId && (
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setIsExitConfirmOpen(true)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        title="Trocar/Encerrar Fornecedor"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-4 space-y-2">
                            <Label>Descrição Detalhada (Site)</Label>
                            <Textarea
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                                placeholder="Descrição completa do produto..."
                                rows={3}
                            />
                        </div>

                        <div className="md:col-span-4">
                            <MeasurementsInput value={form.medidas} onChange={(val) => setForm({ ...form, medidas: val })} />
                        </div>

                        <div className="md:col-span-4 border-t pt-4 mt-4">
                            <h3 className="font-semibold mb-4">Frete e Dimensões</h3>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                                <div className="space-y-2 md:col-span-1">
                                    <Label>Dimensão Padrão</Label>
                                    <Select onValueChange={(v) => handleDimensionSelect(v, false)}>
                                        <SelectTrigger><SelectValue placeholder="Carregar padrão..." /></SelectTrigger>
                                        <SelectContent>
                                            {dimensoes.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.nome}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Peso (kg)</Label>
                                    <Input type="number" step="0.001" value={form.peso_kg} onChange={e => setForm({ ...form, peso_kg: e.target.value })} placeholder="0.000" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Altura (cm)</Label>
                                    <Input type="number" value={form.altura_cm} onChange={e => setForm({ ...form, altura_cm: e.target.value })} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Largura (cm)</Label>
                                    <Input type="number" value={form.largura_cm} onChange={e => setForm({ ...form, largura_cm: e.target.value })} placeholder="0" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Comprimento (cm)</Label>
                                    <Input type="number" value={form.profundidade_cm} onChange={e => setForm({ ...form, profundidade_cm: e.target.value })} placeholder="0" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 flex items-center gap-2 mt-4">
                            <Checkbox
                                id="is_accessory"
                                checked={form.is_accessory}
                                onCheckedChange={(checked) => setForm({ ...form, is_accessory: checked })}
                            />
                            <Label htmlFor="is_accessory" className="cursor-pointer font-medium">Este produto é um Acessório?</Label>
                        </div>

                        <div className="space-y-2 flex items-center gap-2 mt-8">
                            <Checkbox
                                id="sync"
                                checked={!form.sync_ecommerce}
                                onCheckedChange={(checked) => setForm({ ...form, sync_ecommerce: !checked })}
                            />
                            <Label htmlFor="sync" className="cursor-pointer">Não Sincronizar com E-commerce</Label>
                        </div>

                        <div className="md:col-span-4 space-y-2">
                            <Label>Fotos do Produto</Label>
                            <div className="flex gap-4 items-center flex-wrap">
                                {form.fotos && form.fotos.map((url, idx) => (
                                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                                        <img
                                            src={url.startsWith('http') ? url : `${API_URL.replace('/api/v1', '')}${url}`}
                                            alt="Foto"
                                            className="w-full h-full object-cover"
                                        />
                                        <button onClick={() => removeImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-colors">
                                    <Plus className="h-6 w-6" />
                                    <span className="text-xs text-center px-1">Add Fotos</span>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-4 flex items-end justify-between gap-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDuplicateSearch("");
                                    setDuplicateResults([]);
                                    setIsDuplicateDialogOpen(true);
                                }}
                                className="border-primary text-primary hover:bg-primary/5 h-10 px-6 w-full md:w-auto"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" /> Duplicar Produto Existente
                            </Button>
                            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-8 w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar ao Estoque
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modais de Fluxo de Fornecedor */}
            <Dialog open={isExitConfirmOpen} onOpenChange={setIsExitConfirmOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Encerrar Sessão?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Deseja encerrar o cadastro para o fornecedor <strong>{fornecedores.find(f => String(f.id) === String(form.fornecedorId))?.nome}</strong>?</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExitConfirmOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmExitSupplier}>Sim, encerrar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDamageReportOpen} onOpenChange={setIsDamageReportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Relatório de Avaria</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <p className="font-medium text-amber-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Importante
                        </p>
                        <p>Este produto tem alguma avaria e você deseja notificar o fornecedor agora?</p>
                    </div>
                    <DialogFooter className="flex gap-2 sm:justify-between w-full">
                        <Button variant="outline" onClick={() => handleNotifyAvaria(false)} className="flex-1">Não, sem avaria</Button>
                        <Button onClick={() => handleNotifyAvaria(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex-1 text-xs">Sim, notificar avaria</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            Duplicar Produto Existente
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground">
                            Pesquise um produto para copiar suas informações para o formulário de cadastro.
                        </p>
                    </DialogHeader>

                    <div className="py-2 space-y-4 flex-1 flex flex-col min-h-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por código, descrição ou marca..."
                                value={duplicateSearch}
                                onChange={(e) => setDuplicateSearch(e.target.value)}
                                className="pl-10"
                                autoFocus
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {duplicateResults.length > 0 ? (
                                duplicateResults.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 border rounded-lg hover:border-primary hover:bg-primary/5 cursor-pointer transition-all group"
                                        onClick={() => handleDuplicateSelect(item)}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <div className="h-10 w-10 bg-muted rounded flex items-center justify-center group-hover:bg-primary/10">
                                                <Shirt className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm line-clamp-1">{item.descricao_curta}</p>
                                                <div className="flex gap-2 text-[10px] text-muted-foreground">
                                                    <span className="font-mono">{item.codigo_etiqueta}</span>
                                                    <span>•</span>
                                                    <span>{item.marca?.nome || 'Sem Marca'}</span>
                                                    <span>•</span>
                                                    <span>{item.tamanho?.nome || 'U'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-primary">R$ {item.preco_venda}</p>
                                            <Button variant="ghost" size="sm" className="h-6 text-[10px] p-0 hover:bg-transparent text-primary underline">
                                                Selecionar
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : duplicateSearch ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Nenhum produto encontrado para "{duplicateSearch}"</p>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p>Comece a digitar para buscar produtos...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <div className="p-4 bg-white border-b space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1 w-full relative">
                            <Label className="text-xs text-gray-500">Busca Rápida</Label>
                            <Input
                                placeholder="Buscar por nome ou código..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                            <Search className="absolute left-3 bottom-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <div className="hidden md:flex items-center gap-2 pb-1">
                            {/* Stats or Actions */}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Fornecedor</Label>
                            <SearchableSelect
                                options={fornecedores}
                                value={filterFornecedor}
                                onValueChange={setFilterFornecedor}
                                placeholder="Todos"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Tamanho</Label>
                            <SearchableSelect
                                options={tamanhos}
                                value={filterTamanho}
                                onValueChange={setFilterTamanho}
                                placeholder="Todos"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Marca</Label>
                            <SearchableSelect
                                options={marcas}
                                value={filterMarca}
                                onValueChange={setFilterMarca}
                                placeholder="Todas"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Categoria</Label>
                            <SearchableSelect
                                options={categorias}
                                value={filterCategoria}
                                onValueChange={setFilterCategoria}
                                placeholder="Todas"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Aquisição</Label>
                            <Select value={filterTipoAquisicao} onValueChange={setFilterTipoAquisicao}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODOS">Todas</SelectItem>
                                    <SelectItem value="COMPRA">Compra</SelectItem>
                                    <SelectItem value="CONSIGNACAO">Consignação</SelectItem>
                                    <SelectItem value="DOACAO">Doação</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Status</Label>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODOS">Todos</SelectItem>
                                    <SelectItem value="DISPONIVEL">Disponível</SelectItem>
                                    <SelectItem value="VENDIDA">Vendida</SelectItem>
                                    <SelectItem value="RESERVADA_SACOLINHA">Reservada</SelectItem>
                                    <SelectItem value="DEVOLVIDA">Devolvida</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="text-sm text-gray-500">
                            {isLoading ? "Filtrando..." : `${totalItems} itens encontrados`}
                        </div>
                        {(filterFornecedor || filterTamanho || filterMarca || filterCategoria || filterTipoAquisicao !== 'TODOS') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilterFornecedor("");
                                    setFilterTamanho("");
                                    setFilterMarca("");
                                    setFilterCategoria("");
                                    setFilterTipoAquisicao("TODOS");
                                    setFilterStatus("TODOS");
                                    setSearchTerm("");
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="h-4 w-4 mr-1" /> Limpar Filtros
                            </Button>
                        )}
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-white">
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Foto</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tam</TableHead>
                            <TableHead>Cor</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Preço</TableHead>
                            <TableHead className="text-center">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id} className="border-b">
                                <TableCell>{String(item.id).padStart(6, '0')}</TableCell>
                                <TableCell>
                                    <div className="w-12 h-12 rounded overflow-hidden border bg-gray-100 flex items-center justify-center">
                                        {item.fotos && item.fotos.length > 0 && item.fotos[0].url ? (
                                            <img
                                                src={item.fotos[0].url.startsWith('http') ? item.fotos[0].url : `${API_URL.replace('/api/v1', '')}${item.fotos[0].url}`}
                                                alt="Foto"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Shirt className="h-6 w-6 text-gray-300" />
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.descricao_curta}</TableCell>
                                <TableCell><Badge variant="outline">{item.tamanho ? item.tamanho.nome : getName(tamanhos, item.tamanhoId)}</Badge></TableCell>
                                <TableCell>{item.cor ? item.cor.nome : getName(cores, item.corId)}</TableCell>
                                <TableCell>{item.marca ? item.marca.nome : getName(marcas, item.marcaId)}</TableCell>
                                <TableCell>
                                    <Badge variant={item.status === 'VENDIDA' ? 'destructive' : item.status === 'DISPONIVEL' ? 'default' : 'secondary'}>
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold text-primary">R$ {item.preco_venda}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => { setCurrentItem(item); setIsDetailsOpen(true); }}
                                            className="bg-purple-500 hover:bg-purple-600 text-white h-7 px-2"
                                            title="Ver Detalhes"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" onClick={() => handleEdit(item)} className="bg-blue-500 hover:bg-blue-600 text-white h-7 px-2">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleSync(item)}
                                            disabled={syncingId === item.id}
                                            className="bg-green-500 hover:bg-green-600 text-white h-7 px-2"
                                            title="Sincronizar com E-commerce"
                                        >
                                            <RefreshCw className={`h-4 w-4 ${syncingId === item.id ? 'animate-spin' : ''}`} />
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => loadHistory(item)}
                                            className="bg-orange-500 hover:bg-orange-600 text-white h-7 px-2"
                                            title="Histórico de Movimentação"
                                        >
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} className="bg-red-500 hover:bg-red-600 text-white h-7 px-2">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {/* Pagination Controls */}
                <div className="p-4 bg-white border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1 || isLoading}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages || isLoading}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Próxima
                        </Button>
                    </div>
                </div>
            </Card>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="text-red-600">Excluir Peça</DialogTitle></DialogHeader>
                    <p>Remover <strong>{currentItem?.descricao_curta}</strong> do cadastro?</p>
                    <DialogFooter><Button onClick={handleDelete} className="bg-red-600 text-white">Sim, excluir</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Editar Peça</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Descrição Curta</Label>
                                <Input value={editForm.descricao_curta} onChange={e => setEditForm({ ...editForm, descricao_curta: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Preço Venda</Label>
                                <Input type="number" value={editForm.preco_venda} onChange={e => setEditForm({ ...editForm, preco_venda: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Quantidade</Label>
                                <Input type="number" value={editForm.quantidade} onChange={e => setEditForm({ ...editForm, quantidade: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Tipo Aquisição</Label>
                                <Select value={editForm.tipo_aquisicao} onValueChange={v => setEditForm({ ...editForm, tipo_aquisicao: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="COMPRA">Compra</SelectItem>
                                        <SelectItem value="CONSIGNACAO">Consignação</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tamanho</Label>
                                <SearchableSelect
                                    options={tamanhos}
                                    value={editForm.tamanhoId}
                                    onValueChange={v => setEditForm({ ...editForm, tamanhoId: v })}
                                    placeholder="Selecione tamanho"
                                    searchPlaceholder="Buscar tamanho..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cor</Label>
                                <SearchableSelect
                                    options={cores}
                                    value={editForm.corId}
                                    onValueChange={v => setEditForm({ ...editForm, corId: v })}
                                    placeholder="Selecione cor"
                                    searchPlaceholder="Buscar cor..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <SearchableSelect
                                    options={marcas}
                                    value={editForm.marcaId}
                                    onValueChange={v => setEditForm({ ...editForm, marcaId: v })}
                                    placeholder="Selecione marca"
                                    searchPlaceholder="Buscar marca..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <SearchableSelect
                                    options={categorias}
                                    value={editForm.categoriaId}
                                    onValueChange={v => setEditForm({ ...editForm, categoriaId: v })}
                                    placeholder="Selecione categoria"
                                    searchPlaceholder="Buscar categoria..."
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Fornecedor</Label>
                                <SearchableSelect
                                    options={fornecedores}
                                    value={editForm.fornecedorId}
                                    onValueChange={v => setEditForm({ ...editForm, fornecedorId: v })}
                                    placeholder="Selecione fornecedor"
                                    searchPlaceholder="Buscar fornecedor..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Descrição Detalhada</Label>
                            <Textarea
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <MeasurementsInput value={editForm.medidas} onChange={(val) => setEditForm({ ...editForm, medidas: val })} />
                        </div>

                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="edit-sync"
                                checked={!editForm.sync_ecommerce}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, sync_ecommerce: !checked })}
                            />
                            <Label htmlFor="edit-sync" className="cursor-pointer">Não Sincronizar com E-commerce</Label>
                        </div>

                        <div className="space-y-2">
                            <Label>Fotos</Label>
                            <div className="flex gap-4 items-center flex-wrap">
                                {editForm.fotos && editForm.fotos.map((url, idx) => (
                                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden group">
                                        <img
                                            src={url.startsWith('http') ? url : `${API_URL.replace('/api/v1', '')}${url}`}
                                            alt="Foto"
                                            className="w-full h-full object-cover"
                                        />
                                        <button onClick={() => removeImage(idx, true)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:text-primary transition-colors">
                                    <Plus className="h-6 w-6" />
                                    <span className="text-xs text-center px-1">Add</span>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleImageUpload(e, true)} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button onClick={saveEdit}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Detalhes */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Detalhes do Produto {currentItem ? `- #${String(currentItem.id).padStart(6, '0')}` : ''}</DialogTitle>
                    </DialogHeader>
                    {currentItem && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Coluna Fotos */}
                            <div className="space-y-4">
                                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                                    {currentItem.fotos && currentItem.fotos.length > 0 ? (
                                        <img
                                            src={currentItem.fotos[0].url.startsWith('http') ? currentItem.fotos[0].url : `${API_URL.replace('/api/v1', '')}${currentItem.fotos[0].url}`}
                                            alt="Principal"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Shirt className="h-24 w-24 opacity-20" />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {currentItem.fotos && currentItem.fotos.slice(1).map((f, idx) => (
                                        <div key={idx} className="aspect-square bg-gray-50 rounded border overflow-hidden">
                                            <img
                                                src={f.url.startsWith('http') ? f.url : `${API_URL.replace('/api/v1', '')}${f.url}`}
                                                alt={`Foto ${idx + 2}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Coluna Infos */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg">{currentItem.descricao_curta}</h3>
                                    <p className="text-sm text-gray-500">{currentItem.descricao_detalhada || "Sem descrição detalhada."}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="text-xs text-gray-500 uppercase">Preço Venda</div>
                                        <div className="text-xl font-bold text-green-700">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentItem.preco_venda || 0)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg border">
                                        <div className="text-xs text-gray-500 uppercase">Status</div>
                                        <div><Badge variant="secondary">{currentItem.status}</Badge></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm border-b pb-1">Atributos</h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div><span className="text-gray-500">Tamanho:</span> {currentItem.tamanho?.nome || '-'}</div>
                                        <div><span className="text-gray-500">Cor:</span> {currentItem.cor?.nome || '-'}</div>
                                        <div><span className="text-gray-500">Marca:</span> {currentItem.marca?.nome || '-'}</div>
                                        <div><span className="text-gray-500">Categoria:</span> {currentItem.categoria?.nome || '-'}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-sm border-b pb-1">Aquisição</h4>
                                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                                        <div><span className="text-gray-500">Tipo:</span> {currentItem.tipo_aquisicao}</div>
                                        <div><span className="text-gray-500">Fornecedor:</span> {currentItem.fornecedor?.nome || '-'}</div>
                                        <div><span className="text-gray-500">Custo:</span> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentItem.preco_custo || 0)}</div>
                                        <div><span className="text-gray-500">Data Entrada:</span> {new Date(currentItem.data_entrada).toLocaleDateString('pt-BR')}</div>
                                    </div>
                                </div>

                                {currentItem.medidas && currentItem.medidas.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm border-b pb-1">Medidas Específicas</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {currentItem.medidas.map((m, i) => (
                                                <div key={i} className="text-sm border p-1 rounded bg-white">
                                                    <span className="font-medium">{m.nome}:</span> {m.valor}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Fechar</Button>
                        <Button onClick={() => { setIsDetailsOpen(false); openEdit(currentItem); }}>Editar Produto</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Histórico */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Histórico de Movimentação - {currentItem?.descricao_curta}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {isLoadingHistory ? (
                            <div className="flex justify-center py-10"><RefreshCw className="h-8 w-8 animate-spin text-primary" /></div>
                        ) : history.length === 0 ? (
                            <div className="text-center py-10 text-muted-foreground">Nenhuma movimentação registrada.</div>
                        ) : (
                            <div className="space-y-4">
                                {history.map((h, i) => (
                                    <div key={i} className="flex items-start gap-4 p-3 border rounded-lg bg-gray-50">
                                        <div className={`mt-1 h-2 w-2 rounded-full ${h.tipo.includes('ENTRADA') ? 'bg-green-500' : 'bg-red-500'}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm">{h.tipo.replace(/_/g, ' ')}</span>
                                                <span className="text-xs text-muted-foreground">{new Date(h.createdAt || h.data_movimento).toLocaleString('pt-BR')}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{h.motivo}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function CadastroPecasSimplesPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <CadastroPecasContent />
        </Suspense>
    );
}