import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatARS } from './format';

interface Expense {
  name: string;
  amount: number;
  tags: string[];
}

interface ExportOptions {
  tableName: string;
  expenses: Expense[];
  language: 'es' | 'en';
  previousMonthTotal?: number;
}

interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
}

const getCategorySummary = (expenses: Expense[], isSpanish: boolean): CategorySummary[] => {
  const fallbackCategory = isSpanish ? 'Sin categoria' : 'No category';
  const totalsByCategory = new Map<string, number>();
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  expenses.forEach((expense) => {
    const category = expense.tags.length > 0 ? expense.tags[0] : fallbackCategory;
    totalsByCategory.set(category, (totalsByCategory.get(category) ?? 0) + expense.amount);
  });

  return [...totalsByCategory.entries()]
    .map(([category, amount]) => ({
      category,
      total: amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
};

export const exportTableToPdf = ({ tableName, expenses, language, previousMonthTotal }: ExportOptions) => {
  const doc = new jsPDF();
  const isSpanish = language === 'es';
  const today = new Date().toLocaleDateString(isSpanish ? 'es-AR' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const totalARS = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const averageTicket = expenses.length > 0 ? totalARS / expenses.length : 0;
  const categorySummary = getCategorySummary(expenses, isSpanish);
  const hasPreviousMonth = typeof previousMonthTotal === 'number';
  const deltaAmount = hasPreviousMonth ? totalARS - previousMonthTotal : 0;
  const deltaPercent = hasPreviousMonth && previousMonthTotal !== 0
    ? (deltaAmount / previousMonthTotal) * 100
    : 0;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SUMAR', 105, 18, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(isSpanish ? 'Reporte de gastos mensuales' : 'Monthly expense report', 105, 25, {
    align: 'center',
  });
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(tableName, 105, 34, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${isSpanish ? 'Generado' : 'Generated'}: ${today}`, 105, 41, { align: 'center' });
  doc.setTextColor(0);
  doc.setDrawColor(220);
  doc.line(14, 46, 196, 46);

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 50, 182, 24, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(isSpanish ? 'TOTAL GENERAL' : 'GRAND TOTAL', 18, 57);
  doc.text(isSpanish ? 'CANTIDAD DE GASTOS' : 'EXPENSE COUNT', 82, 57);
  doc.text(isSpanish ? 'TICKET PROMEDIO' : 'AVERAGE TICKET', 143, 57);
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(formatARS(totalARS), 18, 66);
  doc.text(String(expenses.length), 82, 66);
  doc.text(formatARS(averageTicket), 143, 66);

  let currentY = 83;
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(isSpanish ? 'Top categorias del mes' : 'Top categories this month', 14, currentY);
  currentY += 5;

  if (categorySummary.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      isSpanish ? 'Todavia no hay categorias para mostrar.' : 'No categories to display yet.',
      14,
      currentY + 3,
    );
    currentY += 10;
  } else {
    categorySummary.forEach((item) => {
      const maxBarWidth = 42;
      const barWidth = Math.max(2, Math.round((item.percentage / 100) * maxBarWidth));
      doc.setFontSize(9);
      doc.setTextColor(60);
      doc.text(item.category, 14, currentY + 4);
      doc.text(formatARS(item.total), 170, currentY + 4, { align: 'right' });
      doc.text(`${item.percentage.toFixed(1)}%`, 196, currentY + 4, { align: 'right' });
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(76, currentY, maxBarWidth, 4, 1, 1, 'F');
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(76, currentY, barWidth, 4, 1, 1, 'F');
      currentY += 7;
    });
  }

  currentY += 3;
  doc.setFontSize(11);
  doc.setTextColor(30);
  doc.text(isSpanish ? 'Comparacion mensual' : 'Monthly comparison', 14, currentY);
  currentY += 6;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, currentY - 4, 182, 15, 2, 2, 'F');
  if (!hasPreviousMonth) {
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(
      isSpanish
        ? 'Sin datos historicos todavia. La comparacion se habilita desde el segundo mes.'
        : 'No historical data yet. Monthly comparison is available from month two onward.',
      18,
      currentY + 2,
    );
  } else {
    doc.setFontSize(9);
    doc.setTextColor(90);
    doc.text(
      isSpanish ? 'Vs. mes anterior:' : 'Vs. previous month:',
      18,
      currentY + 2,
    );
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(deltaAmount > 0 ? 185 : 16, deltaAmount > 0 ? 28 : 120, deltaAmount > 0 ? 28 : 60);
    const variationLabel = deltaAmount > 0
      ? (isSpanish ? 'Subio' : 'Increased')
      : deltaAmount < 0
        ? (isSpanish ? 'Bajo' : 'Decreased')
        : (isSpanish ? 'Sin cambios' : 'No change');
    const deltaPrefix = deltaAmount > 0 ? '+' : '';
    doc.text(
      `${variationLabel} ${deltaPrefix}${formatARS(deltaAmount)} (${deltaPercent.toFixed(1)}%)`,
      18,
      currentY + 8,
    );
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
  }

  const tableData = expenses.map((expense) => {
    const category = expense.tags.length > 0 ? expense.tags[0] : (isSpanish ? 'Sin categoria' : 'No category');
    return [expense.name, category, formatARS(expense.amount)];
  });

  autoTable(doc, {
    startY: currentY + 16,
    head: [[
      isSpanish ? 'Nombre' : 'Name',
      isSpanish ? 'Categoria' : 'Category',
      isSpanish ? 'Monto (ARS)' : 'Amount (ARS)',
    ]],
    body: tableData,
    foot: [['TOTAL', '', formatARS(totalARS)]],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left',
    },
    footStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 92 },
      1: { cellWidth: 50 },
      2: { halign: 'right', cellWidth: 40 },
    },
  });

  const fileName = `${tableName.replace(/\s+/g, '_')}_${isSpanish ? 'gastos' : 'expenses'}.pdf`;
  doc.save(fileName);
};
