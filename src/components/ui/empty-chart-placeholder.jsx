import { BarChart2 } from "lucide-react";

export function EmptyChartPlaceholder({ message = "Sem dados para exibir no período", height = "300px" }) {
    return (
        <div
            className="w-full flex flex-col items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200"
            style={{ height }}
        >
            <div className="bg-gray-100 p-4 rounded-full mb-3">
                <BarChart2 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">{message}</p>
            <p className="text-xs text-gray-400 mt-1">Tente alterar os filtros ou o período</p>
        </div>
    );
}
