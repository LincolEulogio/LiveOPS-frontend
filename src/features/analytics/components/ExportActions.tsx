'use client';

import { analyticsService } from '@/features/analytics/api/analytics.service';
import { Download, FileDown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { ProductionLog } from '@/features/analytics/types/analytics.types';

interface Props {
    productionId: string;
}

export const ExportActions = ({ productionId }: Props) => {
    const [isExporting, setIsExporting] = useState(false);

    const convertToCSV = (objArray: Record<string, unknown>[]) => {
        const array = objArray;
        let str = '';

        // Headers
        if (array.length > 0) {
            str += Object.keys(array[0]).join(',') + '\r\n';
        }

        // Rows
        for (let i = 0; i < array.length; i++) {
            let line = '';
            for (const index in array[i]) {
                if (line !== '') line += ',';

                const value = array[i][index];
                if (typeof value === 'object') {
                    line += `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                } else {
                    line += `"${String(value).replace(/"/g, '""')}"`;
                }
            }
            str += line + '\r\n';
        }
        return str;
    };

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            setIsExporting(true);
            const data = await analyticsService.getAllLogsForExport(productionId);

            const blob = format === 'csv'
                ? new Blob([convertToCSV(data as unknown as Record<string, unknown>[])], { type: 'text/csv;charset=utf-8;' })
                : new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });

            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `production_${productionId}_logs.${format}`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-6 bg-card-bg border border-card-border rounded-3xl ">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <Download size={18} />
                </div>
                <h2 className="text-sm font-bold text-foreground uppercase ">Data Export</h2>
            </div>

            <p className="text-[10px] text-muted leading-relaxed">
                Download the complete production history for post-production analysis or billing compliance.
            </p>

            <div className="space-y-3 mt-2">
                <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-background hover:bg-card-border border border-card-border rounded-2xl transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet size={16} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-muted uppercase ">Spreadsheet (CSV)</span>
                    </div>
                    {isExporting ? <Loader2 size={14} className="animate-spin text-muted" /> : <FileDown size={14} className="text-muted" />}
                </button>

                <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-background hover:bg-card-border border border-card-border rounded-2xl transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <FileDown size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-muted uppercase ">Raw Data (JSON)</span>
                    </div>
                    {isExporting ? <Loader2 size={14} className="animate-spin text-muted" /> : <FileDown size={14} className="text-muted" />}
                </button>
            </div>

            <div className="mt-2 text-[9px] text-muted italic text-center">
                Includes all scene changes, commands, and engine states.
            </div>
        </div>
    );
};
