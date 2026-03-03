'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import CategoryModal from './CategoryModal';
import { Trash2, Plus } from 'lucide-react';

// Schema Validation
const productSchema = z.object({
    name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    description: z.string().optional(),
    price: z.coerce.number().min(0.01, 'Preço deve ser maior que 0'),
    sku: z.string().min(1, 'SKU é obrigatório'),
    stock: z.coerce.number().min(0, 'Estoque não pode ser negativo'),
    categoryId: z.string().min(1, 'Categoria é obrigatória'),

    // Shipping
    weight: z.coerce.number().min(0.001, 'Peso é obrigatório (kg)'),
    height: z.coerce.number().min(1, 'Altura é obrigatória (cm)'),
    width: z.coerce.number().min(1, 'Largura é obrigatória (cm)'),
    length: z.coerce.number().min(1, 'Comprimento é obrigatório (cm)'),

    is_accessory: z.boolean().default(false),

    // Variations
    is_variable: z.boolean().default(false),
    options: z.array(z.object({
        name: z.string(),
        values: z.array(z.string())
    })).optional(),
    variations: z.array(z.object({
        sku: z.string(),
        price: z.coerce.number(),
        stock: z.coerce.number(),
        attributes: z.record(z.string())
    })).optional()
});

export default function ProductForm({ initialData }) {
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('basic');

    const form = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            name: '',
            description: '',
            price: 0,
            sku: '',
            stock: 0,
            categoryId: '',
            weight: 0,
            height: 0,
            width: 0,
            length: 0,
            is_variable: false,
            options: [],
            variations: [],
            is_accessory: false
        }
    });

    const { register, control, handleSubmit, watch, setValue, formState: { errors } } = form;
    const isVariable = watch('is_variable');

    // Fetch Categories
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await api.get('/categories');
            return res.data;
        }
    });

    // Mutation
    const mutation = useMutation({
        mutationFn: async (data) => {
            if (initialData?.id) {
                return api.put(`/products/${initialData.id}`, data);
            }
            return api.post('/products', data);
        },
        onSuccess: () => {
            toast({ title: 'Produto salvo com sucesso!' });
            router.push('/products');
        },
        onError: (err) => {
            toast({
                title: 'Erro ao salvar',
                description: err.response?.data?.error || 'Erro desconhecido',
                variant: 'destructive'
            });
        }
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    // Variation Logic
    const { fields: optionFields, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: "options"
    });

    // Generate Variations Matrix
    const generateVariations = () => {
        const options = form.getValues('options');
        if (!options || options.length === 0) return;

        // Cartesian product of option values
        const cartesian = (...a) => a.reduce((a, b) => a.flatMap(d => b.map(e => [d, e].flat())));

        const valueArrays = options.map(opt => opt.values.filter(v => v)); // Filter empty
        if (valueArrays.some(arr => arr.length === 0)) return;

        const combinations = valueArrays.length > 1 ? cartesian(...valueArrays) : valueArrays[0].map(v => [v]);

        const newVariations = combinations.map(combo => {
            const attributes = {};
            options.forEach((opt, idx) => {
                attributes[opt.name] = Array.isArray(combo) ? combo[idx] : combo;
            });

            // Generate SKU suffix
            const suffix = Object.values(attributes).join('-').toUpperCase();
            const baseSku = form.getValues('sku') || 'PROD';

            return {
                sku: `${baseSku}-${suffix}`,
                price: form.getValues('price'),
                stock: 0,
                attributes
            };
        });

        setValue('variations', newVariations);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{initialData ? 'Editar Produto' : 'Novo Produto'}</h1>
                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button type="submit" disabled={mutation.isPending}>
                        {mutation.isPending ? 'Salvando...' : 'Salvar Produto'}
                    </Button>
                </div>
            </div>

            {initialData?.brechoId && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="pt-6 flex items-center gap-4">
                        <div className="bg-blue-100 p-2 rounded-full">
                            🔄
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900">Produto Integrado ao Brechó</h3>
                            <p className="text-sm text-blue-700">
                                Vinculado ao ID: #{initialData.brechoId} - SKU: {initialData.sku}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Básico</TabsTrigger>
                    <TabsTrigger value="shipping">Frete & Dimensões</TabsTrigger>
                    <TabsTrigger value="variations">Variações</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* BASIC INFO */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader><CardTitle>Informações Principais</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Nome do Produto</Label>
                                    <Input {...register('name')} placeholder="Ex: Camiseta Oversized" />
                                    {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>SKU (Código Único)</Label>
                                    <Input {...register('sku')} placeholder="Ex: CAM-001" />
                                    {errors.sku && <span className="text-red-500 text-sm">{errors.sku.message}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descrição</Label>
                                <Textarea {...register('description')} rows={5} />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Preço (R$)</Label>
                                    <Input type="number" step="0.01" {...register('price')} />
                                    {errors.price && <span className="text-red-500 text-sm">{errors.price.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Estoque Inicial</Label>
                                    <Input type="number" {...register('stock')} disabled={isVariable} />
                                    {isVariable && <span className="text-xs text-muted-foreground">Gerenciado nas variações</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Categoria</Label>
                                    <div className="flex gap-2">
                                        <Controller
                                            control={control}
                                            name="categoryId"
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map(cat => (
                                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                                {cat.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        <CategoryModal onCategoryCreated={(newCat) => setValue('categoryId', newCat.id.toString())} />
                                    </div>
                                    {errors.categoryId && <span className="text-red-500 text-sm">{errors.categoryId.message}</span>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-4">
                                <Checkbox
                                    id="is_accessory"
                                    checked={watch('is_accessory')}
                                    onCheckedChange={(checked) => setValue('is_accessory', checked)}
                                />
                                <Label htmlFor="is_accessory">Este produto é um Acessório?</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SHIPPING */}
                <TabsContent value="shipping" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader><CardTitle>Dimensões para Frete</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Peso (kg)</Label>
                                <Input type="number" step="0.001" {...register('weight')} />
                                {errors.weight && <span className="text-red-500 text-sm">{errors.weight.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Altura (cm)</Label>
                                <Input type="number" {...register('height')} />
                                {errors.height && <span className="text-red-500 text-sm">{errors.height.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Largura (cm)</Label>
                                <Input type="number" {...register('width')} />
                                {errors.width && <span className="text-red-500 text-sm">{errors.width.message}</span>}
                            </div>
                            <div className="space-y-2">
                                <Label>Comprimento (cm)</Label>
                                <Input type="number" {...register('length')} />
                                {errors.length && <span className="text-red-500 text-sm">{errors.length.message}</span>}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* VARIATIONS */}
                <TabsContent value="variations" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Variações de Produto</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_variable"
                                        checked={isVariable}
                                        onCheckedChange={(checked) => setValue('is_variable', checked)}
                                    />
                                    <Label htmlFor="is_variable">Este produto tem variações?</Label>
                                </div>
                            </div>
                        </CardHeader>
                        {isVariable && (
                            <CardContent className="space-y-6">
                                {/* Options Definition */}
                                <div className="space-y-4">
                                    {optionFields.map((field, index) => (
                                        <div key={field.id} className="flex gap-4 items-end border p-4 rounded-md">
                                            <div className="space-y-2 flex-1">
                                                <Label>Nome da Opção (Ex: Cor)</Label>
                                                <Input {...register(`options.${index}.name`)} placeholder="Cor" />
                                            </div>
                                            <div className="space-y-2 flex-[2]">
                                                <Label>Valores (Separados por vírgula)</Label>
                                                <Input
                                                    placeholder="Azul, Vermelho, Verde"
                                                    onChange={(e) => {
                                                        const vals = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                                                        setValue(`options.${index}.values`, vals);
                                                    }}
                                                />
                                            </div>
                                            <Button type="button" variant="destructive" size="icon" onClick={() => removeOption(index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={() => appendOption({ name: '', values: [] })}>
                                        <Plus className="mr-2 h-4 w-4" /> Adicionar Opção
                                    </Button>
                                    <Button type="button" onClick={generateVariations}>Gerar Combinações</Button>
                                </div>

                                {/* Generated Matrix */}
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Combinações Geradas</h3>
                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="p-2">Variação</th>
                                                    <th className="p-2">SKU</th>
                                                    <th className="p-2">Preço</th>
                                                    <th className="p-2">Estoque</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {watch('variations')?.map((variation, index) => (
                                                    <tr key={index} className="border-t">
                                                        <td className="p-2 font-medium">
                                                            {Object.values(variation.attributes).join(' / ')}
                                                        </td>
                                                        <td className="p-2">
                                                            <Input {...register(`variations.${index}.sku`)} className="h-8" />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input type="number" step="0.01" {...register(`variations.${index}.price`)} className="h-8" />
                                                        </td>
                                                        <td className="p-2">
                                                            <Input type="number" {...register(`variations.${index}.stock`)} className="h-8" />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {(!watch('variations') || watch('variations').length === 0) && (
                                            <div className="p-4 text-center text-muted-foreground">Nenhuma variação gerada ainda.</div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </TabsContent>

                {/* SEO */}
                <TabsContent value="seo" className="space-y-4 mt-4">
                    <Card>
                        <CardHeader><CardTitle>Otimização para Buscas (SEO)</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Meta Title</Label>
                                <Input placeholder="Título que aparece no Google" />
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Description</Label>
                                <Textarea placeholder="Descrição curta para resultados de busca" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </form>
    );
}
