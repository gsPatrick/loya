
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api from "@/services/api";

const SystemThemeContext = createContext({});

export function useSystemTheme() {
    return useContext(SystemThemeContext);
}

export function SystemThemeProvider({ children, initialColor, initialLogo, initialName }) {
    const [themeConfig, setThemeConfig] = useState({
        SYSTEM_COLOR_PRIMARY: initialColor || null,
        SYSTEM_LOGO: initialLogo || null,
        SYSTEM_NAME: initialName || 'Loya'
    });

    useEffect(() => {
        // Fetch if any critical config is missing
        if (!initialColor || !initialName || !initialLogo) {
            fetchAndApplyConfig();
        }

        window.addEventListener('systemConfigUpdated', fetchAndApplyConfig);
        return () => window.removeEventListener('systemConfigUpdated', fetchAndApplyConfig);
    }, [initialColor, initialName, initialLogo]);

    const fetchAndApplyConfig = async () => {
        try {
            // We can now use the public endpoint here too if we want, or keep the admin one if auth is available.
            // Since this runs on client, let's try public first to avoid auth issues if token is missing.
            let response;
            try {
                response = await api.get('/public/system-config');
            } catch (e) {
                // Fallback to admin if public fails (though public should work)
                response = await api.get('/admin/configuracoes');
            }

            const configMap = {};
            response.data.forEach(conf => {
                configMap[conf.chave] = conf.valor;
            });

            setThemeConfig(prev => ({
                ...prev,
                ...configMap
            }));

            const primaryColor = configMap['SYSTEM_COLOR_PRIMARY'];
            if (primaryColor) {
                applyTheme(primaryColor);
            }
        } catch (error) {
            console.error("Erro ao carregar tema:", error);
        }
    };

    const applyTheme = (color) => {
        const root = document.documentElement;
        // Apply to primary variables
        root.style.setProperty('--primary', color);
        root.style.setProperty('--ring', color);
        root.style.setProperty('--sidebar-primary', color);
        root.style.setProperty('--sidebar-ring', color);
    };

    return (
        <SystemThemeContext.Provider value={{ themeConfig, refreshConfig: fetchAndApplyConfig }}>
            {children}
        </SystemThemeContext.Provider>
    );
}

