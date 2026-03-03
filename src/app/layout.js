// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-international-phone/style.css';
import { Toaster } from "@/components/ui/toaster"; // <--- Importar aqui
import { SystemThemeProvider } from "@/components/providers/SystemThemeProvider";
import { API_URL } from "@/services/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Loja Simples - Gestão de Brechós", // Atualizei o título para ficar correto
  description: "Sistema de Gestão Inteligente",
};

export default async function RootLayout({ children }) {
  let primaryColor = null;
  let systemLogo = null;
  let systemName = null;

  try {
    // Fetch public config from backend
    // Note: We use fetch here because axios interceptors in api.js might rely on window/localStorage
    const res = await fetch(`${API_URL}/public/system-config`, {
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    if (res.ok) {
      const configs = await res.json();
      const colorConfig = configs.find(c => c.chave === 'SYSTEM_COLOR_PRIMARY');
      const logoConfig = configs.find(c => c.chave === 'SYSTEM_LOGO');
      const nameConfig = configs.find(c => c.chave === 'SYSTEM_NAME');

      if (colorConfig) primaryColor = colorConfig.valor;
      if (logoConfig) systemLogo = logoConfig.valor;
      if (nameConfig) systemName = nameConfig.valor;
    }
  } catch (error) {
    console.error("Failed to fetch system config:", error);
  }

  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={primaryColor ? {
          '--primary': primaryColor,
          '--ring': primaryColor,
          '--sidebar-primary': primaryColor,
          '--sidebar-ring': primaryColor
        } : {}}
      >
        <SystemThemeProvider
          initialColor={primaryColor}
          initialLogo={systemLogo}
          initialName={systemName}
        >
          {children}
          <Toaster />
        </SystemThemeProvider>
      </body>
    </html>
  );
}