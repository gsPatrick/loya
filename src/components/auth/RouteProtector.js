"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { canAccessRoute, getDefaultRoute } from "@/lib/permissions";

export function RouteProtector({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [checking, setChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(true);

    useEffect(() => {
        // Skip check for sem-permissao page
        if (pathname === '/dashboard/sem-permissao') {
            setChecking(false);
            setHasAccess(true);
            return;
        }

        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.push('/login');
                return;
            }

            const user = JSON.parse(userStr);
            const role = user.role || 'CAIXA';

            if (!canAccessRoute(role, pathname)) {
                // Redirect to no-permission page
                router.push('/dashboard/sem-permissao');
                setHasAccess(false);
            } else {
                setHasAccess(true);
            }
        } catch (e) {
            console.error('Error checking permissions:', e);
            setHasAccess(true); // Fail open for now
        }

        setChecking(false);
    }, [pathname, router]);

    if (checking) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!hasAccess) {
        return null; // Will redirect
    }

    return children;
}
