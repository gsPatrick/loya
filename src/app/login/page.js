// src/app/login/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowLeft, ShoppingBag, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useSystemTheme } from "@/components/providers/SystemThemeProvider"; // Importando o tema do cliente

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { themeConfig } = useSystemTheme(); // Pegando config do cliente (Logo e Cor)

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // Estado para disparar a animação
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Configurações visuais do cliente (Fallback para Loja Simples padrão)
  const systemLogo = themeConfig?.SYSTEM_LOGO || null;
  const primaryColor = themeConfig?.SYSTEM_COLOR_PRIMARY || "hsl(var(--primary))";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${'https://jackbear-backend-apilojasimples-revestese.r954jc.easypanel.host/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Sucesso!
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 1. Dispara a animação "UAU"
        setIsSuccess(true);

        // 2. Aguarda a animação acontecer (1.8s) antes de ir para o dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1800);

      } else {
        toast({ title: "Acesso Negado", description: data.error || "Credenciais inválidas.", variant: "destructive" });
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({ title: "Erro de Conexão", description: "Verifique sua internet.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex overflow-hidden bg-slate-50">

      {/* --- ANIMAÇÃO DE SAÍDA (LOGIN SUCESSO -> DASHBOARD) --- */}
      <AnimatePresence>
        {isSuccess && (
          <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-end">

            {/* Camada 1: Tecido Branco (Sobe rápido) */}
            <motion.div
              initial={{ height: "0%" }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              className="absolute bottom-0 w-full bg-slate-100 z-10"
            />

            {/* Camada 2: A Cor da Marca (Sobe um pouco depois, cobrindo tudo) */}
            <motion.div
              initial={{ height: "0%" }}
              animate={{ height: "100%" }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
              className="absolute bottom-0 w-full z-20 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: primaryColor }} // Usa a cor do cliente
            >
              {/* Textura de fundo sutil (Linhas de costura) */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
            </motion.div>

            {/* Elemento Central: A Logo/Etiqueta caindo e balançando */}
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center"
              initial={{ y: -1000, rotate: -15, opacity: 0 }}
              animate={{
                y: "-50%",
                rotate: 0,
                opacity: 1,
                transition: {
                  type: "spring",
                  damping: 12,
                  stiffness: 100,
                  delay: 0.6
                }
              }}
            >
              {/* O "Fio" da etiqueta segurando a logo */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "50vh" }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute bottom-full left-1/2 w-0.5 bg-white/50 -translate-x-1/2"
              />

              {/* O Card da Logo (Parece uma etiqueta física) */}
              <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 relative border-t-8 border-white/50">
                {/* Furo da etiqueta */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-800 rounded-full border-2 border-white/50 shadow-inner" />

                {systemLogo ? (
                  <img src={systemLogo} alt="Logo" className="h-16 w-auto object-contain" />
                ) : (
                  <ShoppingBag className="w-16 h-16 text-slate-800" />
                )}

                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
                  Carregando Loja...
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>


      {/* --- O RESTO DA PÁGINA (NÃO ALTERADO VISUALMENTE) --- */}

      {/* Cortina Inicial (Entrada na página) */}
      <motion.div
        className="fixed inset-0 bg-slate-900 z-[9998]"
        initial={{ y: "0%" }}
        animate={{ y: "-100%" }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
      />

      {/* Coluna Esquerda */}
      <motion.div
        className="hidden lg:block relative w-1/2 h-screen bg-slate-900"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
      >
        <Image
          src="/login/login.png"
          alt="Login Loja Simples"
          fill
          className="object-cover opacity-90"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80" />
        <div className="absolute bottom-16 left-16 right-16 z-20 text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-teal-500/20 p-2 rounded-lg backdrop-blur-md border border-teal-500/30">
                <ShoppingBag className="w-6 h-6 text-teal-300" />
              </div>
              <span className="font-bold text-xl tracking-tight">Loya System</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Gerencie seu brechó com <span className="text-teal-400">inteligência.</span>
            </h2>
            <p className="text-slate-300 text-lg max-w-md">
              Acompanhe vendas, estoque e consignações em tempo real.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Coluna Direita (Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
        <motion.div
          className="absolute top-8 left-8"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1 }}
        >
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao site
          </Link>
        </motion.div>

        <motion.div
          className="w-full max-w-[400px] space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center lg:text-left">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bem-vindo de volta</h1>
            <p className="mt-2 text-slate-500">
              Entre com suas credenciais para acessar o painel.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="patrick@gmail.com"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 bg-white border-slate-200 focus-visible:ring-teal-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link href="/forgot-password" class="text-xs font-medium text-teal-600 hover:text-teal-700">Esqueceu a senha?</Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="h-12 pr-10 bg-white border-slate-200 focus-visible:ring-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="data-[state=checked]:bg-teal-600 border-slate-300" />
              <label htmlFor="remember" className="text-sm font-medium text-slate-500 cursor-pointer">Lembrar neste dispositivo</label>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-slate-900 hover:bg-teal-600 text-white shadow-lg transition-all"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Entrando...</> : "Acessar Sistema"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            Ainda não tem conta? <Link href="/register" className="font-bold text-teal-600 hover:text-teal-700">Criar conta grátis</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}