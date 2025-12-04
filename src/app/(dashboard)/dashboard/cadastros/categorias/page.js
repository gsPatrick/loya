"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit, Save, AlertTriangle } from "lucide-react";
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

export default function InclusaoCategoriasPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemFoto, setNewItemFoto] = useState("");

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editName, setEditName] = useState("");
    const [editFoto, setEditFoto] = useState("");

    const [items, setItems] = useState([]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        api.get('/cadastros/categorias')
            .then(res => setItems(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar categorias.", variant: "destructive" });
            });
    };

};

const handleImageUpload = async (e, setUrl) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
        const res = await api.post('/catalogo/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        setUrl(res.data.url);
        toast({ title: "Sucesso", description: "Imagem enviada." });
    } catch (err) {
        console.error(err);
        toast({ title: "Erro", description: "Erro ao enviar imagem.", variant: "destructive" });
    }
};

const handleAdd = () => {
    if (!newItemName.trim()) return;
    api.post('/cadastros/categorias', { nome: newItemName.toUpperCase(), foto: newItemFoto })
        .then(res => {
            setItems([...items, res.data]);
            setNewItemName("");
            setNewItemFoto("");
            toast({ title: "Sucesso", description: "Categoria adicionada.", className: "bg-primary text-primary-foreground" });
        })
        .catch(err => {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao adicionar categoria.", variant: "destructive" });
        });
};

const handleConfirmEdit = () => {
    api.put(`/cadastros/categorias/${currentItem.id}`, { nome: editName.toUpperCase(), foto: editFoto })
        .then(res => {
            setItems(items.map(i => i.id === currentItem.id ? res.data : i));
            setIsEditOpen(false);
            toast({ title: "Atualizado", description: "Categoria alterada.", className: "bg-primary text-primary-foreground" });
        })
        .catch(err => {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao atualizar categoria.", variant: "destructive" });
        });
};

const handleConfirmDelete = () => {
    api.delete(`/cadastros/categorias/${currentItem.id}`)
        .then(() => {
            setItems(items.filter(i => i.id !== currentItem.id));
            setIsDeleteOpen(false);
            toast({ title: "Removido", description: "Categoria removida.", className: "bg-red-600 text-white" });
        })
        .catch(err => {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao remover categoria.", variant: "destructive" });
        });
};

const filteredItems = items.filter(i => i.nome && i.nome.toLowerCase().includes(searchTerm.toLowerCase()));

return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
        <div className="flex items-center gap-2 border-b pb-4">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Inclusão de Categorias</h1>
        </div>

        <Card className="border-t-4 border-t-primary shadow-sm">
            <CardContent className="p-6">
                <div className="flex justify-end mb-2">
                    <Badge className="bg-primary text-primary-foreground text-base py-1 px-3">
                        {String(items.length + 1).padStart(8, '0')}
                    </Badge>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Referência de Categoria</Label>
                        <Input
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder="Digite a categoria (Ex: Calças, Acessórios...)"
                            className="bg-gray-50 border-gray-200 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Foto da Categoria</Label>
                        <div className="flex items-center gap-4">
                            {newItemFoto && <img src={newItemFoto.startsWith('http') ? newItemFoto : `${api.defaults.baseURL.replace('/api/v1', '')}${newItemFoto}`} alt="Preview" className="w-16 h-16 object-cover rounded border" />}
                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-sm font-medium transition-colors">
                                Escolher Imagem
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setNewItemFoto)} />
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6">
                            <Plus className="mr-2 h-4 w-4" /> Incluir Categoria
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">Exibir resultados</div>
                <div className="relative w-full md:w-[250px]">
                    <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-9 bg-gray-50" />
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                </div>
            </div>
            <Table>
                <TableHeader className="bg-white">
                    <TableRow>
                        <TableHead className="w-[100px] font-bold">Id</TableHead>
                        <TableHead className="font-bold">Categoria</TableHead>
                        <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                        <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredItems.map((item) => (
                        <TableRow key={item.id} className="hover:bg-primary/5 border-b">
                            <TableCell>{String(item.id).padStart(8, '0')}</TableCell>
                            <TableCell className="font-medium flex items-center gap-2">
                                {item.foto && <img src={item.foto.startsWith('http') ? item.foto : `${api.defaults.baseURL.replace('/api/v1', '')}${item.foto}`} alt="" className="w-8 h-8 rounded object-cover border" />}
                                {item.nome}
                            </TableCell>
                            <TableCell className="text-center"><Button size="sm" onClick={() => { setCurrentItem(item); setEditName(item.nome); setEditFoto(item.foto || ""); setIsEditOpen(true); }} className="h-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px]">ALTERAR</Button></TableCell>
                            <TableCell className="text-center"><Button size="sm" onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} className="h-6 w-full bg-red-500 hover:bg-red-600 text-white text-[10px]">APAGAR</Button></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Alterar Categoria</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Foto</Label>
                        <div className="flex items-center gap-4">
                            {editFoto && <img src={editFoto.startsWith('http') ? editFoto : `${api.defaults.baseURL.replace('/api/v1', '')}${editFoto}`} alt="Preview" className="w-16 h-16 object-cover rounded border" />}
                            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded text-sm font-medium transition-colors">
                                Alterar Imagem
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setEditFoto)} />
                            </label>
                        </div>
                    </div>
                </div>
                <DialogFooter><Button onClick={handleConfirmEdit} className="bg-primary text-primary-foreground">Salvar</Button></DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle className="text-red-600 flex gap-2"><AlertTriangle /> Confirmar Exclusão</DialogTitle></DialogHeader>
                <p>Deseja apagar <strong>{currentItem?.nome}</strong>?</p>
                <DialogFooter><Button onClick={handleConfirmDelete} className="bg-red-600 text-white">Excluir</Button></DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
);
