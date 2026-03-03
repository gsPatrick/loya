'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Assuming hook exists or standard shadcn

const categorySchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório'),
    slug: z.string().optional(),
});

export default function CategoryModal({ onCategoryCreated }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(categorySchema)
    });

    const mutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/categories', data);
            return response.data;
        },
        onSuccess: (newCategory) => {
            queryClient.invalidateQueries(['categories']);
            toast({ title: 'Categoria criada com sucesso' });
            setOpen(false);
            reset();
            if (onCategoryCreated) {
                onCategoryCreated(newCategory);
            }
        },
        onError: (error) => {
            toast({
                title: 'Erro ao criar categoria',
                description: error.response?.data?.error || 'Erro desconhecido',
                variant: 'destructive'
            });
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                    <Plus className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nova Categoria</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" {...register('name')} placeholder="Ex: Camisetas" />
                        {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
