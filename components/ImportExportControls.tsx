import React, { useRef } from 'react';
import { ArrowUpOnSquareIcon, ArrowDownOnSquareIcon } from './Icons';

interface ImportExportControlsProps {
  dataToExport: any;
  exportFileName: string;
  onImport: (importedData: any) => void;
  importLabel: string;
  addToast: (message: string) => void;
}

export const ImportExportControls: React.FC<ImportExportControlsProps> = ({
  dataToExport,
  exportFileName,
  onImport,
  importLabel,
  addToast,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!dataToExport || (Array.isArray(dataToExport) && dataToExport.length === 0)) {
        addToast("There is no data to export.");
        return;
    }
    try {
        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = exportFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        addToast("Data exported successfully!");
    } catch (error) {
        console.error("Failed to export data", error);
        addToast("Error: Could not export data.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            throw new Error("File content is not readable.");
        }
        const jsonData = JSON.parse(text);
        onImport(jsonData);
      } catch (error) {
        console.error("Failed to import file", error);
        addToast("Error: Invalid JSON file or file is corrupted.");
      }
    };
    reader.onerror = () => {
        addToast("Error: Failed to read the file.");
    }
    reader.readAsText(file);

    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
        aria-hidden="true"
      />
      <button
        onClick={handleImportClick}
        className="flex items-center px-3 py-2 bg-blue-800/60 text-blue-300 text-xs font-semibold rounded-lg shadow-sm hover:bg-blue-800/90 transition-colors duration-300"
        aria-label={importLabel}
      >
        <ArrowDownOnSquareIcon className="mr-2 h-4 w-4" />
        Import
      </button>
      <button
        onClick={handleExport}
        className="flex items-center px-3 py-2 bg-gray-600/60 text-gray-300 text-xs font-semibold rounded-lg shadow-sm hover:bg-gray-600/90 transition-colors duration-300"
        aria-label="Export data"
      >
        <ArrowUpOnSquareIcon className="mr-2 h-4 w-4" />
        Export
      </button>
    </div>
  );
};