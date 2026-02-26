/**
 * Export audit log entries to a professional-looking PDF using jsPDF.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LogEntry {
    id: string;
    eventType: string;
    details?: Record<string, unknown> | null;
    createdAt: string;
    user?: { name?: string; email?: string } | null;
}

export function exportAuditLogPDF(logs: LogEntry[], productionName = 'Producción') {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    // Header
    const now = new Date().toLocaleString('es', { dateStyle: 'long', timeStyle: 'short' });
    doc.setFillColor(10, 10, 20);
    doc.rect(0, 0, doc.internal.pageSize.width, 60, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('LIVEOPS · AUDIT TRAIL', 40, 35);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(160, 160, 200);
    doc.text(`Producción: ${productionName}   ·   Exportado: ${now}   ·   Total: ${logs.length} eventos`, 40, 52);

    // Table
    autoTable(doc, {
        startY: 75,
        head: [['#', 'Timestamp', 'Tipo de Evento', 'Operador', 'Detalles']],
        body: logs.map((log, i) => [
            String(i + 1),
            new Date(log.createdAt).toLocaleString('es'),
            log.eventType,
            log.user?.name ?? log.user?.email ?? 'Sistema',
            log.details ? JSON.stringify(log.details).slice(0, 120) : '—',
        ]),
        headStyles: {
            fillColor: [30, 30, 80],
            textColor: [200, 200, 255],
            fontStyle: 'bold',
            fontSize: 8,
        },
        bodyStyles: {
            fontSize: 7.5,
            textColor: [30, 30, 50],
        },
        alternateRowStyles: {
            fillColor: [245, 245, 255],
        },
        columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 110 },
            2: { cellWidth: 120 },
            3: { cellWidth: 100 },
            4: { cellWidth: 'auto' },
        },
        margin: { left: 40, right: 40 },
        styles: { overflow: 'ellipsize', cellPadding: 5 },
    });

    // Footer page numbers
    const total = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150);
        doc.text(
            `LiveOPS Audit Trail  ·  Página ${i} de ${total}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 20,
            { align: 'center' }
        );
    }

    doc.save(`audit-trail-${Date.now()}.pdf`);
}
