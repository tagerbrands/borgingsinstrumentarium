import * as XLSX from 'xlsx';
import { InterviewData, CATEGORIES, InstrumentMapping, createEmptyInstrument } from '../types';

export const exportToExcel = (interviews: InterviewData[]) => {
  // Find maximum length of instruments in each category to create uniform columns
  const maxLengths: Record<string, number> = {};
  CATEGORIES.forEach(cat => {
    maxLengths[cat.key] = 1;
  });

  interviews.forEach(interview => {
    CATEGORIES.forEach(cat => {
      const mappings = interview[cat.key as keyof InterviewData] as InstrumentMapping[];
      if (mappings && mappings.length > maxLengths[cat.key]) {
        maxLengths[cat.key] = mappings.length;
      }
    });
  });

  const flatData = interviews.map(interview => {
    
    // Base flattening
    const row: any = {
      'ID': interview.id,
      'Laatst Gewerkt': new Date(interview.lastUpdated).toLocaleString(),
      'Excie': interview.excie,
      'Datum': interview.datum,
      'CvE-lid': interview.cveLid,
      'Onderwijsvorm': interview.onderwijsvorm.join(', ') + (interview.onderwijsvormOpmerkingen ? ` (${interview.onderwijsvormOpmerkingen})` : ''),
      'Belangrijkste doel excie': interview.doelExcie,
      'Model of kader': interview.modelKader,
      'Borgingsagenda/-kalender': interview.borgingsagenda,
      'Welke 3 doelen centraal': interview.drieDoelen,
      'Betekenis kwaliteit borgen': interview.betekenisKwaliteitBorgen,
      'Visie op toetsing': interview.visieToetsing,
    };

    // Flatten Categories
    CATEGORIES.forEach(cat => {
      const mappings = interview[cat.key as keyof InterviewData] as InstrumentMapping[] || [];
      const prefixBase = cat.label;

      for (let i = 0; i < maxLengths[cat.key]; i++) {
        const mapping = mappings[i] || createEmptyInstrument();
        const prefix = maxLengths[cat.key] > 1 ? `${prefixBase} ${i + 1}` : prefixBase;
        
        row[`${prefix} - Instrumentnaam`] = mapping.instrumentnaam;
        row[`${prefix} - Regelmaat van inzet`] = mapping.regelmaat;
        row[`${prefix} - Opmerkingen`] = mapping.opmerkingen;
        row[`${prefix} - Onderzoeksdesign`] = mapping.onderzoeksdesign.join(', ') + (mapping.onderzoeksdesignAnders ? ` (${mapping.onderzoeksdesignAnders})` : '');
        row[`${prefix} - Type meetinstrument`] = mapping.typeMeetinstrument.join(', ') + (mapping.typeMeetinstrumentAnders ? ` (${mapping.typeMeetinstrumentAnders})` : '');
        row[`${prefix} - Type data`] = mapping.typeData.join(', ') + (mapping.typeDataAnders ? ` (${mapping.typeDataAnders})` : '');
        row[`${prefix} - Interpretatie`] = mapping.interpretatie.join(', ') + (mapping.interpretatieAnders ? ` (${mapping.interpretatieAnders})` : '');
      }
    });

    // Flatten Slotvragen
    row['Slot - Verdere instrumenten'] = interview.verdereInstrumenten;
    row['Slot - Eigenstandig oordeel'] = interview.eigenstandigOordeel;
    row['Slot - Vragen borgen kwaliteit'] = interview.vragenBorgenKwaliteit;
    row['Slot - Open voor delen practices'] = interview.delenBestPractices + (interview.delenBestPracticesOpmerkingen ? ` (${interview.delenBestPracticesOpmerkingen})` : '');

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(flatData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Interviews');
  
  // Format standard column widths for better readibility
  const wscols = [
    {wch: 10}, // ID
    {wch: 20}, // Laatst gewerkt
    {wch: 20}, // Excie
    {wch: 15}, // Datum
    {wch: 20}, // CvE-lid
    {wch: 30}, // Onderwijsvorm
    // Add a default generous width for text areas
    ...Array(30).fill({wch: 40}) 
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `Excie_Interviews_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
};
