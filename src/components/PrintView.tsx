import React from 'react';
import { CATEGORIES, InstrumentMapping, InterviewData } from '../types';

export const PrintView: React.FC<{ interview: InterviewData }> = ({ interview }) => {
  const SectionHeading = ({ children, colorClass }: { children: React.ReactNode, colorClass?: string }) => (
    <h2 className={`text-lg font-bold uppercase tracking-wider mb-2 pb-1 border-b-2 border-gray-800 dark:border-gray-400 ${colorClass && colorClass.split(' ')[0]}`}>{children}</h2>
  );

  const QA = ({ question, answer }: { question: string, answer: string }) => (
    <div className="mb-4 break-inside-avoid">
      <div className="font-semibold text-gray-800 dark:text-gray-300 text-sm">{question}</div>
      <div className="mt-1 text-gray-700 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 border border-gray-100 dark:border-gray-700 rounded text-sm">{answer || '-'}</div>
    </div>
  );

  return (
    <div className="max-w-[800px] mx-auto p-8 bg-white dark:bg-gray-900 text-black dark:text-gray-100 min-h-screen">
      <div className="text-center mb-8 pb-4 border-b dark:border-gray-700">
        <h1 className="text-2xl font-bold uppercase tracking-widest">Interview Excie</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="font-medium">Excie: <span className="font-normal">{interview.excie || '-'}</span></div>
        <div className="font-medium">Datum: <span className="font-normal">{interview.datum || '-'}</span></div>
        <div className="font-medium">CvE-lid: <span className="font-normal">{interview.cveLid || '-'}</span></div>
        <div className="font-medium">Onderwijsvorm: <span className="font-normal">{interview.onderwijsvorm.join(', ') || '-'}</span></div>
      </div>

      <div className="mb-8 border-t border-gray-200 dark:border-gray-700 py-6">
        <SectionHeading>Startvragen</SectionHeading>
        <QA question="Wat is in uw eigen woorden het belangrijkste doel van uw excie?" answer={interview.doelExcie} />
        <QA question="Maakt u gebruik van een model of kader (bijv. Toetsweb)?" answer={interview.modelKader} />
        <QA question="Maakt u gebruik van een borgingsagenda/-kalender? Zo ja, kunt u deze delen?" answer={interview.borgingsagenda} />
        <QA question="Welke 3 doelen staan in de praktijk het meest centraal binnen uw excie?" answer={interview.drieDoelen} />
        <QA question="Wat betekent 'kwaliteit borgen' bij u vooral?" answer={interview.betekenisKwaliteitBorgen} />
        <QA question="Is er een visie op toetsing? Zo ja, kunt u deze delen?" answer={interview.visieToetsing} />
      </div>

      <div className="mb-8">
        {CATEGORIES.map(cat => {
            const mappings = interview[cat.key as keyof InterviewData] as InstrumentMapping[];
            if (!mappings || mappings.length === 0) return null;
            
            // Generate list to avoid empty blocks printing unnecessarily if they are fully empty. 
            // We print them all if there's any data, but usually they might just be empty strings. Let's just print them.
            return (
              <div key={cat.key} className="mb-8 break-inside-avoid">
                 <SectionHeading colorClass={cat.headerBg}>{cat.label}</SectionHeading>
                 {mappings.map((mapping, idx) => (
                    <div key={mapping.id} className="border border-gray-300 rounded p-4 mb-4 text-sm bg-gray-50/30">
                        {mappings.length > 1 && <div className="font-bold underline mb-2">Instrument {mappings.length - idx}</div>}
                        <div className="grid grid-cols-3 gap-2 mb-4 border-b border-gray-200 pb-2">
                           <div><strong>Instrumentnaam:</strong><br/> {mapping.instrumentnaam || '-'}</div>
                           <div><strong>Regelmaat:</strong><br/> {mapping.regelmaat || '-'}</div>
                           <div><strong>Opmerkingen:</strong><br/> {mapping.opmerkingen || '-'}</div>
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                           <div>
                              <strong className="block mb-1">Onderzoeksdesign:</strong>
                              {mapping.onderzoeksdesign.join(', ')} {mapping.onderzoeksdesignAnders ? `(${mapping.onderzoeksdesignAnders})` : ''}
                           </div>
                           <div>
                              <strong className="block mb-1">Type meetinstrument:</strong>
                              {mapping.typeMeetinstrument.join(', ')} {mapping.typeMeetinstrumentAnders ? `(${mapping.typeMeetinstrumentAnders})` : ''}
                           </div>
                           <div>
                              <strong className="block mb-1">Type data:</strong>
                              {mapping.typeData.join(', ')} {mapping.typeDataAnders ? `(${mapping.typeDataAnders})` : ''}
                           </div>
                           <div>
                              <strong className="block mb-1">Interpretatie:</strong>
                              {mapping.interpretatie.join(', ')} {mapping.interpretatieAnders ? `(${mapping.interpretatieAnders})` : ''}
                           </div>
                        </div>
                    </div>
                 ))}
              </div>
            );
        })}
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700 mt-8 break-inside-avoid">
        <SectionHeading>Slotvragen</SectionHeading>
        <QA question="Hanteert u nog verdere instrumenten die niet zijn besproken?" answer={interview.verdereInstrumenten} />
        <QA question="Hoe formuleert u een eigenstandig oordeel over de toetskwaliteit?" answer={interview.eigenstandigOordeel} />
        <QA question="Welke vragen heeft u over het borgen van toetskwaliteit?" answer={interview.vragenBorgenKwaliteit} />
        <QA question="Staat u open voor het delen van uw best practices met andere excies?" answer={`${interview.delenBestPractices || '-'} ${interview.delenBestPracticesOpmerkingen ? `(${interview.delenBestPracticesOpmerkingen})` : ''}`} />
      </div>
    </div>
  );
}
