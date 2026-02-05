"use client";

import { ShieldX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function SemPermissaoPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-red-500">
                <CardContent className="pt-8 pb-8 text-center space-y-6">
                    <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                        <ShieldX className="h-10 w-10 text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Acesso Negado
                        </h1>
                        <p className="text-gray-600">
                            Você não tem permissão para acessar esta página.
                        </p>
                        <p className="text-sm text-gray-500">
                            Entre em contato com o administrador se acredita que isso é um erro.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href="/dashboard/pedidos/pdv">
                            <Button className="w-full bg-primary hover:bg-primary/90">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Voltar para o PDV
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            onClick={() => {
                                localStorage.removeItem('token');
                                localStorage.removeItem('user');
                                window.location.href = '/login';
                            }}
                            className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                            Sair e Trocar de Conta
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
