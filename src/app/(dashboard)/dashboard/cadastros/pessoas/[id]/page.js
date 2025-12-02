"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, History, Calendar } from "lucide-react";

export default function DetalhesPessoaPage() {
    const params = useParams();
    const router = useRouter();
    const [pessoa, setPessoa] = useState(null);
    const [permuta, setPermuta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadData();
        }
    }, [params.id]);

    const loadData = async () => {
        try {
            const [resPessoa, resPermuta] = await Promise.all([
                api.get(`/pessoas/${params.id}`),
                api.get(`/pessoas/${params.id}/saldo-permuta`)
            ]);
            setPessoa(resPessoa.data);
            setPermuta(resPermuta.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10">Carregando...</div>;
    if (!pessoa) return <div className="p-10">Pessoa não encontrada.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-4 border-b pb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">{pessoa.nome}</h1>
                    <p className="text-sm text-muted-foreground">{pessoa.email} • {pessoa.telefone_whatsapp}</p>
                </div>
            </div>

            <Tabs defaultValue="dados" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
                    <TabsTrigger value="permuta">Carteira de Permuta</TabsTrigger>
                </TabsList>

                <TabsContent value="dados">
                    <Card>
                        <CardHeader><CardTitle>Informações Pessoais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground">CPF/CNPJ</label>
                                    <p>{pessoa.cpf_cnpj || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground">Tipo</label>
                                    <div className="flex gap-2">
                                        {pessoa.is_cliente && <Badge>Cliente</Badge>}
                                        {pessoa.is_fornecedor && <Badge variant="outline">Fornecedor</Badge>}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permuta">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Balance Card */}
                        <Card className="bg-purple-50 border-purple-200">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-purple-700 flex items-center gap-2">
                                    <Wallet className="h-5 w-5" /> Saldo Disponível
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-purple-800">
                                    R$ {parseFloat(permuta?.saldo || 0).toFixed(2)}
                                </div>
                                {permuta?.proximoVencimento && (
                                    <div className="mt-2 flex items-center gap-2 text-sm text-purple-600">
                                        <Calendar className="h-4 w-4" />
                                        Próximo vencimento: {new Date(permuta.proximoVencimento).toLocaleDateString()}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* History Card */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5" /> Histórico de Uso
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {permuta?.historico && permuta.historico.length > 0 ? (
                                        permuta.historico.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                                <div>
                                                    <p className="font-medium">{item.descricao}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(item.data).toLocaleDateString()} às {new Date(item.data).toLocaleTimeString()}</p>
                                                </div>
                                                <span className="font-bold text-red-600">
                                                    - R$ {parseFloat(item.valor).toFixed(2)}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Nenhum uso registrado.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
