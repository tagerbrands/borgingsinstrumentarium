import React from 'react';
import { InstrumentMapping, CheckboxGroup, ONDERZOEKSDESIGN_OPTIONS, TYPE_MEETINSTRUMENT_OPTIONS, TYPE_DATA_OPTIONS, INTERPRETATIE_OPTIONS } from '../types';

interface Props {
  label: string;
  colorClass: string;
  headerClass: string;
  data: InstrumentMapping;
  onChange: (data: InstrumentMapping) => void;
}

export const InstrumentBlock: React.FC<Props> = ({ label, colorClass, headerClass, data, onChange }) => {
  
  const handleTextChange = (field: keyof InstrumentMapping, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleCheckboxChange = (field: keyof InstrumentMapping, option: string) => {
    const currentSelection = data[field] as CheckboxGroup;
    let newSelection: CheckboxGroup;
    
    if (currentSelection.includes(option)) {
      newSelection = currentSelection.filter(item => item !== option);
    } else {
      newSelection = [...currentSelection, option];
    }
    
    onChange({ ...data, [field]: newSelection });
  };

  const renderCheckboxColumn = (title: string, field: keyof InstrumentMapping, andersField: keyof InstrumentMapping, options: string[]) => (
    <div className="flex-1 min-w-[150px]">
      <div className={`font-semibold text-sm mb-2 pb-1 border-b ${headerClass.replace('bg-', 'border-').replace('200', '400')} dark:border-opacity-30`}>
        {title}
      </div>
      <div className="space-y-1">
        {options.map(option => (
          <label key={option} className="flex items-start gap-2 cursor-pointer text-sm">
            <input 
              type="checkbox" 
              className="mt-1 shrink-0 accent-blue-600"
              checked={(data[field] as CheckboxGroup).includes(option)}
              onChange={() => handleCheckboxChange(field, option)}
            />
            <span className="leading-tight text-gray-800 dark:text-gray-200">{option}</span>
          </label>
        ))}
        <input
            type="text"
            placeholder="Anders nl..."
            className="w-full text-sm mt-2 px-2 py-1 border border-gray-200 dark:border-gray-600 rounded outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 placeholder-gray-400 bg-white/50 dark:bg-gray-700/50 dark:text-gray-100 transition-colors"
            value={data[andersField] as string}
            onChange={(e) => handleTextChange(andersField, e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className={`flex border ${colorClass.split(' ')[1]} shadow-sm bg-white dark:bg-gray-800 rounded-md overflow-hidden transition-colors`}>
      {/* Sidebar Label */}
      <div className={`${headerClass} dark:opacity-80 w-12 flex items-center justify-center border-r ${colorClass.split(' ')[1]}`}>
        <div className="font-bold text-sm tracking-wider uppercase text-gray-800" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          {label}
        </div>
      </div>
      
      {/* Content */}
      <div className={`flex-1 p-0 ${colorClass.split(' ')[0]} dark:bg-opacity-10`}>
        {/* Top Text Inputs */}
        <div className="space-y-0 border-b border-gray-300 dark:border-gray-600">
          <div className="flex border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors">
            <label className="w-40 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 shrink-0 flex items-center">Instrumentnaam:</label>
            <input 
              type="text" 
              className="flex-1 px-3 py-2 bg-transparent outline-none focus:bg-blue-50/50 dark:focus:bg-blue-900/20 dark:text-gray-100 transition-colors"
              value={data.instrumentnaam}
              onChange={(e) => handleTextChange('instrumentnaam', e.target.value)}
            />
          </div>
          <div className="flex border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors">
            <label className="w-40 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 shrink-0 flex items-center">Regelmaat van inzet:</label>
            <input 
              type="text" 
              className="flex-1 px-3 py-2 bg-transparent outline-none focus:bg-blue-50/50 dark:focus:bg-blue-900/20 dark:text-gray-100 transition-colors"
              value={data.regelmaat}
              onChange={(e) => handleTextChange('regelmaat', e.target.value)}
            />
          </div>
          <div className="flex bg-white dark:bg-gray-800 transition-colors">
            <label className="w-40 px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 shrink-0 flex items-center">Opmerkingen:</label>
            <input 
              type="text" 
              className="flex-1 px-3 py-2 bg-transparent outline-none focus:bg-blue-50/50 dark:focus:bg-blue-900/20 dark:text-gray-100 transition-colors"
              value={data.opmerkingen}
              onChange={(e) => handleTextChange('opmerkingen', e.target.value)}
            />
          </div>
        </div>

        {/* Checkbox Grid */}
        <div className="flex flex-wrap gap-4 p-4 bg-white/60 dark:bg-gray-800/80 transition-colors">
          {renderCheckboxColumn('Onderzoeksdesign', 'onderzoeksdesign', 'onderzoeksdesignAnders', ONDERZOEKSDESIGN_OPTIONS)}
          {renderCheckboxColumn('Type meetinstrument', 'typeMeetinstrument', 'typeMeetinstrumentAnders', TYPE_MEETINSTRUMENT_OPTIONS)}
          {renderCheckboxColumn('Type data', 'typeData', 'typeDataAnders', TYPE_DATA_OPTIONS)}
          {renderCheckboxColumn('Interpretatie', 'interpretatie', 'interpretatieAnders', INTERPRETATIE_OPTIONS)}
        </div>
      </div>
    </div>
  );
};
