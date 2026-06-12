import { InterviewData, InstrumentMapping } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'excies_interviews';

export const getInterviews = (): InterviewData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data) as any[];
    // Migration: wrap older single-objects into arrays
    return parsed.map(item => {
      const migrateCategory = (catData: any): InstrumentMapping[] => {
        if (!catData) return [];
        if (Array.isArray(catData)) return catData.map(c => ({ id: uuidv4(), ...c, id_from_migration: true })); 
        // Note: we just generate new IDs if they are missing
        return [{ id: uuidv4(), ...catData }];
      };
      
      return {
        ...item,
        toetsbeleid: migrateCategory(item.toetsbeleid),
        toetsorganisatie: migrateCategory(item.toetsorganisatie),
        toetsbekwaamheid: migrateCategory(item.toetsbekwaamheid),
        toetsTaken: migrateCategory(item.toetsTaken),
        toetsprogramma: migrateCategory(item.toetsprogramma),
      } as InterviewData;
    });
  } catch (e) {
    console.error('Failed to parse interviews from local storage', e);
    return [];
  }
};

export const saveInterview = (interview: InterviewData) => {
  const interviews = getInterviews();
  const existingIndex = interviews.findIndex(i => i.id === interview.id);
  
  if (existingIndex >= 0) {
    interviews[existingIndex] = { ...interview, lastUpdated: new Date().toISOString() };
  } else {
    interviews.push({ ...interview, lastUpdated: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interviews));
};

export const deleteInterview = (id: string) => {
  const interviews = getInterviews();
  const filtered = interviews.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getInterviewById = (id: string): InterviewData | undefined => {
  return getInterviews().find(i => i.id === id);
};
