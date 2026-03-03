"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QrCode, Link, Trash2 } from "lucide-react";

const mockTables = [ { id: 1, name: "Mesa 01" }, { id: 2, name: "Mesa 02" }, { id: 3, name: "Balcão 01" }];

export default function TablesTab() {
    const [tables, setTables] = useState(mockTables);
    const [newTableName, setNewTableName] = useState("");

    const handleAddTable = () => {
        if(newTableName.trim()){
            setTables([...tables, {id: Date.now(), name: newTableName}]);
            setNewTableName("");
        }
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Mesas e QR Codes</CardTitle>
        <CardDescription>Cadastre suas mesas e gere os links de acesso para cada tablet.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-6">
          <Input placeholder="Nome da nova mesa (Ex: Varanda 03)" value={newTableName} onChange={e => setNewTableName(e.target.value)} />
          <Button onClick={handleAddTable}>Adicionar Mesa</Button>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {tables.map(table => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm"><QrCode className="h-4 w-4 mr-2" /> Gerar QR Code</Button>
                    <Button variant="outline" size="sm"><Link className="h-4 w-4 mr-2" /> Copiar Link</Button>
                    <Button variant="destructive" size="icon" className="h-9 w-9"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}