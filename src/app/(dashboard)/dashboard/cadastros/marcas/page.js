"use client";

import { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle, Tag, Edit, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function InclusaoMarcasPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [newItemName, setNewItemName] = useState("");
    const [newItemImage, setNewItemImage] = useState("");
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState("");
    const [items, setItems] = useState([]);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        api.get('/cadastros/marcas')
            .then(res => setItems(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar marcas.", variant: "destructive" });
            });
    };

    const handleAdd = () => {
        if (!newItemName.trim()) return;
        api.post('/cadastros/marcas', { nome: newItemName.toUpperCase(), imagem: newItemImage })
            .then(res => {
                setItems([...items, res.data]);
                setNewItemName("");
                setNewItemImage("");
                toast({ title: "Sucesso", description: "Marca adicionada.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao adicionar marca.", variant: "destructive" });
            });
    };

    const handleConfirmEdit = () => {
        api.put(`/cadastros/marcas/${currentItem.id}`, { nome: editName.toUpperCase(), imagem: editImage })
            .then(res => {
                setItems(items.map(i => i.id === currentItem.id ? res.data : i));
                setIsEditOpen(false);
                toast({ title: "Atualizado", description: "Marca alterada.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar marca.", variant: "destructive" });
            });
    };

    const handleConfirmDelete = () => {
        api.delete(`/cadastros/marcas/${currentItem.id}`)
            .then(() => {
                setItems(items.filter(i => i.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({ title: "Removido", description: "Marca removida.", className: "bg-red-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover marca.", variant: "destructive" });
            });
    };

    const handleSync = (item) => {
        toast({ title: "Sincronizando...", description: `Sincronizando ${item.nome}...` });
        api.post(`/cadastros/marcas/${item.id}/sync`)
            .then(() => {
                toast({ title: "Sucesso", description: "Marca sincronizada com sucesso!", className: "bg-green-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao sincronizar marca.", variant: "destructive" });
            });
    };

    const handleImageUpload = async (e, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        toast({ title: "Enviando...", description: "Enviando imagem..." });

        try {
            const res = await api.post('/catalogo/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const fullUrl = `https://geral-tiptagapi.r954jc.easypanel.host${res.data.url}`;

            if (isEdit) {
                setEditImage(fullUrl);
            } else {
                setNewItemImage(fullUrl);
            }
            toast({ title: "Sucesso", description: "Imagem enviada." });
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao enviar imagem.", variant: "destructive" });
        }
    };

    const filteredItems = items.filter(i => i.nome && i.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Marcas</h1>
            </div>

            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-end mb-2">
                        <Badge className="bg-primary text-primary-foreground text-base py-1 px-3">{String(items.length + 1).padStart(8, '0')}</Badge>
                    </div>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome da Marca</Label>
                                <Input
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder="Digite a marca..."
                                    className="bg-gray-50 border-gray-200 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Logo da Marca</Label>
                                <div className="flex gap-2 items-center">
                                    {newItemImage && (
                                        <img src={newItemImage} alt="Preview" className="h-10 w-10 object-contain border rounded" />
                                    )}
                                    <Label htmlFor="upload-new" className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium transition-colors">
                                        Escolher Imagem
                                    </Label>
                                    <Input
                                        id="upload-new"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(e, false)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6">
                                <Plus className="mr-2 h-4 w-4" /> Incluir Marca
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
                            <TableHead className="w-[80px] font-bold">Logo</TableHead>
                            <TableHead className="font-bold">Marca</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Sync</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-primary/5 border-b">
                                <TableCell>{String(item.id).padStart(8, '0')}</TableCell>
                                <TableCell>
                                    {item.imagem ? (
                                        <img src={item.imagem} alt={item.nome} className="w-10 h-10 object-contain" />
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-xs">N/A</div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{item.nome}</TableCell>
                                <TableCell className="text-center"><Button size="sm" onClick={() => handleSync(item)} className="h-6 w-full bg-blue-500 hover:bg-blue-600 text-white text-[10px]"><RefreshCw className="w-3 h-3 mr-1" /> SYNC</Button></TableCell>
                                <TableCell className="text-center"><Button size="sm" onClick={() => { setCurrentItem(item); setEditName(item.nome); setEditImage(item.imagem || ""); setIsEditOpen(true); }} className="h-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px]">ALTERAR</Button></TableCell>
                                <TableCell className="text-center"><Button size="sm" onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} className="h-6 w-full bg-red-500 hover:bg-red-600 text-white text-[10px]">APAGAR</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Alterar Marca</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Logo da Marca</Label>
                            <div className="flex gap-2 items-center">
                                {editImage && (
                                    <img src={editImage} alt="Preview" className="h-10 w-10 object-contain border rounded" />
                                )}
                                <Label htmlFor="upload-edit" className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm font-medium transition-colors">
                                    Alterar Imagem
                                </Label>
                                <Input
                                    id="upload-edit"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleImageUpload(e, true)}
                                />
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
}