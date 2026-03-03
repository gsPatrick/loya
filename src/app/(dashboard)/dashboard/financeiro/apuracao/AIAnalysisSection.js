import {
    Info,
    Lightbulb,
    BarChart3,
    AlertTriangle,
    Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AIAnalysisSection({ data }) {
    if (!data) return null;

    const receitaLiquida = data.receitaTotal - data.totalDevolucoes;
    const resultado = data.lucroLiquido;
    const margemOperacional = receitaLiquida > 0 ? (resultado / receitaLiquida) * 100 : 0;
    const resultadoPercent = receitaLiquida > 0 ? (resultado / receitaLiquida) * 100 : 0;

    const isCritical = resultado < 0;
    const statusColor = isCritical ? "red" : "blue";
    const statusText = isCritical ? "crítica" : "saudável";

    return (
        <div className="space-y-6 mt-8">

            {/* Disclaimer Banner */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 items-start">
                <Info className="h-5 w-5 text-gray-500 mt-0.5 shrink-0" />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-gray-700">Análises Geradas por Inteligência Artificial</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        As análises, alertas e recomendações apresentadas são geradas por IA especializada em varejo circular. Estamos continuamente aprendendo e aprimorando nossas recomendações. Embora trabalhemos com alta probabilidade de acerto, <strong>utilize essas informações como pontos para reflexão</strong> e sempre considere suas experiências e contexto específico antes de tomar decisões estratégicas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna 1: Alertas e Oportunidades */}
                <Card className="border-t-4 border-t-primary shadow-sm h-full">
                    <CardHeader className="pb-3 border-b border-gray-100">
                        <CardTitle className="text-base font-bold text-primary">
                            Alertas e Oportunidades
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">

                        {/* Diagnóstico Geral */}
                        <div className={`bg-${statusColor}-50 border-l-4 border-${statusColor}-500 p-4 rounded-r-md`}>
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className={`h-4 w-4 text-${statusColor}-700`} />
                                <h4 className={`text-sm font-bold text-${statusColor}-800`}>Diagnóstico Geral</h4>
                            </div>
                            <p className={`text-sm text-${statusColor}-700 mb-3`}>
                                A receita operacional líquida é R$ {receitaLiquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, resultando em um resultado de R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, o que indica uma situação financeira {statusText}.
                            </p>
                            <div className="space-y-1">
                                <p className={`text-xs font-bold text-${statusColor}-800`}>Pontos de Atenção:</p>
                                <ul className={`list-disc pl-5 text-xs text-${statusColor}-700 space-y-1`}>
                                    <li>Margem operacional de {margemOperacional.toFixed(2)}% {margemOperacional < 25 ? "está abaixo" : "está acima"} do mínimo setorial de 25%.</li>
                                    <li>Resultado de R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} representa {resultadoPercent.toFixed(2)}% da receita líquida.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Oportunidade */}
                        {isCritical && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                                <p className="text-sm font-bold text-red-800 mb-2">
                                    Oportunidade: Resultado negativo indica necessidade de revisão.
                                </p>
                                <p className="text-sm text-red-700 italic mb-2">
                                    Recomendação: Revisar e otimizar as despesas imediatamente.
                                </p>
                                <p className="text-xs text-red-400">
                                    Prioridade: o mais cedo que puder
                                </p>
                            </div>
                        )}

                    </CardContent>
                </Card>

                {/* Coluna 2: Recomendações Estratégicas */}
                <Card className="border-t-4 border-t-primary shadow-sm h-full">
                    <CardHeader className="pb-3 border-b border-gray-100">
                        <CardTitle className="text-base font-bold text-primary">
                            Recomendações Estratégicas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">

                        {/* Recomendação 1 */}
                        <div className="bg-gray-50 border-l-4 border-primary/50 p-4 rounded-r-md h-full">
                            <div className="flex items-center gap-2 mb-3">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                <h4 className="text-sm font-bold text-primary">Implementar modelo de consignação</h4>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <p>
                                    <span className="text-gray-500">Impacto:</span> <span className="font-medium text-gray-800">Aumento na variedade de produtos e engajamento dos fornecedores.</span>
                                </p>
                                <p>
                                    <span className="text-gray-500">Prazo:</span> <span className="font-medium text-gray-800">3 meses</span>
                                </p>
                                <p className="leading-relaxed">
                                    <span className="font-bold text-gray-800">Justificativa:</span> Com base nos dados atuais, é importante migrar para um modelo de consignação que possibilite repasses de 35-40% para melhorar o mix de produtos e o relacionamento com os fornecedores.
                                </p>
                            </div>
                        </div>

                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
