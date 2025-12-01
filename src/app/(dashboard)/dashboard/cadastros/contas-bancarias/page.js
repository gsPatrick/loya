"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Trash2,
    Edit,
    Landmark,
    User,
    Save,
    AlertTriangle,
    ArrowUpDown
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

export default function ContasBancariasPage() {
    const { toast } = useToast();

    // --- ESTADOS ---
    const [selectedProvider, setSelectedProvider] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Estado do Formulário
    const [form, setForm] = useState({
        banco: "",
        agencia: "",
        conta: "",
        pix: "" // Note: Model doesn't have pix field explicitly in ContaBancariaPessoa, but maybe I should check?
        // Checking ContaBancariaPessoa model: it has banco, agencia, conta. NO PIX.
        // But Pessoa has dados_pix.
        // ContaBancariaLoja has pix.
        // If the user wants PIX for supplier account, I might need to add it to the model or use a different field?
        // For now I will assume the backend might accept it or I just won't send it if not in model.
        // Wait, I checked ContaBancariaPessoa.js and it DOES NOT have pix.
        // I will ignore PIX for now or add it to the model?
        // I'll check if I can add it to the model quickly.
        // No, I should stick to the model. I'll remove PIX from the form or just not send it.
        // Actually, usually suppliers have PIX. I'll check if I can add it to the model.
        // I'll add it to the model in a separate step if needed. For now I will keep it in UI but maybe it won't be saved.
        // Or I can add it to the model now.
    });

    // Estados dos Modais
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editForm, setEditForm] = useState({ banco: "", agencia: "", conta: "" });

    const [providers, setProviders] = useState([]);
    const [accounts, setAccounts] = useState([]);

    // --- CARREGAR FORNECEDORES ---
    useEffect(() => {
        api.get('/pessoas?is_fornecedor=true')
            .then(res => setProviders(res.data))
            .catch(err => console.error("Erro ao carregar fornecedores", err));
    }, []);

    // --- CARREGAR CONTAS QUANDO SELECIONAR FORNECEDOR ---
    useEffect(() => {
        if (selectedProvider) {
            loadAccounts(selectedProvider);
        } else {
            setAccounts([]);
        }
    }, [selectedProvider]);

    const loadAccounts = (providerId) => {
        api.get(`/cadastros/contas-pessoa?pessoaId=${providerId}`)
            .then(res => setAccounts(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar contas.", variant: "destructive" });
            });
    };

    // --- HANDLERS ---

    // Adicionar Conta
    const handleAdd = () => {
        if (!selectedProvider) {
            toast({
                title: "Atenção",
                description: "Selecione um fornecedor antes de incluir a conta.",
                variant: "destructive"
            });
            return;
        }
        if (!form.banco || !form.conta) {
            toast({
                title: "Campos obrigatórios",
                description: "Preencha pelo menos o Banco e a Conta.",
                variant: "destructive"
            });
            return;
        }

        api.post('/cadastros/contas-pessoa', {
            pessoaId: selectedProvider,
            banco: form.banco,
            agencia: form.agencia,
            conta: form.conta
            // pix: form.pix // Not supported in model yet
        })
            .then(res => {
                setAccounts([...accounts, res.data]);
                setForm({ banco: "", agencia: "", conta: "", pix: "" });
                toast({
                    title: "Sucesso",
                    description: "Conta bancária incluída com sucesso.",
                    className: "bg-primary text-primary-foreground border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao incluir conta.", variant: "destructive" });
            });
    };

    // Abrir Modal de Edição
    const openEditModal = (item) => {
        setCurrentItem(item);
        setEditForm({
            banco: item.banco,
            agencia: item.agencia,
            conta: item.conta
        });
        setIsEditOpen(true);
    };

    // Confirmar Edição
    const handleConfirmEdit = () => {
        api.put(`/cadastros/contas-pessoa/${currentItem.id}`, editForm)
            .then(res => {
                setAccounts(accounts.map(acc =>
                    acc.id === currentItem.id ? res.data : acc
                ));
                setIsEditOpen(false);
                toast({
                    title: "Atualizado",
                    description: "Dados da conta alterados com sucesso.",
                    className: "bg-primary text-primary-foreground border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar conta.", variant: "destructive" });
            });
    };

    // Abrir Modal de Exclusão
    const openDeleteModal = (item) => {
        setCurrentItem(item);
        setIsDeleteOpen(true);
    };

    // Confirmar Exclusão
    const handleConfirmDelete = () => {
        api.delete(`/cadastros/contas-pessoa/${currentItem.id}`)
            .then(() => {
                setAccounts(accounts.filter(acc => acc.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({
                    title: "Removido",
                    description: "Conta bancária removida.",
                    className: "bg-red-600 text-white border-none"
                });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover conta.", variant: "destructive" });
            });
    };

    // Filtra as contas (já filtradas pela API, mas pode filtrar por busca local)
    const filteredAccounts = accounts.filter(acc => {
        return acc.banco.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Contas Bancárias de Fornecedores</h1>
            </div>

            {/* --- SEÇÃO 1: SELEÇÃO DE FORNECEDOR --- */}
            <Card className="border-t-4 border-t-primary shadow-sm overflow-hidden">
                <div className="bg-primary/5 px-6 py-3 border-b border-primary/10">
                    <h2 className="text-sm font-bold text-primary uppercase flex items-center gap-2">
                        <User className="h-4 w-4" /> Incluir Contas Bancárias para o Fornecedor
                    </h2>
                </div>
                <CardContent className="p-6">
                    <div className="space-y-2">
                        <Label className="text-gray-600">Escolha o Fornecedor</Label>
                        <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                            <SelectTrigger className="bg-gray-50 border-gray-200 h-11">
                                <SelectValue placeholder="Selecione um fornecedor da lista..." />
                            </SelectTrigger>
                            <SelectContent>
                                {providers.map(provider => (
                                    <SelectItem key={provider.id} value={String(provider.id)}>
                                        {provider.nome}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* --- SEÇÃO 2: FORMULÁRIO DE CADASTRO --- */}
            <Card className="shadow-sm border-gray-200">
                <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-gray-600">Banco</Label>
                            <Input
                                value={form.banco}
                                onChange={(e) => setForm({ ...form, banco: e.target.value })}
                                placeholder="Ex: Nubank, Itaú, Bradesco..."
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-600">Agência</Label>
                            <Input
                                value={form.agencia}
                                onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                                placeholder="0000"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-gray-600">Conta-Corrente</Label>
                            <Input
                                value={form.conta}
                                onChange={(e) => setForm({ ...form, conta: e.target.value })}
                                placeholder="00000-0"
                                className="bg-gray-50 border-gray-200 h-11"
                            />
                        </div>
                        {/* PIX removed as it is not in the model */}
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button
                            onClick={handleAdd}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6"
                        >
                            Incluir Conta Bancária
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- SEÇÃO 3: LISTAGEM --- */}
            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-white flex flex-col md:flex-row justify-between items-center gap-4">
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

                    <div className="relative w-full md:w-[250px]">
                        <Label className="sr-only">Pesquisar</Label>
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-9 bg-gray-50 pl-9"
                            placeholder="Pesquisar..."
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="font-bold text-gray-700">
                                    <div className="flex items-center gap-1">Banco <ArrowUpDown className="h-3 w-3" /></div>
                                </TableHead>
                                <TableHead className="font-bold text-gray-700">
                                    <div className="flex items-center gap-1">Agência <ArrowUpDown className="h-3 w-3" /></div>
                                </TableHead>
                                <TableHead className="font-bold text-gray-700">
                                    <div className="flex items-center gap-1">Conta-corrente <ArrowUpDown className="h-3 w-3" /></div>
                                </TableHead>
                                <TableHead className="font-bold text-gray-700 text-center w-[120px]">
                                    Ação
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((acc) => (
                                    <TableRow key={acc.id} className="hover:bg-primary/5 border-b border-gray-100">
                                        <TableCell className="font-medium text-gray-800">{acc.banco}</TableCell>
                                        <TableCell className="text-gray-600">{acc.agencia}</TableCell>
                                        <TableCell className="text-gray-600">{acc.conta}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => openEditModal(acc)}
                                                    className="h-7 px-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] uppercase font-bold"
                                                >
                                                    Alterar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => openDeleteModal(acc)}
                                                    className="h-7 px-2 bg-red-500 hover:bg-red-600 text-white text-[10px] uppercase font-bold"
                                                >
                                                    Excluir
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground bg-gray-50/30">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Landmark className="h-8 w-8 text-gray-300" />
                                            <p>Nenhum registro encontrado</p>
                                            {selectedProvider === "" && <p className="text-xs text-primary">Selecione um fornecedor acima para visualizar ou adicionar.</p>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                <div className="bg-white p-3 border-t text-xs text-gray-500 flex justify-end items-center gap-4">
                    <Button variant="ghost" disabled className="text-gray-400">Anterior</Button>
                    <Button variant="ghost" disabled className="text-gray-400">Próximo</Button>
                </div>
            </Card>

            {/* --- MODAL DE EDIÇÃO --- */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="border-l-4 border-l-primary sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-primary flex items-center gap-2">
                            <Edit className="h-5 w-5" /> Editar Conta Bancária
                        </DialogTitle>
                        <DialogDescription>Altere os dados da conta abaixo.</DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2">
                            <Label className="text-xs text-gray-500 font-bold uppercase">Banco</Label>
                            <Input value={editForm.banco} onChange={e => setEditForm({ ...editForm, banco: e.target.value })} className="border-primary/20" />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500 font-bold uppercase">Agência</Label>
                            <Input value={editForm.agencia} onChange={e => setEditForm({ ...editForm, agencia: e.target.value })} className="border-primary/20" />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500 font-bold uppercase">Conta</Label>
                            <Input value={editForm.conta} onChange={e => setEditForm({ ...editForm, conta: e.target.value })} className="border-primary/20" />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleConfirmEdit}>
                            <Save className="mr-2 h-4 w-4" /> Salvar Alterações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- MODAL DE EXCLUSÃO --- */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="border-l-4 border-l-red-600 sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Confirmar Exclusão
                        </DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja apagar a conta do banco <strong>{currentItem?.banco}</strong>?
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