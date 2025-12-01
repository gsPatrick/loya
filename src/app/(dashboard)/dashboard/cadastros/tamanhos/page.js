// src/app/dashboard/cadastros/tamanhos/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Trash2,
    Edit,
    Youtube,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    AlertTriangle,
    Save,
    X
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

export default function InclusaoTamanhosPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [newSize, setNewSize] = useState("");

    // Estados para os Modais
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editName, setEditName] = useState("");

    const [sizes, setSizes] = useState([]);

    // --- CARREGAR DADOS ---
    useEffect(() => {
        loadSizes();
    }, []);

    const loadSizes = () => {
        api.get('/cadastros/tamanhos')
            .then(res => {
                setSizes(res.data);
            })
            .catch(err => {
                console.error("Erro ao carregar tamanhos", err);
                toast({
                    title: "Erro",
                    description: "Não foi possível carregar os tamanhos.",
                    variant: "destructive"
                });
            });
    };

    // --- AÇÕES ---

    // 1. Adicionar
    const handleAddSize = () => {
        if (!newSize.trim()) return;

        api.post('/cadastros/tamanhos', { nome: newSize.toUpperCase() })
            .then(res => {
                setSizes([...sizes, res.data]);
                setNewSize("");
                toast({
                    title: "Sucesso",
                    description: `Tamanho ${res.data.nome} incluído com sucesso.`,
                    className: "bg-primary text-primary-foreground border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({
                    title: "Erro",
                    description: "Erro ao criar tamanho.",
                    variant: "destructive"
                });
            });
    };

    // 2. Abrir Modal de Edição
    const openEditModal = (item) => {
        setCurrentItem(item);
        setEditName(item.nome);
        setIsEditOpen(true);
    };

    // 3. Confirmar Edição
    const handleConfirmEdit = () => {
        if (!editName.trim()) return;

        api.put(`/cadastros/tamanhos/${currentItem.id}`, { nome: editName.toUpperCase() })
            .then(res => {
                setSizes(sizes.map(s =>
                    s.id === currentItem.id ? res.data : s
                ));
                setIsEditOpen(false);
                toast({
                    title: "Atualizado",
                    description: `Tamanho alterado para ${res.data.nome}.`,
                    className: "bg-primary text-primary-foreground border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({
                    title: "Erro",
                    description: "Erro ao atualizar tamanho.",
                    variant: "destructive"
                });
            });
    };

    // 4. Abrir Modal de Exclusão
    const openDeleteModal = (item) => {
        setCurrentItem(item);
        setIsDeleteOpen(true);
    };

    // 5. Confirmar Exclusão
    const handleConfirmDelete = () => {
        api.delete(`/cadastros/tamanhos/${currentItem.id}`)
            .then(() => {
                setSizes(sizes.filter(s => s.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({
                    title: "Removido",
                    description: "O tamanho foi removido da lista.",
                    className: "bg-red-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({
                    title: "Erro",
                    description: "Erro ao excluir tamanho.",
                    variant: "destructive"
                });
            });
    };

    // Filtro
    const filteredSizes = sizes.filter(s =>
        (s.nome && s.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.id.toString().includes(searchTerm)
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho com Link de Ajuda */}
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Inclusão de Tamanhos</h1>
                <Button variant="ghost" size="icon" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                    <Youtube className="h-6 w-6" />
                </Button>
            </div>

            {/* --- 1. CARD DE INCLUSÃO --- */}
            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="p-6">
                    {/* Badge de ID (Simulando o próximo ID) */}
                    <div className="flex justify-end mb-2">
                        <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-base py-1 px-3">
                            {String(sizes.length + 1).padStart(8, '0')}
                        </Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Referência de Tamanho</Label>
                            <Input
                                value={newSize}
                                onChange={(e) => setNewSize(e.target.value)}
                                placeholder="Digite o tamanho (Ex: P, M, G, 38, 40...)"
                                className="bg-gray-50 border-gray-200 h-11 focus-visible:ring-primary"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button
                                onClick={handleAddSize}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6 shadow-md transition-all hover:scale-105"
                            >
                                <Plus className="mr-2 h-4 w-4" /> Incluir Tamanho
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. LISTAGEM --- */}
            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">

                {/* Controles da Tabela */}
                <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        Exibir
                        <Select defaultValue="100">
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
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
                                className="h-9 bg-gray-50"
                            />
                            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="w-[100px] font-bold text-gray-700 text-xs py-3">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                                        Id <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs py-3">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-primary">
                                        Referência de Tamanho <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="w-[100px] font-bold text-gray-700 text-xs text-center py-3">Ação</TableHead>
                                <TableHead className="w-[100px] font-bold text-gray-700 text-xs text-center py-3">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSizes.length > 0 ? (
                                filteredSizes.map((size) => (
                                    <TableRow key={size.id} className="hover:bg-primary/5 odd:bg-gray-50/30 even:bg-white border-b border-gray-100 h-10">
                                        <TableCell className="text-xs text-gray-600 py-2">{size.id}</TableCell>
                                        <TableCell className="text-xs font-medium text-gray-800 py-2">{size.nome}</TableCell>
                                        <TableCell className="text-center py-1">
                                            <Button
                                                size="sm"
                                                onClick={() => openEditModal(size)}
                                                className="h-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] uppercase font-bold rounded-sm shadow-sm"
                                            >
                                                Alterar
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center py-1">
                                            <Button
                                                size="sm"
                                                onClick={() => openDeleteModal(size)}
                                                className="h-6 w-full bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase font-bold rounded-sm shadow-sm"
                                            >
                                                Apagar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground text-sm">
                                        Nenhum tamanho encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação Rodapé */}
                <div className="bg-white p-3 border-t text-xs text-gray-500 flex justify-between items-center">
                    <span>Mostrando 1 até {filteredSizes.length} de {sizes.length} registros</span>
                    <div className="flex gap-1 items-center">
                        <span className="mr-2">Anterior</span>
                        <Button variant="outline" size="sm" className="h-7 w-7 p-0 bg-gray-200 border-none text-gray-600">1</Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">2</Button>
                        <span className="ml-2">Próximo</span>
                    </div>
                </div>
            </Card>

            {/* --- MODAL DE EDIÇÃO (ROXO) --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="border-l-4 border-l-primary sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-primary flex items-center gap-2">
                            <Edit className="h-5 w-5" /> Alterar Tamanho
                        </DialogTitle>
                        <DialogDescription>
                            Edite a referência do tamanho abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label className="text-xs font-bold text-muted-foreground uppercase mb-1.5 block">
                            Nova Referência
                        </Label>
                        <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="border-primary/20 focus-visible:ring-primary"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleConfirmEdit}>
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
                            Tem certeza que deseja apagar o tamanho <strong>{currentItem?.nome}</strong>?
                            <br />
                            <span className="text-xs text-red-500 mt-2 block">
                                Essa ação não pode ser desfeita se o tamanho já estiver em uso.
                            </span>
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