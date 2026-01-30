"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Printer, Check, X, RefreshCw, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function ImprimirEtiquetasPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    // Filters State
    const [filterFornecedor, setFilterFornecedor] = useState("");
    const [filterTamanho, setFilterTamanho] = useState("");
    const [filterMarca, setFilterMarca] = useState("");
    const [filterCategoria, setFilterCategoria] = useState("");
    const [filterTipoAquisicao, setFilterTipoAquisicao] = useState("TODOS");

    // Data Lists
    const [tamanhos, setTamanhos] = useState([]);
    const [cores, setCores] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const ITEMS_PER_PAGE = 20;

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Load filter data
    useEffect(() => {
        loadDropdownData();
    }, []);

    // Load items
    useEffect(() => {
        loadItems();
    }, [currentPage, debouncedSearch, filterFornecedor, filterTamanho, filterMarca, filterCategoria, filterTipoAquisicao]);

    const loadDropdownData = async () => {
        try {
            const [tamRes, corRes, marcaRes, catRes, fornRes] = await Promise.all([
                api.get('/cadastros/tamanhos'),
                api.get('/cadastros/cores'),
                api.get('/cadastros/marcas'),
                api.get('/cadastros/categorias'),
                api.get('/pessoas?is_fornecedor=true&simple=true')
            ]);
            setTamanhos(tamRes.data);
            setCores(corRes.data);
            setMarcas(marcaRes.data);
            setCategorias(catRes.data);
            setFornecedores(fornRes.data);
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao carregar filtros.", variant: "destructive" });
        }
    };

    const loadItems = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage,
                limit: ITEMS_PER_PAGE
            });
            if (debouncedSearch) {
                params.append('search', debouncedSearch);
            }
            if (filterFornecedor) params.append('fornecedorId', filterFornecedor);
            if (filterTamanho) params.append('tamanhoId', filterTamanho);
            if (filterMarca) params.append('marcaId', filterMarca);
            if (filterCategoria) params.append('categoriaId', filterCategoria);
            if (filterTipoAquisicao && filterTipoAquisicao !== 'TODOS') params.append('tipo_aquisicao', filterTipoAquisicao);

            const res = await api.get(`/catalogo/pecas?${params.toString()}`);
            if (res.data.data) {
                setItems(res.data.data);
                setTotalPages(res.data.totalPages || 1);
                setTotalItems(res.data.total || 0);
            } else {
                setItems(res.data);
                setTotalPages(1);
                setTotalItems(res.data.length);
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao carregar peças.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === items.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(items.map(i => i.id));
        }
    };

    const handlePrint = async () => {
        if (selectedIds.length === 0) {
            toast({ title: "Atenção", description: "Selecione pelo menos uma peça.", variant: "destructive" });
            return;
        }

        setIsPrinting(true);
        try {
            // Fetch label config from backend
            let labelConfig = {
                LABEL_STORE_NAME: 'GARIMPONOS',
                LABEL_BG_COLOR: '#1a1a1a',
                LABEL_TEXT_COLOR: '#ffffff',
                LABEL_WIDTH: '34',
                LABEL_HEIGHT: '62',
                LABEL_MARGIN_TOP: '0',
                LABEL_MARGIN_BOTTOM: '0',
                LABEL_MARGIN_LEFT: '0',
                LABEL_MARGIN_RIGHT: '0',
                LABEL_FONT_SIZE_LOGO: '11',
                LABEL_FONT_SIZE_PRICE: '10',
                LABEL_FONT_SIZE_TEXT: '5',
                LABEL_BARCODE_HEIGHT: '28',
                LABEL_BARCODE_WIDTH: '1.2',
                LABEL_LOGO_OFFSET_Y: '0',
                LABEL_BARCODE_OFFSET_Y: '0',
                LABEL_PRICE_OFFSET_Y: '0',
                LABEL_CODE_OFFSET_Y: '0',
                LABEL_HORIZONTAL_GAP: '0', // Ajuste para 0 se as etiquetas forem coladas (35mm já inclui o passo)
            };
            try {
                const configRes = await api.get('/admin/configuracoes');
                configRes.data.forEach(c => {
                    if (labelConfig.hasOwnProperty(c.chave)) {
                        labelConfig[c.chave] = c.valor;
                    }
                });
            } catch (e) {
                console.warn('Could not fetch label config, using defaults');
            }

            // Get selected items data
            const selectedItems = items.filter(i => selectedIds.includes(i.id));

            // Generate printable content with dynamic config
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Etiquetas - Impressão</title>
                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: Arial, sans-serif; 
                            background: #f5f5f5;
                            padding: 0;
                            margin: 0;
                        }
                        .etiquetas-container {
                            display: grid;
                            grid-template-columns: repeat(3, max-content); /* Força 3 colunas */
                            column-gap: ${labelConfig.LABEL_HORIZONTAL_GAP}mm;
                            row-gap: 0;
                            justify-content: center; /* Centralizar no papel */
                            width: 100%;
                            padding-left: 0; /* Removido padding extra */
                            margin: 0;
                        }
                        .etiqueta {
                            width: ${labelConfig.LABEL_WIDTH}mm;
                            height: ${labelConfig.LABEL_HEIGHT}mm;
                            background: ${labelConfig.LABEL_BG_COLOR};
                            color: ${labelConfig.LABEL_TEXT_COLOR};
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: space-between;
                            padding-top: ${labelConfig.LABEL_MARGIN_TOP}mm;
                            padding-bottom: ${labelConfig.LABEL_MARGIN_BOTTOM}mm;
                            padding-left: ${labelConfig.LABEL_MARGIN_LEFT}mm;
                            padding-right: ${labelConfig.LABEL_MARGIN_RIGHT}mm;
                            position: relative;
                            page-break-inside: avoid;
                            overflow: hidden;
                        }
                        .etiqueta::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 5mm;
                            height: 2.5mm;
                            background: #fff; /* Fundo branco para simular o furo se precisar, ou transparente */
                            border-radius: 0 0 2.5mm 2.5mm;
                            /* Se a etiqueta for preta, o furo visual ajuda, mas na impressao real o papel já tem furo */
                            visibility: hidden;
                        }
                        /* ... estilos internos ... */
                        .logo-area {
                            margin-top: calc(1mm + ${labelConfig.LABEL_LOGO_OFFSET_Y}mm);
                            text-align: center;
                            line-height: 1;
                            width: 100%;
                        }
                        .logo {
                            font-family: 'Dancing Script', cursive;
                            font-size: ${labelConfig.LABEL_FONT_SIZE_LOGO}pt;
                            font-weight: 700;
                            color: white;
                            letter-spacing: 0.5px;
                            white-space: nowrap;
                        }
                        .subtitulo {
                            display: none;
                        }
                        .barcode-area {
                            background: white;
                            padding: 1.5mm 1mm;
                            border-radius: 1mm;
                            margin-top: calc(1.5mm + ${labelConfig.LABEL_BARCODE_OFFSET_Y}mm);
                            margin-bottom: 1.5mm;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            width: 95%; 
                        }
                        .barcode-area svg {
                            display: block;
                            max-width: 100%;
                        }
                        .codigo-text {
                            font-size: ${labelConfig.LABEL_FONT_SIZE_TEXT}pt;
                            color: white;
                            text-align: center;
                            margin-top: ${labelConfig.LABEL_CODE_OFFSET_Y}mm;
                            font-family: monospace;
                        }
                        .preco-area {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;
                            padding: 0;
                            margin-top: auto;
                            transform: translateY(${labelConfig.LABEL_PRICE_OFFSET_Y}mm);
                        }
                        .preco {
                            font-size: ${labelConfig.LABEL_FONT_SIZE_PRICE}pt;
                            font-weight: bold;
                            color: white;
                        }
                        .tamanho {
                            font-size: ${labelConfig.LABEL_FONT_SIZE_PRICE}pt;
                            font-weight: bold;
                            color: white;
                        }
                        .codigo-inferior {
                            font-size: ${Math.max(4, parseFloat(labelConfig.LABEL_FONT_SIZE_TEXT) - 1)}pt;
                            color: rgba(255,255,255,0.6);
                            text-align: center;
                            margin-top: 0.5mm;
                            font-family: monospace;
                        }
                        @media print {
                            @page {
                                margin: 0; /* Remove margens da impressora */
                                size: 105mm 62mm; /* Tamanho exato do papel (3x35mm width) */
                            }
                            html, body { 
                                background: white; 
                                padding: 0 !important;
                                margin: 0 !important;
                                width: 100%;
                                height: 100%;
                            }
                            .etiquetas-container {
                                /* Ajuste fino para print */
                                width: 100%;
                                margin: 0 !important;
                                padding: 0 !important;
                            }
                            .etiqueta {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                                background: ${labelConfig.LABEL_BG_COLOR} !important;
                                color: ${labelConfig.LABEL_TEXT_COLOR} !important;
                            }
                            .etiqueta::before {
                                background: white !important;
                            }
                            .logo, .preco, .tamanho, .codigo-text {
                                color: ${labelConfig.LABEL_TEXT_COLOR} !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="etiquetas-container">
                        ${selectedItems.map((item, idx) => {
                const codigo = item.codigo_etiqueta || 'TAG-' + String(item.id).padStart(4, '0');
                const codigoCompleto = String(item.id).padStart(8, '0') + ' 01.' + String(Math.floor(Math.random() * 90000000) + 10000000);
                const codigoInferior = '19.' + String(Math.floor(Math.random() * 90000000) + 10000000) + 'B';
                return `
                                <div class="etiqueta">
                                    <div class="logo-area">
                                        <div class="logo">${labelConfig.LABEL_STORE_NAME}</div>
                                    </div>
                                    <div class="barcode-area">
                                        <svg id="barcode-${idx}"></svg>
                                    </div>
                                    <div class="codigo-text">${codigoCompleto}</div>
                                    <div class="preco-area">
                                        <div class="preco">R$ ${parseFloat(item.preco_venda || 0).toFixed(2).replace('.', ',')}</div>
                                        <div class="tamanho">${item.tamanho?.nome || 'U'}</div>
                                    </div>
                                    <div class="codigo-inferior">${codigoInferior}</div>
                                </div>
                            `;
            }).join('')}
                    </div>
                    <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            ${selectedItems.map((item, idx) => {
                const codigo = item.codigo_etiqueta || 'TAG-' + String(item.id).padStart(4, '0');
                return `
                                    JsBarcode("#barcode-${idx}", "${codigo}", {
                                        format: "CODE128",
                                        width: ${labelConfig.LABEL_BARCODE_WIDTH},
                                        height: ${labelConfig.LABEL_BARCODE_HEIGHT},
                                        displayValue: false,
                                        margin: 2
                                    });
                                `;
            }).join('')}
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        });
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();

            toast({ title: "Sucesso", description: `${selectedIds.length} etiqueta(s) enviadas para impressão.`, className: "bg-green-600 text-white border-none" });
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Erro ao gerar etiquetas.", variant: "destructive" });
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                    <Printer className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Imprimir Etiquetas</h1>
                </div>
                <Button
                    onClick={handlePrint}
                    disabled={selectedIds.length === 0 || isPrinting}
                    className="bg-primary hover:bg-primary/90"
                >
                    {isPrinting ? (
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Printer className="mr-2 h-4 w-4" />
                    )}
                    Imprimir Selecionadas ({selectedIds.length})
                </Button>
            </div>

            <Card className="border-t-4 border-t-primary shadow-sm">
                <div className="p-4 bg-white border-b space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 space-y-1 w-full relative">
                            <Label className="text-xs text-gray-500">Busca Rápida</Label>
                            <Input
                                placeholder="Buscar por código ou descrição..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                            <Search className="absolute left-3 bottom-2.5 h-4 w-4 text-gray-400" />
                        </div>
                        <div className="hidden md:flex items-center gap-2 pb-1">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                                {isLoading ? "Carregando..." : `${totalItems} peças • ${selectedIds.length} selecionada(s)`}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Fornecedor</Label>
                            <SearchableSelect
                                options={fornecedores}
                                value={filterFornecedor}
                                onValueChange={setFilterFornecedor}
                                placeholder="Todos"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Tamanho</Label>
                            <SearchableSelect
                                options={tamanhos}
                                value={filterTamanho}
                                onValueChange={setFilterTamanho}
                                placeholder="Todos"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Marca</Label>
                            <SearchableSelect
                                options={marcas}
                                value={filterMarca}
                                onValueChange={setFilterMarca}
                                placeholder="Todas"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Categoria</Label>
                            <SearchableSelect
                                options={categorias}
                                value={filterCategoria}
                                onValueChange={setFilterCategoria}
                                placeholder="Todas"
                                searchPlaceholder="Buscar..."
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Aquisição</Label>
                            <Select value={filterTipoAquisicao} onValueChange={setFilterTipoAquisicao}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TODOS">Todas</SelectItem>
                                    <SelectItem value="COMPRA">Compra</SelectItem>
                                    <SelectItem value="CONSIGNACAO">Consignação</SelectItem>
                                    <SelectItem value="DOACAO">Doação</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex-1 md:hidden text-sm text-gray-500">
                            {isLoading ? "Filtrando..." : `${totalItems} itens`}
                        </div>
                        {(filterFornecedor || filterTamanho || filterMarca || filterCategoria || filterTipoAquisicao !== 'TODOS') && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilterFornecedor("");
                                    setFilterTamanho("");
                                    setFilterMarca("");
                                    setFilterCategoria("");
                                    setFilterTipoAquisicao("TODOS");
                                    setSearchTerm("");
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                            >
                                <X className="h-4 w-4 mr-1" /> Limpar Filtros
                            </Button>
                        )}
                    </div>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={items.length > 0 && selectedIds.length === items.length}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead>Código</TableHead>
                                <TableHead>Descrição</TableHead>
                                <TableHead>Tamanho</TableHead>
                                <TableHead>Cor</TableHead>
                                <TableHead className="text-right">Preço</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow
                                    key={item.id}
                                    className={`cursor-pointer transition-colors ${selectedIds.includes(item.id) ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
                                    onClick={() => toggleSelect(item.id)}
                                >
                                    <TableCell onClick={e => e.stopPropagation()}>
                                        <Checkbox
                                            checked={selectedIds.includes(item.id)}
                                            onCheckedChange={() => toggleSelect(item.id)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono">
                                            {item.codigo_etiqueta || String(item.id).padStart(6, '0')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">{item.descricao_curta}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{item.tamanho?.nome || '-'}</Badge>
                                    </TableCell>
                                    <TableCell>{item.cor?.nome || '-'}</TableCell>
                                    <TableCell className="text-right font-bold text-primary">
                                        R$ {parseFloat(item.preco_venda || 0).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Nenhuma peça encontrada
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="p-4 border-t flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                            Página {currentPage} de {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1 || isLoading}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= totalPages || isLoading}
                                onClick={() => setCurrentPage(p => p + 1)}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
