// src/app/dashboard/layout.js
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-muted/5">
      {/* Sidebar Desktop (Fixa na esquerda) */}
      <div className="hidden md:block fixed inset-y-0 left-0 z-30 w-[240px] lg:w-[280px] border-r bg-background">
        <Sidebar />
      </div>

      {/* Conteúdo Principal (Empurrado para a direita) */}
      <div className="flex flex-col md:pl-[240px] lg:pl-[280px] min-h-screen transition-all duration-300">
        <Header />

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto w-full space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}