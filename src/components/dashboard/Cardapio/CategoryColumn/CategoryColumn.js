"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CategoryColumn({ 
  categories, 
  selectedCategory, 
  selectedSubcategory, 
  onSelectCategory, 
  onSelectSubcategory,
  onAddCategory,
  onAddSubcategory
}) {
  // --- MUDANÇA-CHAVE: Estados para controlar os modais e inputs ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryName, setNewSubcategoryName] = useState("");

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName);
      setNewCategoryName(""); // Limpa o input
      setIsCategoryModalOpen(false); // Fecha o modal programaticamente
    }
  };

  const handleCreateSubcategory = () => {
    if (newSubcategoryName.trim()) {
      onAddSubcategory(newSubcategoryName);
      setNewSubcategoryName(""); // Limpa o input
      setIsSubcategoryModalOpen(false); // Fecha o modal programaticamente
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Navegação</CardTitle>
            <CardDescription>Categorias e Subcategorias</CardDescription>
          </div>
          {/* --- MUDANÇA-CHAVE: Modal de Categoria controlado por estado --- */}
          <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Criar Nova Categoria</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <Label htmlFor="category-name">Nome da Categoria</Label>
                <Input 
                  id="category-name" 
                  placeholder="Ex: Sobremesas" 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateCategory}>Criar Categoria</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-1">
          {categories.map(category => (
            <li key={category.id}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start font-semibold text-base h-11", selectedCategory?.id === category.id && "bg-accent")}
                onClick={() => onSelectCategory(category.id)}
              >
                {category.name}
              </Button>
              
              {selectedCategory?.id === category.id && (
                <ul className="pl-4 mt-1 space-y-1">
                  {category.subcategories.map(subcategory => (
                    <li key={subcategory.id}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn("w-full justify-start font-normal", selectedSubcategory?.id === subcategory.id && "bg-accent/50")}
                        onClick={() => onSelectSubcategory(subcategory.id)}
                      >
                        {subcategory.name}
                      </Button>
                    </li>
                  ))}
                   {/* --- MUDANÇA-CHAVE: Modal de Subcategoria controlado por estado --- */}
                   <Dialog open={isSubcategoryModalOpen} onOpenChange={setIsSubcategoryModalOpen}>
                    <DialogTrigger asChild>
                       <Button variant="ghost" size="sm" className="w-full justify-start font-normal text-muted-foreground italic">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Nova Subcategoria
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Criar Subcategoria em "{category.name}"</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Label htmlFor="subcategory-name">Nome da Subcategoria</Label>
                        <Input 
                          id="subcategory-name" 
                          placeholder="Ex: Cafés Gelados"
                          value={newSubcategoryName}
                          onChange={(e) => setNewSubcategoryName(e.target.value)}
                        />
                      </div>
                      <DialogFooter>
                         <Button variant="outline" onClick={() => setIsSubcategoryModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleCreateSubcategory}>Criar Subcategoria</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </ul>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}