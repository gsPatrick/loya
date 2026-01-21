"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Printer, Check, X, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function ImprimirEtiquetasPage() {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");
    const [items, setItems] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

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

    // Load items
    useEffect(() => {
        loadItems();
    }, [currentPage, debouncedSearch]);

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
            // Get selected items data
            const selectedItems = items.filter(i => selectedIds.includes(i.id));

            // Generate printable content with design matching reference image
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Etiquetas - Impressão</title>
                    <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { 
                            font-family: Arial, sans-serif; 
                            background: #f5f5f5;
                            padding: 10px;
                        }
                        .etiquetas-container {
                            display: flex;
                            flex-wrap: wrap;
                            gap: 4mm;
                            justify-content: flex-start;
                        }
                        .etiqueta {
                            width: 40mm;
                            height: 70mm;
                            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
                            background-image: 
                                linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%),
                                linear-gradient(225deg, rgba(255,255,255,0.03) 0%, transparent 50%),
                                linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
                            color: white;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: space-between;
                            padding: 3mm 2mm;
                            position: relative;
                            page-break-inside: avoid;
                        }
                        .etiqueta::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 50%;
                            transform: translateX(-50%);
                            width: 8mm;
                            height: 4mm;
                            background: #f5f5f5;
                            border-radius: 0 0 4mm 4mm;
                        }
                        .logo-area {
                            margin-top: 4mm;
                            text-align: center;
                        }
                        .logo {
                            font-family: 'Dancing Script', cursive;
                            font-size: 18pt;
                            font-weight: 700;
                            color: white;
                            letter-spacing: 1px;
                        }
                        .subtitulo {
                            font-family: 'Dancing Script', cursive;
                            font-size: 10pt;
                            color: rgba(255,255,255,0.7);
                            margin-top: 1mm;
                        }
                        .barcode-area {
                            background: white;
                            padding: 2mm;
                            border-radius: 1mm;
                            margin: 2mm 0;
                        }
                        .barcode-area svg {
                            display: block;
                        }
                        .codigo-text {
                            font-size: 7pt;
                            color: white;
                            text-align: center;
                            margin-top: 1mm;
                            font-family: monospace;
                        }
                        .preco-area {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            width: 100%;
                            padding: 0 2mm;
                            margin-top: 2mm;
                        }
                        .preco {
                            font-size: 14pt;
                            font-weight: bold;
                            color: white;
                        }
                        .tamanho {
                            font-size: 14pt;
                            font-weight: bold;
                            color: white;
                        }
                        .codigo-inferior {
                            font-size: 6pt;
                            color: rgba(255,255,255,0.6);
                            text-align: center;
                            margin-top: 1mm;
                            font-family: monospace;
                        }
                        @media print {
                            body { 
                                background: white; 
                                padding: 0;
                                margin: 0;
                            }
                            .etiqueta::before {
                                background: white;
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
                                        <div class="logo">Nós</div>
                                        <div class="subtitulo">Garimpos</div>
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
                                        width: 1.5,
                                        height: 30,
                                        displayValue: false,
                                        margin: 0
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
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por código ou descrição..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="max-w-md"
                            />
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {isLoading ? "Carregando..." : `${totalItems} peças • ${selectedIds.length} selecionada(s)`}
                        </span>
                    </div>
                </CardHeader>
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
