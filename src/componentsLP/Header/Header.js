// src/componentsLP/Header/Header.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, LogIn, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./Header.module.css";

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLoginClick = (e) => {
        e.preventDefault();
        setIsNavigating(true);

        // Tempo um pouco maior para apreciar a animação do logo (1.2s)
        setTimeout(() => {
            router.push("/login");
        }, 1200);
    };

    return (
        <>
            <header className={`${styles.headerWrapper} ${isScrolled ? styles.scrolled : ""}`}>
                <div className={styles.navContainer}>

                    <Link href="/" className={styles.logo}>
                        <div className="bg-teal-50 p-2 rounded-xl border border-teal-100">
                            <ShoppingBag className="w-5 h-5 text-teal-600" />
                        </div>
                        <span>Loja Simples<span className="text-teal-500">.</span></span>
                    </Link>

                    <nav className={styles.navLinks}>
                        <Link href="#recursos" className={styles.link}>Recursos</Link>
                        <Link href="#impacto" className={styles.link}>Impacto</Link>
                        <Link href="#depoimentos" className={styles.link}>Quem usa</Link>
                        <Link href="#faq" className={styles.link}>Dúvidas</Link>
                    </nav>

                    <div className={styles.actions}>
                        <Button
                            onClick={handleLoginClick}
                            className="bg-slate-900 text-white hover:bg-teal-600 rounded-full px-6 h-10 font-bold shadow-lg shadow-slate-900/10 transition-all hover:scale-105 flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" />
                            Acessar
                        </Button>
                    </div>
                </div>
            </header>

            {/* --- CINE-TRANSITION --- */}
            <AnimatePresence>
                {isNavigating && (
                    <div className={styles.overlayContainer}>

                        {/* Camada 1: Acento (Amarelo) - Passa rápido */}
                        <motion.div
                            className={`${styles.curtain} ${styles.curtainAccent}`}
                            initial={{ y: "100%" }}
                            animate={{ y: "-100%" }}
                            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                        />

                        {/* Camada 2: Luz (Branco) - Limpa a visão */}
                        <motion.div
                            className={`${styles.curtain} ${styles.curtainLight}`}
                            initial={{ y: "100%" }}
                            animate={{ y: "-100%" }}
                            transition={{ duration: 0.9, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
                        />

                        {/* Camada 3: Marca (Slate Escuro) - Fica na tela */}
                        <motion.div
                            className={`${styles.curtain} ${styles.curtainPrimary}`}
                            initial={{ y: "100%" }}
                            animate={{ y: "0%" }} // Fica parada cobrindo a tela
                            exit={{ y: "0%" }} // Mantém no exit para o próximo componente assumir
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
                        >
                            {/* Logo Animado no Centro */}
                            <motion.div
                                className={styles.transitionLogo}
                                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
                            >
                                <div className={styles.transitionIconBox}>
                                    <ShoppingBag className="w-10 h-10 text-teal-400" strokeWidth={1.5} />
                                </div>
                                <div className="flex flex-col items-center">
                                    <h1 className="text-3xl font-bold tracking-tight text-white">Loja Simples</h1>
                                    <div className="flex items-center gap-2 text-teal-400 text-sm font-medium">
                                        <Sparkles className="w-3 h-3 animate-spin-slow" />
                                        <span>Moda Circular Inteligente</span>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                )}
            </AnimatePresence>
        </>
    );
}