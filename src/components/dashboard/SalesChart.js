"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

// Dados mocados para o gráfico
const data = [
  { name: "10h", total: Math.floor(Math.random() * 2000) + 500 },
  { name: "11h", total: Math.floor(Math.random() * 3000) + 1000 },
  { name: "12h", total: Math.floor(Math.random() * 5000) + 2000 },
  { name: "13h", total: Math.floor(Math.random() * 4500) + 2500 },
  { name: "14h", total: Math.floor(Math.random() * 4000) + 2000 },
  { name: "15h", total: Math.floor(Math.random() * 3000) + 1500 },
  { name: "19h", total: Math.floor(Math.random() * 4800) + 3000 },
  { name: "20h", total: Math.floor(Math.random() * 5500) + 3500 },
  { name: "21h", total: Math.floor(Math.random() * 5200) + 3200 },
  { name: "22h", total: Math.floor(Math.random() * 4000) + 2000 },
];

export default function SalesChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${value / 1000}k`}
        />
        <Tooltip
          cursor={{ fill: "rgba(128, 128, 128, 0.1)" }}
          contentStyle={{ 
            backgroundColor: "rgba(255, 255, 255, 0.8)", 
            border: "1px solid #ccc",
            borderRadius: "0.5rem"
          }}
        />
        <Bar dataKey="total" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}