"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import ProductEditor from "../ProductEditor/ProductEditor"; // O formulário

export default function ProductColumn({ subcategory }) {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleEdit = (product) => {
    setSelectedProduct(product);
    // Aqui você abriria o Sheet programaticamente, ou o SheetTrigger faria isso.
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{subcategory.name}</CardTitle>
            <CardDescription>
              {subcategory.products.length} produto(s) nesta subcategoria.
            </CardDescription>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button onClick={() => setSelectedProduct(null)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
              {/* O conteúdo do formulário será renderizado aqui */}
              <ProductEditor product={null} />
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="border-t">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Produto</TableHead>
                <TableHead className="text-right">Preço Base</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subcategory.products.map(product => (
                <TableRow key={product.id}>
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell className="text-right">
                    {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </TableCell>
                  <TableCell>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(product)}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </SheetTrigger>
                       <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                        <ProductEditor product={selectedProduct} />
                      </SheetContent>
                    </Sheet>
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