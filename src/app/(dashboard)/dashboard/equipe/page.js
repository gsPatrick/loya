"use client";

import { useState, useEffect } from "react";
import { Plus, Users, Save, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function EquipePage() {
    const { toast } = useToast();
    const [users, setUsers] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({ nome: "", email: "", password: "", role: "CAIXA" });
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
                senha_hash: form.password, // Backend espera senha_hash ou password? O model faz hash no hook, enviar raw.
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

    const getRoleBadge = (role) => {
        const colors = {
            ADMIN: "bg-red-100 text-red-700",
            GERENTE: "bg-purple-100 text-purple-700",
            CAIXA: "bg-blue-100 text-blue-700",
            ESTOQUISTA: "bg-orange-100 text-orange-700"
        };
        return <Badge className={`border-none ${colors[role] || "bg-gray-100"}`}>{role}</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                    <Users className="h-6 w-6" /> Gestão de Equipe
                </h1>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="mr-2 h-4 w-4" /> Novo Usuário
                        </Button>
                    </DialogTrigger>
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
                            <Button onClick={handleCreate} disabled={loading} className="bg-primary text-white">
                                {loading ? "Salvando..." : "Criar Usuário"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader><CardTitle>Usuários Ativos</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u.id}>
                                    <TableCell className="font-medium">{u.nome}</TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                                    <TableCell><Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Ativo</Badge></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
