// src/app/page.js
"use client";

import Header from "@/componentsLP/Header/Header";
import Hero from "@/componentsLP/Hero/Hero";
import HowItWorks from "@/componentsLP/HowItWorks/HowItWorks";
import Impact from "@/componentsLP/Impact/Impact";
import Testimonials from "@/componentsLP/Testimonials/Testimonials";
import FAQ from "@/componentsLP/FAQ/FAQ"; // <--- Novo
import Footer from "@/componentsLP/Footer/Footer"; // <--- Novo

export default function LandingPage() {
    return (
        <main className="bg-slate-50 min-h-screen w-full overflow-x-hidden selection:bg-teal-500 selection:text-white">
            <Header />
            <Hero />
            <HowItWorks />
            <Impact />
            <Testimonials />
            <FAQ /> {/* <--- Inserido */}
            <Footer /> {/* <--- Inserido */}
        </main>
    );
}