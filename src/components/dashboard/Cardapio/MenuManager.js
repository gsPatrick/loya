"use client";
import { useState } from "react";
import CategoryColumn from "./CategoryColumn/CategoryColumn";
import ProductColumn from "./ProductColumn/ProductColumn";

// --- Dados Mocado Iniciais ---
const initialMenu = [
  { 
    id: 'cat1', 
    name: 'Comidas',
    subcategories: [
      { id: 'sub1', name: 'Hambúrgueres', products: [{ id: 'prod1', name: 'Hambúrguer Clássico', price: 29.90 }] },
      { id: 'sub2', name: 'Pizzas', products: [{ id: 'prod3', name: 'Pizza de Calabresa', price: 45.00 }] },
    ]
  },
  { 
    id: 'cat2', 
    name: 'Bebidas',
    subcategories: [
      { id: 'sub3', name: 'Refrigerantes', products: [{ id: 'prod4', name: 'Coca-Cola Lata', price: 6.00 }] },
    ]
  }
];
// --- Fim dos Dados Mocado ---


export default function MenuManager() {
  const [menuData, setMenuData] = useState(initialMenu);
  const [selectedCategory, setSelectedCategory] = useState(initialMenu[0]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(initialMenu[0].subcategories[0]);

  // --- MUDANÇA-CHAVE: Funções para manipular o estado ---
  const handleAddCategory = (categoryName) => {
    const newCategory = {
      id: `cat${Date.now()}`,
      name: categoryName,
      subcategories: []
    };
    setMenuData([...menuData, newCategory]);
  };

  const handleAddSubcategory = (subcategoryName) => {
    const newSubcategory = {
      id: `sub${Date.now()}`,
      name: subcategoryName,
      products: []
    };
    
    const updatedMenu = menuData.map(cat => {
      if (cat.id === selectedCategory.id) {
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSubcategory]
        };
      }
      return cat;
    });

    setMenuData(updatedMenu);
    
    // Atualiza a categoria selecionada para refletir a nova subcategoria
    setSelectedCategory(updatedMenu.find(c => c.id === selectedCategory.id));
  };
  // --- Fim das Mudanças ---

  const handleSelectCategory = (categoryId) => {
    const category = menuData.find(c => c.id === categoryId);
    setSelectedCategory(category);
    setSelectedSubcategory(category.subcategories[0] || null);
  };

  const handleSelectSubcategory = (subcategoryId) => {
    const subcategory = selectedCategory.subcategories.find(s => s.id === subcategoryId);
    setSelectedSubcategory(subcategory);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 h-full">
      <div className="md:col-span-1 lg:col-span-1 h-full">
        <CategoryColumn
          categories={menuData}
          selectedCategory={selectedCategory}
          selectedSubcategory={selectedSubcategory}
          onSelectCategory={handleSelectCategory}
          onSelectSubcategory={handleSelectSubcategory}
          onAddCategory={handleAddCategory} // Passando a nova função
          onAddSubcategory={handleAddSubcategory} // Passando a nova função
        />
      </div>

      <div className="md:col-span-2 lg:col-span-3 h-full min-h-0">
        {selectedSubcategory ? (
          <ProductColumn 
            key={selectedSubcategory.id}
            subcategory={selectedSubcategory} 
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800/50 rounded-lg">
            <p className="text-muted-foreground">Selecione ou crie uma subcategoria.</p>
          </div>
        )}
      </div>
    </div>
  );
}