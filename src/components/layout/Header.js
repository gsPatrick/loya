// src/components/layout/Header.js
"use client";

import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { Sidebar } from "./Sidebar"; // Importando o componente Sidebar criado acima

// Componentes do Shadcn UI
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6 shadow-sm">

            {/* --- MENU MOBILE (Sheet) --- */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Abrir menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                    {/* Reutilizamos a Sidebar aqui dentro para o mobile */}
                    <Sidebar setIsOpen={setIsOpen} />
                </SheetContent>
            </Sheet>

            {/* --- BARRA DE BUSCA GLOBAL --- */}
            <div className="w-full flex-1 md:w-auto md:flex-none">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar peças (código), clientes..."
                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px] h-10"
                    />
                </div>
            </div>

            {/* --- ÁREA DO USUÁRIO (Direita) --- */}
            <div className="flex items-center gap-4 ml-auto">

                {/* Botão de Notificações */}
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {/* Bolinha vermelha de notificação */}
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
                </Button>

                {/* Dropdown do Usuário */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9 border">
                                {/* Fallback caso não tenha imagem */}
                                <AvatarImage src="/usuario.png" alt="@admin" />
                                <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">Administrador</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    admin@garimpo.nos
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Meu Perfil</DropdownMenuItem>
                        <DropdownMenuItem>Configurações da Loja</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                window.location.href = '/login';
                            }}
                            className="text-red-500 focus:text-red-500 cursor-pointer"
                        >
                            Sair
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}