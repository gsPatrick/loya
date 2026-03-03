"use client";

import { useState } from "react";
import { ClipboardCheck, Play, Save, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function AuditoriaPage() {
    const { toast } = useToast();
    const [inputCodes, setInputCodes] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleAudit = async () => {
        if (!inputCodes.trim()) {
            toast({ title: "Atenção", description: "Insira os códigos para auditar.", variant: "warning" });
            return;
        }

        const codigos = inputCodes.split('\n').map(c => c.trim()).filter(c => c);

        setLoading(true);
        try {
            const { data } = await api.post('/estoque/auditoria', { codigos });
            setResult(data);
            toast({ title: "Sucesso", description: "Auditoria processada." });
        } catch (error) {
            console.error(error);
            toast({ title: "Erro", description: "Falha ao processar auditoria.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6" /> Auditoria de Estoque
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Coluna Esquerda: Input */}
                <Card className="lg:col-span-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Leitura de Códigos</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                        <Textarea
                            placeholder="Bipe ou cole os códigos de etiqueta aqui (um por linha)..."
                            className="flex-1 resize-none font-mono text-sm"
                            value={inputCodes}
                            onChange={(e) => setInputCodes(e.target.value)}
                        />
                        <Button onClick={handleAudit} disabled={loading} className="w-full">
                            {loading ? "Processando..." : <><Play className="mr-2 h-4 w-4" /> Processar Auditoria</>}
                        </Button>
                    </CardContent>
                </Card>

                {/* Coluna Direita: Resultados */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2">
                    {result && (
                        <>
                            {/* Sucesso */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-green-700 flex items-center gap-2 text-lg">
                                        <CheckCircle className="h-5 w-5" /> Encontrados e Corretos ({result.encontrados?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.encontrados?.map(c => (
                                            <Badge key={c} variant="outline" className="bg-green-50 text-green-700 border-green-200">{c}</Badge>
                                        ))}
                                        {(!result.encontrados || result.encontrados.length === 0) && <span className="text-muted-foreground text-sm">Nenhum item.</span>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Divergência de Status */}
                            <Card className="border-l-4 border-l-yellow-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-yellow-700 flex items-center gap-2 text-lg">
                                        <AlertTriangle className="h-5 w-5" /> Divergência de Status ({result.divergencias_status?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {result.divergencias_status?.map((item, idx) => (
                                            <div key={idx} className="text-sm border p-2 rounded bg-yellow-50 border-yellow-100 flex justify-between">
                                                <span className="font-mono font-bold">{item.codigo}</span>
                                                <span className="text-yellow-800">Status Atual: {item.status_atual}</span>
                                            </div>
                                        ))}
                                        {(!result.divergencias_status || result.divergencias_status.length === 0) && <span className="text-muted-foreground text-sm">Nenhuma divergência.</span>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Sobras (Não existem no sistema) */}
                            <Card className="border-l-4 border-l-red-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-red-700 flex items-center gap-2 text-lg">
                                        <XCircle className="h-5 w-5" /> Sobras / Não Cadastrados ({result.sobras?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.sobras?.map(c => (
                                            <Badge key={c} variant="destructive">{c}</Badge>
                                        ))}
                                        {(!result.sobras || result.sobras.length === 0) && <span className="text-muted-foreground text-sm">Nenhuma sobra.</span>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Perdidas (No sistema mas não bipadas) */}
                            <Card className="border-l-4 border-l-gray-500">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-700 flex items-center gap-2 text-lg">
                                        <AlertTriangle className="h-5 w-5" /> Perdidas / Não Bipadas ({result.nao_lidas_no_inventario?.length || 0})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {result.nao_lidas_no_inventario?.map(c => (
                                            <Badge key={c.codigo_etiqueta} variant="secondary" className="bg-gray-100 text-gray-600">{c.codigo_etiqueta}</Badge>
                                        ))}
                                        {(!result.nao_lidas_no_inventario || result.nao_lidas_no_inventario.length === 0) && <span className="text-muted-foreground text-sm">Tudo encontrado!</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {!result && (
                        <div className="h-full flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                            Aguardando processamento...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
