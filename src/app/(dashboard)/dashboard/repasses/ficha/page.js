// src/app/dashboard/repasses/ficha/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Download,
    Wallet,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    FileText,
    MessageCircle,
    Printer,
    Link as LinkIcon,
    ArrowUpRight
} from "lucide-react";
import Link from "next/link";

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
import { Separator } from "@/components/ui/separator";
import api from "@/services/api";

export default function FichaContaCorrentePage() {
    const [showDetails, setShowDetails] = useState(false); // Estado para o botão "Ver Detalhes"
    const [selectedPerson, setSelectedPerson] = useState("");
    const [people, setPeople] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [dateStart, setDateStart] = useState("2025-10-29");
    const [dateEnd, setDateEnd] = useState("2025-11-30");

    useEffect(() => {
        loadPeople();
    }, []);

    const loadPeople = async () => {
        try {
            const { data } = await api.get('/pessoas');
            setPeople(data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadExtrato = async () => {
        if (!selectedPerson) return;
        try {
            const { data } = await api.get(`/financeiro/extrato-pessoa/${selectedPerson}?inicio=${dateStart}&fim=${dateEnd}`);
            setTransactions(data);
        } catch (error) {
            console.error(error);
        }
    };

    const saldoFinal = transactions.length > 0 ? transactions[transactions.length - 1].saldo : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-purple-600">Ficha de Conta-Corrente</h1>
            </div>

            {/* --- 1. BARRA DE FILTROS SUPERIOR --- */}
            <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col lg:flex-row gap-4 items-end">
                <div className="flex-1 w-full">
                    <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                        <SelectTrigger className="h-10 bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Escolha a Pessoa" />
                        </SelectTrigger>
                        <SelectContent>
                            {people.map(p => (
                                <SelectItem key={p.id} value={String(p.id)}>{String(p.id).padStart(8, '0')} {'>'} {p.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 w-full lg:w-auto">
                    <div className="relative flex-1">
                        <Input type="date" className="h-10 bg-gray-50 border-gray-200" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                    </div>
                    <div className="relative flex-1">
                        <Input type="date" className="h-10 bg-gray-50 border-gray-200" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                    </div>
                </div>

                <Button onClick={loadExtrato} className="bg-purple-600 hover:bg-purple-700 text-white font-bold h-10 px-8 w-full lg:w-auto">
                    LISTAR
                </Button>
            </div>

            {/* --- 2. CARD PRINCIPAL DE SALDO --- */}
            <Card className="border-2 border-primary/50 shadow-md overflow-hidden bg-white">
                <div className="p-6">

                    {/* Topo: Saldo */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-600 p-2 rounded-md text-white">
                                <Wallet className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-purple-700">Saldo da Conta-Corrente</h2>
                                <p className="text-xs text-gray-500">Saldo ao final do período selecionado</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-bold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoFinal)}
                            </span>
                        </div>
                    </div>

                    {/* Aviso Amarelo (Fiel ao print) */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="text-xs font-bold text-yellow-600 uppercase">Atenção: Chave PIX</span>
                        </div>
                        <p className="text-xs text-gray-700 font-bold">Fornecedor sem chave PIX informada.</p>
                        <p className="text-[10px] text-gray-500">Acesse Cadastros → Pessoas para adicionar a chave PIX deste fornecedor.</p>
                    </div>

                    {/* Botão Ver Detalhes + Título Composição */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-bold flex items-center gap-2 text-gray-700">
                            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">C</span>
                            Composição do Saldo
                        </h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                            {showDetails ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                            {showDetails ? "Ocultar Detalhes" : "Ver Detalhes"}
                        </Button>
                    </div>

                    {/* Cards de Resumo (4 colunas) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-xs font-bold text-gray-600">Vendas de Peças</span>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    transactions.reduce((acc, tx) => acc + (tx.categoria === 'VENDA_PECA' ? (tx.credito || 0) : 0), 0)
                                )}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-xs font-bold text-gray-600">Devoluções</span>
                            </div>
                            <span className="text-lg font-bold text-red-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    transactions.reduce((acc, tx) => acc + (tx.categoria === 'DEVOLUCAO' ? (tx.credito || 0) : 0), 0)
                                )}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-xs font-bold text-gray-600">Utilizações</span>
                            </div>
                            <span className="text-lg font-bold text-blue-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    transactions.reduce((acc, tx) => acc + (tx.debito || 0), 0)
                                )}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-3 rounded border border-gray-100">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                <span className="text-xs font-bold text-gray-600">Outros Créditos</span>
                            </div>
                            <span className="text-lg font-bold text-orange-600">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                    transactions.reduce((acc, tx) => acc + (tx.categoria !== 'VENDA_PECA' && tx.categoria !== 'DEVOLUCAO' ? (tx.credito || 0) : 0), 0)
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Área Expansível (Texto Explicativo) */}
                    {showDetails && (
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-xs text-gray-600 space-y-4 animate-in slide-in-from-top-2">
                            <div className="space-y-1">
                                <strong className="text-green-700 block">CRÉDITOS (Aumentam o saldo)</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>Vendas de Peças:</strong> Comissões por vendas de peças consignadas.</li>
                                    <li><strong>Devoluções:</strong> Créditos por produtos devolvidos pelo fornecedor.</li>
                                    <li><strong>Cashback:</strong> Bônus e incentivos do programa de fidelidade.</li>
                                    <li><strong>Créditos Diversos:</strong> Ajustes, bonificações e compensações manuais.</li>
                                </ul>
                            </div>
                            <Separator />
                            <div className="space-y-1">
                                <strong className="text-red-700 block">DÉBITOS (Diminuem o saldo)</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li><strong>Utilizações:</strong> Créditos usados pelo fornecedor em compras na loja.</li>
                                    <li><strong>Pagamentos:</strong> Valores já pagos ao fornecedor (Pix/Dinheiro).</li>
                                </ul>
                            </div>
                        </div>
                    )}

                </div>
            </Card>

            {/* --- 3. LANÇAMENTO DE TRANSAÇÕES --- */}
            <Card className="border border-purple-200 shadow-sm">
                <div className="bg-white p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg text-purple-600 font-medium">Lançamento de Transações</h3>
                        <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-600 text-white flex items-center justify-center text-[8px]">i</div>
                            Entendendo as transações
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Tipo de Transação</Label>
                            <Select defaultValue="transacao">
                                <SelectTrigger className="h-10 bg-gray-50"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="transacao">Transação</SelectItem>
                                    <SelectItem value="pagamento">Pagamento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Data da Transação</Label>
                            <Input type="date" className="h-10 bg-gray-50" />
                        </div>
                        <div className="md:col-span-4 space-y-1">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Descrição</Label>
                            <Input className="h-10 bg-gray-50" placeholder="Ex: pagamento mensal, adiantamento..." />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <Label className="text-[10px] font-bold text-gray-500 uppercase">Valor</Label>
                            <Input type="number" className="h-10 bg-gray-50 text-right" placeholder="0,00" />
                        </div>
                        <div className="md:col-span-2">
                            <div className="mb-1"><Label className="text-[10px] font-bold text-gray-500 uppercase">Conta Financeira</Label></div>
                            <div className="flex gap-2">
                                <Input className="h-10 bg-gray-50" placeholder="Conta Financeira" readOnly />
                                <Button className="h-10 bg-purple-600 hover:bg-purple-700 text-white font-bold w-full">
                                    LANÇAR
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* --- 4. EXTRATO (Tabela Completa) --- */}
            <Card className="border border-purple-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-white border-b flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="text-lg text-purple-600 font-medium">Extrato de Conta-Corrente</h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedPerson && (
                            <Link href={`/dashboard/cadastros/pecas-cadastro?fornecedorId=${selectedPerson}`}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-9">
                                    <ArrowUpRight className="mr-2 h-4 w-4" /> VISUALIZAR PEÇAS
                                </Button>
                            </Link>
                        )}
                        <Button variant="outline" size="icon" className="text-gray-500"><Printer className="h-5 w-5" /></Button>
                        <Button variant="outline" size="icon" className="text-gray-500"><FileText className="h-5 w-5" /></Button>
                        <Button variant="outline" size="icon" className="text-green-600"><MessageCircle className="h-5 w-5" /></Button>
                    </div>
                </div>

                {/* Wrapper de Scroll Horizontal */}
                <div className="overflow-x-auto w-full">
                    <Table className="min-w-[1200px]">
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-[100px] text-xs font-bold text-gray-700">Data</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Transação</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Categoria</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Venda</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Peça</TableHead>
                                <TableHead className="min-w-[200px] text-xs font-bold text-gray-700">Histórico</TableHead>
                                <TableHead className="text-xs font-bold text-gray-700">Pago Com</TableHead>
                                <TableHead className="text-right text-xs font-bold text-gray-700">Taxa</TableHead>
                                <TableHead className="text-center text-xs font-bold text-gray-700">Parcelas</TableHead>
                                <TableHead className="text-right text-xs font-bold text-gray-700">Imposto</TableHead>
                                <TableHead className="text-right text-xs font-bold text-gray-700">Débito</TableHead>
                                <TableHead className="text-right text-xs font-bold text-gray-700">Crédito</TableHead>
                                <TableHead className="text-right text-xs font-bold text-gray-700 bg-gray-100">Saldo</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="hover:bg-white">
                                <TableCell colSpan={12} className="text-right font-bold text-xs text-gray-500 uppercase py-3">
                                    SALDO ANTERIOR
                                </TableCell>
                                <TableCell className="text-right font-bold text-gray-800 bg-gray-50">0,00</TableCell>
                            </TableRow>

                            {transactions.map((tx, idx) => (
                                <TableRow key={idx} className="hover:bg-purple-50/20 text-xs">
                                    <TableCell>{tx.data}</TableCell>
                                    <TableCell>{tx.transacao}</TableCell>
                                    <TableCell>{tx.categoria}</TableCell>
                                    <TableCell className="font-mono text-purple-600">{tx.venda}</TableCell>
                                    <TableCell className="font-mono text-purple-600">{tx.peca}</TableCell>
                                    <TableCell className="uppercase text-gray-600">{tx.historico}</TableCell>
                                    <TableCell>{tx.pagoCom}</TableCell>
                                    <TableCell className="text-right">{tx.taxa}</TableCell>
                                    <TableCell className="text-center">{tx.parcelas}</TableCell>
                                    <TableCell className="text-right">{tx.imposto}</TableCell>
                                    <TableCell className="text-right text-red-600 font-bold">
                                        {tx.debito ? tx.debito.toFixed(2) : ""}
                                    </TableCell>
                                    <TableCell className="text-right text-green-600 font-bold">
                                        {tx.credito ? tx.credito.toFixed(2) : ""}
                                    </TableCell>
                                    <TableCell className="text-right font-bold bg-gray-50">
                                        {tx.saldo.toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}

                            {/* Linha Final de Saldo */}
                            <TableRow className="bg-gray-50 hover:bg-gray-50 border-t-2 border-gray-200">
                                <TableCell colSpan={12} className="text-right font-bold text-sm text-gray-800 uppercase py-4">
                                    SALDO DO PERÍODO
                                </TableCell>
                                <TableCell className="text-right font-bold text-lg text-green-600">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(saldoFinal)}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </Card>

        </div>
    );
}