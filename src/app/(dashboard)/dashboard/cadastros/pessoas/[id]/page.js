"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Wallet, History, Calendar, MapPin, CreditCard, Package, Info, Users, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, FileText, Download, Eye, FilePlus, Printer, FileSpreadsheet, File } from "lucide-react";
import * as XLSX from 'xlsx';

export default function DetalhesPessoaPage() {
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const [pessoa, setPessoa] = useState(null);
    const [permuta, setPermuta] = useState(null);
    const [pecas, setPecas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Edit/Delete State
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editForm, setEditForm] = useState(null);

    // Selection/Export State
    const [selectedPecas, setSelectedPecas] = useState([]);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [contractToRename, setContractToRename] = useState(null);
    const [newName, setNewName] = useState("");

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

    const openEdit = () => {
        setEditForm({
            nome: pessoa.nome || "",
            cpf_cnpj: pessoa.cpf_cnpj || "",
            email: pessoa.email || "",
            telefone_whatsapp: pessoa.telefone_whatsapp || "",
            rg_ie: pessoa.rg_ie || "",
            data_nascimento: pessoa.data_nascimento || "",
            comissao_padrao: pessoa.comissao_padrao || 50,
            dados_pix: pessoa.dados_pix || "",
            is_cliente: pessoa.is_cliente,
            is_fornecedor: pessoa.is_fornecedor,
            endereco: {
                cep: pessoa.endereco?.cep || "",
                rua: pessoa.endereco?.rua || "",
                numero: pessoa.endereco?.numero || "",
                bairro: pessoa.endereco?.bairro || "",
                cidade: pessoa.endereco?.cidade || "",
                uf: pessoa.endereco?.uf || "",
                comp: pessoa.endereco?.comp || ""
            }
        });
        setIsEditOpen(true);
    };

    const handleUpdate = async () => {
        try {
            const res = await api.put(`/pessoas/${params.id}`, editForm);
            setPessoa(res.data);
            setIsEditOpen(false);
            toast({
                title: "Sucesso",
                description: "Dados atualizados com sucesso.",
                className: "bg-primary text-white border-none"
            });
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Falha ao atualizar dados.", variant: "destructive" });
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/pessoas/${params.id}`);
            toast({ title: "Excluído", description: "Pessoa removida com sucesso.", variant: "destructive" });
            router.push('/dashboard/cadastros/pessoas');
        } catch (err) {
            console.error(err);
            toast({ title: "Erro", description: "Falha ao excluir registro.", variant: "destructive" });
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('foto', file);

        try {
            const res = await api.post(`/pessoas/${params.id}/foto`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPessoa(res.data);
            toast({ title: "Sucesso", description: "Foto atualizada!" });
        } catch (err) {
            toast({ title: "Erro", description: "Falha ao enviar foto.", variant: "destructive" });
        }
    };

    const handleContractUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('contrato', file);
        formData.append('nome_exibicao', file.name);

        try {
            await api.post(`/pessoas/${params.id}/contratos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast({ title: "Sucesso", description: "Contrato enviado!" });
            loadData(); // Reload to get updated contract list
        } catch (err) {
            toast({ title: "Erro", description: "Falha ao enviar contrato.", variant: "destructive" });
        }
    };

    const handleDeleteContract = async (id) => {
        if (!confirm("Deseja realmente excluir este contrato?")) return;
        try {
            await api.delete(`/pessoas/contratos/${id}`);
            toast({ title: "Sucesso", description: "Contrato removido!" });
            loadData();
        } catch (err) {
            toast({ title: "Erro", description: "Falha ao excluir contrato." });
        }
    };

    const handleRenameContract = async () => {
        try {
            await api.put(`/pessoas/contratos/${contractToRename.id}`, { nome_exibicao: newName });
            toast({ title: "Sucesso", description: "Contrato renomeado!" });
            setIsRenameOpen(false);
            loadData();
        } catch (err) {
            toast({ title: "Erro", description: "Falha ao renomear contrato." });
        }
    };

    // Selection Logic
    const togglePecaSelection = (id) => {
        setSelectedPecas(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleAllPecas = () => {
        if (selectedPecas.length === pecas.length) {
            setSelectedPecas([]);
        } else {
            setSelectedPecas(pecas.map(p => p.id));
        }
    };

    // Export Logic
    const exportExcel = () => {
        const dataToExport = pecas.filter(p => selectedPecas.includes(p.id));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport.map(p => ({
            ID: p.id,
            Descricao: p.descricao_curta,
            Marca: p.marca?.nome,
            Tamanho: p.tamanho?.nome,
            Preco_Venda: p.preco_venda,
            Comissao: p.comissao_padrao,
            Valor_Liquido: p.valor_liquido_fornecedor,
            Status: p.status
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Peças");
        XLSX.writeFile(workbook, `pecas_fornecedor_${pessoa.id}.xlsx`);
    };

    const handlePrintPecas = () => {
        const dataToPrint = pecas.filter(p => selectedPecas.includes(p.id));
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Impressão de Peças - ${pessoa.nome}</title>
                    <style>
                        table { width: 100%; border-collapse: collapse; font-family: sans-serif; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #f4f4f4; }
                        h1 { font-family: sans-serif; }
                    </style>
                </head>
                <body>
                    <h1>Lista de Peças - ${pessoa.nome}</h1>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Peça</th>
                                <th>Preço Venda</th>
                                <th>Comissão</th>
                                <th>Vlr Líquido</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dataToPrint.map(p => `
                                <tr>
                                    <td>#${p.id}</td>
                                    <td>${p.descricao_curta} (${p.marca?.nome})</td>
                                    <td>R$ ${parseFloat(p.preco_venda).toFixed(2)}</td>
                                    <td>${p.comissao_padrao}%</td>
                                    <td>R$ ${parseFloat(p.valor_liquido_fornecedor).toFixed(2)}</td>
                                    <td>${p.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    if (loading) return <div className="p-10 flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
    if (!pessoa) return <div className="p-10 text-center">Pessoa não encontrada.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex items-center gap-4 border-b pb-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="relative group">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src={pessoa.foto} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                            {pessoa.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="photo-upload"
                        className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform opacity-0 group-hover:opacity-100"
                    >
                        <Camera className="h-3 w-3" />
                        <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                    </label>
                </div>

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
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openEdit} className="gap-2">
                        <Edit className="h-4 w-4" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(true)} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" /> Excluir
                    </Button>
                </div>
                <div className="text-right ml-4">
                    <p className="text-xs text-muted-foreground uppercase font-bold">ID do Sistema</p>
                    <p className="font-mono text-lg">#{String(pessoa.id).padStart(4, '0')}</p>
                </div>
            </div>

            <Tabs defaultValue="dados" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 md:w-[800px] md:grid-cols-4">
                    <TabsTrigger value="dados" className="flex items-center gap-2"><Info className="h-4 w-4" /> Cadastro</TabsTrigger>
                    {pessoa.is_fornecedor && (
                        <TabsTrigger value="pecas" className="flex items-center gap-2"><Package className="h-4 w-4" /> Peças/Estoque</TabsTrigger>
                    )}
                    {pessoa.is_fornecedor && (
                        <TabsTrigger value="contratos" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Contratos</TabsTrigger>
                    )}
                    <TabsTrigger value="permuta" className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Carteira/Saldo</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Personal Info */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex flex-row items-center gap-3">
                                    <Users className="h-5 w-5 text-primary" />
                                    <div>
                                        <CardTitle>Informações Gerais</CardTitle>
                                        <CardDescription>Dados básicos e de identificação</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={openEdit} className="h-8 gap-1 text-primary">
                                    <Edit className="h-3.5 w-3.5" /> Editar
                                </Button>
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
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex flex-row items-center gap-3">
                                        <CreditCard className="h-5 w-5 text-orange-500" />
                                        <div>
                                            <CardTitle>Dados de Fornecedor</CardTitle>
                                            <CardDescription>Comissões e pagamentos</CardDescription>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={openEdit} className="h-8 gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                                        <Edit className="h-3.5 w-3.5" /> Editar
                                    </Button>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Comissão Padrão</p>
                                            <p className="text-lg font-bold text-orange-600">{pessoa.comissao_padrao || 50}%</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Dia Fechamento</p>
                                            <p className="font-medium">Último dia do mês</p>
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
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex flex-row items-center gap-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <div>
                                        <CardTitle>Endereço</CardTitle>
                                        <CardDescription>Localização para coletas ou entregas</CardDescription>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={openEdit} className="h-8 gap-1 text-primary">
                                    <Edit className="h-3.5 w-3.5" /> Editar
                                </Button>
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
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Peças Consignadas</CardTitle>
                                <CardDescription>Lista de itens vinculados a este fornecedor</CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedPecas.length > 0 && (
                                    <>
                                        <Button variant="outline" size="sm" onClick={exportExcel} className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                                            <FileSpreadsheet className="h-4 w-4" /> Excel
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handlePrintPecas} className="gap-2">
                                            <Printer className="h-4 w-4" /> Imprimir / PDF
                                        </Button>
                                    </>
                                )}
                                <Badge className="bg-primary text-primary-foreground">{pecas.length} itens</Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[50px]">
                                            <Checkbox checked={selectedPecas.length === pecas.length && pecas.length > 0} onCheckedChange={toggleAllPecas} />
                                        </TableHead>
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
                                        <TableRow key={p.id} className={selectedPecas.includes(p.id) ? "bg-primary/5" : ""}>
                                            <TableCell>
                                                <Checkbox checked={selectedPecas.includes(p.id)} onCheckedChange={() => togglePecaSelection(p.id)} />
                                            </TableCell>
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

                <TabsContent value="contratos">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Contratos e Anexos</CardTitle>
                                <CardDescription>Documentos digitalizados e contratos firmados</CardDescription>
                            </div>
                            <label className="cursor-pointer">
                                <Button variant="default" className="gap-2" asChild>
                                    <span><Upload className="h-4 w-4" /> Adicionar Anexo</span>
                                </Button>
                                <input type="file" className="hidden" onChange={handleContractUpload} />
                            </label>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {pessoa.contratos && pessoa.contratos.length > 0 ? (
                                    pessoa.contratos.map((c) => (
                                        <Card key={c.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                                            <div className="p-4 flex items-start gap-4">
                                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <FileText className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold truncate text-sm" title={c.nome_exibicao}>{c.nome_exibicao}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{c.mimetype?.split('/')[1] || 'DOC'} • {(c.tamanho / 1024).toFixed(1)} KB</p>
                                                    <p className="text-[10px] text-muted-foreground">Adicionado em {new Date(c.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="bg-muted/50 px-2 py-1 flex justify-end gap-1 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => window.open(c.caminho.startsWith('http') ? c.caminho : `http://localhost:3001/${c.caminho.replace(/\\/g, '/')}`, '_blank')}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                                                    setContractToRename(c);
                                                    setNewName(c.nome_exibicao);
                                                    setIsRenameOpen(true);
                                                }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteContract(c.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full py-10 text-center border-2 border-dashed rounded-lg">
                                        <FilePlus className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground">Nenhum contrato anexado.</p>
                                        <label className="text-primary hover:underline cursor-pointer mt-2 block text-sm">
                                            Clique aqui para enviar o primeiro
                                            <input type="file" className="hidden" onChange={handleContractUpload} />
                                        </label>
                                    </div>
                                )}
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

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Editar Cadastro</DialogTitle>
                    </DialogHeader>
                    {editForm && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome Completo</Label>
                                    <Input value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value.toUpperCase() })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>CPF/CNPJ</Label>
                                    <Input value={editForm.cpf_cnpj} onChange={e => setEditForm({ ...editForm, cpf_cnpj: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp</Label>
                                    <Input value={editForm.telefone_whatsapp} onChange={e => setEditForm({ ...editForm, telefone_whatsapp: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>RG/IE</Label>
                                    <Input value={editForm.rg_ie} onChange={e => setEditForm({ ...editForm, rg_ie: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Data Nascimento</Label>
                                    <Input type="date" value={editForm.data_nascimento} onChange={e => setEditForm({ ...editForm, data_nascimento: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg mt-2">
                                <Label>Tipo de Cadastro</Label>
                                <div className="flex gap-6">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_cliente"
                                            checked={editForm.is_cliente}
                                            onCheckedChange={(checked) => setEditForm({ ...editForm, is_cliente: !!checked })}
                                        />
                                        <Label htmlFor="is_cliente" className="font-normal cursor-pointer">Cliente</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_fornecedor"
                                            checked={editForm.is_fornecedor}
                                            onCheckedChange={(checked) => setEditForm({ ...editForm, is_fornecedor: !!checked })}
                                        />
                                        <Label htmlFor="is_fornecedor" className="font-normal cursor-pointer">Fornecedor</Label>
                                    </div>
                                </div>
                            </div>

                            {pessoa.is_fornecedor && (
                                <>
                                    <h4 className="font-bold border-b pb-1 mt-4">Dados de Fornecedor</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Comissão Padrão (%)</Label>
                                            <Input type="number" value={editForm.comissao_padrao} onChange={e => setEditForm({ ...editForm, comissao_padrao: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Chave PIX</Label>
                                            <Input value={editForm.dados_pix} onChange={e => setEditForm({ ...editForm, dados_pix: e.target.value })} />
                                        </div>
                                    </div>
                                </>
                            )}

                            <h4 className="font-bold border-b pb-1 mt-4">Endereço</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>CEP</Label>
                                    <Input value={editForm.endereco.cep} onChange={e => setEditForm({ ...editForm, endereco: { ...editForm.endereco, cep: e.target.value } })} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Rua</Label>
                                    <Input value={editForm.endereco.rua} onChange={e => setEditForm({ ...editForm, endereco: { ...editForm.endereco, rua: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Número</Label>
                                    <Input value={editForm.endereco.numero} onChange={e => setEditForm({ ...editForm, endereco: { ...editForm.endereco, numero: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Bairro</Label>
                                    <Input value={editForm.endereco.bairro} onChange={e => setEditForm({ ...editForm, endereco: { ...editForm.endereco, bairro: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cidade</Label>
                                    <Input value={editForm.endereco.cidade} onChange={e => setEditForm({ ...editForm, endereco: { ...editForm.endereco, cidade: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>UF</Label>
                                    <Input value={editForm.endereco.uf} onChange={e => setEditForm({ ...editForm, endereco: { ...editForm.endereco, uf: e.target.value } })} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Complemento</Label>
                                    <Input value={editForm.endereco.comp} onChange={e => setEditForm({ ...editForm, endereco: { ...editForm.endereco, comp: e.target.value } })} />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
                        <Button onClick={handleUpdate}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Excluir Cadastro</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Tem certeza que deseja excluir permanentemente o cadastro de <strong>{pessoa.nome}</strong>?</p>
                        <p className="text-sm text-muted-foreground mt-2">Esta ação não pode ser desfeita e removerá todos os vínculos desta pessoa.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
                        <Button variant="destructive" onClick={handleDelete}>Confirmar Exclusão</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Contract Modal */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renomear Documento</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label>Nome do Documento</Label>
                        <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Contrato de Consignação 2024" />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancelar</Button>
                        <Button onClick={handleRenameContract}>Salvar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
