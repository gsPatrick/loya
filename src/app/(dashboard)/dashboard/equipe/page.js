"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Pencil, Trash2, Power, PowerOff, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function EquipePage() {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState({ nome: "", email: "", password: "", role: "CAIXA" });
    const [editForm, setEditForm] = useState({ id: null, nome: "", email: "", role: "CAIXA", password: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async () => {
        if (!form.nome || !form.email || !form.password) {
            toast({ title: "Erro", description: "Preencha todos os campos.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            await api.post('/admin/users', {
                nome: form.nome,
                email: form.email,
                senha_hash: form.password,
                role: form.role
            });
            toast({ title: "Sucesso", description: "Usuário criado com sucesso." });
            setIsOpen(false);
            setForm({ nome: "", email: "", password: "", role: "CAIXA" });
            loadUsers();
        } catch (error) {
            toast({ title: "Erro", description: error.response?.data?.error || "Erro ao criar usuário.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditForm({
            id: user.id,
            nome: user.nome,
            email: user.email,
            role: user.role,
            password: ""
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editForm.nome || !editForm.email) {
            toast({ title: "Erro", description: "Nome e email são obrigatórios.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const payload = {
                nome: editForm.nome,
                email: editForm.email,
                role: editForm.role
            };
            if (editForm.password) {
                payload.senha_hash = editForm.password;
            }
            await api.put(`/admin/users/${editForm.id}`, payload);
            toast({ title: "Sucesso", description: "Usuário atualizado com sucesso." });
            setIsEditOpen(false);
            loadUsers();
        } catch (error) {
            toast({ title: "Erro", description: error.response?.data?.error || "Erro ao atualizar usuário.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const newStatus = user.ativo !== false ? false : true;
            await api.put(`/admin/users/${user.id}`, { ativo: newStatus });
            toast({
                title: "Sucesso",
                description: `Usuário ${newStatus ? 'ativado' : 'inativado'} com sucesso.`
            });
            loadUsers();
        } catch (error) {
            toast({ title: "Erro", description: "Erro ao alterar status.", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setLoading(true);
        try {
            await api.delete(`/admin/users/${selectedUser.id}`);
            toast({ title: "Sucesso", description: "Usuário excluído com sucesso." });
            setIsDeleteOpen(false);
            setSelectedUser(null);
            loadUsers();
        } catch (error) {
            toast({ title: "Erro", description: error.response?.data?.error || "Erro ao excluir usuário.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        const colors = {
            ADMIN: "bg-red-100 text-red-700",
            GERENTE: "bg-purple-100 text-purple-700",
            CAIXA: "bg-blue-100 text-blue-700",
            ESTOQUISTA: "bg-orange-100 text-orange-700"
        };
        return <Badge className={`border-none ${colors[role] || "bg-gray-100"}`}>{role}</Badge>;
    };

    const getStatusBadge = (ativo) => {
        if (ativo === false) {
            return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Inativo</Badge>;
        }
        return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Ativo</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Users className="h-6 w-6" /> Gestão de Equipe
                </h1>

                <Button onClick={() => setIsOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" /> Novo Usuário
                </Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Membros da Equipe</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                        Nenhum usuário cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map(u => (
                                    <TableRow key={u.id} className={u.ativo === false ? "opacity-60" : ""}>
                                        <TableCell className="font-medium">{u.nome}</TableCell>
                                        <TableCell>{u.email}</TableCell>
                                        <TableCell>{getRoleBadge(u.role)}</TableCell>
                                        <TableCell>{getStatusBadge(u.ativo)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(u)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                                                        {u.ativo === false ? (
                                                            <>
                                                                <Power className="mr-2 h-4 w-4 text-green-600" />
                                                                <span className="text-green-600">Ativar</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <PowerOff className="mr-2 h-4 w-4 text-amber-600" />
                                                                <span className="text-amber-600">Inativar</span>
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => { setSelectedUser(u); setIsDeleteOpen(true); }}
                                                        className="text-red-600 focus:text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal Criar */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Adicionar Membro da Equipe</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Maria Silva" />
                        </div>
                        <div className="space-y-2">
                            <Label>Email de Acesso</Label>
                            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="maria@loja.com" />
                        </div>
                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Cargo / Permissão</Label>
                            <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CAIXA">Vendedor(a) / Caixa</SelectItem>
                                    <SelectItem value="GERENTE">Gerente</SelectItem>
                                    <SelectItem value="ESTOQUISTA">Estoquista</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreate} disabled={loading} className="bg-primary text-white">
                            {loading ? "Salvando..." : "Criar Usuário"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal Editar */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email de Acesso</Label>
                            <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Nova Senha (deixe em branco para manter a atual)</Label>
                            <Input type="password" value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} placeholder="••••••••" />
                        </div>
                        <div className="space-y-2">
                            <Label>Cargo / Permissão</Label>
                            <Select value={editForm.role} onValueChange={v => setEditForm({ ...editForm, role: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CAIXA">Vendedor(a) / Caixa</SelectItem>
                                    <SelectItem value="GERENTE">Gerente</SelectItem>
                                    <SelectItem value="ESTOQUISTA">Estoquista</SelectItem>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUpdate} disabled={loading} className="bg-primary text-white">
                            {loading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirmação de Exclusão */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. O usuário <strong>{selectedUser?.nome}</strong> será permanentemente excluído.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={loading}
                        >
                            {loading ? "Excluindo..." : "Excluir"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
