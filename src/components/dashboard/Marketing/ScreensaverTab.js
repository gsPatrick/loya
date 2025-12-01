"use client";
import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

// Dados Mocado
const mockBanners = [
  { id: 1, url: "/highlights/highlight-1.png" },
  { id: 2, url: "/images/banner-gourmet.png" },
];

export default function ScreensaverTab() {
  const [banners, setBanners] = useState(mockBanners);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Proteção de Tela</CardTitle>
            <CardDescription>
              Gerencie os banners que aparecem no carrossel do tablet.
            </CardDescription>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Adicionar Banner
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {banners.map((banner) => (
            <div key={banner.id} className="relative group aspect-video">
              <Image
                src={banner.url}
                alt={`Banner ${banner.id}`}
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
      </CardContent>
    </Card>
  );
}