// src/app/dashboard/consultas/grade/page.js
"use client";

import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    Grid3X3,
    Shirt,
    Ruler,
    PackageSearch,
    Info,
    ArrowDown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export default function GradeEstoquePage() {
    const { toast } = useToast();
    const [selectedCell, setSelectedCell] = useState(null);
    const [matrixData, setMatrixData] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [fornecedorId, setFornecedorId] = useState("todos");
    const [marcaId, setMarcaId] = useState("todas");
    const [precoMin, setPrecoMin] = useState("");
    const [precoMax, setPrecoMax] = useState("");

    // Dropdown Data
    const [suppliers, setSuppliers] = useState([]);
    const [brands, setBrands] = useState([]); // Assuming we can fetch brands or just mock for now if no endpoint

    useEffect(() => {
        loadInitialData();
        fetchGrade();
    }, []);

    const loadInitialData = async () => {
        try {
            const supRes = await api.get('/pessoas?is_fornecedor=true');
            setSuppliers(supRes.data);
            const brandRes = await api.get('/catalogo/marcas');
            setBrands(brandRes.data);
        } catch (error) {
            console.error("Error loading filters", error);
        }
    };

    const fetchGrade = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (fornecedorId !== "todos") params.append("fornecedorId", fornecedorId);
            if (marcaId !== "todas") params.append("marcaId", marcaId);
            if (precoMin) params.append("precoMin", precoMin);
            if (precoMax) params.append("precoMax", precoMax);

            const { data } = await api.get(`/relatorios/grade-estoque?${params.toString()}`);
            setMatrixData(data.matrix);
            setSizes(data.sizes);
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Erro ao carregar grade.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // --- MOCK DATA: Detalhes (Aparece ao clicar) ---
    // TODO: Implement API for details if needed, or use existing getPecas
    const detailsData = [
        { id: "001020", desc: "VESTIDO LONGO FLORAL", fornecedor: "MARIA SILVA", marca: "FARM", cor: "Estampado", comissao: "50%", preco: 159.90, entrada: "20/11/2025" },
        { id: "001021", desc: "VESTIDO CURTO LINHO", fornecedor: "JOANA DARC", marca: "ZARA", cor: "Bege", comissao: "50%", preco: 89.90, entrada: "18/11/2025" },
        { id: "001022", desc: "VESTIDO FESTA PAETÊ", fornecedor: "ANA CLARA", marca: "ANIMALE", cor: "Preto", comissao: "40%", preco: 299.00, entrada: "15/11/2025" },
    ];

    // Lógica de Cor do Heatmap (Baseado no tema Primary)
    const getCellClass = (val) => {
        if (val === 0) return "bg-muted/30 text-muted-foreground hover:bg-muted/50";
        if (val <= 5) return "bg-primary/10 text-primary font-medium hover:bg-primary/20";
        if (val <= 20) return "bg-primary/30 text-primary font-semibold hover:bg-primary/40";
        if (val <= 50) return "bg-primary/60 text-primary-foreground font-bold hover:bg-primary/70";
        return "bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90";
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">

            {/* Cabeçalho */}
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Matriz de Estoque (Grade)</h1>
                <p className="text-sm text-muted-foreground">
                    Análise cruzada de Categorias x Tamanhos para identificar furos ou excessos de estoque.
                </p>
            </div>

            {/* --- 1. FILTROS --- */}
            <Card className="shadow-sm border-primary/10 bg-card">
                <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase text-muted-foreground">
                        <Filter className="h-4 w-4" /> Filtros de Grade
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid gap-1.5 flex-[2]">
                            <Label className="text-xs">Fornecedor</Label>
                            <Select value={fornecedorId} onValueChange={setFornecedorId}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os Fornecedores</SelectItem>
                                    {suppliers.map(s => (
                                        <SelectItem key={s.id} value={String(s.id)}>{s.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5 flex-[1.5]">
                            <Label className="text-xs">Marca</Label>
                            <Select value={marcaId} onValueChange={setMarcaId}>
                                <SelectTrigger className="h-9"><SelectValue placeholder="Todas" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todas">Todas as Marcas</SelectItem>
                                    {brands.map(brand => (
                                        <SelectItem key={brand.id} value={String(brand.id)}>{brand.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs">Preço Min</Label>
                            <Input
                                type="number"
                                placeholder="0,00"
                                className="h-9"
                                value={precoMin}
                                onChange={e => setPrecoMin(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-1.5 flex-1">
                            <Label className="text-xs">Preço Máx</Label>
                            <Input
                                type="number"
                                placeholder="999,99"
                                className="h-9"
                                value={precoMax}
                                onChange={e => setPrecoMax(e.target.value)}
                            />
                        </div>

                        <Button onClick={fetchGrade} className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground min-w-[100px]">
                            {loading ? "..." : "FILTRAR"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* --- 2. ÁREA DA MATRIZ (HEATMAP) --- */}
            <Card className="shadow-md border-primary/20 overflow-hidden">
                <div className="bg-muted/10 p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">

                    {/* Legenda Visual */}
                    <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold text-muted-foreground">Legenda:</span>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-muted/30 border"></div> <span>Vazio</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary/10"></div> <span>1-5</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary/30"></div> <span>6-20</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary/60"></div> <span>21-50</span></div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-primary"></div> <span>50+</span></div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground bg-yellow-50 text-yellow-700 px-2 py-1 rounded border border-yellow-100 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            <span>Considera: NOVA, A VENDA e EM AUTORIZAÇÃO</span>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 gap-2 text-primary border-primary/20 hover:bg-primary/5">
                            <Download className="h-3 w-3" /> Exportar
                        </Button>
                    </div>
                </div>

                {/* WRAPPER COM SCROLL HORIZONTAL */}
                <div className="relative w-full overflow-x-auto pb-2">
                    <Table className="min-w-max border-collapse">
                        <TableHeader>
                            <TableRow className="bg-background hover:bg-background">
                                {/* Coluna Fixa (Sticky) */}
                                <TableHead className="w-[150px] sticky left-0 z-20 bg-background shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] font-bold text-primary">
                                    <div className="flex items-center gap-2">
                                        <Grid3X3 className="h-4 w-4" /> CATEGORIA
                                    </div>
                                </TableHead>
                                {/* Colunas de Tamanhos */}
                                {sizes.map(size => (
                                    <TableHead key={size} className="w-[60px] text-center font-bold text-muted-foreground bg-muted/5">
                                        {size}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {matrixData.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className="group">
                                    {/* Célula Fixa da Linha (Categoria) */}
                                    <TableCell className="font-medium text-xs sticky left-0 z-10 bg-background group-hover:bg-muted/10 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.1)] border-r">
                                        {row.category}
                                    </TableCell>

                                    {/* Células de Valores */}
                                    {row.values.map((val, colIndex) => (
                                        <TableCell key={colIndex} className="p-1 text-center">
                                            <div
                                                onClick={() => setSelectedCell({ category: row.category, size: sizes[colIndex], val })}
                                                className={`
                                                    h-9 w-full min-w-[40px] rounded-md flex items-center justify-center text-xs transition-all cursor-pointer
                                                    ${getCellClass(val)}
                                                    ${selectedCell?.category === row.category && selectedCell?.size === sizes[colIndex] ? 'ring-2 ring-purple-500 ring-offset-2 scale-110 z-10' : ''}
                                                `}
                                            >
                                                {val}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* --- 3. DETALHES DA SELEÇÃO (Aparece ao clicar na matriz) --- */}
            <div className="relative">
                {selectedCell ? (
                    <Card className="animate-in slide-in-from-top-4 fade-in duration-300 border-l-4 border-l-primary shadow-lg">
                        <CardHeader className="bg-muted/10 pb-3">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-base text-primary flex items-center gap-2">
                                        <PackageSearch className="h-5 w-5" />
                                        Peças Selecionadas
                                    </CardTitle>
                                    <CardDescription>
                                        Exibindo itens da categoria <strong className="text-foreground">{selectedCell.category}</strong> tamanho <strong className="text-foreground">{selectedCell.size}</strong> ({selectedCell.val} itens)
                                    </CardDescription>
                                </div>
                                <div className="w-[250px] relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Buscar na seleção..." className="pl-9 h-9 bg-background" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/20">
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Fornecedora</TableHead>
                                        <TableHead>Marca</TableHead>
                                        <TableHead>Cor</TableHead>
                                        <TableHead className="text-center">Comissão</TableHead>
                                        <TableHead className="text-right">Preço</TableHead>
                                        <TableHead className="text-right">Entrada</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {detailsData.map((item, idx) => (
                                        <TableRow key={idx} className="hover:bg-muted/10">
                                            <TableCell className="font-mono text-xs text-muted-foreground">{item.id}</TableCell>
                                            <TableCell className="font-medium text-xs uppercase">{item.desc}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground truncate">{item.fornecedor}</TableCell>
                                            <TableCell className="text-xs">{item.marca}</TableCell>
                                            <TableCell className="text-xs">{item.cor}</TableCell>
                                            <TableCell className="text-center text-xs">{item.comissao}</TableCell>
                                            <TableCell className="text-right text-xs font-bold text-primary">R$ {item.preco.toFixed(2)}</TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">{item.entrada}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="p-4 border-t bg-muted/5 flex justify-center">
                                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                                    Ver todos os registros dessa seleção
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/5 text-muted-foreground">
                        <PackageSearch className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium">Nenhuma célula selecionada</h3>
                        <p className="text-sm">Clique em um número na matriz acima para ver a lista detalhada das peças.</p>
                        <ArrowDown className="h-6 w-6 mt-4 animate-bounce opacity-30" />
                    </div>
                )}
            </div>

        </div>
    );
}