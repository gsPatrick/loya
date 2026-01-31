"use client";

import { useState, useEffect } from "react";
import { Search, Plus, AlertTriangle, Users, Save, Trash2, Package } from "lucide-react";
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

export default function CadastroPessoasPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("Todos");

    // Formulario
    const [form, setForm] = useState({ nome: "", cpf_cnpj: "", email: "", telefone_whatsapp: "", tipo: "Cliente" });

    // Modais
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);

    const [people, setPeople] = useState([]);

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = () => {
        api.get('/pessoas')
            .then(res => setPeople(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar pessoas.", variant: "destructive" });
            });
    };

    const handleAdd = () => {
        if (!form.nome) {
            toast({ title: "Erro", description: "Nome é obrigatório.", variant: "destructive" });
            return;
        }

        const is_cliente = form.tipo === "Cliente" || form.tipo === "Ambos";
        const is_fornecedor = form.tipo === "Fornecedor" || form.tipo === "Ambos";

        const payload = {
            nome: form.nome.toUpperCase(),
            cpf_cnpj: form.cpf_cnpj,
            email: form.email,
            telefone_whatsapp: form.telefone_whatsapp,
            is_cliente,
            is_fornecedor
        };

        api.post('/pessoas', payload)
            .then(res => {
                setPeople([...people, res.data]);
                setForm({ nome: "", cpf_cnpj: "", email: "", telefone_whatsapp: "", tipo: "Cliente" });
                toast({ title: "Sucesso", description: "Pessoa cadastrada.", className: "bg-primary text-primary-foreground border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao cadastrar pessoa.", variant: "destructive" });
            });
    };

    const handleDelete = () => {
        api.delete(`/pessoas/${currentItem.id}`)
            .then(() => {
                setPeople(people.filter(p => p.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({ title: "Removido", description: "Cadastro excluído.", className: "bg-red-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover pessoa.", variant: "destructive" });
            });
    };

    const filtered = people.filter(p => {
        const matchesSearch = (p.nome && p.nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.cpf_cnpj && p.cpf_cnpj.includes(searchTerm));

        let matchesType = true;
        if (filterType === "Fornecedores") matchesType = p.is_fornecedor && !p.is_cliente;
        if (filterType === "Clientes") matchesType = p.is_cliente && !p.is_fornecedor;
        if (filterType === "Ambos") matchesType = p.is_fornecedor && p.is_cliente;

        return matchesSearch && matchesType;
    });

    const getTipoLabel = (p) => {
        if (p.is_cliente && p.is_fornecedor) return "Ambos";
        if (p.is_fornecedor) return "Fornecedor";
        return "Cliente";
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Cadastro de Pessoas</h1>
            </div>

            {/* Form */}
            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-end"><Badge className="bg-primary">{String(people.length + 1).padStart(8, '0')}</Badge></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="space-y-2">
                            <Label>CPF/CNPJ</Label>
                            <Input value={form.cpf_cnpj} onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Tipo</Label>
                            <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cliente">Cliente</SelectItem>
                                    <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                                    <SelectItem value="Ambos">Ambos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone / WhatsApp</Label>
                            <Input value={form.telefone_whatsapp} onChange={e => setForm({ ...form, telefone_whatsapp: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-6">
                            <Save className="mr-2 h-4 w-4" /> Salvar Cadastro
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Listagem */}
            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <div className="p-4 bg-white border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex gap-2">
                        {["Todos", "Fornecedores", "Ambos", "Clientes"].map((type) => (
                            <Button
                                key={type}
                                variant={filterType === type ? "default" : "outline"}
                                onClick={() => setFilterType(type)}
                                size="sm"
                                className="h-8"
                            >
                                {type}
                            </Button>
                        ))}
                    </div>
                    <div className="relative w-[250px]">
                        <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." className="h-9 pl-9" />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow>
                                <TableHead className="w-[60px]">ID</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>CPF/CNPJ</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead className="text-center w-[80px]">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((p) => (
                                <TableRow key={p.id} className="hover:bg-primary/5 border-b">
                                    <TableCell className="text-gray-500">{String(p.id).padStart(4, '0')}</TableCell>
                                    <TableCell className="font-bold text-gray-700">{p.nome}</TableCell>
                                    <TableCell>{p.cpf_cnpj}</TableCell>
                                    <TableCell className="text-xs">
                                        <div>{p.telefone_whatsapp}</div>
                                        <div className="text-gray-400">{p.email}</div>
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{getTipoLabel(p)}</Badge></TableCell>
                                    <TableCell className="text-center flex items-center justify-center gap-2">
                                        {p.is_fornecedor && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                title="Ver Produtos"
                                                onClick={() => window.location.href = `/dashboard/cadastros/pecas-cadastro?fornecedorId=${p.id}`}
                                                className="h-7 w-7 p-0 bg-orange-100 text-orange-700 hover:bg-orange-200"
                                            >
                                                <Package className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button size="sm" variant="outline" onClick={() => window.location.href = `/dashboard/cadastros/pessoas/${p.id}`} className="h-7 w-7 p-0">
                                            <Search className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" onClick={() => { setCurrentItem(p); setIsDeleteOpen(true); }} className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600 text-white rounded-md">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle className="text-red-600">Excluir Cadastro</DialogTitle></DialogHeader>
                    <p>Tem certeza que deseja remover <strong>{currentItem?.nome}</strong>?</p>
                    <DialogFooter><Button onClick={handleDelete} className="bg-red-600 text-white">Confirmar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}