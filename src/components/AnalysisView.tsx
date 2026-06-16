import React, { useMemo, useState } from 'react';
import { getInterviews } from '../store';
import { ArrowLeft, Printer, Moon, Sun } from 'lucide-react';
import { CATEGORIES, InterviewData, InstrumentMapping } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Text } from 'recharts';
import { InstrumentBlock } from './InstrumentBlock';

interface Props {
  ids: string[];
  onBack: () => void;
  onOpenInterview: (id: string) => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export const AnalysisView: React.FC<Props> = ({ ids, onBack, onOpenInterview, toggleTheme, isDarkMode }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedInstrumentName, setSelectedInstrumentName] = useState<string | null>(null);

  const interviews = useMemo(() => {
    const all = getInterviews();
    return all.filter(i => ids.includes(i.id));
  }, [ids]);

  // B) Onderwijsvorm chart data
  const onderwijsvormData = useMemo(() => {
    const grouped: Record<string, string[]> = {};
    interviews.forEach(inv => {
      const excie = inv.excie || 'Onbekend';
      inv.onderwijsvorm.forEach(ov => {
        if (!grouped[ov]) grouped[ov] = [];
        grouped[ov].push(excie);
      });
    });
    return Object.entries(grouped).map(([name, excies]) => ({
      name,
      count: excies.length,
      excies: excies.join(', ')
    }));
  }, [interviews]);

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 shadow-md rounded-md text-sm">
          <p className="font-bold text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-gray-700 dark:text-gray-300">Aantal: {payload[0].value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] mt-1 break-words leading-tight">
            {payload[0].payload.excies}
          </p>
        </div>
      );
    }
    return null;
  };

  // C) Startvragen tabel
  const startQuestions = [
    { key: 'doelExcie', label: 'Belangrijkste doel excie' },
    { key: 'modelKader', label: 'Model of kader (bijv. Toetsweb)' },
    { key: 'borgingsagenda', label: 'Borgingsagenda/-kalender' },
    { key: 'drieDoelen', label: 'Welke 3 doelen staan centraal' },
    { key: 'betekenisKwaliteitBorgen', label: 'Betekenis kwaliteit borgen' },
    { key: 'visieToetsing', label: 'Visie op toetsing en uiting daarvan' },
  ];

  // D) Radar chart data (unique instrument names per category)
  const radarData = useMemo(() => {
    return CATEGORIES.map(cat => {
      const allNames = interviews.flatMap(inv => 
        (inv[cat.key as keyof InterviewData] as InstrumentMapping[])
          .map(inst => inst.instrumentnaam.trim())
          .filter(name => name.length > 0)
      );
      const uniqueCount = new Set(allNames).size;
      return {
        subject: cat.label,
        Aantal: uniqueCount,
        fullMark: Math.max(10, uniqueCount + 5)
      };
    });
  }, [interviews]);

  // E) Instrumenten per categorie
  // Flatten unique names per category
  const getUniqueInstrumentsForCategory = (catKey: string) => {
    const map = new Map<string, Array<{ inst: InstrumentMapping, excie: string }>>();
    interviews.forEach(inv => {
      const excie = inv.excie || 'Onbekend';
      const tools = inv[catKey as keyof InterviewData] as InstrumentMapping[];
      tools.forEach(t => {
        const name = (t.instrumentnaam || '').trim();
        if (name) {
          if (!map.has(name)) map.set(name, []);
          map.get(name)!.push({ inst: t, excie });
        }
      });
    });
    return map; // Map<instrumentName, Array<Inst+Excie>>
  };

  const currentCategoryMap = selectedCategory ? getUniqueInstrumentsForCategory(selectedCategory) : new Map();
  const uniqueNames = Array.from(currentCategoryMap.keys()).sort();

  const handlePrint = () => {
    window.print();
  };

  const tailwindHexColors: Record<string, string> = {
    'toetsbeleid': '#EC4899',
    'toetsorganisatie': '#F97316',
    'toetsbekwaamheid': '#22C55E',
    'toetsTaken': '#3B82F6',
    'toetsprogramma': '#14B8A6',
  };

  const renderPolarAngleAxis = ({ payload, x, y, cx, cy, ...rest }: any) => {
    const cat = CATEGORIES.find(c => c.label === payload.value);
    const color = cat ? tailwindHexColors[cat.key] : '#374151';
    
    const dataItem = radarData.find(d => d.subject === payload.value);
    const count = dataItem ? dataItem.Aantal : 0;

    return (
      <Text
        {...rest}
        x={x}
        y={y}
        cx={cx}
        cy={cy}
        fill={color}
        className="font-bold text-sm"
        textAnchor={x > cx ? 'start' : x < cx ? 'end' : 'middle'}
      >
        {`${payload.value} (${count})`}
      </Text>
    );
  };

  const btnColors: Record<string, string> = {
    'toetsbeleid': 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800 hover:bg-pink-200 dark:hover:bg-pink-900/50',
    'toetsorganisatie': 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800 hover:bg-orange-200 dark:hover:bg-orange-900/50',
    'toetsbekwaamheid': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50',
    'toetsTaken': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/50',
    'toetsprogramma': 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800 hover:bg-teal-200 dark:hover:bg-teal-900/50',
  };

  const activeBtnColors: Record<string, string> = {
    'toetsbeleid': 'bg-pink-600 text-white border-pink-600 hover:bg-pink-700',
    'toetsorganisatie': 'bg-orange-600 text-white border-orange-600 hover:bg-orange-700',
    'toetsbekwaamheid': 'bg-green-600 text-white border-green-600 hover:bg-green-700',
    'toetsTaken': 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
    'toetsprogramma': 'bg-teal-600 text-white border-teal-600 hover:bg-teal-700',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {/* HEADER */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm print:hidden">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Terug naar Dashboard
        </button>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
             onClick={handlePrint}
             className="flex items-center gap-2 px-4 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 font-medium rounded-lg transition-colors border border-purple-200 dark:border-purple-800 shadow-sm"
          >
            <Printer size={18} /> PDF-export
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8 print:p-0">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Analyse ({interviews.length} onderzoeken)</h1>
          <p className="text-gray-500 dark:text-gray-400">Vergelijking van geselecteerde excies</p>
        </div>

        {/* A: Excies lijst */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 break-inside-avoid">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Geanalyseerde Examencommissies</h2>
          <div className="flex flex-wrap gap-2">
            {interviews.map((inv) => (
              <button 
                key={inv.id} 
                onClick={() => onOpenInterview(inv.id)}
                className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
              >
                {inv.excie || 'Onbekend'}
              </button>
            ))}
          </div>
        </div>

        {/* B: Onderwijsvorm Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 break-inside-avoid">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Onderwijsvormen</h2>
          {onderwijsvormData.length > 0 ? (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={onderwijsvormData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} tick={{fontSize: 12}} />
                  <YAxis allowDecimals={false} stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500">Geen onderwijsvormen geregistreerd.</p>
          )}
        </div>

        {/* C: Startvragen Tabel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Startvragen vergelijking</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 min-w-[200px] max-w-[250px] sticky left-0 bg-gray-50 dark:bg-gray-900 z-10 border-r border-gray-200 dark:border-gray-700">Vraag</th>
                  {interviews.map(inv => (
                    <th key={inv.id} className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 min-w-[250px] border-r border-gray-200 dark:border-gray-700 last:border-0">{inv.excie || 'Onbekend'}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {startQuestions.map((q, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">{q.label}</td>
                    {interviews.map(inv => (
                      <td key={inv.id} className="px-4 py-3 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-0 whitespace-pre-wrap align-top">
                        {(inv as any)[q.key] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* D: Radar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 break-inside-avoid flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Unieke instrumenten per categorie</h2>
            <div className="h-[400px] w-[100%] max-w-[600px] mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="70%" data={radarData}>
                  <PolarGrid stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                  <PolarAngleAxis dataKey="subject" tick={renderPolarAngleAxis} />
                  <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 1']} stroke={isDarkMode ? '#9CA3AF' : '#6B7280'} tick={false} axisLine={false} />
                  <Radar name="Unieke instrumenten" dataKey="Aantal" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                  <Tooltip contentStyle={{backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', borderColor: isDarkMode ? '#374151' : '#E5E7EB'}} itemStyle={{color: '#8B5CF6'}} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="w-full md:w-1/3 text-sm text-gray-600 dark:text-gray-400">
             <p>Deze grafiek toont het aantal <strong>unieke</strong> instrumentnamen dat is ingevuld over alle geselecteerde excies per categorie. Hierdoor wordt snel duidelijk in welke gebieden het instrumentarium het sterkst gediversifieerd is.</p>
          </div>
        </div>

        {/* E: Instrumenten per categorie (Drilldown) */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 break-inside-avoid print:hidden">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Instrumenten per Entiteit</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map(cat => {
              const activeClass = selectedCategory === cat.key ? activeBtnColors[cat.key] : btnColors[cat.key];
              return (
                <button 
                  key={cat.key}
                  onClick={() => { setSelectedCategory(cat.key); setSelectedInstrumentName(null); }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors border ${activeClass}`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {selectedCategory && (
            <div className="mt-4">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">Gevonden instrumenten in categorie:</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {uniqueNames.length === 0 && <span className="text-gray-500 text-sm">Geen instrumenten in deze categorie.</span>}
                {uniqueNames.map(name => {
                  const count = currentCategoryMap.get(name)?.length || 0;
                  return (
                    <button 
                      key={name}
                      onClick={() => setSelectedInstrumentName(name)}
                      className={`px-3 py-1.5 rounded-md text-sm border transition-colors flex items-center gap-2 ${selectedInstrumentName === name ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      {name} <span className="bg-gray-200 dark:bg-gray-700 text-xs px-1.5 py-0.5 rounded-full">{count}x</span>
                    </button>
                  );
                })}
              </div>

              {selectedInstrumentName && (
                <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                   <h3 className="font-bold mb-4 text-xl">Deelresultaten: {selectedInstrumentName}</h3>
                   <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
                     {currentCategoryMap.get(selectedInstrumentName)?.map((item, idx) => {
                       const catProps = CATEGORIES.find(c => c.key === selectedCategory);
                       return (
                         <div key={idx} className="shrink-0 w-[90%] md:w-[600px] snap-center">
                           <div className="mb-2 font-bold text-gray-700 dark:text-gray-300 text-sm tracking-wide">
                             EXCIE: <span className="text-blue-600 dark:text-blue-400">{item.excie}</span>
                           </div>
                           <div className="pointer-events-none opacity-90">
                              <InstrumentBlock 
                                label={catProps?.label || ''} 
                                colorClass={catProps?.color || ''}
                                headerClass={catProps?.headerBg || ''}
                                data={item.inst} 
                                onChange={() => {}} 
                              />
                           </div>
                         </div>
                       )
                     })}
                   </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* F: Slotvragen Tabel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Slotvragen vergelijking</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-orange-50 dark:bg-orange-900/20 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 min-w-[200px] max-w-[250px] sticky left-0 bg-orange-50 dark:bg-orange-900/80 z-10 border-r border-gray-200 dark:border-gray-700">Vraag</th>
                  {interviews.map(inv => (
                    <th key={inv.id} className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 min-w-[250px] border-r border-gray-200 dark:border-gray-700 last:border-0">{inv.excie || 'Onbekend'}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  {key: 'verdereInstrumenten', label: 'Verdere instrumenten'},
                  {key: 'eigenstandigOordeel', label: 'Eigenstandig oordeel'},
                  {key: 'vragenBorgenKwaliteit', label: 'Vragen borgen kwaliteit'},
                  {key: 'delenBestPractices', label: 'Staat open voor delen practices'}
                ].map((q, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 sticky left-0 bg-white dark:bg-gray-800 z-10 border-r border-gray-200 dark:border-gray-700">{q.label}</td>
                    {interviews.map(inv => (
                      <td key={inv.id} className="px-4 py-3 text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-0 whitespace-pre-wrap align-top">
                        {q.key === 'delenBestPractices' 
                          ? `${inv.delenBestPractices || '-'} ${inv.delenBestPracticesOpmerkingen ? `(${inv.delenBestPracticesOpmerkingen})` : ''}`
                          : ((inv as any)[q.key] || '-')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: white !important; }
        }
      `}</style>
    </div>
  );
};
