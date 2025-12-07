"use client";

import { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle, Shirt, Save, Trash2, Edit, RefreshCw } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// ... existing imports ...

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

    return (
        <div className="space-y-2">
            <Label>Medidas Personalizadas</Label>
            <div className="space-y-2">
                {value.map((m, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                        <Input
                            placeholder="Nome (ex: Busto)"
                            value={m.nome}
                            onChange={(e) => updateMeasurement(idx, 'nome', e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            placeholder="Valor (ex: 34cm)"
                            value={m.valor}
                            onChange={(e) => updateMeasurement(idx, 'valor', e.target.value)}
                            className="flex-1"
                        />
                        <Button variant="destructive" size="icon" onClick={() => removeMeasurement(idx)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addMeasurement}>
                    <Plus className="h-4 w-4 mr-2" /> Adicionar Medida
                </Button>
            </div>
        </div>
    );
};

export default function CadastroPecasSimplesPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

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
        tipo_aquisicao: "COMPRA",
        quantidade: 1,
        sync_ecommerce: true,
        is_accessory: false,
        peso_kg: "",
        altura_cm: "",
        largura_cm: "",
        profundidade_cm: "",
        fotos: [],
        medidas: []
    });

    // Data Lists
    const [tamanhos, setTamanhos] = useState([]);
    const [cores, setCores] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [dimensoes, setDimensoes] = useState([]);
    const [items, setItems] = useState([]);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [syncingId, setSyncingId] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tamRes, corRes, marcaRes, catRes, fornRes, pecasRes, dimRes] = await Promise.all([
                api.get('/cadastros/tamanhos'),
                api.get('/cadastros/cores'),
                api.get('/cadastros/marcas'),
                api.get('/cadastros/categorias'),
                api.get('/pessoas?is_fornecedor=true'),
                api.get('/catalogo/pecas'),
                api.get('/cadastros/dimensoes')
            ]);

            setTamanhos(tamRes.data);
            setCores(corRes.data);
            setMarcas(marcaRes.data);
            setCategorias(catRes.data);
            setFornecedores(fornRes.data);
            setItems(pecasRes.data);
            setDimensoes(dimRes.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao carregar dados.", variant: "destructive" });
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
                setItems([...items, res.data]);
                setForm({
                    descricao_curta: "",
                    description: "",
                    tamanhoId: "",
                    corId: "",
                    marcaId: "",
                    categoriaId: "",
                    fornecedorId: "",
                    preco_venda: "",
                    tipo_aquisicao: "COMPRA",
                    quantidade: 1,
                    sync_ecommerce: true,
                    is_accessory: false,
                    peso_kg: "",
                    altura_cm: "",
                    largura_cm: "",
                    profundidade_cm: "",
                    fotos: [],
                    medidas: []
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
                const fullUrl = `https://geral-tiptagapi.r954jc.easypanel.host${res.data.url}`;
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
                setItems(items.filter(i => i.id !== currentItem.id));
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
                loadData();
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
                            <Select value={String(form.tamanhoId)} onValueChange={v => setForm({ ...form, tamanhoId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {tamanhos.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Cor</Label>
                            <Select value={String(form.corId)} onValueChange={v => setForm({ ...form, corId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {cores.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Marca</Label>
                            <Select value={String(form.marcaId)} onValueChange={v => setForm({ ...form, marcaId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {marcas.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select value={String(form.categoriaId)} onValueChange={v => setForm({ ...form, categoriaId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    {categorias.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label>Fornecedor</Label>
                            <Select value={String(form.fornecedorId)} onValueChange={v => setForm({ ...form, fornecedorId: v })}>
                                <SelectTrigger><SelectValue placeholder="Selecione o fornecedor" /></SelectTrigger>
                                <SelectContent>
                                    {fornecedores.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nome}</SelectItem>)}
                                </SelectContent>
                            </Select>
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
                                            src={url.startsWith('http') ? url : `https://geral-tiptagapi.r954jc.easypanel.host${url}`}
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

                        <div className="md:col-span-4 flex items-end justify-end">
                            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-8 w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar ao Estoque
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <div className="p-4 bg-white"><Input placeholder="Buscar peça..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
                <Table>
                    <TableHeader className="bg-white">
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Tam</TableHead>
                            <TableHead>Cor</TableHead>
                            <TableHead>Marca</TableHead>
                            <TableHead className="text-right">Preço</TableHead>
                            <TableHead className="text-center">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.filter(i => i.descricao_curta && i.descricao_curta.includes(searchTerm.toUpperCase())).map((item) => (
                            <TableRow key={item.id} className="border-b">
                                <TableCell>{String(item.id).padStart(6, '0')}</TableCell>
                                <TableCell className="font-medium">{item.descricao_curta}</TableCell>
                                <TableCell><Badge variant="outline">{item.tamanho ? item.tamanho.nome : getName(tamanhos, item.tamanhoId)}</Badge></TableCell>
                                <TableCell>{item.cor ? item.cor.nome : getName(cores, item.corId)}</TableCell>
                                <TableCell>{item.marca ? item.marca.nome : getName(marcas, item.marcaId)}</TableCell>
                                <TableCell className="text-right font-bold text-primary">R$ {item.preco_venda}</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
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
                                        <Button size="sm" onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} className="bg-red-500 hover:bg-red-600 text-white h-7 px-2">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
                                <Select value={editForm.tamanhoId} onValueChange={v => setEditForm({ ...editForm, tamanhoId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                    <SelectContent>
                                        {tamanhos.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Cor</Label>
                                <Select value={editForm.corId} onValueChange={v => setEditForm({ ...editForm, corId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                    <SelectContent>
                                        {cores.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Marca</Label>
                                <Select value={editForm.marcaId} onValueChange={v => setEditForm({ ...editForm, marcaId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                    <SelectContent>
                                        {marcas.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Categoria</Label>
                                <Select value={editForm.categoriaId} onValueChange={v => setEditForm({ ...editForm, categoriaId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                    <SelectContent>
                                        {categorias.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Fornecedor</Label>
                                <Select value={editForm.fornecedorId} onValueChange={v => setEditForm({ ...editForm, fornecedorId: v })}>
                                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                                    <SelectContent>
                                        {fornecedores.map(f => <SelectItem key={f.id} value={String(f.id)}>{f.nome}</SelectItem>)}
                                    </SelectContent>
                                </Select>
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
                                            src={url.startsWith('http') ? url : `https://geral-tiptagapi.r954jc.easypanel.host${url}`}
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
        </div>
    );
}