"use client";

import { useState, useEffect } from "react";
import {
    Search,
    ArrowUpDown,
    Filter,
    Trophy,
    ShoppingBag,
    Tag,
    Shirt
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
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function RankingFornecedoresPage() {
    const { toast } = useToast();
    const [selectedFornecedor, setSelectedFornecedor] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [fornecedores, setFornecedores] = useState([]);
    const [detalhes, setDetalhes] = useState({ categorias: [], marcas: [], pecas: [] });
    const [loading, setLoading] = useState(false);
    const [loadingDetalhes, setLoadingDetalhes] = useState(false);
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchFornecedores();
    }, []);

    const fetchFornecedores = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}`;
        api.get(`/relatorios/vendas-fornecedor${params}`)
            .then(res => setFornecedores(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar ranking de fornecedores.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    const fetchDetalhes = (fornecedorId) => {
        setLoadingDetalhes(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}`;
        // Assuming we can pass the name or ID. The backend expects ID. 
        // But getVendasPorFornecedor returns 'nome' and not ID directly if grouped by name.
        // Wait, getVendasPorFornecedor returns 'nome'. 
        // I need to adjust getVendasPorFornecedor to return ID as well if possible, or use name for lookup if unique.
        // Let's assume for now we use 'nome' as ID or we need to fix getVendasPorFornecedor to return ID.
        // Actually, getVendasPorFornecedor groups by 'peca.fornecedor.nome'. It doesn't return ID.
        // I should probably fix getVendasPorFornecedor to return ID.
        // But for now, let's try to find the ID from the list if available, or pass name if backend supports it.
        // The backend getDetalhesFornecedor expects ID.
        // I'll assume for now that I can't easily get ID without changing getVendasPorFornecedor.
        // Let's modify getVendasPorFornecedor in RelatoriosService to include ID.

        // Actually, let's check if I can just use the name if I modify the backend.
        // But better to use ID.
        // I'll assume the frontend 'fornecedores' list has 'id' if I update the service.
        // Let's check RelatoriosService.js again.

        // It groups by 'peca.fornecedor.nome'.
        // I should group by 'peca.fornecedor.id' and 'peca.fornecedor.nome'.

        // For now, I will use the 'nome' as ID if I can't get ID, but that's risky.
        // I'll proceed with using 'nome' and hope the backend can handle it or I'll fix the backend in a bit.
        // Actually, I'll fix the backend first.

        // Wait, I can't fix backend inside this write_to_file.
        // I will finish this file assuming 'id' is available in 'fornecedores' (I will fix backend next).

        api.get(`/relatorios/detalhes-fornecedor/${fornecedorId}${params}`)
            .then(res => setDetalhes(res.data))
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar detalhes.", variant: "destructive" });
            })
            .finally(() => setLoadingDetalhes(false));
    };

    const handleSelectFornecedor = (f) => {
        if (selectedFornecedor === f.id) {
            setSelectedFornecedor(null);
            setDetalhes({ categorias: [], marcas: [], pecas: [] });
        } else {
            setSelectedFornecedor(f.id);
            fetchDetalhes(f.id);
        }
    };

    // Função para calcular Ticket Médio
    const getTicketMedio = (total, qtd) => (qtd > 0 ? total / qtd : 0);

    // Filter
    const filteredFornecedores = fornecedores.filter(f =>
        f.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Ranking de Fornecedores</h1>
                <p className="text-sm text-muted-foreground">Análise de desempenho e vendas por fornecedor.</p>
            </div>

            {/* --- TABELA SUPERIOR: RANKING --- */}
            {/* Usamos border-primary/20 para simular a borda roxa da imagem, mas sutil */}
            <Card className="border border-primary/20 shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4 pt-4 border-b border-primary/10">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <CardTitle className="text-lg font-bold text-primary flex items-center gap-2">
                            <Trophy className="h-5 w-5" /> Lista de Fornecedores
                        </CardTitle>

                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Pesquisar:</span>
                            <div className="relative w-full md:w-[250px]">
                                <Input
                                    className="h-9 bg-background border-primary/20 focus-visible:ring-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <div className="overflow-x-auto max-h-[400px]">
                    <Table>
                        <TableHeader className="bg-background sticky top-0 z-10 shadow-sm">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px] cursor-pointer group">
                                    <div className="flex items-center gap-1 font-bold text-primary">Id <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100" /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer group">
                                    <div className="flex items-center gap-1 font-bold text-primary">Fornecedor <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100" /></div>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer group">
                                    <div className="flex items-center justify-end gap-1 font-bold text-primary">Vendas (R$) <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100" /></div>
                                </TableHead>
                                <TableHead className="text-center cursor-pointer group">
                                    <div className="flex items-center justify-center gap-1 font-bold text-primary">Qtd. Vendas <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100" /></div>
                                </TableHead>
                                <TableHead className="text-right cursor-pointer group">
                                    <div className="flex items-center justify-end gap-1 font-bold text-primary">Tkt Médio <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100" /></div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredFornecedores.map((f, idx) => (
                                <TableRow
                                    key={idx}
                                    onClick={() => handleSelectFornecedor(f)}
                                    className={`cursor-pointer transition-colors text-xs ${selectedFornecedor === f.id ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"}`}
                                >
                                    <TableCell className="font-mono text-muted-foreground">{f.id || '-'}</TableCell>
                                    <TableCell className="font-medium text-foreground uppercase">{f.nome}</TableCell>
                                    <TableCell className="text-right font-medium">
                                        {f.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-mono">{f.qtd}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-primary">
                                        {f.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="bg-primary/5 p-2 text-xs text-muted-foreground border-t border-primary/10 text-center">
                    Selecione um fornecedor acima para ver detalhes
                </div>
            </Card>


            {/* --- GRID INFERIOR: DETALHES --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Categorias Mais Vendidas (3 colunas) */}
                <Card className="md:col-span-3 border border-primary/20 shadow-sm h-full flex flex-col">
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-bold text-primary uppercase flex items-center gap-2">
                            <Tag className="h-4 w-4" /> Categorias mais vendidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="h-8 text-xs font-bold text-primary">Categoria</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-primary text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingDetalhes ? (
                                    <TableRow><TableCell colSpan={2} className="text-center py-4">Carregando...</TableCell></TableRow>
                                ) : detalhes.categorias.length > 0 ? (
                                    detalhes.categorias.map((c, idx) => (
                                        <TableRow key={idx} className="text-xs hover:bg-muted/30">
                                            <TableCell className="py-2">{c.nome}</TableCell>
                                            <TableCell className="py-2 text-right">{c.total}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-32 text-center text-xs text-muted-foreground align-middle">
                                            Nenhum registro encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 2. Marcas Mais Vendidas (3 colunas) */}
                <Card className="md:col-span-3 border border-primary/20 shadow-sm h-full flex flex-col">
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-bold text-primary uppercase flex items-center gap-2">
                            <Shirt className="h-4 w-4" /> Marcas mais vendidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="h-8 text-xs font-bold text-primary">Marca</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-primary text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingDetalhes ? (
                                    <TableRow><TableCell colSpan={2} className="text-center py-4">Carregando...</TableCell></TableRow>
                                ) : detalhes.marcas.length > 0 ? (
                                    detalhes.marcas.map((m, idx) => (
                                        <TableRow key={idx} className="text-xs hover:bg-muted/30">
                                            <TableCell className="py-2">{m.nome}</TableCell>
                                            <TableCell className="py-2 text-right">{m.total}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="h-32 text-center text-xs text-muted-foreground align-middle">
                                            Nenhum registro encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* 3. Peças Vendidas (6 colunas) */}
                <Card className="md:col-span-6 border border-primary/20 shadow-sm h-full flex flex-col">
                    <CardHeader className="pb-2 pt-4">
                        <CardTitle className="text-sm font-bold text-primary uppercase flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" /> Peças vendidas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 flex flex-col">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30 hover:bg-muted/30">
                                    <TableHead className="h-8 text-xs font-bold text-primary">Venda</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-primary">Data</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-primary">Descrição</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-primary text-right">Preço</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-primary text-right">Desconto</TableHead>
                                    <TableHead className="h-8 text-xs font-bold text-primary text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loadingDetalhes ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-4">Carregando...</TableCell></TableRow>
                                ) : detalhes.pecas.length > 0 ? (
                                    detalhes.pecas.map((p, idx) => (
                                        <TableRow key={idx} className="text-xs hover:bg-muted/30">
                                            <TableCell className="py-2 font-mono">{p.venda}</TableCell>
                                            <TableCell className="py-2">{p.data}</TableCell>
                                            <TableCell className="py-2 font-medium">{p.desc}</TableCell>
                                            <TableCell className="py-2 text-right">{p.preco.toFixed(2)}</TableCell>
                                            <TableCell className="py-2 text-right text-red-400">{p.descVal > 0 ? `-${p.descVal.toFixed(2)}` : '-'}</TableCell>
                                            <TableCell className="py-2 text-right font-bold text-primary">{p.total.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground align-middle">
                                            Nenhum registro encontrado
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}