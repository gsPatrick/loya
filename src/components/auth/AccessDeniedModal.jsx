"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function AccessDeniedModal({ isOpen, onClose }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" /> Acesso Negado
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        Seu perfil não possui permissão para realizar esta ação.
                        <br />
                        Entre em contato com o administrador se acreditar que isso é um erro.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={onClose} variant="secondary">
                        Entendi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
