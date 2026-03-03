"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const mockProducts = [
  { id: 'prod1', name: 'Hambúrguer Clássico' },
  { id: 'prod2', name: 'Hambúrguer Duplo Bacon' },
  { id: 'prod4', name: 'Coca-Cola Lata' },
];

const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function OfferForm({ offer }) {
  const isEditing = !!offer;
  const [useSchedule, setUseSchedule] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);

  const toggleDay = (dayIndex) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  return (
    <>
      <SheetHeader className="pb-6">
        <SheetTitle>{isEditing ? "Editar Oferta" : "Criar Nova Oferta"}</SheetTitle>
        <SheetDescription>Preencha os detalhes da sua promoção.</SheetDescription>
      </SheetHeader>
      
      <div className="flex flex-col gap-6">
        <div>
          <Label htmlFor="offer-title">Título da Oferta</Label>
          <Input id="offer-title" placeholder="Ex: Happy Hour Cervejas" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Desconto</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Porcentagem (%)</SelectItem>
                <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="offer-value">Valor</Label>
            <Input id="offer-value" type="number" placeholder="30" />
          </div>
        </div>

        <div>
          <Label>Produtos Aplicáveis</Label>
          <div className="mt-2 space-y-2 border p-4 rounded-lg max-h-40 overflow-y-auto">
            {mockProducts.map(product => (
              <div key={product.id} className="flex items-center space-x-2">
                <Checkbox id={`prod-${product.id}`} />
                <Label htmlFor={`prod-${product.id}`}>{product.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Imagem Promocional</Label>
          <Input type="file" className="mt-2" />
        </div>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="schedule-switch">Agendamento Automático</Label>
            <Switch id="schedule-switch" checked={useSchedule} onCheckedChange={setUseSchedule} />
          </div>
          {useSchedule && (
            <div className="mt-4 space-y-4">
              <div>
                <Label>Dias da Semana</Label>
                <div className="flex gap-1 mt-2">
                  {weekDays.map((day, index) => (
                    <Button 
                      key={index}
                      variant={selectedDays.includes(index) ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleDay(index)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Horário de Início</Label>
                  <Input id="start-time" type="time" />
                </div>
                <div>
                  <Label htmlFor="end-time">Horário de Fim</Label>
                  <Input id="end-time" type="time" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SheetFooter className="mt-8">
        <Button variant="outline">Cancelar</Button>
        <Button>{isEditing ? "Salvar Alterações" : "Criar Oferta"}</Button>
      </SheetFooter>
    </>
  );
}