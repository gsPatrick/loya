"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import ModifierGroupManager from "../ModifierGroupManager";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ProductEditor({ product }) {
  const isEditing = !!product;
  
  // Estado local para variações
  const [variations, setVariations] = useState(product?.variations || [{ id: 'var1', name: '', price: '' }]);
  const [associatedModifiers, setAssociatedModifiers] = useState(product?.modifiers || []);

  const handleAddVariation = () => {
    setVariations([...variations, { id: `var${Date.now()}`, name: '', price: '' }]);
  };

  const handleRemoveVariation = (id) => {
    setVariations(variations.filter(v => v.id !== id));
  };
  
  const handleSelectModifierGroup = (group) => {
     if (!associatedModifiers.find(m => m.id === group.id)) {
        setAssociatedModifiers([...associatedModifiers, group]);
     }
  };

  return (
    <>
      <SheetHeader className="pb-6">
        <SheetTitle>{isEditing ? `Editar: ${product.name}` : "Criar Novo Produto"}</SheetTitle>
        <SheetDescription>
          Preencha os detalhes, variações e adicionais do produto.
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex flex-col gap-8">
        {/* Informações Básicas */}
        <Card>
          <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="product-name">Nome do Produto</Label>
              <Input id="product-name" defaultValue={product?.name || ""} />
            </div>
            <div>
              <Label htmlFor="product-description">Descrição</Label>
              <Textarea id="product-description" defaultValue={product?.description || ""} />
            </div>
          </CardContent>
        </Card>

        {/* Variações */}
        <Card>
          <CardHeader>
            <CardTitle>Variações de Produto</CardTitle>
            <CardDescription>
              Crie variações como tamanhos ou tipos (Ex: Pequeno, Médio, Grande). Se não houver variações, o preço base será o único considerado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {variations.map((variation, index) => (
              <div key={variation.id} className="flex items-end gap-2">
                <div className="grid flex-1 gap-1.5">
                  <Label htmlFor={`var-name-${index}`}>Nome da Variação</Label>
                  <Input id={`var-name-${index}`} placeholder="Ex: Pequeno (250ml)" defaultValue={variation.name} />
                </div>
                <div className="grid w-32 gap-1.5">
                  <Label htmlFor={`var-price-${index}`}>Preço</Label>
                  <Input id={`var-price-${index}`} type="number" placeholder="19.90" defaultValue={variation.price} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveVariation(variation.id)} disabled={variations.length === 1}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" className="mt-2" onClick={handleAddVariation}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Variação
            </Button>
          </CardContent>
        </Card>

        {/* Grupos de Adicionais */}
        <Card>
          <CardHeader>
            <CardTitle>Grupos de Adicionais</CardTitle>
            <CardDescription>
              Associe grupos de modificadores a este produto (Ex: "Ponto da Carne", "Molhos Extras").
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-2 mb-4">
              {associatedModifiers.map(group => (
                <div key={group.id} className="flex items-center justify-between p-2 bg-secondary rounded-md">
                  <span className="font-medium">{group.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => setAssociatedModifiers(associatedModifiers.filter(m => m.id !== group.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Associar Grupo de Adicionais
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <ModifierGroupManager onSelectGroup={handleSelectModifierGroup} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2 mt-8">
        <Button variant="outline">Cancelar</Button>
        <Button>{isEditing ? "Salvar Alterações" : "Criar Produto"}</Button>
      </div>
    </>
  );
}