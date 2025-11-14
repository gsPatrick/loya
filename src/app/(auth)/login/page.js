// src/app/(auth)/login/page.js
"use client"

import { useState } from 'react';
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthInput } from "@/components/auth/AuthInput";

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      // O AuthContext cuidará do redirecionamento
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-3xl font-bold text-[#151928]">Acesse sua conta</CardTitle>
        <CardDescription className="text-base pt-2">Bem vindo de volta!</CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="p-0 space-y-5">
          <AuthInput id="email" label="E-mail" type="email" placeholder="seu@email.com" required onChange={handleChange} />
          <AuthInput id="password" label="Senha" type="password" required onChange={handleChange} />
          {error && <p className="text-sm text-red-600 pt-2">{error}</p>}
          <div className="flex justify-end pt-1">
            <Link href="/forgot-password" className="text-sm font-medium text-[#151928] hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-5 p-0 mt-8">
          <Button type="submit" disabled={loading} className="w-full bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 text-white font-semibold h-10">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Não tem uma conta? </span>
            <Link href="/registro" className="font-medium text-[#151928] hover:underline">
              Crie sua conta
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}