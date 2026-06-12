import React, { useState, useEffect } from 'react';
import { FileUp, Plus, Edit2, Trash2, AlertTriangle, Printer, FileDown, Moon, Sun } from 'lucide-react';
import { InterviewData } from '../types';
import { getInterviews, deleteInterview, saveInterview } from '../store';
import { exportToExcel } from '../utils/export';
import { importFromExcel } from '../utils/import';
import { createRoot } from 'react-dom/client';
import { PrintView } from './PrintView';

interface Props {
  onNewInterview: () => void;
  onEditInterview: (id: string) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export const Dashboard: React.FC<Props> = ({ onNewInterview, onEditInterview, toggleTheme, isDarkMode }) => {
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setInterviews(getInterviews());
  }, []);

  const executeDelete = () => {
    if (deleteConfirmId) {
      deleteInterview(deleteConfirmId);
      setInterviews(getInterviews());
      setDeleteConfirmId(null);
      // Remove from selected as well
      const newSelected = new Set(selectedIds);
      newSelected.delete(deleteConfirmId);
      setSelectedIds(newSelected);
    }
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === interviews.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(interviews.map(i => i.id)));
    }
  };

  const handleExport = () => {
    if (interviews.length === 0) return;
    
    // If some selected, export those. Otherwise export all.
    const toExport = selectedIds.size > 0 
      ? interviews.filter(i => selectedIds.has(i.id)) 
      : interviews;
      
    exportToExcel(toExport);
  };

  const handlePrint = () => {
    if (interviews.length === 0) return;
    
    const toPrint = selectedIds.size > 0 
      ? interviews.filter(i => selectedIds.has(i.id)) 
      : interviews;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Interview Excie Print</title>
            <style>
              @media print {
                @page { margin: 1cm; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                .page-break { page-break-after: always; }
                .page-break:last-child { page-break-after: auto; }
              }
            </style>
          </head>
          <body>
            <div id="print-root"></div>
          </body>
        </html>
      `);
      
      const copyStyles = () => {
        document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
          printWindow.document.head.appendChild(node.cloneNode(true));
        });
      };
      
      copyStyles();
      printWindow.document.close();

      const printRootElement = printWindow.document.getElementById('print-root');
      if (printRootElement) {
        const root = createRoot(printRootElement);
        root.render(
          <div>
             {toPrint.map(interview => (
               <div key={interview.id} className="page-break">
                 <PrintView interview={interview} />
               </div>
             ))}
          </div>
        );
        
        setTimeout(() => {
          printWindow.print();
        }, 1500);
      }
    } else {
      alert("Pop-up werd geblokkeerd. Sta pop-ups toe om af te drukken.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromExcel(file);
      imported.forEach(i => saveInterview(i));
      setInterviews(getInterviews());
      alert(`Er zijn ${imported.length} interviews geïmporteerd.`);
    } catch(err) {
      alert("Er is een fout opgetreden bij het importeren.");
      console.error(err);
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Interview Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Beheer formulieren en exporteer data naar Excel.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={toggleTheme} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
             {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium rounded-lg transition-colors border border-blue-200 dark:border-blue-800 shadow-sm cursor-pointer">
            <FileDown size={18} />
            Importeer Excel
            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImport} />
          </label>

          <button 
            onClick={handleExport}
            disabled={interviews.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-colors border border-green-200 dark:border-green-800 shadow-sm"
          >
            <FileUp size={18} />
            {selectedIds.size > 0 ? `Exporteer Geselecteerde (${selectedIds.size})` : 'Exporteer Alle Data'}
          </button>
          
          <button 
            onClick={handlePrint}
            disabled={interviews.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-lg transition-colors border border-purple-200 dark:border-purple-800 shadow-sm"
          >
            <Printer size={18} />
            {selectedIds.size > 0 ? `Print Geselecteerde (${selectedIds.size})` : 'Print Alle Data'}
          </button>
          
          <button 
            onClick={onNewInterview}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            Nieuw Interview
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {interviews.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            <p className="mb-4 text-lg">Nog geen interviews ingevuld.</p>
            <button 
              onClick={onNewInterview}
              className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Start uw eerste interview &rarr;
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      checked={interviews.length > 0 && selectedIds.size === interviews.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Excie</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Datum</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">CvE-lid</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm">Laatst gewijzigd</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-300 text-sm text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {interviews.sort((a, b) => new Date(b.lastUpdated).valueOf() - new Date(a.lastUpdated).valueOf()).map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        checked={selectedIds.has(interview.id)}
                        onChange={() => toggleSelection(interview.id)}
                      />
                    </td>
                    <td className="px-6 py-4" onClick={() => toggleSelection(interview.id)}>
                      <span className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer">{interview.excie || 'Onbekend'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{interview.datum || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{interview.cveLid || '-'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(interview.lastUpdated).toLocaleDateString('nl-NL', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onEditInterview(interview.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                          title="Bewerken"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirmId(interview.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                          title="Verwijderen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4">
               <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                 <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
               </div>
               <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Verwijderen bevestigen</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Weet u zeker dat u dit item wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors shadow-sm"
              >
                Annuleren
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm rounded-lg transition-colors"
              >
                Verwijderen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
