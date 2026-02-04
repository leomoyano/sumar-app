import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';
import { formatARS } from '@/lib/format';

interface Expense {
  id: string;
  name: string;
  amount: number;
  tags: string[];
}

interface ExpensePieChartProps {
  expenses: Expense[];
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  'hsl(var(--secondary))',
];

const ExpensePieChart = ({ expenses }: ExpensePieChartProps) => {
  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      // Usar solo la primera categoría (o "Sin categoría" si no tiene)
      const category = expense.tags.length > 0 ? expense.tags[0] : 'Sin categoría';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return Object.entries(categoryTotals)
      .map(([tag, amount], index) => ({
        tag,
        amount,
        percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : '0',
        fill: COLORS[index % COLORS.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Top 6 para mejor visualización
  }, [expenses]);

  const chartConfig: ChartConfig = chartData.reduce((acc, item, index) => {
    acc[item.tag] = {
      label: item.tag,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChartIcon className="h-4 w-4" />
          Distribución de Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="amount"
              nameKey="tag"
              label={({ tag, percentage }) => `${percentage}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{name}</span>
                      <span>{formatARS(Number(value))}</span>
                    </div>
                  )}
                />
              }
            />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value) => <span className="text-xs">{value}</span>}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ExpensePieChart;
