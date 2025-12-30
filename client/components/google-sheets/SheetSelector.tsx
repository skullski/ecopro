// Sheet Selector Component

import React, { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

interface SheetInfo {
  sheetId: number;
  title: string;
  index: number;
}

interface SheetSelectorProps {
  spreadsheetId: string;
  onSheetSelected: (sheetTitle: string, range: string) => void;
}

export function SheetSelector({ spreadsheetId, onSheetSelected }: SheetSelectorProps) {
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    if (spreadsheetId) {
      loadSheets();
    }
  }, [spreadsheetId]);

  const loadSheets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/google/sheets/${spreadsheetId}`);

      if (!response.ok) {
        throw new Error('Failed to load sheets');
      }

      const data = await response.json();
      setSheets(data.sheets || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSheetSelect = (sheet: SheetInfo) => {
    setSelectedSheet(sheet.title);
    setIsOpen(false);
    // Generate range: Sheet name + all data starting from A1
    const range = `'${sheet.title}'!A:Z`;
    onSheetSelected(sheet.title, range);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading sheets...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (sheets.length === 0) {
    return <p className="text-sm text-gray-600">No sheets found</p>;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:bg-gray-50"
      >
        <span className="text-sm">{selectedSheet || 'Select a sheet...'}</span>
        <ChevronDown className={`w-4 h-4 transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {sheets.map((sheet) => (
            <button
              key={sheet.sheetId}
              onClick={() => handleSheetSelect(sheet)}
              className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm border-b last:border-b-0"
            >
              {sheet.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
