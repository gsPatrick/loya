"use client";

import Link from "next/link";
import { ShoppingBag, Mail, Code2 } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <div className={styles.footerWrapper}>
            <footer className={styles.floatingFooter}>
                <div className={styles.bgDecoration} />

                <div className={styles.grid}>

                    {/* Coluna 1: Marca & Descrição */}
                    <div className={styles.brandColumn}>
                        <div className={styles.logo}>
                            <ShoppingBag className="w-6 h-6 text-teal-400" />
                            <span>TicTag<span className="text-teal-400">.</span></span>
                        </div>
                        <p className={styles.tagline}>
                            O sistema operacional completo para o varejo circular.
                            Simplificamos a gestão do seu brechó para você focar no que importa: vender mais.
                        </p>

                        <div className={styles.contactInfo}>
                            <Mail className="w-4 h-4 text-teal-500" />
                            <a href="mailto:contato@tictag.com.br" className="hover:text-white transition-colors">
                                contato@tictag.com.br
                            </a>
                        </div>
                    </div>

                    {/* Coluna 2: Navegação (Centralizada/Direita) */}
                    <div className={styles.linksColumn}>
                        <h4>Navegação</h4>
                        <ul className={styles.linksList}>
                            <li className={styles.linkItem}><Link href="#recursos">Recursos</Link></li>
                            <li className={styles.linkItem}><Link href="#impacto">Impacto</Link></li>
                            <li className={styles.linkItem}><Link href="#depoimentos">Quem Usa</Link></li>
                            <li className={styles.linkItem}><Link href="#faq">Dúvidas Frequentes</Link></li>
                        </ul>
                    </div>

                </div>

                {/* Barra Inferior */}
                <div className={styles.bottomBar}>
                    <div>
                        &copy; {new Date().getFullYear()} TicTag. Todos os direitos reservados.
                    </div>

                    {/* CRÉDITO DO DESENVOLVEDOR */}
                    <div className={styles.devCredit}>
                        <span>Desenvolvido por</span>
                        <a
                            href="http://codebypatrick.dev/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.devLink}
                        >
                            <Code2 className={styles.codeIcon} />
                            <span className={styles.devName}>Patrick.Developer</span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}