import * as XLSX from 'xlsx';
import { InterviewData, CATEGORIES, createEmptyInstrument } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const importFromExcel = (file: File): Promise<InterviewData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);
        
        const result: InterviewData[] = json.map(row => {
          const ovMatch = (row['Onderwijsvorm'] || '').match(/^(.*?)(?:\s*\((.*)\))?$/);
          const onderwijsvorm = ovMatch?.[1]?.split(',').map((s:string) => s.trim()).filter(Boolean) || [];
          const onderwijsvormOpmerkingen = ovMatch?.[2] || '';

          const interview: any = {
            id: row['ID'] || uuidv4(),
            lastUpdated: new Date().toISOString(),
            excie: row['Excie'] || '',
            datum: row['Datum'] || '',
            cveLid: row['CvE-lid'] || '',
            onderwijsvorm,
            onderwijsvormOpmerkingen,
            doelExcie: row['Belangrijkste doel excie'] || '',
            modelKader: row['Model of kader'] || '',
            borgingsagenda: row['Borgingsagenda/-kalender'] || '',
            drieDoelen: row['Welke 3 doelen centraal'] || '',
            betekenisKwaliteitBorgen: row['Betekenis kwaliteit borgen'] || '',
            visieToetsing: row['Visie op toetsing'] || '',
            verdereInstrumenten: row['Slot - Verdere instrumenten'] || '',
            eigenstandigOordeel: row['Slot - Eigenstandig oordeel'] || '',
            vragenBorgenKwaliteit: row['Slot - Vragen borgen kwaliteit'] || '',
            delenBestPractices: '',
            delenBestPracticesOpmerkingen: ''
          };

          const delen = row['Slot - Open voor delen practices'] || '';
          if (delen.startsWith('Ja')) {
             interview.delenBestPractices = 'Ja';
             interview.delenBestPracticesOpmerkingen = delen.replace('Ja', '').replace(/^\s*\(/, '').replace(/\)\s*$/, '').trim();
          } else if (delen.startsWith('Nee')) {
             interview.delenBestPractices = 'Nee';
             interview.delenBestPracticesOpmerkingen = delen.replace('Nee', '').replace(/^\s*\(/, '').replace(/\)\s*$/, '').trim();
          }

          CATEGORIES.forEach(cat => {
             interview[cat.key] = [];
             for(let i=0; i<15; i++) {
                const prefix = i === 0 ? cat.label : `${cat.label} ${i+1}`;
                if (row[`${prefix} - Instrumentnaam`] !== undefined || row[`${prefix} - Regelmaat van inzet`] !== undefined) {
                   const inst = createEmptyInstrument();
                   inst.instrumentnaam = row[`${prefix} - Instrumentnaam`] || '';
                   inst.regelmaat = row[`${prefix} - Regelmaat van inzet`] || '';
                   inst.opmerkingen = row[`${prefix} - Opmerkingen`] || '';
                   
                   const parseOptions = (val: string) => {
                      if (!val) return { selected: [], anders: ''};
                      const splitIdx = val.lastIndexOf('(');
                      if (splitIdx > -1 && val.endsWith(')')) {
                         const main = val.substring(0, splitIdx).split(',').map(s => s.trim()).filter(Boolean);
                         const opm = val.substring(splitIdx + 1, val.length - 1).trim();
                         return { selected: main, anders: opm };
                      }
                      return { selected: val.split(',').map(s => s.trim()).filter(Boolean), anders: ''};
                   };

                   const od = parseOptions(row[`${prefix} - Onderzoeksdesign`] || '');
                   inst.onderzoeksdesign = od.selected;
                   inst.onderzoeksdesignAnders = od.anders;

                   const tmi = parseOptions(row[`${prefix} - Type meetinstrument`] || '');
                   inst.typeMeetinstrument = tmi.selected;
                   inst.typeMeetinstrumentAnders = tmi.anders;

                   const td = parseOptions(row[`${prefix} - Type data`] || '');
                   inst.typeData = td.selected;
                   inst.typeDataAnders = td.anders;

                   const int = parseOptions(row[`${prefix} - Interpretatie`] || '');
                   inst.interpretatie = int.selected;
                   inst.interpretatieAnders = int.anders;

                   interview[cat.key].push(inst);
                }
             }
             if (interview[cat.key].length === 0) {
                 interview[cat.key].push(createEmptyInstrument());
             }
          });

          return interview as InterviewData;
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
