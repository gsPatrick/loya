"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const mockUsers = [
    { id: 1, name: "Ana Silva", email: "ana@restaurante.com", role: "Admin" },
    { id: 2, name: "Carlos Souza", email: "carlos@restaurante.com", role: "Garçom" },
    { id: 3, name: "Beatriz Lima", email: "beatriz@restaurante.com", role: "Gerente" },
];

export default function TeamTab() {
  return (
    <Card>
      <CardHeader>
         <div className="flex items-center justify-between">
            <div>
                <CardTitle>Equipe</CardTitle>
                <CardDescription>Gerencie os usuários e suas permissões de acesso.</CardDescription>
            </div>
            <Button>Convidar Usuário</Button>
         </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Nível de Acesso</TableHead><TableHead className="w-16"></TableHead></TableRow></TableHeader>
            <TableBody>
              {mockUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell><Badge>{user.role}</Badge></TableCell>
                   <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar Permissões</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">Remover Usuário</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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