"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, Edit, Save, ArrowUpDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function InclusaoCoresPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [newItemName, setNewItemName] = useState("");

    // Modais
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editName, setEditName] = useState("");

    const [items, setItems] = useState([]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        api.get('/cadastros/cores')
            .then(res => setItems(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar cores.", variant: "destructive" });
            });
    };

    // Handlers
    const handleAdd = () => {
        if (!newItemName.trim()) return;
        api.post('/cadastros/cores', { nome: newItemName.toUpperCase() })
            .then(res => {
                setItems([...items, res.data]);
                setNewItemName("");
                toast({ title: "Sucesso", description: "Cor adicionada.", className: "bg-primary text-primary-foreground" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao adicionar cor.", variant: "destructive" });
            });
    };

    const handleConfirmEdit = () => {
        api.put(`/cadastros/cores/${currentItem.id}`, { nome: editName.toUpperCase() })
            .then(res => {
                setItems(items.map(i => i.id === currentItem.id ? res.data : i));
                setIsEditOpen(false);
                toast({ title: "Atualizado", description: "Cor alterada com sucesso.", className: "bg-primary text-primary-foreground" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar cor.", variant: "destructive" });
            });
    };

    const handleConfirmDelete = () => {
        api.delete(`/cadastros/cores/${currentItem.id}`)
            .then(() => {
                setItems(items.filter(i => i.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({ title: "Removido", description: "Cor removida.", className: "bg-red-600 text-white" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover cor.", variant: "destructive" });
            });
    };

    const filteredItems = items.filter(i => i.nome && i.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Inclusão de Cores</h1>
            </div>

            {/* Card Inclusão */}
            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-end mb-2">
                        <Badge className="bg-primary text-primary-foreground text-base py-1 px-3">
                            {String(items.length + 1).padStart(8, '0')}
                        </Badge>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Referência de Cor</Label>
                            <Input
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                placeholder="Digite a cor (Ex: Azul Bebê...)"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6">
                                <Plus className="mr-2 h-4 w-4" /> Incluir Cor
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Listagem */}
            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">Exibir <Select defaultValue="10"><SelectTrigger className="h-8 w-[70px] inline-flex mx-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="10">10</SelectItem></SelectContent></Select> resultados</div>
                    <div className="relative w-full md:w-[250px]">
                        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-9 bg-gray-50" />
                        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
                <Table>
                    <TableHeader className="bg-white">
                        <TableRow>
                            <TableHead className="w-[100px] font-bold">Id</TableHead>
                            <TableHead className="font-bold">Referência de Cor</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-primary/5 border-b">
                                <TableCell>{String(item.id).padStart(8, '0')}</TableCell>
                                <TableCell className="font-medium">{item.nome}</TableCell>
                                <TableCell className="text-center"><Button size="sm" onClick={() => { setCurrentItem(item); setEditName(item.nome); setIsEditOpen(true); }} className="h-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px]">ALTERAR</Button></TableCell>
                                <TableCell className="text-center"><Button size="sm" onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} className="h-6 w-full bg-red-500 hover:bg-red-600 text-white text-[10px]">APAGAR</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Modais */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Alterar Cor</DialogTitle></DialogHeader>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
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