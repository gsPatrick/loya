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

            // Generate printable content
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Etiquetas - Impressão</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body { font-family: Arial, sans-serif; }
                        .etiqueta {
                            width: 5cm;
                            height: 3cm;
                            border: 1px solid #000;
                            padding: 4mm;
                            margin: 2mm;
                            display: inline-block;
                            vertical-align: top;
                            page-break-inside: avoid;
                        }
                        .codigo { font-size: 14pt; font-weight: bold; text-align: center; margin-bottom: 2mm; }
                        .descricao { font-size: 8pt; text-align: center; margin-bottom: 2mm; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                        .preco { font-size: 16pt; font-weight: bold; text-align: center; }
                        .tamanho { font-size: 10pt; text-align: center; margin-top: 1mm; }
                        @media print {
                            body { margin: 0; }
                            .etiqueta { border: 1px solid #000; }
                        }
                    </style>
                </head>
                <body>
                    ${selectedItems.map(item => `
                        <div class="etiqueta">
                            <div class="codigo">${item.codigo_etiqueta || 'S/C'}</div>
                            <div class="descricao">${item.descricao_curta || '-'}</div>
                            <div class="preco">R$ ${parseFloat(item.preco_venda || 0).toFixed(2)}</div>
                            <div class="tamanho">${item.tamanho?.nome || item.tamanhoId || '-'}</div>
                        </div>
                    `).join('')}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
            }, 250);

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
