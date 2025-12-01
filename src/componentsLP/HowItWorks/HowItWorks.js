// src/componentsLP/HowItWorks/HowItWorks.js
"use client";

import { motion } from "framer-motion";
import {
    Store,
    Users,
    LayoutGrid,
    FileBarChart,
    Smartphone,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import styles from "./HowItWorks.module.css";

// Dados das Features (Baseado no sistema real)
const features = [
    {
        id: 1,
        title: "PDV Ágil & Integrado",
        text: "Frente de caixa rápida. Venda em segundos, aplique descontos e controle o caixa em tempo real. Tudo integrado.",
        icon: Store,
        styleClass: "cardTeal", // Gradiente Verde-Azulado
        colSpan: "span2",
    },
    {
        id: 2,
        title: "Gestão de Consignação",
        text: "Controle automático de repasses. Suas fornecedoras acompanham tudo pelo app exclusivo.",
        icon: Users,
        styleClass: "cardPurple", // Gradiente Roxo
        colSpan: "span1",
    },
    {
        id: 3,
        title: "Matriz de Estoque",
        text: "Visão térmica do seu acervo. Identifique furos na grade e excessos por categoria.",
        icon: LayoutGrid,
        styleClass: "cardBlue", // Gradiente Azul
        colSpan: "span1",
    },
    {
        id: 4,
        title: "DRE & Financeiro Real",
        text: "Apuração automática de resultado (DRE). Saiba exatamente seu lucro líquido, separando custos e despesas.",
        icon: FileBarChart,
        styleClass: "cardDark", // Gradiente Escuro
        colSpan: "span1",
    },
    {
        id: 5,
        title: "App & Precificação IA",
        text: "Cadastre peças pelo celular com sugestão de preço via IA. Agilidade que seu brechó precisa.",
        icon: Smartphone,
        styleClass: "cardOrange", // Gradiente Laranja
        colSpan: "span1",
    }
];

// Animações
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function HowItWorks() {
    return (
        <section id="recursos" className={styles.section}>
            <div className={styles.blobBackground} />

            <div className={styles.container}>

                {/* Header */}
                <motion.div
                    className={styles.header}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <span className={styles.badge}>
                        <Sparkles className="w-3 h-3" /> Sistema Completo
                    </span>
                    <h2 className={styles.title}>
                        Tudo o que seu brechó precisa <br />
                        <span className={styles.titleHighlight}>em um só lugar.</span>
                    </h2>
                    <p className={styles.subtitle}>
                        Funcionalidades reais, desenvolvidas especificamente para a complexidade do varejo circular. Do cadastro à gestão financeira.
                    </p>
                </motion.div>

                {/* Bento Grid Colorido */}
                <motion.div
                    className={styles.bentoGrid}
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={fadeUp}
                            className={`${styles.bentoCard} ${styles[feature.styleClass]} ${styles[feature.colSpan]}`}
                        >
                            {/* Elemento Decorativo de Fundo */}
                            <div className={styles.decorCircle} />

                            <div className={styles.cardHeader}>
                                <div className={styles.iconWrapper}>
                                    <feature.icon strokeWidth={1.5} />
                                </div>
                                <h3 className={styles.cardTitle}>{feature.title}</h3>
                                <p className={styles.cardText}>{feature.text}</p>
                            </div>

                            {/* Seta discreta no hover (opcional, visual cue) */}
                            <div className="mt-6 flex justify-end opacity-80">
                                <ArrowRight className="w-6 h-6 text-white" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Simples */}
                <div className="flex justify-center mt-8">
                    <Button className="h-14 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold shadow-xl transition-all hover:scale-105">
                        Ver todos os recursos
                    </Button>
                </div>

            </div>
        </section>
    );
}