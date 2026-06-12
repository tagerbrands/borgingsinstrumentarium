import { v4 as uuidv4 } from 'uuid';

export type CheckboxGroup = string[];

export interface InstrumentMapping {
  id: string;
  instrumentnaam: string;
  regelmaat: string;
  opmerkingen: string;
  onderzoeksdesign: CheckboxGroup;
  onderzoeksdesignAnders: string;
  typeMeetinstrument: CheckboxGroup;
  typeMeetinstrumentAnders: string;
  typeData: CheckboxGroup;
  typeDataAnders: string;
  interpretatie: CheckboxGroup;
  interpretatieAnders: string;
}

export interface InterviewData {
  id: string;
  lastUpdated: string;
  // Meta
  excie: string;
  datum: string;
  cveLid: string;
  
  // Startvragen
  onderwijsvorm: CheckboxGroup;
  onderwijsvormOpmerkingen: string;
  doelExcie: string;
  modelKader: string;
  borgingsagenda: string;
  drieDoelen: string;
  betekenisKwaliteitBorgen: string;
  visieToetsing: string;
  
  // Categories
  toetsbeleid: InstrumentMapping[];
  toetsorganisatie: InstrumentMapping[];
  toetsbekwaamheid: InstrumentMapping[];
  toetsTaken: InstrumentMapping[];
  toetsprogramma: InstrumentMapping[];
  
  // Slotvragen
  verdereInstrumenten: string;
  eigenstandigOordeel: string;
  vragenBorgenKwaliteit: string;
  delenBestPractices: 'Ja' | 'Nee' | '';
  delenBestPracticesOpmerkingen: string;
}

export const createEmptyInstrument = (): InstrumentMapping => ({
  id: uuidv4(),
  instrumentnaam: '',
  regelmaat: '',
  opmerkingen: '',
  onderzoeksdesign: [],
  onderzoeksdesignAnders: '',
  typeMeetinstrument: [],
  typeMeetinstrumentAnders: '',
  typeData: [],
  typeDataAnders: '',
  interpretatie: [],
  interpretatieAnders: ''
});

export const defaultInterview: Omit<InterviewData, 'id' | 'lastUpdated'> = {
  excie: '',
  datum: '',
  cveLid: '',
  onderwijsvorm: [],
  onderwijsvormOpmerkingen: '',
  doelExcie: '',
  modelKader: '',
  borgingsagenda: '',
  drieDoelen: '',
  betekenisKwaliteitBorgen: '',
  visieToetsing: '',
  toetsbeleid: [createEmptyInstrument()],
  toetsorganisatie: [createEmptyInstrument()],
  toetsbekwaamheid: [createEmptyInstrument()],
  toetsTaken: [createEmptyInstrument()],
  toetsprogramma: [createEmptyInstrument()],
  verdereInstrumenten: '',
  eigenstandigOordeel: '',
  vragenBorgenKwaliteit: '',
  delenBestPractices: '',
  delenBestPracticesOpmerkingen: '',
};

export const ONDERWIJSVORM_OPTIONS = [
  'TGO',
  'Programmatisch toetsen',
  'Flexibel onderwijs',
  'Inter-/transdiciplinair toetsen'
];

export const ONDERZOEKSDESIGN_OPTIONS = ['Observatie', 'Kwantitatief', 'Kwalitatief', 'Documentstudie'];
export const TYPE_MEETINSTRUMENT_OPTIONS = ['Observatieformulier', 'Checklist', 'Vragenlijst', 'Interview'];
export const TYPE_DATA_OPTIONS = ["Thema's", 'Cijfermatig', 'Indruk', 'Synthese'];
export const INTERPRETATIE_OPTIONS = ['Gevoelsmatig', 'Drempelwaarden', 'Statistisch', 'Holistisch'];

export const CATEGORIES = [
  { key: 'toetsbeleid', label: 'TOETSBELEID', color: 'bg-pink-100 border-pink-300', headerBg: 'bg-pink-200' },
  { key: 'toetsorganisatie', label: 'TOETSORGANISATIE', color: 'bg-orange-100 border-orange-300', headerBg: 'bg-orange-200' },
  { key: 'toetsbekwaamheid', label: 'TOETSBEKWAAMHEID', color: 'bg-green-100 border-green-300', headerBg: 'bg-green-200' },
  { key: 'toetsTaken', label: 'TOETS(TAK)EN', color: 'bg-blue-100 border-blue-300', headerBg: 'bg-blue-200' },
  { key: 'toetsprogramma', label: 'TOETSPROGRAMMA', color: 'bg-teal-100 border-teal-300', headerBg: 'bg-teal-200' },
] as const;
