import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Check, FileUp, Printer, Plus, Trash2, Moon, Sun } from 'lucide-react';
import { InterviewData, defaultInterview, CATEGORIES, ONDERWIJSVORM_OPTIONS, InstrumentMapping, createEmptyInstrument } from '../types';
import { InstrumentBlock } from './InstrumentBlock';
import { saveInterview } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { exportToExcel } from '../utils/export';
import { createRoot } from 'react-dom/client';
import { PrintView } from './PrintView';

interface Props {
  initialData?: InterviewData;
  onBack: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const TextAreaField: React.FC<TextAreaFieldProps> = ({ label, value, onChange, placeholder = '' }) => (
  <div className="mb-6">
    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">{label}</label>
    <textarea 
      className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-3 min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 outline-none text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 shadow-sm transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

export const InterviewForm: React.FC<Props> = ({ initialData, onBack, toggleTheme, isDarkMode }) => {
  const [data, setData] = useState<InterviewData>(
    initialData || { ...defaultInterview, id: uuidv4(), datum: new Date().toISOString().split('T')[0], lastUpdated: new Date().toISOString() }
  );
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  // Auto-save debounced
  useEffect(() => {
    const handler = setTimeout(() => {
      saveInterview(data);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 2000);
    }, 1000);

    return () => clearTimeout(handler);
  }, [data]);

  const handleChange = (field: keyof InterviewData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleInstrumentChange = (categoryKey: keyof InterviewData, id: string, newInstrumentData: InstrumentMapping) => {
    setData(prev => {
      const arr = prev[categoryKey] as InstrumentMapping[];
      return {
        ...prev,
        [categoryKey]: arr.map(item => item.id === id ? newInstrumentData : item)
      };
    });
  };

  const handleAddInstrument = (categoryKey: keyof InterviewData) => {
    setData(prev => {
      const arr = prev[categoryKey] as InstrumentMapping[];
      return {
        ...prev,
        [categoryKey]: [createEmptyInstrument(), ...arr]
      };
    });

    setTimeout(() => {
      const container = document.getElementById(`scroll-container-${categoryKey}`);
      if (container) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleRemoveInstrument = (categoryKey: keyof InterviewData, id: string) => {
    setData(prev => {
      const arr = prev[categoryKey] as InstrumentMapping[];
      if (arr.length <= 1) return prev;
      return {
        ...prev,
        [categoryKey]: arr.filter(item => item.id !== id)
      };
    });
  };

  const handleOnderwijsvormToggle = (option: string) => {
    const current = data.onderwijsvorm;
    if (current.includes(option)) {
      handleChange('onderwijsvorm', current.filter(o => o !== option));
    } else {
      handleChange('onderwijsvorm', [...current, option]);
    }
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    saveInterview(data);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Interview Excie Export</title>
            <style>
              @media print {
                @page { margin: 1cm; }
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
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
        root.render(<PrintView interview={data} />);
        
        setTimeout(() => {
          printWindow.print();
        }, 1500); // Give enough time for fonts/styles/components to mount
      }
    } else {
      alert("Pop-up werd geblokkeerd. Sta pop-ups toe om af te drukken.");
    }
  };

  // Nav helper for smooth scroll
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sticky Sidebar Navigation */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full flex flex-col transition-colors z-20">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Terug naar Dashboard
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Navigatie</h3>
             <button onClick={toggleTheme} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
               {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
             </button>
          </div>
          <ul className="space-y-1 mb-6">
            <li><button onClick={() => scrollTo('meta')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">Algemeen</button></li>
            <li><button onClick={() => scrollTo('section-startvragen')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">Startvragen</button></li>
            {CATEGORIES.map(cat => (
              <li key={cat.key}>
                <button onClick={() => scrollTo(`section-${cat.key}`)} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                  {cat.label}
                </button>
              </li>
            ))}
            <li><button onClick={() => scrollTo('section-slotvragen')} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">Slotvragen</button></li>
          </ul>

          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Acties</h3>
          <ul className="space-y-1">
            <li>
              <button onClick={() => exportToExcel([data])} className="w-full text-left px-3 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors flex items-center gap-2 font-medium">
                <FileUp size={16} /> Exporteer Huidige (Excel)
              </button>
            </li>
            <li>
              <button onClick={handlePrint} className="w-full text-left px-3 py-2 text-sm text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-md transition-colors flex items-center gap-2 font-medium block">
                <Printer size={16} /> Print (.pdf) modus
              </button>
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 flex items-center gap-2 transition-colors">
           {savedStatus ? <><Check size={16} className="text-green-500"/> Opgeslagen</> : <><Save size={16} className="text-gray-400"/> Automatisch opslaan...</>}
        </div>
      </div>

      {/* Main Form Content */}
      <div className="flex-1 ml-64 p-8 max-w-5xl">
        
        {/* Validation / Form Title Context */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Interview Invullen</h1>
        </div>

        {/* ----- META SECTION ----- */}
        <div id="meta" className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Excie:</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none bg-transparent dark:text-white transition-colors"
                value={data.excie}
                onChange={(e) => handleChange('excie', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Datum:</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none bg-transparent dark:text-white transition-colors"
                value={data.datum}
                onChange={(e) => handleChange('datum', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">CvE-lid:</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none bg-transparent dark:text-white transition-colors"
                value={data.cveLid}
                onChange={(e) => handleChange('cveLid', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ----- STARTVRAGEN ----- */}
        <div id="section-startvragen" className="mb-10">
          <div className="bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-800 px-4 py-2 mb-4 transition-colors">
            <h2 className="text-center font-bold text-gray-800 dark:text-gray-100 tracking-wider">STARTVRAGEN</h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6 transition-colors">
            
            <div className="flex flex-col md:flex-row border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden transition-colors">
              <div className="w-full md:w-1/3 bg-gray-50 dark:bg-gray-900/50 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-100 transition-colors">
                Onderwijsvorm:
              </div>
              <div className="p-4 flex flex-col gap-2 w-full">
                {ONDERWIJSVORM_OPTIONS.map(opt => (
                  <label key={opt} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 accent-blue-600"
                      checked={data.onderwijsvorm.includes(opt)}
                      onChange={() => handleOnderwijsvormToggle(opt)}
                    />
                    <span className="text-gray-700 dark:text-gray-200">{opt}</span>
                  </label>
                ))}
                <input
                  type="text"
                  placeholder="Opmerkingen..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 mt-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none block bg-transparent dark:text-white transition-colors"
                  value={data.onderwijsvormOpmerkingen}
                  onChange={(e) => handleChange('onderwijsvormOpmerkingen', e.target.value)}
                />
              </div>
            </div>

            <TextAreaField label="Wat is in uw eigen woorden het belangrijkste doel van uw excie?" value={data.doelExcie} onChange={(v) => handleChange('doelExcie', v)} />
            <TextAreaField label="Maakt u gebruik van een model of kader (bijv. Toetsweb)?" value={data.modelKader} onChange={(v) => handleChange('modelKader', v)} />
            <TextAreaField label="Maakt u gebruik van een borgingsagenda/-kalender? Zo ja, kunt u deze delen?" value={data.borgingsagenda} onChange={(v) => handleChange('borgingsagenda', v)} />
            <TextAreaField label="Welke 3 doelen staan in de praktijk het meest centraal binnen uw excie?" value={data.drieDoelen} onChange={(v) => handleChange('drieDoelen', v)} />
            <TextAreaField label="Wat betekent 'kwaliteit borgen' bij u vooral?" value={data.betekenisKwaliteitBorgen} onChange={(v) => handleChange('betekenisKwaliteitBorgen', v)} />
            <TextAreaField label="Is er een visie op toetsing? Zo ja, kunt u deze delen?" value={data.visieToetsing} onChange={(v) => handleChange('visieToetsing', v)} />

          </div>
        </div>

        {/* ----- INSTRUMENT CATEGORIES ----- */}
        {CATEGORIES.map(cat => (
          <div key={cat.key} id={`section-${cat.key}`} className="mb-10 scroll-mt-6">
            <div className={`${cat.headerBg} dark:opacity-80 border ${cat.color.split(' ')[1]} px-4 py-2 mb-4 flex items-center justify-between rounded-t-md`}>
              <h2 className="font-bold text-gray-800 tracking-wider uppercase">{cat.label}</h2>
              <button 
                onClick={() => handleAddInstrument(cat.key as keyof InterviewData)}
                className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded shadow-sm border border-gray-300 transition-colors"
              >
                <Plus size={16} /> Instrument toevoegen
              </button>
            </div>
            
            <div id={`scroll-container-${cat.key}`} className="flex flex-nowrap gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
              {(data[cat.key as keyof InterviewData] as InstrumentMapping[]).map((instrument, idx, arr) => (
                <div key={instrument.id} className="relative group shrink-0 w-[96%] snap-center">
                  {arr.length > 1 && (
                    <button 
                      onClick={() => handleRemoveInstrument(cat.key as keyof InterviewData, instrument.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-50 text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 shadow-sm z-10"
                      title="Verwijder instrument"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <InstrumentBlock 
                    label={`Instrument ${arr.length - idx}`}
                    colorClass={cat.color}
                    headerClass={cat.headerBg}
                    data={instrument}
                    onChange={(newData) => handleInstrumentChange(cat.key as keyof InterviewData, instrument.id, newData)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* ----- SLOTVRAGEN ----- */}
        <div id="section-slotvragen" className="mb-32">
          <div className="bg-orange-100 dark:bg-orange-900/40 border border-orange-200 dark:border-orange-800 px-4 py-2 mb-4 transition-colors">
            <h2 className="text-center font-bold text-gray-800 dark:text-gray-100 tracking-wider">SLOTVRAGEN</h2>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-6 transition-colors">
            <TextAreaField label="Hanteert u nog verdere instrumenten die niet zijn besproken?" value={data.verdereInstrumenten} onChange={(v) => handleChange('verdereInstrumenten', v)} />
            <TextAreaField label="Hoe formuleert u een eigenstandig oordeel over de toetskwaliteit?" value={data.eigenstandigOordeel} onChange={(v) => handleChange('eigenstandigOordeel', v)} />
            <TextAreaField label="Welke vragen heeft u over het borgen van toetskwaliteit?" value={data.vragenBorgenKwaliteit} onChange={(v) => handleChange('vragenBorgenKwaliteit', v)} />
            
            <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden transition-colors">
              <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-3 font-semibold text-gray-800 dark:text-gray-200 transition-colors">
                Staat u open voor het delen van uw best practices met andere excies?
              </div>
              <div className="p-4">
                <div className="flex gap-8 justify-center mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="delenBestPractices"
                      className="w-4 h-4 accent-blue-600"
                      checked={data.delenBestPractices === 'Ja'}
                      onChange={() => handleChange('delenBestPractices', 'Ja')}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-200">Ja</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="delenBestPractices"
                      className="w-4 h-4 accent-blue-600"
                      checked={data.delenBestPractices === 'Nee'}
                      onChange={() => handleChange('delenBestPractices', 'Nee')}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-200">Nee</span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Opmerkingen..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none block bg-transparent dark:text-white transition-colors"
                  value={data.delenBestPracticesOpmerkingen}
                  onChange={(e) => handleChange('delenBestPracticesOpmerkingen', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
