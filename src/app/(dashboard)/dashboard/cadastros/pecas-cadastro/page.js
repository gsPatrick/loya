"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Plus, AlertTriangle, Shirt, Save, Trash2, Edit, RefreshCw, Eye, Filter, X, Star, Package, FileSpreadsheet, Printer } from "lucide-react";
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

import * as XLSX from 'xlsx';

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
        <div className="space-y-4 bg-gray-50/30 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Shirt className="h-4 w-4" />
                    </div>
                    <Label className="text-sm font-bold uppercase tracking-tight text-gray-700">
                        Medidas Específicas
                    </Label>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={loadStandard}
                    className="text-[10px] font-bold uppercase tracking-wider h-7 px-3 rounded-full border-primary/20 text-primary hover:bg-primary/5"
                >
                    <Star className="h-3 w-3 mr-1 fill-primary" /> Sugerir Padrão
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {value.map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded-xl border border-gray-200 shadow-sm transition-all hover:border-primary/30">
                        <div className="flex-1 space-y-1">
                            <input
                                placeholder="ex: Busto"
                                value={m.nome}
                                onChange={(e) => updateMeasurement(idx, 'nome', e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 text-[11px] font-bold text-gray-400 p-0 uppercase"
                            />
                            <Input
                                placeholder="Valor"
                                value={m.valor}
                                onChange={(e) => updateMeasurement(idx, 'valor', e.target.value)}
                                className="h-8 border-none bg-gray-50/50 p-2 text-sm focus-visible:ring-1 focus-visible:ring-primary/20 font-medium"
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMeasurement(idx)}
                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 h-8 w-8 rounded-lg flex-shrink-0 self-end mb-1"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addMeasurement}
                className="w-full h-9 border-2 border-dashed border-gray-200 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
            >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Parâmetro de Medida
            </Button>
        </div>
    );
};

function CadastroPecasContent() {
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const fornecedorIdParam = searchParams.get('fornecedorId');
    const searchTermParam = searchParams.get('search') || "";

    const [searchTerm, setSearchTerm] = useState(searchTermParam);
    const [debouncedSearch, setDebouncedSearch] = useState(searchTermParam);

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
    const [selectedItems, setSelectedItems] = useState([]);

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
        // Sanitize IDs - convert empty strings to null
        const sanitizedForm = {
            ...editForm,
            tamanhoId: editForm.tamanhoId || null,
            corId: editForm.corId || null,
            marcaId: editForm.marcaId || null,
            categoriaId: editForm.categoriaId || null,
            fornecedorId: editForm.fornecedorId || null
        };

        api.put(`/catalogo/pecas/${currentItem.id}`, sanitizedForm)
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

    // Selection/Export Logic
    const toggleItemSelection = (id) => {
        setSelectedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAllItems = () => {
        if (selectedItems.length === items.length && items.length > 0) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.map(i => i.id));
        }
    };

    const exportToExcel = () => {
        const dataToExport = items.filter(i => selectedItems.includes(i.id));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport.map(i => ({
            ID: i.id,
            Descricao: i.descricao_curta,
            Marca: i.marca?.nome,
            Tamanho: i.tamanho?.nome,
            Cor: i.cor?.nome,
            Preco_Venda: i.preco_venda,
            Comissao: i.comissao_padrao,
            Fornecedor: i.fornecedor?.nome,
            Status: i.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos");
        XLSX.writeFile(workbook, "relatorio_pecas.xlsx");
    };

    const handlePrint = () => {
        const dataToPrint = items.filter(i => selectedItems.includes(i.id));
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Relatório de Produtos</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 12px; }
                        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                        th { background: #f4f4f4; }
                        h1 { font-family: sans-serif; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>Relatório de Produtos</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Peça</th>
                                <th>Marca</th>
                                <th>Tam</th>
                                <th>Venda</th>
                                <th>Fornecedor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dataToPrint.map(i => `
                                <tr>
                                    <td>#${i.id}</td>
                                    <td>${i.descricao_curta}</td>
                                    <td>${i.marca?.nome || '-'}</td>
                                    <td>${i.tamanho?.nome || '-'}</td>
                                    <td>R$ ${parseFloat(i.preco_venda).toFixed(2)}</td>
                                    <td>${i.fornecedor?.nome || '-'}</td>
                                    <td>${i.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
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
            {/* Listagem */}
            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <div className="p-4 bg-white border-b space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                <Package className="h-5 w-5" /> Estoque de Peças
                            </h2>
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {totalItems} itens no total
                            </Badge>
                        </div>
                        <div className="flex gap-2">
                            {selectedItems.length > 0 && (
                                <>
                                    <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                                        <FileSpreadsheet className="h-4 w-4" /> Excel
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                                        <Printer className="h-4 w-4" /> Imprimir
                                    </Button>
                                </>
                            )}
                            <div className="relative w-[250px]">
                                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Busca rápida..." className="h-9 pl-9" />
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Fornecedor</Label>
                            <SearchableSelect options={fornecedores} value={filterFornecedor} onValueChange={setFilterFornecedor} placeholder="Todos" searchPlaceholder="Buscar..." />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Tamanho</Label>
                            <SearchableSelect options={tamanhos} value={filterTamanho} onValueChange={setFilterTamanho} placeholder="Todos" searchPlaceholder="Buscar..." />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Marca</Label>
                            <SearchableSelect options={marcas} value={filterMarca} onValueChange={setFilterMarca} placeholder="Todas" searchPlaceholder="Buscar..." />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Categoria</Label>
                            <SearchableSelect options={categorias} value={filterCategoria} onValueChange={setFilterCategoria} placeholder="Todas" searchPlaceholder="Buscar..." />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Aquisição</Label>
                            <Select value={filterTipoAquisicao} onValueChange={setFilterTipoAquisicao}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODOS">Todas</SelectItem>
                                    <SelectItem value="COMPRA">Compra</SelectItem>
                                    <SelectItem value="CONSIGNACAO">Consignação</SelectItem>
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
                                    <SelectItem value="DEVOLVIDA">Devolvida</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="text-sm text-gray-500">
                            {isLoading ? "Filtrando..." : `${totalItems} itens encontrados`}
                        </div>
                        {(filterFornecedor || filterTamanho || filterMarca || filterCategoria || filterTipoAquisicao !== 'TODOS' || filterStatus !== 'TODOS') && (
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

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox checked={selectedItems.length === items.length && items.length > 0} onCheckedChange={toggleAllItems} />
                                </TableHead>
                                <TableHead className="w-[80px]">ID</TableHead>
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
                            {isLoading ? (
                                <TableRow><TableCell colSpan={10} className="text-center py-20"><RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary/20" /></TableCell></TableRow>
                            ) : items.map((p) => (
                                <TableRow key={p.id} className={`hover:bg-primary/5 border-b ${selectedItems.includes(p.id) ? "bg-primary/5" : ""}`}>
                                    <TableCell>
                                        <Checkbox checked={selectedItems.includes(p.id)} onCheckedChange={() => toggleItemSelection(p.id)} />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">#{String(p.id).padStart(4, '0')}</TableCell>
                                    <TableCell>
                                        <div className="w-10 h-10 rounded overflow-hidden border bg-muted flex items-center justify-center">
                                            {p.fotos && p.fotos.length > 0 ? (
                                                <img
                                                    src={p.fotos[0].url.startsWith('http') ? p.fotos[0].url : `${API_URL.replace('/api/v1', '')}${p.fotos[0].url}`}
                                                    alt="Foto"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Shirt className="h-5 w-5 text-muted-foreground" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{p.descricao_curta}</TableCell>
                                    <TableCell><Badge variant="outline">{p.tamanho?.nome || '-'}</Badge></TableCell>
                                    <TableCell>{p.cor?.nome || '-'}</TableCell>
                                    <TableCell>{p.marca?.nome || '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={p.status === 'VENDIDA' ? 'destructive' : p.status === 'DISPONIVEL' ? 'default' : 'secondary'}>
                                            {p.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-primary">R$ {parseFloat(p.preco_venda).toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setCurrentItem(p); setIsDetailsOpen(true); }}><Eye className="h-4 w-4 text-purple-600" /></Button>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleEdit(p)}><Edit className="h-4 w-4 text-blue-600" /></Button>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Sincronizar" onClick={() => handleSync(p)} disabled={syncingId === p.id}>
                                                <RefreshCw className={`h-4 w-4 text-green-600 ${syncingId === p.id ? 'animate-spin' : ''}`} />
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Histórico" onClick={() => loadHistory(p)}><RefreshCw className="h-4 w-4 text-orange-600" /></Button>
                                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => { setCurrentItem(p); setIsDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 bg-white border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalPages} ({totalItems} itens)
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

            {/* Modal Detalhes Melhorado */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl">
                    {currentItem && (
                        <div className="flex flex-col">
                            {/* Header Colorido/Moderno */}
                            <div className="bg-primary p-6 text-primary-foreground">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-primary-foreground border-primary-foreground/30 bg-primary-foreground/10 font-mono">
                                                #{String(currentItem.id).padStart(6, '0')}
                                            </Badge>
                                            <Badge variant="outline" className="text-primary-foreground border-primary-foreground/30 bg-primary-foreground/10 uppercase text-[10px] tracking-widest">
                                                {currentItem.codigo_etiqueta}
                                            </Badge>
                                        </div>
                                        <h2 className="text-2xl font-bold leading-tight">{currentItem.descricao_curta}</h2>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setIsDetailsOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10">
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Galeria de Imagens (4 cols) */}
                                <div className="md:col-span-5 space-y-4">
                                    <div className="aspect-[4/5] bg-gray-50 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner group relative">
                                        {currentItem.fotos && currentItem.fotos.length > 0 ? (
                                            <img
                                                src={currentItem.fotos[0].url.startsWith('http') ? currentItem.fotos[0].url : `${API_URL.replace('/api/v1', '')}${currentItem.fotos[0].url}`}
                                                alt="Principal"
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                                <Shirt className="h-20 w-20 mb-2 opacity-20" />
                                                <span className="text-xs font-medium">Sem imagem cadastrada</span>
                                            </div>
                                        )}
                                        <div className="absolute top-3 right-3">
                                            <Badge className={currentItem.status === 'DISPONIVEL' ? "bg-green-500 shadow-lg" : "bg-amber-500 shadow-lg"}>
                                                {currentItem.status}
                                            </Badge>
                                        </div>
                                    </div>

                                    {currentItem.fotos && currentItem.fotos.length > 1 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                            {currentItem.fotos.map((f, idx) => (
                                                <div key={idx} className="flex-shrink-0 w-16 h-20 rounded-lg border overflow-hidden cursor-pointer hover:border-primary transition-colors">
                                                    <img
                                                        src={f.url.startsWith('http') ? f.url : `${API_URL.replace('/api/v1', '')}${f.url}`}
                                                        alt={`Thumbnail ${idx}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Conteúdo de Dados (7 cols) */}
                                <div className="md:col-span-7 space-y-6">
                                    {/* Preços e Estoque */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                            <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest block mb-1">Preço de Venda</span>
                                            <div className="text-2xl font-black text-green-700">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentItem.preco_venda || 0)}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block mb-1">Estoque</span>
                                            <div className="text-2xl font-black text-blue-700">
                                                {currentItem.quantidade || 0} <span className="text-sm font-medium">unid.</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Atributos Principais */}
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 py-4 border-y border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Badge variant="outline" className="border-none p-0"><Shirt className="h-4 w-4" /></Badge>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Marca</span>
                                                <span className="font-semibold text-sm">{currentItem.marca?.nome || 'Multimarcas'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                SZ
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Tamanho</span>
                                                <span className="font-semibold text-sm">{currentItem.tamanho?.nome || 'Único'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: currentItem.cor?.hex || '#ccc' }} />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Cor</span>
                                                <span className="font-semibold text-sm">{currentItem.cor?.nome || '-'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Filter className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Categoria</span>
                                                <span className="font-semibold text-sm">{currentItem.categoria?.nome || '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descrição Detalhada */}
                                    <div className="space-y-2">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block">Sobre o Produto</span>
                                        <p className="text-sm text-gray-600 leading-relaxed italic">
                                            {currentItem.descricao_detalhada || "Nenhuma descrição detalhada informada para este item."}
                                        </p>
                                    </div>

                                    {/* Seção Fornecedor */}
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-primary font-bold">
                                                {currentItem.fornecedor?.nome?.charAt(0)}
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-400 uppercase font-bold block">Fornecedor</span>
                                                <span className="font-bold text-sm">{currentItem.fornecedor?.nome || '-'}</span>
                                                <span className="text-[10px] block text-gray-400">{currentItem.tipo_aquisicao}</span>
                                            </div>
                                        </div>
                                        {currentItem.fornecedor?.telefone_whatsapp && (
                                            <Button variant="outline" size="sm" className="h-8 rounded-full gap-2 border-green-200 text-green-600 hover:bg-green-50" onClick={() => window.open(`https://wa.me/55${currentItem.fornecedor.telefone_whatsapp.replace(/\D/g, '')}`, '_blank')}>
                                                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.239 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.224-3.82c1.516.903 3.188 1.386 4.895 1.387 5.385 0 9.774-4.388 9.777-9.776 0-2.611-1.015-5.065-2.859-6.91-1.84-1.848-4.293-2.866-6.907-2.866-5.385 0-9.774 4.388-9.776 9.776 0 1.832.51 3.615 1.477 5.2l-.387 1.413.973-.255zm10.518-7.14c.299.149.379.225.43.307.052.083.052.242-.147.646-.197.402-.994 1.102-1.41 1.419-.408.312-.823.36-1.059.36-.236 0-1.801-.159-3.414-1.536-1.612-1.377-2.311-2.613-2.585-2.915-.275-.303-.526-.644-.526-1.096 0-.452.235-.664.336-.784.101-.12.235-.224.299-.307.064-.083.101-.11.168-.22.127-.225.064-.424-.032-.625-.096-.2-.401-.967-.549-1.321-.143-.341-.289-.296-.398-.296-.103 0-.323-.002-.549-.002-.225 0-.589.083-.898.424-.31.341-1.184 1.155-1.184 2.81 0 1.656 1.201 3.254 1.368 3.475.168.22 2.36 3.601 5.717 5.049.799.345 1.423.551 1.91.706.801.258 1.53.221 2.106.135.641-.096 1.964-.803 2.241-1.576.277-.774.277-1.438.194-1.576z" /></svg>
                                                Conversar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer de Ações */}
                            <div className="bg-gray-50 p-4 border-t flex justify-between gap-4">
                                <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="flex-1 md:flex-none px-6">Fechar</Button>
                                <div className="flex gap-2 flex-1 md:flex-none">
                                    <Button variant="outline" className="flex-1 md:flex-none gap-2 border-primary text-primary hover:bg-primary/5 px-6" onClick={() => { setIsDetailsOpen(false); handleSync(currentItem); }}>
                                        <RefreshCw className="h-4 w-4" /> Sincronizar
                                    </Button>
                                    <Button className="flex-1 md:flex-none gap-2 bg-primary hover:bg-primary/90 px-8" onClick={() => { setIsDetailsOpen(false); handleEdit(currentItem); }}>
                                        <Edit className="h-4 w-4" /> Editar Produto
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
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
        </div >
    );
}

export default function CadastroPecasSimplesPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <CadastroPecasContent />
        </Suspense>
    );
}