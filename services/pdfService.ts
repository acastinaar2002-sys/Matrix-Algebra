
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CalculationResult, OperationType, CalculationStep } from '../types';

export const generatePDFReport = (results: CalculationResult[]) => {
  const doc = new jsPDF();
  
  // -- Header --
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Reporte de Álgebra Matricial", 105, 20, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });
  
  doc.setDrawColor(220);
  doc.line(20, 35, 190, 35);

  let currentY = 45;

  results.forEach((res, index) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    // Title
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${res.title}`, 20, currentY);
    currentY += 8;

    // Subtitle / Desc
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    let desc = "";
    if (res.operation === OperationType.EXPRESSION) {
        desc = `Expresión: ${res.expressionStr}`;
    } else if (res.operation === OperationType.EQUATION && res.equationParams) {
        desc = `Ecuación: ${res.equationParams.m} · X + ${res.equationParams.n} = ${res.equationParams.p}`;
    }
    if (desc) {
        doc.text(desc, 20, currentY);
        currentY += 8;
    }

    // --- STEPS (Rich Content) ---
    if (res.steps && res.steps.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text("Procedimiento paso a paso:", 20, currentY);
        currentY += 6;

        res.steps.forEach(step => {
             // Check Page Break
             if (currentY > 260) {
                 doc.addPage();
                 currentY = 20;
             }

             if (step.type === 'text') {
                 doc.setFont("courier", "normal");
                 doc.setFontSize(9);
                 doc.setTextColor(50);
                 
                 const splitText = doc.splitTextToSize(`• ${step.value}`, 170);
                 doc.text(splitText, 25, currentY);
                 currentY += (splitText.length * 4) + 2;
             } 
             else if (step.type === 'matrix') {
                 // Render Intermediate Matrix (Supports string or number)
                 doc.setFont("helvetica", "italic");
                 doc.setFontSize(9);
                 doc.setTextColor(0);
                 doc.text(step.title, 30, currentY + 2);
                 currentY += 4;

                 const tableBody = step.data.map(row => 
                    row.map(val => {
                        if (typeof val === 'string') return val;
                        return Number.isInteger(val) ? val.toString() : val.toFixed(2);
                    })
                 );

                 autoTable(doc, {
                    startY: currentY,
                    body: tableBody,
                    theme: 'plain',
                    styles: {
                        halign: 'center',
                        cellPadding: 1,
                        fontSize: 8,
                        font: 'courier',
                        lineWidth: 0.1,
                        lineColor: [100, 100, 100],
                        textColor: [0, 0, 0]
                    },
                    margin: { left: 30 },
                    tableWidth: 'wrap'
                 });
                 currentY = (doc as any).lastAutoTable.finalY + 8;
             }
        });
        currentY += 5;
    }

    // --- FINAL RESULT ---
    if (res.resultMatrix) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text("Resultado Final:", 20, currentY);
        currentY += 5;

        const tableBody = res.resultMatrix.data.map(row => 
            row.map(val => Number.isInteger(val) ? val.toString() : val.toFixed(4))
        );

        autoTable(doc, {
            startY: currentY,
            body: tableBody,
            theme: 'grid', // slightly more formal for final result
            styles: {
                halign: 'center',
                cellPadding: 3,
                font: 'courier',
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                textColor: [0, 0, 0],
                fillColor: [245, 245, 245]
            },
            headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
            margin: { left: 20 },
            tableWidth: 'wrap'
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
    } else if (res.resultValue !== undefined) {
        doc.setFont("courier", "bold");
        doc.setFontSize(12);
        doc.text(`Resultado: ${res.resultValue}`, 25, currentY + 5);
        currentY += 15;
    }
  });

  doc.save(`Matrix_Report_Pro.pdf`);
};
