// src/componentsLP/Hero/Hero.js
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./Hero.module.css";

export default function Hero() {
    return (
        <section className={styles.section}>
            {/* Fundo Colorido e Animado */}
            <div className={styles.auroraBackground} />

            <div className={styles.container}>

                {/* --- TEXTO (ESTÁTICO) --- */}
                <div className={styles.textColumn}>

                    <div className={styles.badge}>
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-slate-800">Software para Brechós Inteligentes</span>
                    </div>

                    <h1 className={styles.title}>
                        Gestão completa <br />
                        para quem vive de <br />
                        <span className={styles.gradientText}>moda circular.</span>
                    </h1>

                    <p className={styles.description}>
                        Organize seu estoque, automatize a consignação e venda mais.
                        O <strong>Loja Simples</strong> transforma a complexidade do seu brechó em processos simples e lucrativos.
                    </p>

                    <div className={styles.btnGroup}>
                        <Link href="/dashboard/pedidos/pdv">
                            <button className={styles.btnPrimary}>
                                Começar Grátis
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </Link>
                        <Link href="/dashboard">
                            <button className={styles.btnSecondary}>
                                Ver Demonstração
                            </button>
                        </Link>
                    </div>

                    {/* Feature Highlight */}
                    <div className="mt-12 flex items-center gap-4">
                        <div className="flex -space-x-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">
                                    User
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col">
                            <div className="flex text-yellow-500 gap-0.5">
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                                <Star className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-sm font-semibold text-slate-700">Aprovado por +200 Lojistas</span>
                        </div>
                    </div>
                </div>

                {/* --- GRID DE IMAGENS (3 IMAGENS GRANDES) --- */}
                <div className={styles.visualColumn}>
                    <div className={styles.imageGrid}>

                        {/* 1. Imagem Alta (Esquerda) - Ideal para foto de look completo */}
                        <div className={`${styles.gridCard} ${styles.cardTall}`}>
                            <Image
                                src="/hero/1.png"
                                alt="Look Completo"
                                width={500}
                                height={800}
                                className={styles.imgObj}
                                priority
                            />
                        </div>

                        {/* 2. Imagem Média (Direita Topo) - Ideal para detalhe ou loja */}
                        <div className={`${styles.gridCard} ${styles.cardTop}`}>
                            <Image
                                src="/hero/2.png"
                                alt="Detalhes"
                                width={500}
                                height={400}
                                className={styles.imgObj}
                            />
                        </div>

                        {/* 3. Imagem Média (Direita Baixo) - Ideal para acessórios */}
                        <div className={`${styles.gridCard} ${styles.cardBottom}`}>
                            <Image
                                src="/hero/3.png"
                                alt="Acessórios"
                                width={500}
                                height={400}
                                className={styles.imgObj}
                            />
                        </div>

                    </div>
                </div>

            </div>
        </section>
    );
}