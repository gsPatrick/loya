"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X } from "lucide-react";

// Dados Mocado
const mockGallery = [
  { id: 1, url: "/about/about-thumb1.png" },
  { id: 2, url: "/about/about-thumb2.png" },
];

export default function AboutTab() {
  const [gallery, setGallery] = useState(mockGallery);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conteúdo &quot;Sobre&quot;</CardTitle>
        <CardDescription>
          Edite as informações que contam a história do seu restaurante.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">

        {/* Editor de Texto */}
        <div>
          <Label htmlFor="about-text">História do Restaurante</Label>
          <Textarea
            id="about-text"
            placeholder="Conte um pouco sobre seu estabelecimento..."
            rows={8}
            className="mt-2"
          />
        </div>

        {/* Galeria de Fotos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label>Galeria de Fotos do Ambiente</Label>
              <p className="text-sm text-muted-foreground">
                Estas imagens aparecerão na tela &quot;Sobre&quot;.
              </p>
            </div>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Fotos
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {gallery.map((image) => (
              <div key={image.id} className="relative group aspect-square">
                <Image
                  src={image.url}
                  alt={`Foto ${image.id}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <Button variant="destructive" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Informações de Wi-Fi */}
        <div>
          <Label>Informações de Wi-Fi</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Exiba os dados da rede Wi-Fi para seus clientes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wifi-ssid">Nome da Rede (SSID)</Label>
              <Input id="wifi-ssid" placeholder="Ex: NomeDoRestaurante_WiFi" />
            </div>
            <div>
              <Label htmlFor="wifi-password">Senha</Label>
              <Input id="wifi-password" placeholder="••••••••" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button>Salvar Conteúdo</Button>
        </div>
      </CardContent>
    </Card>
  );
}