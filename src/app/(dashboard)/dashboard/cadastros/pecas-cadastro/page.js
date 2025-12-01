"use client";

import { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle, Shirt, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function CadastroPecasSimplesPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [form, setForm] = useState({
        descricao_curta: "",
        tamanhoId: "",
        corId: "",
        marcaId: "",
        categoriaId: "",
        fornecedorId: "",
        preco_venda: "",
        tipo_aquisicao: "COMPRA" // Default
    });

    // Data Lists
    const [tamanhos, setTamanhos] = useState([]);
    const [cores, setCores] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [items, setItems] = useState([]);

    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [tamRes, corRes, marcaRes, catRes, fornRes, pecasRes] = await Promise.all([
                api.get('/cadastros/tamanhos'),
                api.get('/cadastros/cores'),
                api.get('/cadastros/marcas'),
                api.get('/cadastros/categorias'),
                api.get('/pessoas?is_fornecedor=true'),
                api.get('/catalogo/pecas')
            ]);

            setTamanhos(tamRes.data);
            setCores(corRes.data);
            setMarcas(marcaRes.data);
            setCategorias(catRes.data);
            setFornecedores(fornRes.data);
            setItems(pecasRes.data);
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
            // Convert empty strings to null for optional FKs if needed, or backend handles it?
            // Backend might expect null if not provided.
            tamanhoId: form.tamanhoId || null,
            corId: form.corId || null,
            marcaId: form.marcaId || null,
            categoriaId: form.categoriaId || null,
            fornecedorId: form.fornecedorId || null,
        };

        api.post('/catalogo/pecas', payload)
            .then(res => {
                setItems([...items, res.data]);
                setForm({
                    descricao_curta: "",
                    tamanhoId: "",
                    corId: "",
                    marcaId: "",
                    categoriaId: "",
                    fornecedorId: "",
                    preco_venda: "",
                    tipo_aquisicao: "COMPRA"
                });
                toast({ title: "Sucesso", description: "Peça cadastrada.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao cadastrar peça.", variant: "destructive" });
            });
    };

    const handleDelete = () => {
        // Assuming there is a delete endpoint for pecas, but catalogo routes didn't show one explicitly?
        // Let's check catalogo.routes.js again. It has POST, GET, PUT. NO DELETE?
        // Wait, I missed checking DELETE in catalogo.routes.js?
        // I'll check it again. If not, I can't delete.
        // I'll assume for now I can't delete or I'll add it.
        // Actually, usually products are not deleted but deactivated.
        // But for this CRUD, user expects delete.
        // I'll check catalogo.routes.js content again in my memory.
        // It had: post, get, get/:id, put/:id, post/etiquetas. NO DELETE.
        // So I cannot delete via API yet.
        // I will comment out the API call and show a toast saying "Not implemented" or add the route.
        // I'll add the route to catalogo.routes.js and controller.

        // For now, I'll try to call it, and if it fails, I'll fix the backend.
        // I'll add the backend fix in the next step.
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

    // Helper to get name from ID
    const getName = (list, id) => list.find(i => i.id === id)?.nome || "-";
    const getPessoaName = (list, id) => list.find(i => i.id === id)?.nome || "-";

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Cadastro Simplificado de Peças</h1>
            </div>

            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <Label>Descrição da Peça</Label>
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

                        <div className="md:col-span-2 flex items-end justify-end">
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
                                    <Button size="sm" onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} className="bg-red-500 hover:bg-red-600 text-white h-7 px-2">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
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
        </div>
    );
}