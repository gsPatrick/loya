"use client";

import { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle, Edit, Trash2, Maximize, ArrowUpDown } from "lucide-react";
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

export default function InclusaoDimensoesPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [form, setForm] = useState({
        nome: "",
        peso_kg: "",
        altura_cm: "",
        largura_cm: "",
        comprimento_cm: ""
    });

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editForm, setEditForm] = useState({
        nome: "",
        peso_kg: "",
        altura_cm: "",
        largura_cm: "",
        comprimento_cm: ""
    });

    const [items, setItems] = useState([]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        api.get('/cadastros/dimensoes')
            .then(res => setItems(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar dimensões.", variant: "destructive" });
            });
    };

    const handleAdd = () => {
        if (!form.nome.trim() || !form.peso_kg || !form.altura_cm || !form.largura_cm || !form.comprimento_cm) {
            toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
            return;
        }

        api.post('/cadastros/dimensoes', {
            ...form,
            nome: form.nome.toUpperCase()
        })
            .then(res => {
                setItems([...items, res.data]);
                setForm({ nome: "", peso_kg: "", altura_cm: "", largura_cm: "", comprimento_cm: "" });
                toast({ title: "Sucesso", description: "Dimensão salva.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao adicionar dimensão.", variant: "destructive" });
            });
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setEditForm({
            nome: item.nome,
            peso_kg: item.peso_kg,
            altura_cm: item.altura_cm,
            largura_cm: item.largura_cm,
            comprimento_cm: item.comprimento_cm
        });
        setIsEditOpen(true);
    };

    const handleConfirmEdit = () => {
        api.put(`/cadastros/dimensoes/${currentItem.id}`, {
            ...editForm,
            nome: editForm.nome.toUpperCase()
        })
            .then(res => {
                setItems(items.map(i => i.id === currentItem.id ? res.data : i));
                setIsEditOpen(false);
                toast({ title: "Atualizado", description: "Dimensão alterada.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar dimensão.", variant: "destructive" });
            });
    };

    const handleConfirmDelete = () => {
        api.delete(`/cadastros/dimensoes/${currentItem.id}`)
            .then(() => {
                setItems(items.filter(i => i.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({ title: "Removido", description: "Dimensão removida.", className: "bg-red-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover dimensão.", variant: "destructive" });
            });
    };

    const filteredItems = items.filter(i => i.nome && i.nome.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Dimensões de Embalagem</h1>
            </div>

            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-end mb-2">
                        <Badge className="bg-primary text-primary-foreground py-1 px-3">{String(items.length + 1).padStart(8, '0')}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2 lg:col-span-2">
                            <Label>Descrição (Nome)</Label>
                            <Input
                                value={form.nome}
                                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                placeholder="Ex: Caixa P..."
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Peso (kg)</Label>
                            <Input
                                type="number"
                                step="0.001"
                                value={form.peso_kg}
                                onChange={(e) => setForm({ ...form, peso_kg: e.target.value })}
                                placeholder="0.000"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Altura (cm)</Label>
                            <Input
                                type="number"
                                value={form.altura_cm}
                                onChange={(e) => setForm({ ...form, altura_cm: e.target.value })}
                                placeholder="0.00"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Largura (cm)</Label>
                            <Input
                                type="number"
                                value={form.largura_cm}
                                onChange={(e) => setForm({ ...form, largura_cm: e.target.value })}
                                placeholder="0.00"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Comp. (cm)</Label>
                            <Input
                                type="number"
                                value={form.comprimento_cm}
                                onChange={(e) => setForm({ ...form, comprimento_cm: e.target.value })}
                                placeholder="0.00"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="lg:col-span-5 flex justify-end">
                            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6 w-full md:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Incluir Dimensão
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
                            <TableHead className="w-[50px] font-bold">Id</TableHead>
                            <TableHead className="font-bold">Dimensão</TableHead>
                            <TableHead className="font-bold">Peso</TableHead>
                            <TableHead className="font-bold">Medidas (AxLxC)</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                            <TableHead className="w-[100px] text-center font-bold">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-primary/5 border-b">
                                <TableCell>{String(item.id).padStart(8, '0')}</TableCell>
                                <TableCell className="font-medium">{item.nome}</TableCell>
                                <TableCell>{item.peso_kg} kg</TableCell>
                                <TableCell>{item.altura_cm}x{item.largura_cm}x{item.comprimento_cm} cm</TableCell>
                                <TableCell className="text-center"><Button size="sm" onClick={() => openEditModal(item)} className="h-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px]">ALTERAR</Button></TableCell>
                                <TableCell className="text-center"><Button size="sm" onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }} className="h-6 w-full bg-red-500 hover:bg-red-600 text-white text-[10px]">APAGAR</Button></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Alterar Dimensão</DialogTitle></DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-2">
                        <div className="col-span-2">
                            <Label>Nome</Label>
                            <Input value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })} />
                        </div>
                        <div>
                            <Label>Peso (kg)</Label>
                            <Input type="number" value={editForm.peso_kg} onChange={(e) => setEditForm({ ...editForm, peso_kg: e.target.value })} />
                        </div>
                        <div>
                            <Label>Altura (cm)</Label>
                            <Input type="number" value={editForm.altura_cm} onChange={(e) => setEditForm({ ...editForm, altura_cm: e.target.value })} />
                        </div>
                        <div>
                            <Label>Largura (cm)</Label>
                            <Input type="number" value={editForm.largura_cm} onChange={(e) => setEditForm({ ...editForm, largura_cm: e.target.value })} />
                        </div>
                        <div>
                            <Label>Comp. (cm)</Label>
                            <Input type="number" value={editForm.comprimento_cm} onChange={(e) => setEditForm({ ...editForm, comprimento_cm: e.target.value })} />
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