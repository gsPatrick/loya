"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Sun, Moon, Palette } from "lucide-react";

export default function BrandTab() {
  const [logoPreview, setLogoPreview] = useState("/logocolorida.png"); // Imagem de exemplo
  const [primaryColor, setPrimaryColor] = useState("#df0024");
  const [theme, setTheme] = useState("dark");

  const handleLogoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identidade Visual (Marca)</CardTitle>
        <CardDescription>
          Personalize a aparência do seu cardápio para combinar com sua marca.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Seção de Logo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <Label>Logotipo</Label>
            <p className="text-sm text-muted-foreground">
              Faça o upload do logo que aparecerá no topo do cardápio.
            </p>
          </div>
          <div className="md:col-span-2 flex items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center p-2">
              {logoPreview ? (
                <Image src={logoPreview} alt="Preview do Logo" width={80} height={80} objectFit="contain" />
              ) : (
                <span className="text-xs text-muted-foreground">Preview</span>
              )}
            </div>
            <Input id="logo-upload" type="file" className="hidden" onChange={handleLogoChange} />
            <Button asChild variant="outline">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Trocar Imagem
              </Label>
            </Button>
          </div>
        </div>

        {/* Seção de Cores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1">
            <Label>Cor Principal</Label>
            <p className="text-sm text-muted-foreground">
              Define a cor de botões, links e outros destaques.
            </p>
          </div>
          <div className="md:col-span-2 flex items-center gap-4">
            <div className="relative">
              <Palette className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-14 p-1 cursor-pointer"
            />
          </div>
        </div>

        {/* Seção de Tema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-1">
            <Label>Tema de Fundo</Label>
            <p className="text-sm text-muted-foreground">
              Escolha entre um tema claro ou escuro.
            </p>
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}>
              <Sun className="h-4 w-4 mr-2" />
              Claro
            </Button>
            <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}>
              <Moon className="h-4 w-4 mr-2" />
              Escuro
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  );
}