"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function GeneralTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações Gerais</CardTitle>
        <CardDescription>Ajustes de moeda, idiomas e funcionalidades do tablet.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <Label>Moeda do Sistema</Label>
          <p className="text-sm text-muted-foreground mb-2">Selecione a moeda principal para todos os preços.</p>
          <Select defaultValue="BRL">
            <SelectTrigger className="w-full md:w-1/3"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="BRL">Real Brasileiro (BRL)</SelectItem>
              <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Idiomas Disponíveis no Tablet</Label>
          <p className="text-sm text-muted-foreground mb-4">Escolha quais bandeiras aparecerão na tela de seleção de idioma.</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2"><Checkbox id="lang-pt" defaultChecked /><Label htmlFor="lang-pt">Português (Brasil)</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="lang-en" defaultChecked /><Label htmlFor="lang-en">Inglês (EUA)</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="lang-es" defaultChecked /><Label htmlFor="lang-es">Espanhol</Label></div>
            <div className="flex items-center space-x-2"><Checkbox id="lang-fr" /><Label htmlFor="lang-fr">Francês</Label></div>
          </div>
        </div>
        <div>
          <Label>Funcionalidades Adicionais</Label>
          <p className="text-sm text-muted-foreground mb-4">Ative ou desative botões e funções específicas no tablet.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor="feat-valet">Ativar botão "Chamar Vallet"</Label><Switch id="feat-valet" /></div>
            <div className="flex items-center justify-between rounded-lg border p-3"><Label htmlFor="feat-tip">Ativar opção de Gorjeta no pagamento</Label><Switch id="feat-tip" defaultChecked /></div>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t"><Button>Salvar Configurações</Button></div>
      </CardContent>
    </Card>
  );
}   