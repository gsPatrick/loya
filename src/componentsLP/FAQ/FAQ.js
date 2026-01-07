"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import styles from "./FAQ.module.css";

const faqs = [
    {
        q: "Preciso instalar algo no meu computador?",
        a: "Não! O Loja Simples é 100% na nuvem. Você acessa pelo navegador de qualquer computador, tablet ou celular, sem ocupar espaço e sem instalações complicadas."
    },
    {
        q: "O sistema funciona para brechós pequenos?",
        a: "Sim. Temos o plano Básico ideal para quem está iniciando, mas que já quer organização profissional. Você pode mudar de plano conforme seu negócio cresce."
    },
    {
        q: "Como funciona o App para Fornecedoras?",
        a: "É um grande diferencial. Suas fornecedoras baixam o app e acompanham o saldo a receber e peças vendidas em tempo real. Isso elimina centenas de mensagens de WhatsApp perguntando 'já vendeu?'."
    },
    {
        q: "Consigo emitir Nota Fiscal?",
        a: "Com certeza. No plano Total, você conta com emissão de NFC-e (Cupom Fiscal) e NF-e de forma integrada e simples, atendendo à legislação do seu estado."
    },
    {
        q: "Tem fidelidade ou multa de cancelamento?",
        a: "Não. Acreditamos na qualidade do nosso sistema. Você pode cancelar a qualquer momento sem multas ou letras miúdas."
    },
    {
        q: "Como funciona o suporte?",
        a: "Temos suporte integrado ao sistema e também via WhatsApp. Nossa equipe é especializada em varejo circular e entende as dores do seu negócio."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0); // Primeiro aberto por padrão

    return (
        <section className={styles.section}>
            <div className={styles.container}>

                <div className={styles.header}>
                    <h2 className={styles.title}>Dúvidas Frequentes</h2>
                    <p className={styles.subtitle}>
                        Tudo o que você precisa saber para começar a usar o Loja Simples hoje mesmo.
                    </p>
                </div>

                <div className={styles.accordion}>
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx;

                        return (
                            <div
                                key={idx}
                                className={styles.item}
                                data-open={isOpen}
                            >
                                <button
                                    className={styles.trigger}
                                    onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                                >
                                    <span className={styles.question}>{faq.q}</span>
                                    <ChevronDown className={styles.icon} />
                                </button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className={styles.content}
                                        >
                                            <div className={styles.answer}>{faq.a}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.supportLink}>
                    Ainda tem dúvidas?{" "}
                    <span className={styles.whatsappLink}>Fale com nosso suporte no WhatsApp</span>
                </div>

            </div>
        </section>
    );
}