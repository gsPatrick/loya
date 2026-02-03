"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Wallet, History, Calendar, MapPin, CreditCard, Package, Info } from "lucide-react";

export default function DetalhesPessoaPage() {
    const params = useParams();
    const router = useRouter();
    const [pessoa, setPessoa] = useState(null);
    const [permuta, setPermuta] = useState(null);
    const [pecas, setPecas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            loadData();
        }
    }, [params.id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [resPessoa, resPermuta, resPecas] = await Promise.all([
                api.get(`/pessoas/${params.id}`),
                api.get(`/pessoas/${params.id}/saldo-permuta`),
                api.get(`/catalogo/pecas?fornecedorId=${params.id}`)
            ]);
            setPessoa(resPessoa.data);
            setPermuta(resPermuta.data);
            setPecas(Array.isArray(resPecas.data) ? resPecas.data : (resPecas.data?.data || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!pessoa) return <div className="p-10 text-center">Pessoa não encontrada.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-4 border-b pb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight text-primary">{pessoa.nome}</h1>
                        <div className="flex gap-2">
                            {pessoa.is_cliente && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Cliente</Badge>}
                            {pessoa.is_fornecedor && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Fornecedor</Badge>}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{pessoa.email || 'Sem email'} • {pessoa.telefone_whatsapp || 'Sem telefone'}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-muted-foreground uppercase font-bold">ID do Sistema</p>
                    <p className="font-mono text-lg">#{String(pessoa.id).padStart(4, '0')}</p>
                </div>
            </div>

            <Tabs defaultValue="dados" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
                    <TabsTrigger value="dados" className="flex items-center gap-2"><Info className="h-4 w-4" /> Cadastro</TabsTrigger>
                    {pessoa.is_fornecedor && (
                        <TabsTrigger value="pecas" className="flex items-center gap-2"><Package className="h-4 w-4" /> Peças/Estoque</TabsTrigger>
                    )}
                    <TabsTrigger value="permuta" className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Carteira/Saldo</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Personal Info */}
                        <Card>
                            <CardHeader className="flex flex-row items-center gap-3">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle>Informações Gerais</CardTitle>
                                    <CardDescription>Dados básicos e de identificação</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">CPF/CNPJ</p>
                                        <p className="font-medium">{pessoa.cpf_cnpj || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">RG/IE</p>
                                        <p className="font-medium">{pessoa.rg_ie || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Email</p>
                                        <p className="font-medium">{pessoa.email || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">WhatsApp</p>
                                        <p className="font-medium text-green-600">{pessoa.telefone_whatsapp || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Data Nasc.</p>
                                        <p className="font-medium">{pessoa.data_nascimento ? new Date(pessoa.data_nascimento).toLocaleDateString() : '-'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Financial/Supplier Info */}
                        {pessoa.is_fornecedor && (
                            <Card className="border-orange-100">
                                <CardHeader className="flex flex-row items-center gap-3">
                                    <CreditCard className="h-5 w-5 text-orange-500" />
                                    <div>
                                        <CardTitle>Dados de Fornecedor</CardTitle>
                                        <CardDescription>Comissões e pagamentos</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Comissão Padrão</p>
                                            <p className="text-lg font-bold text-orange-600">{pessoa.comissao_padrao || 50}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Dia Fechamento</p>
                                            <p className="font-medium">Todo dia {pessoa.dia_fechamento_pagamento || 15}</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t">
                                        <p className="text-xs font-bold text-muted-foreground uppercase mb-1">Chave PIX (Pagamentos)</p>
                                        <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                                            {pessoa.dados_pix || 'Ainda não informado'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Address */}
                        <Card className="md:col-span-2">
                            <CardHeader className="flex flex-row items-center gap-3">
                                <MapPin className="h-5 w-5 text-primary" />
                                <div>
                                    <CardTitle>Endereço</CardTitle>
                                    <CardDescription>Localização para coletas ou entregas</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {pessoa.endereco ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Rua</p>
                                            <p className="font-medium">{pessoa.endereco.rua}, {pessoa.endereco.numero}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Bairro</p>
                                            <p className="font-medium">{pessoa.endereco.bairro}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">CEP</p>
                                            <p className="font-medium">{pessoa.endereco.cep}</p>
                                        </div>
                                        <div className="space-y-1 md:col-span-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Complemento</p>
                                            <p className="font-medium">{pessoa.endereco.comp || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Cidade/UF</p>
                                            <p className="font-medium">{pessoa.endereco.cidade} / {pessoa.endereco.uf}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Nenhum endereço cadastrado.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="pecas">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Peças Consignadas</CardTitle>
                                <CardDescription>Lista de itens vinculados a este fornecedor</CardDescription>
                            </div>
                            <Badge className="bg-primary text-primary-foreground">{pecas.length} itens</Badge>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Peça</TableHead>
                                        <TableHead>Preço Venda</TableHead>
                                        <TableHead>Comissão</TableHead>
                                        <TableHead>Vlr. Líquido</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pecas.length > 0 ? pecas.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-mono text-xs">#{String(p.id).padStart(4, '0')}</TableCell>
                                            <TableCell>
                                                <div className="font-bold">{p.descricao_curta}</div>
                                                <div className="text-[10px] text-muted-foreground uppercase">{p.marca?.nome} • {p.tamanho?.nome}</div>
                                            </TableCell>
                                            <TableCell>R$ {parseFloat(p.preco_venda || 0).toFixed(2)}</TableCell>
                                            <TableCell>{p.comissao_padrao || 50}%</TableCell>
                                            <TableCell className="font-bold text-green-600">R$ {parseFloat(p.valor_liquido_fornecedor || 0).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Badge variant={p.status === 'DISPONIVEL' ? 'default' : 'secondary'} className="text-[10px]">
                                                    {p.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                                Nenhuma peça vinculada a este fornecedor.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
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
                                <CardDescription className="text-purple-600">Total em créditos para permuta lojista</CardDescription>
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
                                <CardDescription>Movimentações recentes de crédito de permuta</CardDescription>
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
                                        <p className="text-sm text-muted-foreground italic">Nenhum uso registrado até o momento.</p>
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
