import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

// Dados Mocado para grupos de modificadores existentes
const mockModifierGroups = [
  {
    id: 'group1',
    name: 'Molhos Extras',
    min: 0,
    max: 2,
    options: [
      { id: 'opt1', name: 'Maionese Temperada', price: 2.50 },
      { id: 'opt2', name: 'Ketchup de Goiaba', price: 3.00 },
    ]
  },
  {
    id: 'group2',
    name: 'Ponto da Carne',
    min: 1,
    max: 1,
    options: [
      { id: 'opt3', name: 'Mal Passado', price: 0 },
      { id: 'opt4', name: 'Ao Ponto', price: 0 },
      { id: 'opt5', name: 'Bem Passado', price: 0 },
    ]
  },
];

export default function ModifierGroupManager({ onSelectGroup }) {
  const [groups, setGroups] = useState(mockModifierGroups);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grupos de Adicionais</CardTitle>
        <CardDescription>
          Crie e gerencie grupos de adicionais para associar aos seus produtos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map(group => (
          <div key={group.id} className="border p-4 rounded-lg">
            <h4 className="font-semibold">{group.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <Button onClick={() => onSelectGroup(group)}>Selecionar</Button>
              <Button variant="outline" size="sm">Editar</Button>
            </div>
          </div>
        ))}
         <Button variant="outline" className="w-full">
            <PlusCircle className="h-4 w-4 mr-2" />
            Criar Novo Grupo
        </Button>
      </CardContent>
    </Card>
  );
}