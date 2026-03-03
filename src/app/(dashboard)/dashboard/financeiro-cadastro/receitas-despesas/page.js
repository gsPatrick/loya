"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Trash2,
    Edit,
    ScrollText,
    ArrowUpDown,
    AlertTriangle,
    Save
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function ReceitasDespesasPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Estado do Formulário
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("DESPESA"); // Default

    // Estados dos Modais
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editName, setEditName] = useState("");
    const [editType, setEditType] = useState("");

    const [items, setItems] = useState([]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        api.get('/cadastros/receitas-despesas')
            .then(res => setItems(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar dados.", variant: "destructive" });
            });
    };

    // --- AÇÕES ---

    // 1. Adicionar
    const handleAdd = () => {
        if (!newName.trim()) return;

        api.post('/cadastros/receitas-despesas', {
            nome: newName.toUpperCase(),
            tipo: newType
        })
            .then(res => {
                setItems([...items, res.data]);
                setNewName("");
                setNewType("DESPESA");
                toast({
                    title: "Sucesso",
                    description: "Conta de Receita/Despesa incluída.",
                    className: "bg-purple-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao incluir registro.", variant: "destructive" });
            });
    };

    // 2. Abrir Modal de Edição
    const openEditModal = (item) => {
        setCurrentItem(item);
        setEditName(item.nome);
        setEditType(item.tipo);
        setIsEditOpen(true);
    };

    // 3. Confirmar Edição
    const handleConfirmEdit = () => {
        if (!editName.trim()) return;

        api.put(`/cadastros/receitas-despesas/${currentItem.id}`, {
            nome: editName.toUpperCase(),
            tipo: editType
        })
            .then(res => {
                setItems(items.map(item =>
                    item.id === currentItem.id ? res.data : item
                ));
                setIsEditOpen(false);
                toast({
                    title: "Atualizado",
                    description: "Registro alterado com sucesso.",
                    className: "bg-purple-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar registro.", variant: "destructive" });
            });
    };

    // 4. Abrir Modal de Exclusão
    const openDeleteModal = (item) => {
        setCurrentItem(item);
        setIsDeleteOpen(true);
    };

    // 5. Confirmar Exclusão
    const handleConfirmDelete = () => {
        api.delete(`/cadastros/receitas-despesas/${currentItem.id}`)
            .then(() => {
                setItems(items.filter(item => item.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({
                    title: "Removido",
                    description: "Registro removido com sucesso.",
                    className: "bg-red-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover registro.", variant: "destructive" });
            });
    };

    // Filtro
    const filteredItems = items.filter(item =>
        (item.nome && item.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.id && item.id.toString().includes(searchTerm))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-purple-700">Inclusão de Contas de Receitas e Despesas</h1>
            </div>

            {/* --- 1. CARD DE INCLUSÃO --- */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                <CardContent className="p-6">
                    {/* Badge de ID */}
                    <div className="flex justify-end mb-2">
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-base py-1 px-3">
                            {String(items.length + 1).padStart(8, '0')}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Conta de Receita e Despesa</Label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Digite o nome (Ex: Material de Escritório)"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>

                        <div className="space-y-2 w-full md:w-[200px]">
                            <Select value={newType} onValueChange={setNewType}>
                                <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DESPESA">DESPESA</SelectItem>
                                    <SelectItem value="RECEITA">RECEITA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleAdd}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-6 shadow-md transition-all hover:scale-105"
                            >
                                Incluir Conta de Receita e Despesa
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. LISTAGEM --- */}
            <Card className="border-t-4 border-t-purple-300 shadow-sm overflow-hidden">

                {/* Controles da Tabela */}
                <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        Exibir
                        <Select defaultValue="10">
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                        resultados por página
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Label className="text-sm text-gray-600">Pesquisar</Label>
                        <div className="relative w-full md:w-[250px]">
                            <Input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-9 bg-gray-50 pl-9"
                            />
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="w-[100px] font-bold text-gray-700 text-xs py-3">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-purple-600">
                                        Id <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs py-3">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-purple-600">
                                        Nome da Conta de Receita e Despesa <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[120px] font-bold text-gray-700 text-xs py-3 text-center">
                                    <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-purple-600">
                                        Tipo <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[150px] font-bold text-gray-700 text-xs text-center py-3">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredItems.length > 0 ? (
                                filteredItems.map((item) => (
                                    <TableRow key={item.id} className="hover:bg-purple-50/20 border-b border-gray-100 h-10">
                                        <TableCell className="text-xs text-gray-600 py-2">{String(item.id).padStart(8, '0')}</TableCell>
                                        <TableCell className="text-xs font-medium text-gray-800 py-2 uppercase">{item.nome}</TableCell>
                                        <TableCell className="text-center py-2">
                                            <Badge variant="outline" className={item.tipo === "RECEITA" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}>
                                                {item.tipo}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openEditModal(item)}
                                                    className="h-6 px-3 bg-purple-500 hover:bg-purple-600 text-white text-[10px] uppercase font-bold rounded-sm shadow-sm"
                                                >
                                                    Alterar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => openDeleteModal(item)}
                                                    className="h-6 px-3 bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase font-bold rounded-sm shadow-sm"
                                                >
                                                    Apagar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground text-sm">
                                        Nenhum registro encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação Rodapé */}
                <div className="bg-white p-3 border-t text-xs text-gray-500 flex justify-end items-center gap-4">
                    <Button variant="ghost" disabled className="text-gray-400">Anterior</Button>
                    <Button variant="ghost" disabled className="text-gray-400">Próximo</Button>
                </div>
            </Card>

            {/* --- MODAL DE EDIÇÃO (ROXO) --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="border-l-4 border-l-purple-600 sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-purple-700 flex items-center gap-2">
                            <Edit className="h-5 w-5" /> Alterar Conta
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Nome da Conta</Label>
                            <Input
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="border-purple-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Tipo</Label>
                            <Select value={editType} onValueChange={setEditType}>
                                <SelectTrigger className="border-purple-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DESPESA">DESPESA</SelectItem>
                                    <SelectItem value="RECEITA">RECEITA</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleConfirmEdit}>
                            <Save className="mr-2 h-4 w-4" /> Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL DE EXCLUSÃO (VERMELHO) --- */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="border-l-4 border-l-red-600 sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja apagar a conta <strong>{currentItem?.nome}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirmDelete}>
                            <Trash2 className="mr-2 h-4 w-4" /> Confirmar Exclusão
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}