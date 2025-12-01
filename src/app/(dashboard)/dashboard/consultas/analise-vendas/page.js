"use client";

import { useState, useEffect } from "react";
import {
    Calendar as CalendarIcon,
    Filter,
    Download,
    FileSpreadsheet,
    FileText,
    TrendingUp,
    DollarSign,
    Package,
    Tags,
    Search,
    Share2,
    ChevronLeft,
    ChevronRight,
    List,
    Grid
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function AnaliseVendasPage() {
    const { toast } = useToast();
    const [dateStart, setDateStart] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [activeTab, setActiveTab] = useState("resumo");
    const [fornecedoresData, setFornecedoresData] = useState([]);
    const [pecasData, setPecasData] = useState([]);
    const [categoriasData, setCategoriasData] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        const params = `?inicio=${dateStart}&fim=${dateEnd}`;

        Promise.all([
            api.get(`/relatorios/vendas-fornecedor${params}`),
            api.get(`/relatorios/vendas-detalhadas${params}`),
            api.get(`/relatorios/vendas-categoria${params}`)
        ])
            .then(([resFornecedor, resDetalhado, resCategoria]) => {
                setFornecedoresData(resFornecedor.data);
                setPecasData(resDetalhado.data);
                setCategoriasData(resCategoria.data);
            })
            .catch(err => {
                console.error(err);
                toast({ title: "Erro", description: "Erro ao carregar dados de vendas.", variant: "destructive" });
            })
            .finally(() => setLoading(false));
    };

    // --- KPIs Calculation ---
    const totalVendido = fornecedoresData.reduce((acc, i) => acc + i.valor, 0);
    const totalLoja = fornecedoresData.reduce((acc, i) => acc + i.loja, 0);
    const totalCusto = fornecedoresData.reduce((acc, i) => acc + i.custo, 0);
    const totalQtd = fornecedoresData.reduce((acc, i) => acc + i.qtd, 0);
    const margemMedia = totalVendido > 0 ? (totalLoja / totalVendido) * 100 : 0;
    const ticketMedio = totalQtd > 0 ? totalVendido / totalQtd : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Análise de Vendas</h1>
                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-600"></span>
                    Entendendo a análise de vendas
                </div>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="shadow-sm border-muted">
                <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs text-muted-foreground">Data Início</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="pl-9 bg-muted/10" />
                            </div>
                        </div>
                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs text-muted-foreground">Data Fim</Label>
                            <div className="relative">
                                <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="pl-9 bg-muted/10" />
                            </div>
                        </div>
                        <Button onClick={fetchData} disabled={loading} className="bg-primary hover:bg-primary/90 text-white min-w-[120px]">
                            {loading ? "Carregando..." : "Filtrar"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. KPIS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-primary text-primary-foreground border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-2xl font-bold tracking-tight">R$ {totalVendido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-primary-foreground/80 text-xs font-medium mt-1 uppercase">Total Vendido</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-500 text-white border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-2xl font-bold tracking-tight">R$ {totalLoja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-emerald-100 text-xs font-medium mt-1 uppercase">Total Valor Loja</p>
                    </CardContent>
                </Card>
                <Card className="bg-purple-600 text-white border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-2xl font-bold tracking-tight">R$ {totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-purple-100 text-xs font-medium mt-1 uppercase">Total Repasse/Custo</p>
                    </CardContent>
                </Card>
                <Card className="bg-orange-500 text-white border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-2xl font-bold tracking-tight">{margemMedia.toFixed(1)}%</h3>
                        <p className="text-orange-100 text-xs font-medium mt-1 uppercase">Margem Média %</p>
                    </CardContent>
                </Card>
                <Card className="bg-cyan-600 text-white border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-2xl font-bold tracking-tight">{totalQtd}</h3>
                        <p className="text-cyan-100 text-xs font-medium mt-1 uppercase">Peças Vendidas</p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-400 text-white border-none shadow-md">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <h3 className="text-2xl font-bold tracking-tight">R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                        <p className="text-amber-100 text-xs font-medium mt-1 uppercase">Ticket Médio</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- 3. CONTEÚDO DAS ABAS --- */}
            <Tabs defaultValue="resumo" className="w-full" onValueChange={setActiveTab}>

                {/* Cabeçalho das Abas + Botões de Ação */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                    <TabsList className="grid w-full md:w-[400px] grid-cols-2 bg-muted/20">
                        <TabsTrigger value="resumo" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                            <Grid className="w-4 h-4 mr-2" /> Resumo por Fornecedor
                        </TabsTrigger>
                        <TabsTrigger value="categoria" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                            <Tags className="w-4 h-4 mr-2" /> Por Categoria
                        </TabsTrigger>
                        <TabsTrigger value="detalhado" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                            <List className="w-4 h-4 mr-2" /> Detalhado por Peça
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex gap-2 w-full md:w-auto">
                        <Button className="flex-1 md:flex-none gap-2 bg-green-600 hover:bg-green-700 text-white border-none h-9 text-xs">
                            <FileSpreadsheet className="h-3 w-3" /> Excel
                        </Button>
                        <Button className="flex-1 md:flex-none gap-2 bg-red-600 hover:bg-red-700 text-white border-none h-9 text-xs">
                            <FileText className="h-3 w-3" /> PDF
                        </Button>
                    </div>
                </div>

                {/* --- CONTEÚDO: RESUMO POR FORNECEDOR --- */}
                <TabsContent value="resumo" className="mt-0">
                    <Card className="shadow-md border-primary/20 overflow-hidden">
                        <div className="bg-purple-100/50 px-4 py-3 flex justify-between items-center border-b border-primary/10">
                            <h3 className="text-primary font-bold text-sm">Análise por Fornecedor</h3>
                        </div>
                        <div className="max-h-[500px] overflow-auto">
                            <Table>
                                <TableHeader className="bg-primary text-white sticky top-0 z-10">
                                    <TableRow className="hover:bg-primary">
                                        <TableHead className="text-white font-bold w-[30%]">Fornecedor</TableHead>
                                        <TableHead className="text-white font-bold text-center text-xs">Qtd Vendas</TableHead>
                                        <TableHead className="text-white font-bold text-right text-xs">Valor Vendido</TableHead>
                                        <TableHead className="text-white font-bold text-right text-xs">Valor Loja</TableHead>
                                        <TableHead className="text-white font-bold text-right text-xs">Repasse/Custo</TableHead>
                                        <TableHead className="text-white font-bold text-center text-xs">Margem %</TableHead>
                                        <TableHead className="text-white font-bold text-right text-xs">Ticket Médio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {fornecedoresData.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-purple-50/50 text-xs border-b border-muted/50 odd:bg-white even:bg-slate-50">
                                            <TableCell className="font-medium uppercase py-2.5 text-slate-700">{item.nome}</TableCell>
                                            <TableCell className="text-center py-2.5 text-slate-600">{item.qtd}</TableCell>
                                            <TableCell className="text-right py-2.5 font-semibold text-slate-700">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-right py-2.5 text-emerald-600 font-medium">R$ {item.loja.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-right py-2.5 text-slate-600">R$ {item.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-center py-2.5 text-slate-600">{item.margem.toFixed(1)}%</TableCell>
                                            <TableCell className="text-right py-2.5 text-slate-600">R$ {item.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                {/* --- CONTEÚDO: RESUMO POR CATEGORIA (NOVO) --- */}
                <TabsContent value="categoria" className="mt-0">
                    <Card className="shadow-md border-primary/20 overflow-hidden">
                        <div className="bg-purple-100/50 px-4 py-3 flex justify-between items-center border-b border-primary/10">
                            <h3 className="text-primary font-bold text-sm">Análise por Categoria</h3>
                        </div>
                        <div className="max-h-[500px] overflow-auto">
                            <Table>
                                <TableHeader className="bg-primary text-white sticky top-0 z-10">
                                    <TableRow className="hover:bg-primary">
                                        <TableHead className="text-white font-bold w-[30%]">Categoria</TableHead>
                                        <TableHead className="text-white font-bold text-center text-xs">Qtd Vendas</TableHead>
                                        <TableHead className="text-white font-bold text-right text-xs">Valor Vendido</TableHead>
                                        <TableHead className="text-white font-bold text-right text-xs">Ticket Médio</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categoriasData.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-purple-50/50 text-xs border-b border-muted/50 odd:bg-white even:bg-slate-50">
                                            <TableCell className="font-medium uppercase py-2.5 text-slate-700">{item.name}</TableCell>
                                            <TableCell className="text-center py-2.5 text-slate-600">{item.qtd}</TableCell>
                                            <TableCell className="text-right py-2.5 font-semibold text-slate-700">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                            <TableCell className="text-right py-2.5 text-slate-600">R$ {item.ticket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>

                {/* --- CONTEÚDO: DETALHADO POR PEÇA --- */}
                <TabsContent value="detalhado" className="mt-0">
                    <Card className="shadow-md border-primary/20 overflow-hidden">

                        {/* Header da Tabela com Busca e Paginação */}
                        <div className="bg-white px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-3 border-b border-gray-100">
                            <h3 className="text-primary font-bold text-sm hidden md:block">Peças Vendidas no Período</h3>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative flex-1 md:w-[350px]">
                                    <Input
                                        placeholder="Pesquisar por Id, descrição, fornecedor..."
                                        className="h-9 text-xs pl-3 pr-9 border-gray-300"
                                    />
                                    <Button size="icon" className="absolute right-0 top-0 h-9 w-9 rounded-l-none bg-orange-100 hover:bg-orange-200 text-orange-600 border border-l-0 border-orange-200">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground hidden sm:inline-block">Exibindo {pecasData.length} registros</span>
                            </div>
                        </div>

                        {/* Tabela Detalhada (Scroll Horizontal) */}
                        <div className="overflow-x-auto">
                            <Table className="w-full min-w-[1800px]">
                                <TableHeader className="bg-primary text-white">
                                    <TableRow className="hover:bg-primary">
                                        <TableHead className="text-white font-bold text-[10px] w-[60px]">Id</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[50px]">Id Alt</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[200px]">Descrição</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[150px]">Fornecedor</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[150px]">Cliente</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[100px]">Categoria</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[100px]">Marca</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[60px]">Cor</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] w-[60px]">Tam.</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-center w-[50px]">Tipo</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-right w-[80px]">Preço Vendido</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-right w-[80px]">Taxa Pagto</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-right w-[80px]">Impostos</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-right w-[80px]">Repasse/Custo</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-right w-[80px]">Valor Loja</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-center w-[60px]">Margem %</TableHead>
                                        <TableHead className="text-white font-bold text-[10px] text-center w-[80px]">Data Venda</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pecasData.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-primary/5 text-[10px] border-b border-gray-100 odd:bg-white even:bg-slate-50">
                                            <TableCell className="py-2 font-mono text-purple-700">{item.id}</TableCell>
                                            <TableCell className="py-2 text-center text-gray-400">{item.idAlt}</TableCell>
                                            <TableCell className="py-2 font-medium text-slate-700 uppercase">{item.desc}</TableCell>
                                            <TableCell className="py-2 text-slate-600 uppercase truncate max-w-[150px]" title={item.fornecedor}>{item.fornecedor}</TableCell>
                                            <TableCell className="py-2 text-slate-600 uppercase truncate max-w-[150px]" title={item.cliente}>{item.cliente}</TableCell>
                                            <TableCell className="py-2 text-slate-600 uppercase">{item.cat}</TableCell>
                                            <TableCell className="py-2 text-slate-600 uppercase">{item.marca}</TableCell>
                                            <TableCell className="py-2 text-slate-500">{item.cor}</TableCell>
                                            <TableCell className="py-2 text-center font-bold text-slate-700">{item.tam}</TableCell>
                                            <TableCell className="py-2 text-center">
                                                <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mx-auto cursor-pointer hover:bg-primary/90">
                                                    <Share2 className="w-2.5 h-2.5" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-2 text-right font-medium text-slate-800">R$ {item.preco.toFixed(2)}</TableCell>
                                            <TableCell className="py-2 text-right text-slate-500">R$ {item.taxa.toFixed(2)}</TableCell>
                                            <TableCell className="py-2 text-right text-slate-500">R$ {item.imposto.toFixed(2)}</TableCell>
                                            <TableCell className="py-2 text-right text-slate-600">R$ {item.repasse.toFixed(2)}</TableCell>
                                            <TableCell className="py-2 text-right font-medium text-emerald-600">R$ {item.loja.toFixed(2)}</TableCell>
                                            <TableCell className="py-2 text-center text-slate-600">{item.margem.toFixed(1)}%</TableCell>
                                            <TableCell className="py-2 text-center text-slate-500">{item.data}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

        </div>
    );
}