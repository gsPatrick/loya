"use client";

import { useState } from "react";
import { Upload, FileUp, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function ImportacaoPage() {
    const { toast } = useToast();
    const [loadingPecas, setLoadingPecas] = useState(false);
    const [loadingPessoas, setLoadingPessoas] = useState(false);

    const handleUpload = async (file, type, setLoading) => {
        if (!file) {
            toast({ title: "Erro", description: "Selecione um arquivo.", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tipo', type);

        setLoading(true);
        try {
            const { data } = await api.post('/importacao/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({
                title: "Sucesso",
                description: `Processado: ${data.total || 'OK'} linhas.`
            });
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro na Importação",
                description: error.response?.data?.error || "Falha ao processar arquivo.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                <FileUp className="h-6 w-6" /> Importação de Dados
            </h1>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Card Peças */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-blue-600" /> Importar Peças
                        </CardTitle>
                        <CardDescription>
                            Planilha .xlsx com colunas: codigo_etiqueta, descricao, preco_custo, preco_venda, etc.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="file-pecas">Arquivo Excel</Label>
                            <Input id="file-pecas" type="file" accept=".xlsx, .xls" onChange={(e) => handleUpload(e.target.files[0], 'PECAS', setLoadingPecas)} disabled={loadingPecas} />
                        </div>
                        {loadingPecas && <p className="text-sm text-muted-foreground animate-pulse">Processando...</p>}
                    </CardContent>
                </Card>

                {/* Card Pessoas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-green-600" /> Importar Pessoas
                        </CardTitle>
                        <CardDescription>
                            Planilha .xlsx com colunas: nome, email, telefone, cpf, etc.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="file-pessoas">Arquivo Excel</Label>
                            <Input id="file-pessoas" type="file" accept=".xlsx, .xls" onChange={(e) => handleUpload(e.target.files[0], 'PESSOAS', setLoadingPessoas)} disabled={loadingPessoas} />
                        </div>
                        {loadingPessoas && <p className="text-sm text-muted-foreground animate-pulse">Processando...</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
