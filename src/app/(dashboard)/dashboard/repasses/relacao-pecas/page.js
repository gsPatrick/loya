// src/app/dashboard/repasses/relacao-pecas/page.js
"use client";

import { useState } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    Printer,
    FileText,
    CheckSquare,
    Square,
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/services/api";

export default function RelacaoPecasPage() {
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");

    useEffect(() => {
        loadSuppliers();
    }, []);

    const loadSuppliers = async () => {
        try {
            const { data } = await api.get('/pessoas?is_fornecedor=true');
            setSuppliers(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadItems = async () => {
        if (!selectedSupplier) return;
        try {
            const { data } = await api.get(`/relatorios/pecas-fornecedor/${selectedSupplier}?inicio=${dateStart}&fim=${dateEnd}`);
            setItems(data);
        } catch (error) {
            console.error(error);
        }
    };

    // Helper de Status
    const getStatusBadge = (status) => {
        if (status === "VENDIDA") return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none font-bold">VENDIDA</Badge>;
        if (status === "A VENDA") return <Badge className="bg-green-600 hover:bg-green-700 text-white border-none font-bold">A VENDA</Badge>;
        return <Badge variant="outline">{status}</Badge>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-purple-600">Relação de Peças da Fornecedora</h1>
                <p className="text-sm text-muted-foreground">Consulte o inventário detalhado filtrado por fornecedor.</p>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="shadow-sm border-purple-100 bg-purple-50/20">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">

                        {/* Fornecedor (Select Grande) */}
                        <div className="grid gap-1.5 flex-[2]">
                            <Label className="text-xs font-bold text-purple-700 uppercase">Fornecedor</Label>
                            <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                                <SelectTrigger className="bg-white h-10 border-purple-200">
                                    <SelectValue placeholder="Selecione um fornecedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>{String(s.id).padStart(8, '0')} {'>'} {s.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Datas */}
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Cadastradas de</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input type="date" className="pl-9 bg-white h-10" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs font-bold text-gray-500 uppercase">Até</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                <Input type="date" className="pl-9 bg-white h-10" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                            </div>
                        </div>

                        <Button onClick={loadItems} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[120px] h-10 font-bold shadow-md">
                            FILTRAR
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. BARRA DE AÇÕES EM LOTE --- */}
            <div className="flex items-center justify-between bg-gray-100 p-2 rounded-lg border border-gray-200">
                <div className="flex items-center gap-4 px-2">
                    <span className="text-sm font-bold text-gray-600">Lista de Peças</span>
                    <div className="h-4 w-px bg-gray-300 mx-2" />
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">Selecionadas: 0</Badge>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">Total: 75</Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-white text-gray-600 border-gray-300 hover:bg-gray-50">
                        <Printer className="h-4 w-4" /> Imprimir Lista
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 bg-white text-gray-600 border-gray-300 hover:bg-gray-50">
                        <FileText className="h-4 w-4" /> Gerar PDF
                    </Button>
                </div>
            </div>

            {/* --- 3. LISTAGEM --- */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
                <div className="bg-white p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Select defaultValue="50">
                            <SelectTrigger className="h-8 w-[70px] text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">resultados por página</span>
                    </div>
                    <div className="relative w-[300px]">
                        <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Pesquisar na lista..." className="pl-9 h-8 text-xs bg-gray-50" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-purple-50/50">
                            <TableRow>
                                <TableHead className="w-[40px] text-center"><Checkbox /></TableHead>
                                <TableHead className="w-[100px] text-xs font-bold text-purple-700">ID</TableHead>
                                <TableHead className="w-[100px] text-xs font-bold text-purple-700">Entrada</TableHead>
                                <TableHead className="w-[100px] text-xs font-bold text-purple-700">Alt ID</TableHead>
                                <TableHead className="text-xs font-bold text-purple-700">Descrição</TableHead>
                                <TableHead className="w-[120px] text-center text-xs font-bold text-purple-700">Status</TableHead>
                                <TableHead className="w-[120px] text-xs font-bold text-purple-700">Marca</TableHead>
                                <TableHead className="w-[60px] text-center text-xs font-bold text-purple-700">Tam</TableHead>
                                <TableHead className="w-[60px] text-center text-xs font-bold text-purple-700">Cor</TableHead>
                                <TableHead className="w-[100px] text-right text-xs font-bold text-purple-700">Repasse</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id} className="hover:bg-purple-50/10">
                                    <TableCell className="text-center"><Checkbox /></TableCell>
                                    <TableCell className="font-mono text-xs text-gray-600">{item.id}</TableCell>
                                    <TableCell className="text-xs text-gray-500">{item.entrada}</TableCell>
                                    <TableCell className="font-mono text-xs text-gray-500">{item.altId}</TableCell>
                                    <TableCell className="text-xs font-medium text-gray-700 uppercase">{item.desc}</TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(item.status)}
                                    </TableCell>
                                    <TableCell className="text-xs text-gray-600">{item.marca}</TableCell>
                                    <TableCell className="text-center text-xs font-bold bg-gray-50 rounded mx-1">{item.tam}</TableCell>
                                    <TableCell className="text-center text-xs text-gray-500">-</TableCell>
                                    <TableCell className="text-right text-xs font-bold text-gray-700">
                                        R$ {item.repasse.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Rodapé */}
                <div className="bg-gray-50 p-3 border-t text-xs text-gray-500 flex justify-between items-center px-4">
                    <span>Mostrando 1 até {items.length} de 75 registros</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs bg-white">Anterior</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-white">1</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-white">2</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-white">Próximo</Button>
                    </div>
                </div>
            </Card>

        </div>
    );
}