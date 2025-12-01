"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Trash2,
    Edit,
    Youtube,
    ArrowUpDown,
    AlertTriangle,
    Save,
    Landmark
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

export default function InclusaoContasFinanceirasPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [form, setForm] = useState({
        nome_referencia: "",
        banco: "",
        agencia: "",
        conta: "",
        pix: ""
    });

    // Estados para os Modais
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editForm, setEditForm] = useState({
        nome_referencia: "",
        banco: "",
        agencia: "",
        conta: "",
        pix: ""
    });

    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = () => {
        api.get('/cadastros/contas-loja')
            .then(res => setAccounts(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar contas.", variant: "destructive" });
            });
    };

    // --- AÇÕES ---

    // 1. Adicionar
    const handleAdd = () => {
        if (!form.nome_referencia || !form.banco || !form.conta) {
            toast({ title: "Erro", description: "Preencha Nome, Banco e Conta.", variant: "destructive" });
            return;
        }

        api.post('/cadastros/contas-loja', {
            ...form,
            nome_referencia: form.nome_referencia.toUpperCase()
        })
            .then(res => {
                setAccounts([...accounts, res.data]);
                setForm({ nome_referencia: "", banco: "", agencia: "", conta: "", pix: "" });
                toast({
                    title: "Sucesso",
                    description: `Conta Financeira incluída com sucesso.`,
                    className: "bg-purple-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao incluir conta.", variant: "destructive" });
            });
    };

    // 2. Abrir Modal de Edição
    const openEditModal = (item) => {
        setCurrentItem(item);
        setEditForm({
            nome_referencia: item.nome_referencia,
            banco: item.banco,
            agencia: item.agencia,
            conta: item.conta,
            pix: item.pix
        });
        setIsEditOpen(true);
    };

    // 3. Confirmar Edição
    const handleConfirmEdit = () => {
        api.put(`/cadastros/contas-loja/${currentItem.id}`, {
            ...editForm,
            nome_referencia: editForm.nome_referencia.toUpperCase()
        })
            .then(res => {
                setAccounts(accounts.map(acc =>
                    acc.id === currentItem.id ? res.data : acc
                ));
                setIsEditOpen(false);
                toast({
                    title: "Atualizado",
                    description: `Conta alterada com sucesso.`,
                    className: "bg-purple-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar conta.", variant: "destructive" });
            });
    };

    // 4. Abrir Modal de Exclusão
    const openDeleteModal = (item) => {
        setCurrentItem(item);
        setIsDeleteOpen(true);
    };

    // 5. Confirmar Exclusão
    const handleConfirmDelete = () => {
        api.delete(`/cadastros/contas-loja/${currentItem.id}`)
            .then(() => {
                setAccounts(accounts.filter(acc => acc.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({
                    title: "Removido",
                    description: "A conta financeira foi removida.",
                    className: "bg-red-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover conta.", variant: "destructive" });
            });
    };

    // Filtro
    const filteredAccounts = accounts.filter(acc =>
        (acc.nome_referencia && acc.nome_referencia.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (acc.banco && acc.banco.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-purple-700">Inclusão de Contas Financeiras</h1>
            </div>

            {/* --- 1. CARD DE INCLUSÃO --- */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                <CardContent className="p-6">
                    {/* Badge de ID (Simulando o próximo ID) */}
                    <div className="flex justify-end mb-2">
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-base py-1 px-3">
                            {String(accounts.length + 1).padStart(8, '0')}
                        </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="space-y-2 lg:col-span-2">
                            <Label className="text-sm font-medium text-gray-700">Nome Referência</Label>
                            <Input
                                value={form.nome_referencia}
                                onChange={(e) => setForm({ ...form, nome_referencia: e.target.value })}
                                placeholder="Ex: Banco do Brasil..."
                                className="bg-gray-50 border-gray-200 h-11 focus-visible:ring-purple-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Banco</Label>
                            <Input
                                value={form.banco}
                                onChange={(e) => setForm({ ...form, banco: e.target.value })}
                                placeholder="Ex: BB"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Agência</Label>
                            <Input
                                value={form.agencia}
                                onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                                placeholder="0000"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700">Conta</Label>
                            <Input
                                value={form.conta}
                                onChange={(e) => setForm({ ...form, conta: e.target.value })}
                                placeholder="00000-0"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <Label className="text-sm font-medium text-gray-700">Pix</Label>
                            <Input
                                value={form.pix}
                                onChange={(e) => setForm({ ...form, pix: e.target.value })}
                                placeholder="Chave Pix"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>

                        <div className="lg:col-span-3 flex justify-end items-end">
                            <Button
                                onClick={handleAdd}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-6 shadow-md transition-all hover:scale-105 w-full md:w-auto"
                            >
                                Incluir Conta Financeira
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
                                <TableHead className="w-[150px] font-bold text-gray-700 text-xs py-3">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-purple-600">
                                        Id <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs py-3">
                                    <div className="flex items-center gap-1 cursor-pointer hover:text-purple-600">
                                        Nome Referência <ArrowUpDown className="h-3 w-3" />
                                    </div>
                                </TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs py-3">Banco</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs py-3">Ag/Conta</TableHead>
                                <TableHead className="w-[100px] font-bold text-gray-700 text-xs text-center py-3">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((acc) => (
                                    <TableRow key={acc.id} className="hover:bg-purple-50/20 odd:bg-gray-50/30 even:bg-white border-b border-gray-100 h-10">
                                        <TableCell className="text-xs text-gray-600 py-2">{String(acc.id).padStart(8, '0')}</TableCell>
                                        <TableCell className="text-xs font-medium text-gray-800 py-2 uppercase">{acc.nome_referencia}</TableCell>
                                        <TableCell className="text-xs text-gray-600 py-2">{acc.banco}</TableCell>
                                        <TableCell className="text-xs text-gray-600 py-2">{acc.agencia} / {acc.conta}</TableCell>
                                        <TableCell className="text-center py-1 flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => openEditModal(acc)}
                                                className="h-6 px-3 bg-purple-500 hover:bg-purple-600 text-white text-[10px] uppercase font-bold rounded-sm shadow-sm"
                                            >
                                                Alterar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => openDeleteModal(acc)}
                                                className="h-6 px-3 bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase font-bold rounded-sm shadow-sm"
                                            >
                                                Excluir
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground text-sm">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Landmark className="h-8 w-8 text-gray-300" />
                                            Nenhuma conta financeira encontrada.
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação Rodapé */}
                <div className="bg-white p-3 border-t text-xs text-gray-500 flex justify-end items-center gap-4">
                    <Button variant="ghost" className="h-7 text-xs" disabled>Anterior</Button>
                    <div className="bg-gray-200 px-2 py-1 rounded text-gray-700">1</div>
                    <Button variant="ghost" className="h-7 text-xs">Próximo</Button>
                </div>
            </Card>

            {/* --- MODAL DE EDIÇÃO (ROXO) --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="border-l-4 border-l-purple-600 sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-purple-700 flex items-center gap-2">
                            <Edit className="h-5 w-5" /> Alterar Conta
                        </DialogTitle>
                        <DialogDescription>
                            Edite os dados da conta financeira.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2">
                            <Label>Nome Referência</Label>
                            <Input value={editForm.nome_referencia} onChange={(e) => setEditForm({ ...editForm, nome_referencia: e.target.value })} />
                        </div>
                        <div>
                            <Label>Banco</Label>
                            <Input value={editForm.banco} onChange={(e) => setEditForm({ ...editForm, banco: e.target.value })} />
                        </div>
                        <div>
                            <Label>Agência</Label>
                            <Input value={editForm.agencia} onChange={(e) => setEditForm({ ...editForm, agencia: e.target.value })} />
                        </div>
                        <div>
                            <Label>Conta</Label>
                            <Input value={editForm.conta} onChange={(e) => setEditForm({ ...editForm, conta: e.target.value })} />
                        </div>
                        <div className="col-span-2">
                            <Label>Pix</Label>
                            <Input value={editForm.pix} onChange={(e) => setEditForm({ ...editForm, pix: e.target.value })} />
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
                            Tem certeza que deseja apagar a conta <strong>{currentItem?.nome_referencia}</strong>?
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