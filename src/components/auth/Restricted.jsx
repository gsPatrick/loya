"use client";

import { useState, useEffect, cloneElement } from "react";
import AccessDeniedModal from "./AccessDeniedModal";

export default function Restricted({ roles = [], children, fallback = null }) {
    const [userRole, setUserRole] = useState(null);
    const [isDeniedOpen, setIsDeniedOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserRole(user.role);
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }, []);

    if (!isClient) return null; // Avoid hydration mismatch

    const hasPermission = userRole && (roles.includes(userRole) || userRole === 'ADMIN');

    if (hasPermission) {
        return children;
    }

    // If fallback is provided (e.g. null to hide), return it
    if (fallback !== undefined) {
        return fallback;
    }

    // Otherwise, render children but intercept click
    const handleIntercept = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeniedOpen(true);
    };

    return (
        <>
            <div onClickCapture={handleIntercept} className="inline-block">
                {children}
            </div>
            <AccessDeniedModal
                isOpen={isDeniedOpen}
                onClose={() => setIsDeniedOpen(false)}
            />
        </>
    );
}
