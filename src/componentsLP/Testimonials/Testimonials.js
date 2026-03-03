// src/componentsLP/Testimonials/Testimonials.js
"use client";

import { Quote } from "lucide-react";
import styles from "./Testimonials.module.css";

// Dados reais fornecidos
const testimonials = [
    {
        name: "Katia Zanetti",
        role: "Maria Fofura Brechó",
        text: "O controle de estoque em tempo real facilita decisões rápidas. Os relatórios detalhados oferecem uma visão clara do desempenho. O sistema Loja Simples é crucial para o sucesso do nosso brechó."
    },
    {
        name: "Rayanne",
        role: "Rare Brechó",
        text: "Hoje tenho tudo que preciso. Organização, trabalhar online, facilidade de contato com fornecedoras. A satisfação e confiança que sentimos não tem preço."
    },
    {
        name: "Gláucia Baruch",
        role: "Compritchas Brechó",
        text: "Considero fundamental. Hoje só recebo elogios de minhas clientes e fornecedoras sobre a qualidade dos meus controles e organização. E tudo com muito mais tempo livre."
    },
    {
        name: "Lika",
        role: "New Again",
        text: "Conseguimos organizar melhor nosso estoque, agilizar o atendimento e aumentar nossas vendas. O sistema é intuitivo e tem sido fundamental para o crescimento."
    },
    {
        name: "Kris",
        role: "J'adore Boutique Brechó",
        text: "Não consigo ver a J’adore sem o sistema. Funcionalidade essencial para gestão de consignação. As fornecedoras amam o aplicativo pela transparência."
    },
    {
        name: "Taís Shimizu",
        role: "Carrossel Reutilize",
        text: "Cada dia fico mais perplexa com tanta atualização! Quando idealizo algo, eles já estão botando em prática. Sistema que facilita a minha vida diariamente."
    },
    {
        name: "Ana Duleh",
        role: "Ana Duleh BreXó",
        text: "Surpresa com tudo que ele oferecia. Quando percebi que meu tempo com planilhas seria resolvido e minhas fornecedoras acompanhariam suas vendas no app, não pensei duas vezes."
    },
    {
        name: "Daniela Prado",
        role: "Mundo Poopiss Brechó",
        text: "A melhor solução que encontrei. Fazia tudo no papel, mas para crescer precisei do Loja Simples. É uma ferramenta completa e o app para fornecedoras ajuda muito na autonomia."
    }
];

export default function Testimonials() {
    return (
        <section id="depoimentos" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Quem usa, recomenda</h2>
                <p className={styles.subtitle}>
                    Junte-se a centenas de brechós que transformaram sua gestão e ganharam liberdade.
                </p>
            </div>

            <div className={styles.marqueeContainer}>

                {/* Track 1 (Original) */}
                <div className={styles.track}>
                    {testimonials.map((t, i) => (
                        <div key={i} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>
                                    {t.name.charAt(0)}
                                </div>
                                <div className={styles.authorInfo}>
                                    <h4>{t.name}</h4>
                                    <span>{t.role}</span>
                                </div>
                                <Quote className={`w-6 h-6 ${styles.quoteIcon}`} fill="currentColor" />
                            </div>
                            <p className={styles.quote}>&quot;{t.text}&quot;</p>
                        </div>
                    ))}
                </div>

                {/* Track 2 (Duplicata para Loop Infinito) */}
                <div className={styles.track} aria-hidden="true">
                    {testimonials.map((t, i) => (
                        <div key={`dup-${i}`} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.avatar}>
                                    {t.name.charAt(0)}
                                </div>
                                <div className={styles.authorInfo}>
                                    <h4>{t.name}</h4>
                                    <span>{t.role}</span>
                                </div>
                                <Quote className={`w-6 h-6 ${styles.quoteIcon}`} fill="currentColor" />
                            </div>
                            <p className={styles.quote}>&quot;{t.text}&quot;</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}