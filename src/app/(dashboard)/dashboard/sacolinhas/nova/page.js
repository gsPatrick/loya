"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingBag, ArrowLeft, Search, Plus, Loader2, Check, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command";
import {
    Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function NovaSacolinhaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [selectedCliente, setSelectedCliente] = useState(null);
    const [open, setOpen] = useState(false);
    const [loadingClientes, setLoadingClientes] = useState(false);

    useEffect(() => {
        if (searchCliente.length >= 2) {
            loadClientes(searchCliente);
        }
    }, [searchCliente]);

    const loadClientes = async (search) => {
        setLoadingClientes(true);
        try {
            const { data } = await api.get('/cadastros/pessoas', {
                params: { search, tipo: 'CLIENTES' }
            });
            setClientes(data.rows || data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingClientes(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedCliente) {
            toast({ title: "Atenção", description: "Selecione um cliente para criar a sacolinha.", variant: "destructive" });
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/vendas/sacolinhas/abrir', {
                clienteId: selectedCliente.id
            });
            toast({ title: "Sucesso!", description: "Sacolinha criada com sucesso." });
            router.push(`/dashboard/sacolinhas/${data.id || data.sacolinha?.id}`);
        } catch (err) {
            toast({
                title: "Erro",
                description: err.response?.data?.error || "Erro ao criar sacolinha.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/sacolinhas">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
                        <ShoppingBag className="h-6 w-6" /> Nova Sacolinha
                    </h1>
                    <p className="text-sm text-gray-500">Crie uma nova sacolinha para um cliente</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados da Sacolinha</CardTitle>
                    <CardDescription>Selecione o cliente para abrir uma nova sacolinha</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Cliente *</Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-full justify-between h-11"
                                >
                                    {selectedCliente ? (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            {selectedCliente.nome}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">Buscar cliente...</span>
                                    )}
                                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Digite o nome do cliente..."
                                        value={searchCliente}
                                        onValueChange={setSearchCliente}
                                    />
                                    <CommandList>
                                        {loadingClientes ? (
                                            <div className="py-6 text-center">
                                                <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                                            </div>
                                        ) : (
                                            <>
                                                <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                                                <CommandGroup>
                                                    {clientes.map((cliente) => (
                                                        <CommandItem
                                                            key={cliente.id}
                                                            value={cliente.nome}
                                                            onSelect={() => {
                                                                setSelectedCliente(cliente);
                                                                setOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={`mr-2 h-4 w-4 ${selectedCliente?.id === cliente.id ? "opacity-100" : "opacity-0"
                                                                    }`}
                                                            />
                                                            <div>
                                                                <p className="font-medium">{cliente.nome}</p>
                                                                {cliente.telefone && (
                                                                    <p className="text-xs text-gray-500">{cliente.telefone}</p>
                                                                )}
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </>
                                        )}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <p className="text-xs text-gray-500">
                            Digite pelo menos 2 caracteres para buscar
                        </p>
                    </div>

                    {selectedCliente && (
                        <Card className="bg-muted/50">
                            <CardContent className="pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <User className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-primary">{selectedCliente.nome}</p>
                                        <p className="text-sm text-gray-500">{selectedCliente.telefone || 'Sem telefone'}</p>
                                        {selectedCliente.email && (
                                            <p className="text-xs text-gray-400">{selectedCliente.email}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="flex gap-4 pt-4">
                        <Link href="/dashboard/sacolinhas" className="flex-1">
                            <Button variant="outline" className="w-full">Cancelar</Button>
                        </Link>
                        <Button
                            onClick={handleCreate}
                            disabled={!selectedCliente || loading}
                            className="flex-1 bg-primary hover:bg-primary/90"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Criar Sacolinha
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
