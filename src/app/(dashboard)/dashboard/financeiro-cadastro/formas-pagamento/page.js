"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Info,
    CreditCard,
    Save,
    AlertTriangle,
    Check,
    HelpCircle,
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
import { Checkbox } from "@/components/ui/checkbox";
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

export default function FormasPagamentoPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

    // --- ESTADOS DO FORMULÁRIO ---
    const initialForm = {
        nome: "",
        ocultar: false, // Maps to !ativo
        taxa: "",
        prazoDias: ""
    };
    const [form, setForm] = useState(initialForm);

    const [payments, setPayments] = useState([]);

    // Modais
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [editForm, setEditForm] = useState(initialForm);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = () => {
        api.get('/cadastros/formas-pagamento')
            .then(res => setPayments(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar formas de pagamento.", variant: "destructive" });
            });
    };

    // --- HANDLERS ---

    const handleAdd = () => {
        if (!form.nome) {
            toast({ title: "Erro", description: "O nome da forma de pagamento é obrigatório.", variant: "destructive" });
            return;
        }

        const payload = {
            nome: form.nome.toUpperCase(),
            ativo: !form.ocultar,
            taxa_percentual: form.taxa || 0,
            dias_compensacao: form.prazoDias || 0
        };

        api.post('/cadastros/formas-pagamento', payload)
            .then(res => {
                setPayments([...payments, res.data]);
                setForm(initialForm);
                toast({ title: "Sucesso", description: "Forma de pagamento cadastrada.", className: "bg-purple-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao cadastrar forma de pagamento.", variant: "destructive" });
            });
    };

    const openEditModal = (item) => {
        setCurrentItem(item);
        setEditForm({
            nome: item.nome,
            ocultar: !item.ativo,
            taxa: item.taxa_percentual,
            prazoDias: item.dias_compensacao
        });
        setIsEditOpen(true);
    };

    const handleConfirmEdit = () => {
        const payload = {
            nome: editForm.nome.toUpperCase(),
            ativo: !editForm.ocultar,
            taxa_percentual: editForm.taxa || 0,
            dias_compensacao: editForm.prazoDias || 0
        };

        api.put(`/cadastros/formas-pagamento/${currentItem.id}`, payload)
            .then(res => {
                setPayments(payments.map(p => p.id === currentItem.id ? res.data : p));
                setIsEditOpen(false);
                toast({ title: "Sucesso", description: "Forma de pagamento atualizada.", className: "bg-purple-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao atualizar forma de pagamento.", variant: "destructive" });
            });
    };

    const handleDelete = () => {
        api.delete(`/cadastros/formas-pagamento/${currentItem.id}`)
            .then(() => {
                setPayments(payments.filter(p => p.id !== currentItem.id));
                setIsDeleteOpen(false);
                toast({ title: "Removido", description: "Forma de pagamento excluída.", className: "bg-red-600 text-white border-none" });
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao remover forma de pagamento.", variant: "destructive" });
            });
    };

    // Helper de Badge
    const renderBadge = (value, type = "default") => {
        if (type === "ocultar") {
            return value ?
                <Badge variant="destructive" className="h-5 px-2">SIM</Badge> :
                <Badge className="bg-emerald-500 hover:bg-emerald-600 h-5 px-2">NÃO</Badge>;
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-2 border-b pb-4">
                <h1 className="text-2xl font-bold tracking-tight text-purple-700">Formas de Pagamento</h1>
            </div>

            {/* --- CARD DE CADASTRO --- */}
            <Card className="border-t-4 border-t-purple-500 shadow-sm">
                <CardContent className="p-6 space-y-6">

                    {/* Linha 1: Nome */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-1 text-purple-700 font-bold text-xs uppercase">
                            Forma de Pagamento
                        </Label>
                        <Input
                            value={form.nome}
                            onChange={e => setForm({ ...form, nome: e.target.value })}
                            placeholder="Ex: CARTÃO CRÉDITO 3X"
                            className="bg-gray-50 border-gray-200"
                        />
                    </div>

                    {/* Linha 2: Checkboxes */}
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="ocultar"
                                checked={form.ocultar}
                                onCheckedChange={(checked) => setForm({ ...form, ocultar: checked })}
                            />
                            <label htmlFor="ocultar" className="text-sm text-purple-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
                                Ocultar essa forma de pagamento na tela de vendas
                            </label>
                        </div>
                    </div>

                    {/* Linha 3: Prazo e Taxa */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1 text-purple-700 font-bold text-xs uppercase">
                                Prazo de Compensação (dias)
                            </Label>
                            <Input
                                type="number"
                                value={form.prazoDias}
                                onChange={e => setForm({ ...form, prazoDias: e.target.value })}
                                placeholder="0"
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="flex items-center gap-1 text-purple-700 font-bold text-xs uppercase">
                                Taxa (%)
                            </Label>
                            <Input
                                type="number"
                                value={form.taxa}
                                onChange={e => setForm({ ...form, taxa: e.target.value })}
                                placeholder="0.00"
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleAdd}
                            className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-6 shadow-md"
                        >
                            Incluir Forma de Pagamento
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- LISTAGEM --- */}
            <Card className="border-t-4 border-t-purple-300 shadow-sm overflow-hidden">
                <div className="p-4 bg-white flex justify-end">
                    <div className="relative w-[250px]">
                        <Input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Pesquisar..."
                            className="h-9 bg-gray-50 pl-9"
                        />
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-white">
                            <TableRow className="border-b border-gray-200">
                                <TableHead className="w-[80px] font-bold text-gray-700 text-xs">Id</TableHead>
                                <TableHead className="font-bold text-gray-700 text-xs">Nome</TableHead>
                                <TableHead className="text-center font-bold text-gray-700 text-xs">Ocultar</TableHead>
                                <TableHead className="text-center font-bold text-gray-700 text-xs">Prazo (Dias)</TableHead>
                                <TableHead className="text-center font-bold text-gray-700 text-xs">Taxa %</TableHead>
                                <TableHead className="w-[100px] text-center font-bold text-gray-700 text-xs">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.filter(p => p.nome && p.nome.includes(searchTerm.toUpperCase())).map((item) => (
                                <TableRow key={item.id} className="hover:bg-purple-50/20 text-xs border-b border-gray-100 h-12">
                                    <TableCell className="text-gray-500">{String(item.id).padStart(4, '0')}</TableCell>
                                    <TableCell className="font-medium text-gray-700 uppercase">{item.nome}</TableCell>
                                    <TableCell className="text-center">{renderBadge(!item.ativo, "ocultar")}</TableCell>
                                    <TableCell className="text-center text-gray-600">{item.dias_compensacao}</TableCell>
                                    <TableCell className="text-center text-gray-600">{item.taxa_percentual}</TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button
                                                size="sm"
                                                onClick={() => openEditModal(item)}
                                                className="h-6 w-full bg-purple-500 hover:bg-purple-600 text-white text-[10px] uppercase font-bold rounded-sm shadow-sm"
                                            >
                                                ALTERAR
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={() => { setCurrentItem(item); setIsDeleteOpen(true); }}
                                                className="h-6 w-8 bg-red-500 hover:bg-red-600 text-white rounded-sm shadow-sm p-0"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* --- MODAIS DE AÇÃO --- */}

            {/* DELETE */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="border-l-4 border-l-red-600 sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Excluir Forma de Pagamento
                        </DialogTitle>
                        <DialogDescription>
                            Deseja remover <strong>{currentItem?.nome}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                        <Button className="bg-red-600 text-white" onClick={handleDelete}>Excluir</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* EDIT */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="border-l-4 border-l-purple-600">
                    <DialogHeader>
                        <DialogTitle className="text-purple-700">Editar Forma de Pagamento</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} className="border-purple-200" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="edit-ocultar"
                                checked={editForm.ocultar}
                                onCheckedChange={(checked) => setEditForm({ ...editForm, ocultar: checked })}
                            />
                            <label htmlFor="edit-ocultar" className="text-sm">Ocultar</label>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Prazo (dias)</Label>
                                <Input type="number" value={editForm.prazoDias} onChange={e => setEditForm({ ...editForm, prazoDias: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Taxa (%)</Label>
                                <Input type="number" value={editForm.taxa} onChange={e => setEditForm({ ...editForm, taxa: e.target.value })} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button className="bg-purple-600 text-white" onClick={handleConfirmEdit}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}