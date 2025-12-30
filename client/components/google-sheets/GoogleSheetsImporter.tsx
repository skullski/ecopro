// Main Google Sheets Importer Component

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GoogleConnect } from './GoogleConnect';
import { SheetSelector } from './SheetSelector';
import { ColumnMapper } from './ColumnMapper';
import { ImportResults } from './ImportResults';

type Step = 'connect' | 'setup' | 'mapping' | 'importing' | 'results';
type ImportType = 'orders' | 'customers' | 'products';

interface ImportState {
  spreadsheetId: string;
  sheetTitle: string;
  range: string;
  importType: ImportType;
  columnMapping: Record<string, string>;
  previewData: Array<Record<string, any>>;
  previewHeaders: string[];
}

export function GoogleSheetsImporter() {
  const [step, setStep] = useState<Step>('connect');
  const [isConnected, setIsConnected] = useState(false);
  const [importState, setImportState] = useState<Partial<ImportState>>({
    importType: 'orders',
  });
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleConnected = () => {
    setIsConnected(true);
    setStep('setup');
  };

  const handleDisconnected = () => {
    setIsConnected(false);
    setStep('connect');
    setImportState({});
  };

  const handleImportTypeChange = (type: ImportType) => {
    setImportState((prev) => ({
      ...prev,
      importType: type,
    }));
  };

  const handleSheetSelected = async (sheetTitle: string, range: string) => {
    setImportState((prev) => ({
      ...prev,
      sheetTitle,
      range,
    }));
    setError(null);

    // Preview data
    try {
      setStep('importing');
      const response = await fetch('/api/google/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: importState.spreadsheetId,
          range,
          limit: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to preview data');
      }

      const data = await response.json();
      setImportState((prev) => ({
        ...prev,
        previewData: data.preview,
        previewHeaders: data.headers,
      }));

      setStep('mapping');
    } catch (err: any) {
      setError(err.message);
      setStep('setup');
    }
  };

  const handleMappingComplete = async (mapping: Record<string, string>) => {
    setImportState((prev) => ({
      ...prev,
      columnMapping: mapping,
    }));

    // Start import
    await startImport(mapping);
  };

  const startImport = async (mapping: Record<string, string>) => {
    setStep('importing');
    try {
      const response = await fetch('/api/google/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spreadsheetId: importState.spreadsheetId,
          range: importState.range,
          import_type: importState.importType,
          column_mapping: mapping,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      setLastResult(result);
      setStep('results');
    } catch (err: any) {
      setError(err.message);
      setStep('mapping');
    }
  };

  const handleSpreadsheetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportState((prev) => ({
      ...prev,
      spreadsheetId: e.target.value,
    }));
  };

  const goBack = () => {
    if (step === 'results') {
      setStep('setup');
      setImportState((prev) => ({
        ...prev,
        sheetTitle: '',
        range: '',
        previewData: [],
        previewHeaders: [],
      }));
    } else if (step === 'mapping') {
      setStep('setup');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      {/* Breadcrumb / Steps */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <button
          onClick={() => setStep('connect')}
          className={`px-3 py-1 rounded ${
            step === 'connect' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Connect
        </button>
        <span className="text-gray-400">→</span>
        <button
          onClick={() => step !== 'connect' && setStep('setup')}
          className={`px-3 py-1 rounded ${
            step === 'setup' ? 'bg-blue-600 text-white' : step === 'connect' ? 'text-gray-400' : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled={step === 'connect'}
        >
          Setup
        </button>
        <span className="text-gray-400">→</span>
        <button
          onClick={() => (step !== 'connect' && step !== 'setup') && setStep('mapping')}
          className={`px-3 py-1 rounded ${
            step === 'mapping' ? 'bg-blue-600 text-white' : (step === 'connect' || step === 'setup') ? 'text-gray-400' : 'text-gray-600 hover:text-gray-900'
          }`}
          disabled={step === 'connect' || step === 'setup'}
        >
          Map
        </button>
        <span className="text-gray-400">→</span>
        <button
          className={`px-3 py-1 rounded ${
            step === 'results' ? 'bg-blue-600 text-white' : 'text-gray-400'
          }`}
          disabled={true}
        >
          Results
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Connect Step */}
        {step === 'connect' && (
          <GoogleConnect onConnected={handleConnected} />
        )}

        {/* Setup Step */}
        {step === 'setup' && (
          <SetupStep
            importState={importState}
            onSpreadsheetChange={handleSpreadsheetChange}
            onImportTypeChange={handleImportTypeChange}
            onSheetSelected={handleSheetSelected}
            error={error}
          />
        )}

        {/* Mapping Step */}
        {step === 'mapping' && importState.previewHeaders && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Preview Data</h4>
              <div className="overflow-x-auto">
                <table className="text-sm w-full">
                  <thead>
                    <tr className="border-b border-blue-200">
                      {importState.previewHeaders?.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 text-left font-semibold text-blue-900"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {importState.previewData?.slice(0, 3).map((row, idx) => (
                      <tr key={idx} className="border-b border-blue-100">
                        {importState.previewHeaders?.map((header) => (
                          <td key={header} className="px-3 py-2 text-blue-800">
                            {String(row[header] || '—').slice(0, 50)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ColumnMapper
              importType={importState.importType || 'orders'}
              sheetColumns={importState.previewHeaders || []}
              onMappingComplete={handleMappingComplete}
            />

            <button
              onClick={goBack}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Importing your data...</p>
          </div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <div className="space-y-6">
            <ImportResults initialResult={lastResult} onClose={goBack} />
          </div>
        )}

        {/* Error Display */}
        {error && step !== 'connect' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

interface SetupStepProps {
  importState: Partial<ImportState>;
  onSpreadsheetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportTypeChange: (type: ImportType) => void;
  onSheetSelected: (sheetTitle: string, range: string) => void;
  error: string | null;
}

function SetupStep({
  importState,
  onSpreadsheetChange,
  onImportTypeChange,
  onSheetSelected,
  error,
}: SetupStepProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Spreadsheet ID
        </label>
        <p className="text-xs text-gray-600 mb-2">
          (Get it from the URL: sheets.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/)
        </p>
        <input
          type="text"
          value={importState.spreadsheetId || ''}
          onChange={onSpreadsheetChange}
          placeholder="1BxiMVs0XRA5nFMKUVfIaWGqVXC1k7A..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Import Type
        </label>
        <div className="space-y-2">
          {(['orders', 'customers', 'products'] as ImportType[]).map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="importType"
                value={type}
                checked={importState.importType === type}
                onChange={() => onImportTypeChange(type)}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700 capitalize">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {importState.spreadsheetId && (
        <SheetSelector
          spreadsheetId={importState.spreadsheetId}
          onSheetSelected={onSheetSelected}
        />
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
