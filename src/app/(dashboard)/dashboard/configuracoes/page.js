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
        LABEL_HEIGHT: "75",
        // Advanced
        LABEL_MARGIN_TOP: "1.5",
        LABEL_MARGIN_BOTTOM: "1.5",
        LABEL_MARGIN_LEFT: "1.0",
        LABEL_MARGIN_RIGHT: "1.0",
        LABEL_FONT_SIZE_LOGO: "11",
        LABEL_FONT_SIZE_PRICE: "10",
        LABEL_FONT_SIZE_TEXT: "5",
        LABEL_BARCODE_HEIGHT: "28",
        LABEL_BARCODE_WIDTH: "1.2",
        // Element offsets (individual positioning)
        LABEL_LOGO_OFFSET_Y: "0",
        LABEL_BARCODE_OFFSET_Y: "0",
        LABEL_PRICE_OFFSET_Y: "0",
        LABEL_CODE_OFFSET_Y: "0",
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
            const configsToSave = [
                'SYSTEM_NAME', 'SYSTEM_LOGO', 'SYSTEM_COLOR_PRIMARY',
                'LABEL_STORE_NAME', 'LABEL_BG_COLOR', 'LABEL_TEXT_COLOR', 'LABEL_WIDTH', 'LABEL_HEIGHT',
                'LABEL_MARGIN_TOP', 'LABEL_MARGIN_BOTTOM', 'LABEL_MARGIN_LEFT', 'LABEL_MARGIN_RIGHT',
                'LABEL_FONT_SIZE_LOGO', 'LABEL_FONT_SIZE_PRICE', 'LABEL_FONT_SIZE_TEXT',
                'LABEL_BARCODE_HEIGHT', 'LABEL_BARCODE_WIDTH',
                'LABEL_LOGO_OFFSET_Y', 'LABEL_BARCODE_OFFSET_Y', 'LABEL_PRICE_OFFSET_Y', 'LABEL_CODE_OFFSET_Y'
            ];

            await Promise.all(configsToSave.map(key =>
                api.put(`/admin/configuracoes/${key}`, { valor: configs[key] })
            ));

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

                            {/* Layout Físico */}
                            <div className="space-y-4">
                                <Label className="text-base font-bold text-primary">Layout Físico da Etiqueta</Label>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="LABEL_WIDTH">Largura Total (mm)</Label>
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
                                        <Label htmlFor="LABEL_HEIGHT">Altura Total (mm)</Label>
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

                                <div className="space-y-2 pt-2 border-t">
                                    <Label>Margens Físicas (Topo, Base, Esq, Dir)</Label>
                                    <p className="text-xs text-muted-foreground italic mb-2">Use estas margens para centralizar o conteúdo e evitar cortes.</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Topo (mm)</Label>
                                            <Input type="number" name="LABEL_MARGIN_TOP" value={configs.LABEL_MARGIN_TOP || 1.5} onChange={handleChange} step="0.1" title="Aumente para descer o conteúdo" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Base (mm)</Label>
                                            <Input type="number" name="LABEL_MARGIN_BOTTOM" value={configs.LABEL_MARGIN_BOTTOM || 1.5} onChange={handleChange} step="0.1" title="Aumente para subir o conteúdo" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Esq (mm)</Label>
                                            <Input type="number" name="LABEL_MARGIN_LEFT" value={configs.LABEL_MARGIN_LEFT || 1.0} onChange={handleChange} step="0.1" />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs text-muted-foreground font-bold">Dir (mm)</Label>
                                            <Input type="number" name="LABEL_MARGIN_RIGHT" value={configs.LABEL_MARGIN_RIGHT || 1.0} onChange={handleChange} step="0.1" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <Separator />

                            {/* Font Sizes */}
                            <div className="space-y-2">
                                <Label>Tamanho das Fontes (pt)</Label>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Logo</Label>
                                        <Input type="number" name="LABEL_FONT_SIZE_LOGO" value={configs.LABEL_FONT_SIZE_LOGO || 11} onChange={handleChange} step="0.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Preço</Label>
                                        <Input type="number" name="LABEL_FONT_SIZE_PRICE" value={configs.LABEL_FONT_SIZE_PRICE || 10} onChange={handleChange} step="0.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Infos</Label>
                                        <Input type="number" name="LABEL_FONT_SIZE_TEXT" value={configs.LABEL_FONT_SIZE_TEXT || 5} onChange={handleChange} step="0.5" />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Barcode */}
                            <div className="space-y-2">
                                <Label>Código de Barras</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Altura (px)</Label>
                                        <Input type="number" name="LABEL_BARCODE_HEIGHT" value={configs.LABEL_BARCODE_HEIGHT || 28} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Escala</Label>
                                        <Input type="number" name="LABEL_BARCODE_WIDTH" value={configs.LABEL_BARCODE_WIDTH || 1.2} onChange={handleChange} step="0.1" />
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Element Offsets */}
                            <div className="space-y-2">
                                <Label>Ajuste de Posição (mm)</Label>
                                <p className="text-xs text-muted-foreground">Valores negativos sobem, positivos descem.</p>
                                <div className="grid grid-cols-4 gap-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Logo (Y)</Label>
                                        <Input type="number" name="LABEL_LOGO_OFFSET_Y" value={configs.LABEL_LOGO_OFFSET_Y || 0} onChange={handleChange} step="0.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Barcode (Y)</Label>
                                        <Input type="number" name="LABEL_BARCODE_OFFSET_Y" value={configs.LABEL_BARCODE_OFFSET_Y || 0} onChange={handleChange} step="0.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Preço (Y)</Label>
                                        <Input type="number" name="LABEL_PRICE_OFFSET_Y" value={configs.LABEL_PRICE_OFFSET_Y || 0} onChange={handleChange} step="0.5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-muted-foreground">Código (Y)</Label>
                                        <Input type="number" name="LABEL_CODE_OFFSET_Y" value={configs.LABEL_CODE_OFFSET_Y || 0} onChange={handleChange} step="0.5" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Live Preview */}
                        <div className="flex flex-col items-start gap-2">
                            <span className="text-sm font-medium self-center">Pré-visualização</span>
                            <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-8 border w-full h-full min-h-[400px]">
                                <div
                                    style={{
                                        width: `${configs.LABEL_WIDTH}mm`,
                                        height: `${configs.LABEL_HEIGHT}mm`,
                                        background: configs.LABEL_BG_COLOR,
                                        color: configs.LABEL_TEXT_COLOR,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: `${configs.LABEL_MARGIN_TOP}mm`,
                                        paddingBottom: `${configs.LABEL_MARGIN_BOTTOM}mm`,
                                        paddingLeft: `${configs.LABEL_MARGIN_LEFT}mm`,
                                        paddingRight: `${configs.LABEL_MARGIN_RIGHT}mm`,
                                        position: 'relative',
                                        borderRadius: '2px',
                                        fontFamily: 'sans-serif',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        overflow: 'hidden',
                                        transition: 'all 0.2s ease',
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
                                    <div style={{
                                        marginTop: `calc(1mm + ${configs.LABEL_LOGO_OFFSET_Y || 0}mm)`,
                                        fontFamily: 'cursive',
                                        fontSize: `${configs.LABEL_FONT_SIZE_LOGO}pt`,
                                        fontWeight: 700,
                                        lineHeight: 1,
                                        textAlign: 'center',
                                        width: '100%',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {configs.LABEL_STORE_NAME || 'LOJA'}
                                    </div>

                                    {/* Barcode placeholder */}
                                    <div style={{
                                        background: 'white',
                                        padding: '1.5mm 1mm',
                                        marginTop: `calc(1.5mm + ${configs.LABEL_BARCODE_OFFSET_Y || 0}mm)`,
                                        marginBottom: '1.5mm',
                                        borderRadius: '1mm',
                                        width: '95%',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{
                                            height: `${configs.LABEL_BARCODE_HEIGHT}px`,
                                            background: 'repeating-linear-gradient(90deg, #000 0, #000 2px, #fff 2px, #fff 4px)',
                                            width: '80%'
                                        }} />
                                    </div>

                                    {/* Code */}
                                    <div style={{
                                        fontSize: `${configs.LABEL_FONT_SIZE_TEXT}pt`,
                                        fontFamily: 'monospace',
                                        color: configs.LABEL_TEXT_COLOR,
                                        marginTop: `${configs.LABEL_CODE_OFFSET_Y || 0}mm`,
                                        marginBottom: '0.5mm'
                                    }}>
                                        00001234 01.12345678
                                    </div>

                                    {/* Price area */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        width: '100%',
                                        marginTop: `calc(auto + ${configs.LABEL_PRICE_OFFSET_Y || 0}mm)`,
                                        transform: `translateY(${configs.LABEL_PRICE_OFFSET_Y || 0}mm)`
                                    }}>
                                        <span style={{ fontSize: `${configs.LABEL_FONT_SIZE_PRICE}pt`, fontWeight: 'bold' }}>R$ 99,00</span>
                                        <span style={{ fontSize: `${configs.LABEL_FONT_SIZE_PRICE}pt`, fontWeight: 'bold' }}>M</span>
                                    </div>

                                    {/* Bottom code */}
                                    <div style={{
                                        fontSize: `${Math.max(4, parseFloat(configs.LABEL_FONT_SIZE_TEXT) - 1)}pt`,
                                        fontFamily: 'monospace',
                                        opacity: 0.6,
                                        marginTop: '0.5mm'
                                    }}>
                                        19.12345678B | F: 0001
                                    </div>
                                </div>
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
