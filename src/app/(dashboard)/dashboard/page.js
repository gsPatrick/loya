"use client";

// src/app/dashboard/page.js
// Build trigger for main branch redeploy

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  PlusCircle,
  Clock,
  Store,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  AlertCircle,
  Package,
  Users,
  Truck,
  AlertTriangle,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

import { useState, useEffect } from "react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { EmptyChartPlaceholder } from "@/components/ui/empty-chart-placeholder";

export default function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expiringPecas, setExpiringPecas] = useState([]);
  const [isReminderOpen, setIsReminderOpen] = useState(false);

  useEffect(() => {
    fetchData();
    fetchExpiringPecas();
  }, []);

  const fetchExpiringPecas = async () => {
    try {
      const res = await api.get('/catalogo/pecas/expirando');
      if (res.data && res.data.length > 0) {
        setExpiringPecas(res.data);
        setIsReminderOpen(true);
      }
    } catch (err) {
      console.error("Erro ao carregar peças expirando:", err);
    }
  };

  const fetchData = async () => {
    try {
      const response = await api.get('/dashboard/resumo');
      setData(response.data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast({ title: "Erro", description: "Erro ao carregar dados do dashboard.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10">Carregando...</div>;
  if (!data) return <div className="p-10">Erro ao carregar dados.</div>;

  const { kpis, vendas7Dias, vendasMes, resumo } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* --- 1. CABEÇALHO DO PAINEL --- */}
      <div className="flex flex-col space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Painel de Controle</h1>
        <p className="text-sm text-muted-foreground">Visão geral da sua loja e movimentações.</p>
      </div>

      {/* --- 2. CARDS DE STATUS (Topo Colorido) --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card Azul - Novas */}
        <Card className="bg-primary text-primary-foreground border-none shadow-md relative overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> NOVAS
              </CardTitle>
              <PlusCircle className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpis.novas || 0}</div>
            <p className="text-xs opacity-80 mt-2">{kpis.novas30d || 0} nos últimos 30 dias</p>
            <p className="text-xs opacity-80">{kpis.novasOntem || 0} ontem</p>
          </CardContent>
        </Card>

        {/* Card Amarelo - Em Autorização */}
        <Card className="bg-yellow-500 text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Clock className="h-4 w-4" /> EM AUTORIZAÇÃO
              </CardTitle>
              <Clock className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpis.emAutorizacao || 0}</div>
            <p className="text-xs opacity-80 mt-2">Aguardando revisão</p>
            <p className="text-xs opacity-80">{kpis.autorizadasOntem || 0} autorizadas ontem</p>
          </CardContent>
        </Card>

        {/* Card Verde - À Venda */}
        <Card className="bg-green-600 text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <Store className="h-4 w-4" /> À VENDA
              </CardTitle>
              <Store className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{kpis.aVenda || 0}</div>
            <p className="text-xs opacity-80 mt-2">Itens disponíveis no estoque</p>
            <p className="text-xs opacity-80">{kpis.aVendaOntem || 0} colocadas à venda ontem</p>
          </CardContent>
        </Card>

        {/* Card Preto/Cinza - Vendidas */}
        <Card className="bg-zinc-800 text-white border-none shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> VENDIDAS (30d)
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 opacity-50" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-4xl font-bold">{kpis.vendidas30d || 0}</div>
              <span className="mb-1 text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded flex items-center">
                <ArrowUp className="h-3 w-3 mr-0.5" /> {kpis.vendidas30d || 0}
              </span>
            </div>
            <p className="text-xs opacity-80 mt-2">Total de vendas no período</p>
            <p className="text-xs opacity-80">100,00% vs ano anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* --- 3. SEÇÃO PRINCIPAL (Gráfico + Resumo) --- */}
      <div className="grid gap-6 md:grid-cols-12">

        {/* Gráfico de Barras (Esquerda - Ocupa 8 colunas) */}
        <Card className="md:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Vendas dos Últimos 7 dias</CardTitle>
                <CardDescription className="text-pink-600 font-medium">
                  (abatidos os descontos e fretes)
                </CardDescription>
              </div>
              <RotateCcw className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              {vendas7Dias && vendas7Dias.length > 0 && vendas7Dias.some(d => d.vendas > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vendas7Dias}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="vendas" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder height="100%" message="Sem vendas nos últimos 7 dias" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Geral (Direita - Ocupa 4 colunas) */}
        <Card className="md:col-span-4 h-full">
          <CardHeader>
            <CardTitle className="text-lg text-purple-600">Resumo Geral</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Item Resumo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Estoque Total</p>
                  <p className="text-[10px] text-muted-foreground max-w-[120px] leading-tight">
                    Inclui: Novas, Em Autorização, À Venda...
                  </p>
                </div>
              </div>
              <span className="font-bold text-lg">{resumo.estoqueTotal || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Valor do Estoque</p>
                  <p className="text-[10px] text-muted-foreground">Valor total em R$</p>
                </div>
              </div>
              <span className="font-bold text-lg">R$ {(resumo.valorEstoque || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Vendas (12 meses)</p>
                  <p className="text-[10px] text-muted-foreground">Faturamento dos últimos 12 meses</p>
                </div>
              </div>
              <span className="font-bold text-lg">R$ {(resumo.vendas12m || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between pl-4 border-l-2 border-green-100">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-bold text-green-700">↳ Faturamento Real</p>
                  <p className="text-[9px] text-muted-foreground">Dinheiro/Pix/Cartão</p>
                </div>
              </div>
              <span className="font-bold text-sm text-green-700">R$ {(resumo.vendas12mReal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between pl-4 border-l-2 border-purple-100">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-bold text-purple-700">↳ Faturamento Permuta</p>
                  <p className="text-[9px] text-muted-foreground">Voucher/Crédito</p>
                </div>
              </div>
              <span className="font-bold text-sm text-purple-700">R$ {(resumo.vendas12mPermuta || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-full text-red-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Saídas (12 meses)</p>
                  <p className="text-[10px] text-muted-foreground">Despesas e pagamentos</p>
                </div>
              </div>
              <span className="font-bold text-lg">R$ {(resumo.saidas12m || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                  <BanknoteIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Repasses (12 meses)</p>
                  <p className="text-[10px] text-muted-foreground">Pagamentos a fornecedores</p>
                </div>
              </div>
              <span className="font-bold text-lg">R$ {(resumo.repasses12m || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Fornecedores</p>
                  <p className="text-[10px] text-muted-foreground">Cadastrados</p>
                </div>
              </div>
              <span className="font-bold text-lg">{resumo.fornecedores || 0}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Clientes</p>
                  <p className="text-[10px] text-muted-foreground">Cadastrados</p>
                </div>
              </div>
              <span className="font-bold text-lg">{resumo.clientes || 0}</span>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* --- 4. SEÇÃO INFERIOR (Gráfico Curvo + Notificações) --- */}
      <div className="grid gap-6 md:grid-cols-12">

        {/* Gráfico de Evolução (Curvo) */}
        <Card className="md:col-span-8">
          <CardHeader>
            <CardTitle>Quantidade de Peças Vendidas por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {vendasMes && vendasMes.length > 0 && vendasMes.some(d => d.vendas > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vendasMes}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="vendas"
                      stroke="var(--color-primary)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorVendas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChartPlaceholder height="100%" message="Sem histórico de vendas mensal" />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Últimas Notificações</CardTitle>
            <span className="text-xs text-purple-600 cursor-pointer hover:underline">Ver tudo</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(data.notificacoes || []).map((notif, i) => (
                <div key={i} className="flex gap-4">
                  <div className="min-w-[60px] text-xs font-medium text-muted-foreground text-right">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex gap-3">
                    <div className="relative mt-1">
                      <div className="absolute top-0 left-[3px] h-full w-[2px] bg-muted -z-10" />
                      <div className={`h-2 w-2 rounded-full border-2 bg-background ${notif.tipo === 'ALERTA' ? 'border-yellow-500' : 'border-primary'}`} />
                    </div>
                    <p className="text-xs text-purple-700 font-medium leading-snug">
                      {notif.mensagem}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* --- 5. MODAL DE LEMBRETE DO DIA --- */}
      <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-amber-600 mb-2">
              <AlertTriangle className="h-6 w-6" />
              <DialogTitle className="text-xl">Lembrete do Dia: Peças Expirando</DialogTitle>
            </div>
            <CardDescription>
              As seguintes peças em consignação ultrapassaram o prazo de 60 dias e precisam ser devolvidas ou renegociadas.
            </CardDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {expiringPecas.map((peca) => (
              <div key={peca.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{peca.descricao_curta}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">{peca.codigo_etiqueta}</Badge>
                      <span className="text-xs text-muted-foreground">Entrada: {new Date(peca.data_entrada).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{peca.fornecedor?.nome}</p>
                  <p className="text-[10px] text-muted-foreground">{peca.fornecedor?.telefone_whatsapp}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReminderOpen(false)}>Lembrar mais tarde</Button>
            <Button onClick={() => window.location.href = '/dashboard/cadastros/etiquetas'}>Ir para Etiquetas</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Icon helper para o ícone de dinheiro que faltou no import acima
function BanknoteIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  )
}