 import jsPDF from 'jspdf';
 import autoTable from 'jspdf-autotable';
 import { formatARS, formatUSD, convertARStoUSD } from './format';
 
 interface Expense {
   name: string;
   amount: number;
   amountUSD?: number;
   tags: string[];
 }
 
 interface ExportOptions {
   tableName: string;
   expenses: Expense[];
   rate: number;
   language: 'es' | 'en';
 }
 
 export const exportTableToPdf = ({ tableName, expenses, rate, language }: ExportOptions) => {
   const doc = new jsPDF();
   
   const isSpanish = language === 'es';
   const today = new Date().toLocaleDateString(isSpanish ? 'es-AR' : 'en-US', {
     day: '2-digit',
     month: '2-digit',
     year: 'numeric'
   });
 
   // Header
   doc.setFontSize(20);
   doc.setFont('helvetica', 'bold');
   doc.text('SUMAR - ' + (isSpanish ? 'Gastos Mensuales' : 'Monthly Expenses'), 105, 20, { align: 'center' });
   
   doc.setFontSize(16);
   doc.setFont('helvetica', 'normal');
   doc.text(tableName, 105, 30, { align: 'center' });
   
   doc.setFontSize(10);
   doc.setTextColor(100);
   doc.text(`${isSpanish ? 'Generado' : 'Generated'}: ${today}`, 105, 38, { align: 'center' });
   doc.setTextColor(0);
 
   // Calculate totals
   const totalARS = expenses.reduce((sum, exp) => sum + exp.amount, 0);
   const totalUSD = convertARStoUSD(totalARS, rate);
 
   // Table data
   const tableData = expenses.map(expense => {
     const category = expense.tags.length > 0 ? expense.tags[0] : (isSpanish ? 'Sin categoría' : 'No category');
     const usdAmount = expense.amountUSD ?? convertARStoUSD(expense.amount, rate);
     
     return [
       expense.name,
       category,
       formatARS(expense.amount),
       formatUSD(usdAmount)
     ];
   });
 
  // Add table
  autoTable(doc, {
    startY: 45,
    head: [[
      isSpanish ? 'Nombre' : 'Name',
      isSpanish ? 'Categoría' : 'Category',
      isSpanish ? 'Monto (ARS)' : 'Amount (ARS)',
      isSpanish ? 'Monto (USD)' : 'Amount (USD)'
    ]],
    body: tableData,
    foot: [[
      'TOTAL',
      '',
      formatARS(totalARS),
      formatUSD(totalUSD)
    ]],
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'left'
    },
    footStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 40 },
      2: { halign: 'right', cellWidth: 40 },
      3: { halign: 'right', cellWidth: 40 }
    }
  });

  // Add exchange rate note at the bottom
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Draw a subtle box for the note
  doc.setDrawColor(200);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, finalY - 5, 182, 18, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(
    isSpanish ? 'Nota:' : 'Note:',
    18,
    finalY + 3
  );
  doc.setTextColor(60);
  doc.text(
    `${isSpanish ? 'Los valores en USD fueron calculados con la cotización del Dólar Blue del día' : 'USD values were calculated using the Blue Dollar exchange rate'}: ${formatARS(rate)}`,
    18,
    finalY + 9
  );
 
   // Save the PDF
   const fileName = tableName.replace(/\s+/g, '_') + '_' + (isSpanish ? 'gastos' : 'expenses') + '.pdf';
   doc.save(fileName);
 };