// src/utils/pdfGenerator.ts

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Portfolio, Signal } from '../types/portfolio';

/**
 * Generates a PDF report for a given portfolio and triggers a download.
 *
 * @param portfolio - The portfolio data to include in the report.
 * @param signals   - A map of ticker symbols to their advisory signals.
 */
export function createReport(
  portfolio: Portfolio,
  signals: Record<string, Signal>
): void {
  try {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(18);
    doc.text('Portfolio Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Client: ${portfolio.clientName}`, 14, 32);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

    // Table columns
    const columns = ['Ticker', 'Quantity', 'Avg Cost', 'Current Price', 'Signal'];

    // Table rows
    const rows = portfolio.holdings.map((h) => {
      const signal = signals[h.ticker] ?? 'N/A';
      return [
        h.ticker,
        h.quantity.toString(),
        typeof h.avgCost === 'number' ? h.avgCost.toFixed(2) : `${h.avgCost}`,
        typeof h.currentPrice === 'number'
          ? h.currentPrice.toFixed(2)
          : `${h.currentPrice}`,
        typeof signal === 'string' ? signal : `${signal}`,
      ];
    });

    // Add the table
    (doc as any).autoTable({
      head: [columns],
      body: rows,
      startY: 50,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 10 },
    });

    // Save the PDF
    const safeClientName = portfolio.clientName.replace(/\s+/g, '_');
    const fileName = `${safeClientName}_Portfolio.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF report. Please try again.');
  }
}