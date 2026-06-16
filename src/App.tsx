import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { InterviewForm } from './components/InterviewForm';
import { AnalysisView } from './components/AnalysisView';
import { getInterviewById } from './store';
import { InterviewData } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'form' | 'analysis'>('dashboard');
  const [editingInterview, setEditingInterview] = useState<InterviewData | undefined>();
  const [analysisIds, setAnalysisIds] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleNewInterview = () => {
    setEditingInterview(undefined);
    setCurrentView('form');
  };

  const handleEditInterview = (id: string) => {
    const interview = getInterviewById(id);
    if (interview) {
      setEditingInterview(interview);
      setCurrentView('form');
    }
  };

  const handleAnalyze = (ids: string[]) => {
    setAnalysisIds(ids);
    setCurrentView('analysis');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setEditingInterview(undefined);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200">
      {currentView === 'dashboard' ? (
        <Dashboard 
          onNewInterview={handleNewInterview} 
          onEditInterview={handleEditInterview} 
          onAnalyze={handleAnalyze}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      ) : currentView === 'form' ? (
        <InterviewForm 
          initialData={editingInterview} 
          onBack={handleBackToDashboard} 
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      ) : (
        <AnalysisView
          ids={analysisIds}
          onBack={handleBackToDashboard}
          onOpenInterview={handleEditInterview}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
