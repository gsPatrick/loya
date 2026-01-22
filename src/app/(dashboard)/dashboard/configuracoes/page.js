"use client";

import { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Upload, Tag } from "lucide-react";

export default function ConfiguracoesPage() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [configs, setConfigs] = useState({
        SYSTEM_NAME: "",
        SYSTEM_LOGO: "",
        SYSTEM_COLOR_PRIMARY: "",
        // Label configs
        LABEL_STORE_NAME: "GARIMPONOS",
        LABEL_BG_COLOR: "#1a1a1a",
        LABEL_TEXT_COLOR: "#ffffff",
        LABEL_WIDTH: "31",
        LABEL_HEIGHT: "53",
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
            // Save system configs
            await api.put('/admin/configuracoes/SYSTEM_NAME', { valor: configs.SYSTEM_NAME });
            await api.put('/admin/configuracoes/SYSTEM_LOGO', { valor: configs.SYSTEM_LOGO });
            await api.put('/admin/configuracoes/SYSTEM_COLOR_PRIMARY', { valor: configs.SYSTEM_COLOR_PRIMARY });
            // Save label configs
            await api.put('/admin/configuracoes/LABEL_STORE_NAME', { valor: configs.LABEL_STORE_NAME });
            await api.put('/admin/configuracoes/LABEL_BG_COLOR', { valor: configs.LABEL_BG_COLOR });
            await api.put('/admin/configuracoes/LABEL_TEXT_COLOR', { valor: configs.LABEL_TEXT_COLOR });
            await api.put('/admin/configuracoes/LABEL_WIDTH', { valor: configs.LABEL_WIDTH });
            await api.put('/admin/configuracoes/LABEL_HEIGHT', { valor: configs.LABEL_HEIGHT });

            toast({ title: "Sucesso", description: "Configurações salvas com sucesso!" });
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
                </CardContent>
            </Card>

            {/* --- LABEL CONFIGURATION --- */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Tag className="h-5 w-5" /> Configuração de Etiquetas</CardTitle>
                    <CardDescription>Personalize o visual das etiquetas de preço/produto.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left: Settings */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="LABEL_STORE_NAME">Nome da Loja (Etiqueta)</Label>
                                <Input
                                    id="LABEL_STORE_NAME"
                                    name="LABEL_STORE_NAME"
                                    value={configs.LABEL_STORE_NAME}
                                    onChange={handleChange}
                                    placeholder="Ex: GARIMPONOS"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="LABEL_BG_COLOR">Cor de Fundo</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            id="LABEL_BG_COLOR"
                                            name="LABEL_BG_COLOR"
                                            value={configs.LABEL_BG_COLOR || '#1a1a1a'}
                                            onChange={handleChange}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={configs.LABEL_BG_COLOR || ''}
                                            onChange={(e) => handleChange({ target: { name: 'LABEL_BG_COLOR', value: e.target.value } })}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="LABEL_TEXT_COLOR">Cor do Texto</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="color"
                                            id="LABEL_TEXT_COLOR"
                                            name="LABEL_TEXT_COLOR"
                                            value={configs.LABEL_TEXT_COLOR || '#ffffff'}
                                            onChange={handleChange}
                                            className="w-12 h-10 p-1 cursor-pointer"
                                        />
                                        <Input
                                            type="text"
                                            value={configs.LABEL_TEXT_COLOR || ''}
                                            onChange={(e) => handleChange({ target: { name: 'LABEL_TEXT_COLOR', value: e.target.value } })}
                                            className="flex-1"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="LABEL_WIDTH">Largura (mm)</Label>
                                    <Input
                                        type="number"
                                        id="LABEL_WIDTH"
                                        name="LABEL_WIDTH"
                                        value={configs.LABEL_WIDTH}
                                        onChange={handleChange}
                                        min="20"
                                        max="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="LABEL_HEIGHT">Altura (mm)</Label>
                                    <Input
                                        type="number"
                                        id="LABEL_HEIGHT"
                                        name="LABEL_HEIGHT"
                                        value={configs.LABEL_HEIGHT}
                                        onChange={handleChange}
                                        min="30"
                                        max="150"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right: Live Preview */}
                        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-4 border">
                            <span className="text-xs text-muted-foreground mb-3 uppercase font-medium">Pré-visualização</span>
                            <div
                                style={{
                                    width: `${configs.LABEL_WIDTH}mm`,
                                    height: `${configs.LABEL_HEIGHT}mm`,
                                    background: configs.LABEL_BG_COLOR,
                                    color: configs.LABEL_TEXT_COLOR,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                    padding: '1.5mm 1mm',
                                    position: 'relative',
                                    borderRadius: '2px',
                                    fontFamily: 'sans-serif',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* Hole */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '5mm',
                                    height: '2.5mm',
                                    background: '#e5e5e5',
                                    borderRadius: '0 0 2.5mm 2.5mm',
                                }} />
                                {/* Logo */}
                                <div style={{ marginTop: '3mm', fontFamily: 'cursive', fontSize: '11pt', fontWeight: 700 }}>
                                    {configs.LABEL_STORE_NAME || 'LOJA'}
                                </div>
                                {/* Barcode placeholder */}
                                <div style={{ background: 'white', padding: '1.5mm', margin: '1.5mm 0', borderRadius: '1mm', width: '90%' }}>
                                    <div style={{ height: '20px', background: 'repeating-linear-gradient(90deg, #000 0, #000 2px, #fff 2px, #fff 4px)', width: '100%' }} />
                                </div>
                                {/* Code */}
                                <div style={{ fontSize: '5pt', fontFamily: 'monospace', color: configs.LABEL_TEXT_COLOR }}>00001234 01.12345678</div>
                                {/* Price area */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 1.5mm', marginTop: '0.5mm' }}>
                                    <span style={{ fontSize: '10pt', fontWeight: 'bold' }}>R$ 99,00</span>
                                    <span style={{ fontSize: '10pt', fontWeight: 'bold' }}>M</span>
                                </div>
                                {/* Bottom code */}
                                <div style={{ fontSize: '4pt', fontFamily: 'monospace', opacity: 0.6, marginTop: '0' }}>19.12345678B</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Todas as Configurações
                </Button>
            </div>
        </div>
    );
}

