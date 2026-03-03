"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock } from "lucide-react";

export default function IntegrationsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrações com PDV</CardTitle>
        <CardDescription>Conecte seu sistema de Ponto de Venda (PDV) para sincronizar pedidos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <Alert>
            <Lock className="h-4 w-4" />
            <AlertTitle>Recurso Premium</AlertTitle>
            <AlertDescription>
                A integração com sistemas de PDV está disponível apenas no Plano Premium.
            </AlertDescription>
        </Alert>
        <fieldset disabled className="space-y-6 opacity-50">
            <div>
              <Label>Sistema de PDV</Label>
              <p className="text-sm text-muted-foreground mb-2">Selecione o seu sistema de PDV atual.</p>
              <Select>
                <SelectTrigger className="w-full md:w-1/2"><SelectValue placeholder="Selecione um PDV" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="toast">Toast</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="oracle">Oracle Micros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="api-key">Chave de API (API Key)</Label>
               <Input id="api-key" placeholder="Cole sua chave de API aqui" />
            </div>
             <div className="flex justify-end pt-4 border-t"><Button>Salvar e Testar Conexão</Button></div>
        </fieldset>
      </CardContent>
    </Card>
  );
}