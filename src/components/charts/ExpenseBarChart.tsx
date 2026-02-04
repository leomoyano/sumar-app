import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { formatARS } from '@/lib/format';

interface Expense {
  id: string;
  name: string;
  amount: number;
  tags: string[];
}

interface ExpenseBarChartProps {
  expenses: Expense[];
}

const ExpenseBarChart = ({ expenses }: ExpenseBarChartProps) => {
  const chartData = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      // Usar solo la primera categoría (o "Sin categoría" si no tiene)
      const category = expense.tags.length > 0 ? expense.tags[0] : 'Sin categoría';
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount;
    });

    return Object.entries(categoryTotals)
      .map(([tag, amount]) => ({
        tag,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 categorías
  }, [expenses]);

  const chartConfig: ChartConfig = {
    amount: {
      label: 'Monto',
      color: 'hsl(var(--primary))',
    },
  };

  if (expenses.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Gastos por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" tickFormatter={(value) => formatARS(value)} fontSize={11} />
            <YAxis 
              type="category" 
              dataKey="tag" 
              width={80} 
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => formatARS(Number(value))}
                />
              }
            />
            <Bar 
              dataKey="amount" 
              fill="var(--color-amount)" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ExpenseBarChart;
