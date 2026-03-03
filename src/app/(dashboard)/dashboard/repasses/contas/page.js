// src/app/dashboard/repasses/contas/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    User,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    MessageCircle,
    FileText,
    Calendar as CalendarIcon,
    CheckCircle2,
    DollarSign
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/services/api";

export default function ContasPagarReceberPage() {
    const [filterType, setFilterType] = useState("todos"); // todos, credores, devedores
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadAccounts();
    }, [searchTerm]);

    const loadAccounts = async () => {
        try {
            const { data } = await api.get(`/financeiro/saldos-pessoas?search=${searchTerm}`);
            setAccounts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const filteredAccounts = accounts.filter(a => {
        if (filterType === 'todos') return true;
        if (filterType === 'credores') return a.tipo === 'CREDOR';
        if (filterType === 'devedores') return a.tipo === 'DEVEDOR';
        return true;
    });

    // Cálculos de Totais
    const totalCredores = accounts.filter(a => a.tipo === "CREDOR").reduce((acc, curr) => acc + curr.valor, 0);
    const totalDevedores = accounts.filter(a => a.tipo === "DEVEDOR").reduce((acc, curr) => acc + Math.abs(curr.valor), 0);
    const saldoLiquido = totalCredores - totalDevedores;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Contas a Pagar ou Receber</h1>
                    <p className="text-sm text-muted-foreground">Gestão de saldos de fornecedores e consignadoras.</p>
                </div>
                <Button variant="outline" className="gap-2 text-green-700 border-green-200 hover:bg-green-50">
                    <Download className="h-4 w-4" /> Exportar Excel
                </Button>
            </div>

            {/* --- 1. CARDS DE TOTAIS (Substitui o rodapé antigo) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-red-50 border-red-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-red-600 uppercase tracking-wider">Total Credores (A Pagar)</p>
                            <div className="text-2xl font-bold text-red-700 mt-1">R$ {totalCredores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <ArrowUpRight className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600 uppercase tracking-wider">Total Devedores (A Receber)</p>
                            <div className="text-2xl font-bold text-green-700 mt-1">R$ {totalDevedores.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <ArrowDownLeft className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-primary text-primary-foreground border-none shadow-md">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-primary-foreground/80 uppercase tracking-wider">Saldo Líquido da Loja</p>
                            <div className="text-2xl font-bold mt-1">R$ {saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center text-white">
                            <Wallet className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- 2. FILTROS --- */}
            <Card className="shadow-sm">
                <CardContent className="p-4 space-y-4">

                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end">

                        {/* Filtro de Data */}
                        <div className="space-y-2 w-full lg:w-auto">
                            <Label className="text-xs text-muted-foreground uppercase font-bold">Saldo calculado até:</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-9 w-full lg:w-[200px]" defaultValue="2025-11-29" />
                            </div>
                        </div>

                        {/* Abas de Tipo (Credor/Devedor) */}
                        <div className="space-y-2 flex-1">
                            <Label className="text-xs text-muted-foreground uppercase font-bold">Tipo de Filtro</Label>
                            <Tabs defaultValue="todos" className="w-full" onValueChange={setFilterType}>
                                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                                    <TabsTrigger value="credores">Credores</TabsTrigger>
                                    <TabsTrigger value="devedores">Devedores</TabsTrigger>
                                    <TabsTrigger value="todos">Todos</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {/* Checkboxes */}
                        <div className="flex flex-col gap-2 pb-1">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="zero" />
                                <label htmlFor="zero" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Exibir saldos zerados
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="pix" />
                                <label htmlFor="pix" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Exibir pessoas com chave PIX
                                </label>
                            </div>
                        </div>

                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px] h-10">
                            <Filter className="h-4 w-4 mr-2" /> Listar
                        </Button>
                    </div>

                    {/* Barra de Pesquisa Rápida */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Pesquisar por Nome, ID ou WhatsApp..."
                            className="pl-9 bg-muted/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                </CardContent>
            </Card>

            {/* --- 3. LISTAGEM --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[50px] text-center">
                                    <Checkbox />
                                </TableHead>
                                <TableHead className="w-[80px]">ID</TableHead>
                                <TableHead>Pessoa (Fornecedor/Cliente)</TableHead>
                                <TableHead>Dados Bancários</TableHead>
                                <TableHead className="text-center">Peças à Venda</TableHead>
                                <TableHead className="text-right">Valor a Pagar</TableHead>
                                <TableHead className="text-center w-[140px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAccounts.map((acc) => (
                                <TableRow key={acc.id} className="hover:bg-muted/20">
                                    <TableCell className="text-center">
                                        <Checkbox />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {acc.id}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{acc.nome}</span>
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MessageCircle className="h-3 w-3 text-green-500" /> {acc.whatsapp}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs">
                                            {acc.pix !== "-" ? (
                                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-mono">
                                                    PIX: {acc.pix}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground italic">Sem chave cadastrada</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-mono">
                                            {acc.pecasVenda}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {acc.tipo === "CREDOR" ? (
                                            <span className="font-bold text-red-600">R$ {acc.valor.toFixed(2)}</span>
                                        ) : (
                                            <span className="font-bold text-green-600">R$ {Math.abs(acc.valor).toFixed(2)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary hover:bg-primary/10">
                                                            <FileText className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Abrir Ficha Financeira</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                            {acc.tipo === "CREDOR" && (
                                                <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white text-xs">
                                                    <DollarSign className="h-3 w-3 mr-1" /> Pagar
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                <div className="bg-muted/10 p-3 border-t text-xs text-muted-foreground flex justify-between items-center px-4">
                    <span>Mostrando {accounts.length} registros</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Anterior</Button>
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Próximo</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}   