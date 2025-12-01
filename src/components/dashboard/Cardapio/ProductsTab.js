"use client";
import { useState } from "react";
import { PlusCircle, MoreHorizontal, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// --- Dados Mocado ---
const mockProducts = [
  { id: 1, name: "Hambúrguer Clássico", category: "Hambúrgueres", price: 29.90, status: "Ativo", imageUrl: "/images/picanha-burger.png" },
  { id: 2, name: "Batata Frita", category: "Acompanhamentos", price: 12.50, status: "Ativo", imageUrl: "/path-to-fries.png" },
  { id: 3, name: "Avelã Latte", category: "Bebidas", price: 19.50, status: "Pausado", imageUrl: "/cart/burger-no-prato.png" },
  { id: 4, name: "Salada Caesar", category: "Entradas", price: 22.00, status: "Ativo", imageUrl: "/path-to-salad.png" },
];
// --- Fim dos Dados Mocado ---

export default function ProductsTab() {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Produtos</CardTitle>
            <CardDescription>
              Liste, busque e gerencie todos os seus produtos.
            </CardDescription>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nome do produto..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Imagem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Preço</TableHead>
                <TableHead className="w-[60px] text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10 rounded-md">
                      <AvatarImage src={product.imageUrl} alt={product.name} />
                      <AvatarFallback className="rounded-md">
                        {product.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={product.status === "Ativo" ? "default" : "destructive"}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    {product.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500">
                          Excluir
                        </DropdownMenuItem>
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