"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Upload } from "lucide-react";

export default function ConfiguracoesPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [configs, setConfigs] = useState({
        SYSTEM_NAME: "",
        SYSTEM_LOGO: "",
        SYSTEM_COLOR_PRIMARY: "",
    });

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const response = await api.get('/admin/configuracoes');
            const configMap = {};
            response.data.forEach(conf => {
                configMap[conf.chave] = conf.valor;
            });
            setConfigs(prev => ({ ...prev, ...configMap }));
        } catch (error) {
            console.error("Erro ao carregar configurações:", error);
            toast({ title: "Erro", description: "Não foi possível carregar as configurações.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfigs(prev => ({ ...prev, [name]: value }));
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/admin/configuracoes/upload-logo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setConfigs(prev => ({ ...prev, SYSTEM_LOGO: response.data.url }));
            toast({ title: "Sucesso", description: "Logo enviado com sucesso!" });
        } catch (error) {
            console.error("Erro no upload:", error);
            toast({ title: "Erro", description: "Falha ao enviar logo.", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save each config
            await api.put('/admin/configuracoes/SYSTEM_NAME', { valor: configs.SYSTEM_NAME });
            await api.put('/admin/configuracoes/SYSTEM_LOGO', { valor: configs.SYSTEM_LOGO });
            await api.put('/admin/configuracoes/SYSTEM_COLOR_PRIMARY', { valor: configs.SYSTEM_COLOR_PRIMARY });

            toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });

            // Force reload to update sidebar/header if needed, or use context in future
            // window.location.reload(); 
            // For now, let's just notify. The sidebar might need a refresh or we can trigger an event.
            window.dispatchEvent(new Event('systemConfigUpdated'));

        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast({ title: "Erro", description: "Erro ao salvar configurações.", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Configurações do Sistema</h1>
                <p className="text-sm text-muted-foreground">Personalize a identidade visual e opções do sistema.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Identidade Visual</CardTitle>
                    <CardDescription>Defina o nome e o logo que aparecerão na barra lateral e cabeçalho.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="SYSTEM_NAME">Nome do Sistema</Label>
                        <Input
                            id="SYSTEM_NAME"
                            name="SYSTEM_NAME"
                            value={configs.SYSTEM_NAME}
                            onChange={handleChange}
                            placeholder="Ex: Loja Simples Admin"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="SYSTEM_LOGO">Logo do Sistema</Label>
                        <div className="flex gap-2">
                            <Input
                                id="SYSTEM_LOGO"
                                name="SYSTEM_LOGO"
                                value={configs.SYSTEM_LOGO}
                                onChange={handleChange}
                                placeholder="URL do Logo"
                                className="flex-1"
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    id="logo-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleUpload}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('logo-upload').click()}
                                    disabled={uploading}
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    Upload
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Cole a URL ou faça upload de uma imagem (PNG/JPG).</p>
                    </div>

                    {configs.SYSTEM_LOGO && (
                        <div className="mt-4 p-4 border rounded-md bg-muted/20 flex flex-col items-center">
                            <span className="text-xs text-muted-foreground mb-2">Pré-visualização:</span>
                            <img src={configs.SYSTEM_LOGO} alt="Logo Preview" className="h-12 object-contain" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="SYSTEM_COLOR_PRIMARY">Cor Principal do Sistema</Label>
                        <div className="flex gap-2 items-center">
                            <Input
                                type="color"
                                id="SYSTEM_COLOR_PRIMARY"
                                name="SYSTEM_COLOR_PRIMARY"
                                value={configs.SYSTEM_COLOR_PRIMARY || '#000000'}
                                onChange={handleChange}
                                className="w-16 h-10 p-1 cursor-pointer"
                            />
                            <Input
                                type="text"
                                value={configs.SYSTEM_COLOR_PRIMARY || ''}
                                onChange={(e) => handleChange({ target: { name: 'SYSTEM_COLOR_PRIMARY', value: e.target.value } })}
                                placeholder="#000000"
                                className="w-32"
                            />
                            <p className="text-xs text-muted-foreground">Selecione a cor principal (botões, destaques, sidebar).</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Salvar Alterações
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
