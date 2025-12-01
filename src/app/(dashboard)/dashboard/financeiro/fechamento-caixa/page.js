// src/app/dashboard/financeiro/fechamento-caixa/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Lock,
    Eye,
    Printer,
    Search,
    AlertCircle,
    CheckCircle2,
    AlertTriangle,
    Check
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
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast"; // Supondo uso do hook de toast padrão
import api from "@/services/api";

export default function FechamentoCaixaPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [closings, setClosings] = useState([]);

    useEffect(() => {
        // Load initial data (e.g. last 30 days) or empty
        // For now, let's load if dates are set or just empty
    }, []);

    const fetchClosings = async () => {
        try {
            const { data } = await api.get(`/financeiro/fechamentos?inicio=${dateStart}&fim=${dateEnd}`);
            setClosings(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao buscar fechamentos.", variant: "destructive" });
        }
    };

    // Helper para cor do status
    const getStatusBadge = (status) => {
        if (status === "Correto") return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Correto</Badge>;
        if (status === "Divergente") return <Badge variant="destructive" className="border-none"><AlertCircle className="w-3 h-3 mr-1" /> Falta</Badge>;
        if (status === "Sobras") return <Badge className="bg-primary hover:bg-primary/90 border-none"><AlertCircle className="w-3 h-3 mr-1" /> Sobra</Badge>;
        return <Badge variant="outline">{status}</Badge>;
    };

    // Handler para abrir o modal
    const handleInitiateClick = () => {
        if (!dateStart || !dateEnd) {
            toast({
                variant: "destructive",
                title: "Datas obrigatórias",
                description: "Selecione o início e o fim do período para prosseguir.",
            });
            return;
        }
        setIsConfirmOpen(true);
    };

    // Handler para confirmar a ação
    const handleConfirmClosing = () => {
        setIsConfirmOpen(false);
        toast({
            title: "Processo Iniciado",
            description: `Fechamento para o período ${dateStart} a ${dateEnd} iniciado com sucesso.`,
            className: "bg-primary text-primary-foreground border-none"
        });
        // Aqui entraria a lógica de redirecionamento ou chamada de API
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Fechamento de Caixa</h1>
                <p className="text-sm text-muted-foreground">
                    Realize o fechamento diário e audite os históricos de conferência.
                </p>
            </div>

            {/* --- 1. SELEÇÃO DE PERÍODO (Ação Principal) --- */}
            <Card className="border-t-4 border-t-primary shadow-sm">
                <CardHeader className="pb-3 border-b border-gray-100 bg-primary/5">
                    <CardTitle className="text-base font-bold text-primary flex items-center gap-2">
                        <Lock className="h-5 w-5" /> Seleção de Período para Fechamento
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-6 items-end">

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-primary">Início do Período</Label>
                            <Input
                                type="date"
                                value={dateStart}
                                onChange={e => setDateStart(e.target.value)}
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>

                        <div className="grid gap-1.5 flex-1 w-full">
                            <Label className="text-xs font-bold text-primary">Fim do Período</Label>
                            <Input
                                type="date"
                                value={dateEnd}
                                onChange={e => setDateEnd(e.target.value)}
                                className="bg-gray-50 border-gray-200"
                            />
                        </div>

                        {/* MODAL DE CONFIRMAÇÃO */}
                        <div className="flex gap-2">
                            <Button onClick={fetchClosings} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10">
                                BUSCAR
                            </Button>
                            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={handleInitiateClick}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold min-w-[180px] h-10 shadow-md transition-all hover:scale-105"
                                    >
                                        INICIAR FECHAMENTO
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-l-4 border-l-primary sm:max-w-[450px]">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2 text-primary">
                                            <AlertTriangle className="h-5 w-5" /> Confirmar Fechamento?
                                        </DialogTitle>
                                        <DialogDescription className="pt-2">
                                            Você está prestes a iniciar o fechamento de caixa para o período:
                                            <div className="mt-3 p-3 bg-primary/5 border border-primary/10 rounded-md text-sm font-medium text-center text-primary">
                                                {dateStart ? dateStart.split('-').reverse().join('/') : 'DD/MM/AAAA'} até {dateEnd ? dateEnd.split('-').reverse().join('/') : 'DD/MM/AAAA'}
                                            </div>
                                            <p className="mt-3 text-xs text-muted-foreground">
                                                Certifique-se de que todas as transações do período foram lançadas. Esta ação bloqueará edições em lançamentos anteriores a este fechamento.
                                            </p>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancelar</Button>
                                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleConfirmClosing}>
                                            <Check className="mr-2 h-4 w-4" /> Confirmar e Iniciar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. HISTÓRICO (Tabela) --- */}
            <Card className="border-t-4 border-t-primary/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 border-b border-gray-100 bg-white">
                    <CardTitle className="text-base font-bold text-primary">
                        Fechamentos de Caixa Realizados
                    </CardTitle>
                </CardHeader>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-primary/5">
                            <TableRow>
                                <TableHead className="w-[80px] font-bold text-primary text-xs text-center">Ação</TableHead>
                                <TableHead className="font-bold text-primary text-xs">ID</TableHead>
                                <TableHead className="font-bold text-primary text-xs">Data de Abertura</TableHead>
                                <TableHead className="font-bold text-primary text-xs">Data de Fechamento</TableHead>
                                <TableHead className="font-bold text-primary text-xs">Fechado Por</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-center">Status</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-right">Valor Esperado</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-right">Valor Confirmado</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-right">Diferença</TableHead>
                                <TableHead className="font-bold text-primary text-xs text-center">Fechado em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {closings.map((close) => (
                                <TableRow key={close.id} className="hover:bg-slate-50 text-xs border-b border-gray-100">
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:bg-primary/10" title="Visualizar Detalhes">
                                                <Eye className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:bg-gray-100" title="Imprimir Comprovante">
                                                <Printer className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-gray-600">#{close.id}</TableCell>
                                    <TableCell className="text-gray-600">{close.abertura}</TableCell>
                                    <TableCell className="text-gray-600">{close.fechamento}</TableCell>
                                    <TableCell className="font-medium uppercase text-gray-700">{close.usuario}</TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(close.status)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-gray-700">R$ {close.esperado.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-medium text-primary">R$ {close.confirmado.toFixed(2)}</TableCell>
                                    <TableCell className={`text-right font-bold ${close.dif < 0 ? 'text-red-600' : close.dif > 0 ? 'text-primary' : 'text-gray-400'}`}>
                                        R$ {close.dif.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-center text-gray-500">{close.dataReal}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                <div className="bg-gray-50 p-3 border-t flex gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-white" disabled>Anterior</Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs bg-white">Próximo</Button>
                </div>
            </Card>

        </div>
    );
}