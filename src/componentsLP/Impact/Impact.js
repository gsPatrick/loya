"use client";

import { motion } from "framer-motion";
import { Leaf, DollarSign, RefreshCw, ShoppingBag } from "lucide-react";
import styles from "./Impact.module.css";

const stats = [
    {
        icon: RefreshCw,
        value: "+500k",
        label: "Peças Circularizadas",
        delay: 0
    },
    {
        icon: DollarSign,
        value: "R$ 15M+",
        label: "Gerados para Lojistas",
        delay: 0.1
    },
    {
        icon: ShoppingBag,
        value: "+200",
        label: "Brechós Parceiros",
        delay: 0.2
    },
    {
        icon: Leaf,
        value: "~50 Ton",
        label: "CO₂ Evitado Estimado",
        delay: 0.3
    }
];

export default function Impact() {
    return (
        <section id="impacto" className={styles.section}>
            <div className={styles.aurora} />

            <div className={styles.container}>
                <div className={styles.grid}>

                    {/* Texto Esquerda */}
                    <motion.div
                        className={styles.textContent}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className={styles.label}>Impacto Real</span>
                        <h2 className={styles.title}>
                            Tecnologia que gera lucro e <br />
                            <span className="text-teal-400">preserva o futuro.</span>
                        </h2>
                        <p className={styles.description}>
                            O TicTag não é apenas um sistema, é um motor de crescimento para o varejo circular.
                            Ajudamos brechós a escalar suas operações enquanto reduzimos o desperdício têxtil global.
                        </p>
                    </motion.div>

                    {/* Stats Direita */}
                    <div className={styles.statsGrid}>
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                className={styles.statCard}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: stat.delay, duration: 0.6 }}
                            >
                                <stat.icon className={`w-6 h-6 ${styles.icon}`} />
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}