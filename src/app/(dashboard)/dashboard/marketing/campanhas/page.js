// src/app/dashboard/marketing/campanhas/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Calendar as CalendarIcon,
    Filter,
    CheckCircle2,
    Trash2,
    PlusCircle,
    AlertTriangle,
    Megaphone,
    Check
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast"; // Assumindo que você tem o hook de toast configurado
import api from "@/services/api";

export default function GestaoCampanhasPage() {
    const { toast } = useToast();

    // --- ESTADOS ---
    const [selectedIds, setSelectedIds] = useState([]);
    const [campaignInput, setCampaignInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Controle dos Modais
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    const [isApproveOpen, setIsApproveOpen] = useState(false);

    const [products, setProducts] = useState([]);

    useEffect(() => {
        loadProducts();
    }, [searchTerm]);

    const loadProducts = async () => {
        try {
            const { data } = await api.get(`/marketing/produtos-campanha?search=${searchTerm}`);
            setProducts(data.map(p => ({
                id: p.id,
                days: Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24)),
                approved: p.status === 'DISPONIVEL',
                campaign: p.campanha ? p.campanha.nome : "",
                desc: p.descricao_curta,
                brand: p.marca ? p.marca.nome : "-",
                cat: p.categoria ? p.categoria.nome : "-",
                price: parseFloat(p.preco_venda),
                promo: parseFloat(p.preco_promocional || 0),
                pct: p.preco_promocional ? Math.round((1 - p.preco_promocional / p.preco_venda) * 100) : 0
            })));
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao carregar produtos.", variant: "destructive" });
        }
    };

    // --- LÓGICA DE SELEÇÃO ---
    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedIds(products.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id, checked) => {
        if (checked) {
            setSelectedIds([...selectedIds, id]);
        } else {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        }
    };

    // --- AÇÕES DOS MODAIS ---

    // 1. Adicionar à Campanha
    const handleAddToCampaign = async () => {
        if (!campaignInput) return;

        try {
            // First create campaign if not exists (or find) - Backend logic for this endpoint should handle it?
            // The current backend endpoint `createCampanha` creates one.
            // But here we are adding products TO a campaign.
            // We need to create the campaign first if we want to use ID, or the backend endpoint should handle name.
            // Let's assume we create the campaign first.
            const campRes = await api.post('/marketing/campanhas', {
                nome: campaignInput,
                data_inicio: new Date(),
                data_fim: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default 1 month
                desconto_percentual: 50 // Default 50% as per UI
            });

            const campanhaId = campRes.data.id;

            await api.post(`/marketing/campanhas/${campanhaId}/produtos`, { pecaIds: selectedIds });

            toast({
                title: "Campanha Atualizada",
                description: `${selectedIds.length} produtos adicionados à campanha.`,
                className: "bg-purple-600 text-white border-none"
            });
            loadProducts();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao adicionar à campanha.", variant: "destructive" });
        }

        setIsAddOpen(false);
        setCampaignInput(""); // Limpa input
        setSelectedIds([]); // Limpa seleção
    };

    // 2. Remover da Campanha
    const handleRemoveFromCampaign = async () => {
        try {
            await api.post('/marketing/campanhas/remover-produtos', { pecaIds: selectedIds });
            toast({
                title: "Produtos Removidos",
                description: "Os produtos foram removidos da campanha.",
                variant: "destructive"
            });
            loadProducts();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao remover da campanha.", variant: "destructive" });
        }

        setIsRemoveOpen(false);
        setSelectedIds([]);
    };

    // 3. Aprovar Produtos
    const handleApproveProducts = async () => {
        try {
            await api.post('/marketing/produtos/aprovar', { pecaIds: selectedIds });
            toast({
                title: "Produtos Aprovados",
                description: "Os itens selecionados agora estão ativos na promoção.",
                className: "bg-emerald-600 text-white border-none"
            });
            loadProducts();
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao aprovar produtos.", variant: "destructive" });
        }

        setIsApproveOpen(false);
        setSelectedIds([]);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Gestão de Campanhas Promocionais</h1>
                <p className="text-sm text-muted-foreground">Crie campanhas, aplique descontos em massa e aprove itens para promoção.</p>
            </div>

            {/* --- ÁREA DE CONTROLE (Card Principal) --- */}
            <Card className="border-purple-100 shadow-md">
                <CardContent className="p-6 space-y-6">

                    {/* Linha 1: Busca e Data */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Pesquise Produtos</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Digite algo sobre os produtos que deseja encontrar..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-[200px] space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Cadastradas até</label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-9" />
                            </div>
                        </div>
                    </div>

                    {/* Linha 2: Input de Campanha e Botões de Ação */}
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1.5 w-full">
                            <label className="text-xs font-bold text-muted-foreground uppercase">Nome da Nova Campanha</label>
                            <Input
                                placeholder="Ex: Black Friday, Verão 2025..."
                                value={campaignInput}
                                onChange={(e) => setCampaignInput(e.target.value)}
                                className="border-purple-200 focus-visible:ring-purple-500"
                            />
                        </div>

                        {/* BOTÕES COM MODAIS */}
                        <div className="flex gap-2 w-full md:w-auto">

                            {/* 1. MODAL ROXO (ADICIONAR) */}
                            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-purple-600 hover:bg-purple-700 text-white flex-1 md:flex-none"
                                        disabled={selectedIds.length === 0 || !campaignInput}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar à Campanha
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-l-4 border-l-purple-600 sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-purple-700 flex items-center gap-2">
                                            <Megaphone className="h-5 w-5" /> Confirmar Adição
                                        </DialogTitle>
                                        <DialogDescription>
                                            Você está prestes a adicionar <strong>{selectedIds.length} produtos</strong> à campanha:
                                            <br />
                                            <span className="text-lg font-bold text-foreground mt-2 block">"{campaignInput}"</span>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
                                        <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAddToCampaign}>
                                            Confirmar
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* 2. MODAL VERDE (REMOVER - OBS: User pediu "Remover da Campanha", geralmente vermelho ou cinza, vou usar um tom Teal/Greenish conforme print ou Red conforme lógica) - Usarei Vermelho para destaque de remoção */}
                            <Dialog open={isRemoveOpen} onOpenChange={setIsRemoveOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="text-white bg-teal-500 hover:bg-teal-600 border-teal-600 hover:text-white flex-1 md:flex-none" // Cor do print parece um verde-água/teal
                                        disabled={selectedIds.length === 0}
                                    >
                                        Remover da Campanha
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-l-4 border-l-teal-500 sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-teal-700 flex items-center gap-2">
                                            <Trash2 className="h-5 w-5" /> Remover Produtos
                                        </DialogTitle>
                                        <DialogDescription>
                                            Deseja remover <strong>{selectedIds.length} produtos</strong> da campanha atual?
                                            <br />
                                            Eles voltarão a ficar sem vínculo promocional.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsRemoveOpen(false)}>Cancelar</Button>
                                        <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleRemoveFromCampaign}>
                                            Sim, Remover
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* 3. MODAL VERDE ESCURO (APROVAR) */}
                            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-none"
                                        disabled={selectedIds.length === 0}
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Aprovar Produtos
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="border-l-4 border-l-emerald-600 sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle className="text-emerald-700 flex items-center gap-2">
                                            <Check className="h-5 w-5" /> Aprovação de Promoção
                                        </DialogTitle>
                                        <DialogDescription>
                                            Confirmar a aprovação de <strong>{selectedIds.length} produtos</strong>?
                                            <div className="mt-2 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-md border border-emerald-100 flex gap-2">
                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                Ao aprovar, os descontos serão aplicados e os produtos estarão visíveis com preço promocional no PDV.
                                            </div>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsApproveOpen(false)}>Revisar</Button>
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApproveProducts}>
                                            Aprovar Agora
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </div>
                </CardContent>

                {/* Faixa de Título da Lista */}
                <div className="bg-purple-500 text-white px-6 py-2 font-bold text-sm">
                    Produtos Disponíveis
                </div>
            </Card>

            {/* --- TABELA --- */}
            <Card className="shadow-sm border-muted overflow-hidden">
                <div className="p-4 border-b bg-muted/5 flex items-center gap-2 text-sm text-muted-foreground">
                    Exibir
                    <select className="border rounded p-1 bg-white">
                        <option>10</option>
                        <option>50</option>
                        <option>100</option>
                    </select>
                    resultados por página
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/10">
                            <TableRow>
                                <TableHead className="w-[40px] text-center">
                                    <Checkbox
                                        checked={selectedIds.length === products.length && products.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="w-[150px] font-bold text-purple-700">Campanha</TableHead>
                                <TableHead className="w-[60px] text-center font-bold text-purple-700">Dias</TableHead>
                                <TableHead className="w-[40px] text-center font-bold text-purple-700">✓</TableHead>
                                <TableHead className="w-[80px] font-bold text-purple-700">Id</TableHead>
                                <TableHead className="font-bold text-purple-700">Descrição</TableHead>
                                <TableHead className="font-bold text-purple-700">Marca</TableHead>
                                <TableHead className="font-bold text-purple-700">Categoria</TableHead>
                                <TableHead className="text-right font-bold text-purple-700">Preço</TableHead>
                                <TableHead className="text-right font-bold text-purple-700">Preço Promo</TableHead>
                                <TableHead className="text-center font-bold text-purple-700">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.filter(p => p.desc.toLowerCase().includes(searchTerm.toLowerCase())).map((prod) => (
                                <TableRow key={prod.id} className="hover:bg-purple-50/20">
                                    <TableCell className="text-center">
                                        <Checkbox
                                            checked={selectedIds.includes(prod.id)}
                                            onCheckedChange={(checked) => handleSelectOne(prod.id, checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {prod.campaign ? (
                                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                                                {prod.campaign}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs italic">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center text-xs">{prod.days}</TableCell>
                                    <TableCell className="text-center">
                                        {prod.approved ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                                        ) : (
                                            <div className="h-4 w-4 border rounded-full border-gray-300 mx-auto" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{prod.id}</TableCell>
                                    <TableCell className="text-xs font-medium uppercase">{prod.desc}</TableCell>
                                    <TableCell className="text-xs">{prod.brand}</TableCell>
                                    <TableCell className="text-xs">{prod.cat}</TableCell>
                                    <TableCell className="text-right text-xs">R$ {prod.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right text-xs font-bold text-purple-600">
                                        {prod.campaign ? `R$ ${(prod.price * 0.5).toFixed(2)}` : "-"}
                                    </TableCell>
                                    <TableCell className="text-center text-xs">
                                        {prod.campaign ? "50.00" : "-"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 border-t text-xs text-muted-foreground flex justify-between items-center">
                    <span>Mostrando 1 até {products.length} de {products.length} registros</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled className="h-7 text-xs">Anterior</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-purple-50 text-purple-700 border-purple-200">1</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">2</Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs">Próximo</Button>
                    </div>
                </div>
            </Card>

        </div>
    );
}