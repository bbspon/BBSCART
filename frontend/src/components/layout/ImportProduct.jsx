import React, { useRef, useState } from "react";

const ImportProduct = ({ setIsImportModalOpen, onImport }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const openFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // ✅ Store the actual file object
    }
  };

  const formatFileSize = (size) => {
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;

    while (size >= 1024 && index < units.length - 1) {
      size /= 1024;
      index++;
    }

    return `${size.toFixed(2)} ${units[index]}`;
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsImporting(true);
    setImportSuccess(false);
    
    const success = await onImport(selectedFile); // ✅ Await the response
    if (success.status === 200) {
      setTimeout(() => {
        setIsImporting(false);
        setImportSuccess(true);
        setTimeout(() => {
          setImportSuccess(false);
          setIsImportModalOpen(false);
        }, 1500);
      }, 1000);
    } else {
      setIsImporting(false);
      alert("Import failed. Please try again.", success.message);
    }
  };

  return (
    <div id="importProduct">
      <div className="min-h-[350px] flex flex-col justify-center items-center p-4 bg-gradient-to-br from-logoSecondary/10 to-logoPrimary/10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 text-center tracking-tight">Import Products</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-sm">Upload your product file in CSV or ZIP format. Only .csv and .zip files are supported.</p>
        <div className="w-full max-w-xs mx-auto">
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={openFileInput}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-logoSecondary to-logoPrimary hover:from-logoPrimary hover:to-logoSecondary text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 text-base focus:outline-none focus:ring-2 focus:ring-logoPrimary"
            >
              <i className="fa-solid fa-upload text-lg"></i> Choose File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept=".csv,.zip"
              onChange={handleFileChange}
            />
            <span className="text-gray-400 text-xs">Supported: .csv, .zip</span>
          </div>
          {selectedFile && (
            <div className="mt-6 w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <i className={`fa-solid ${selectedFile.name.endsWith('.csv') ? 'fa-file-csv' : 'fa-file-archive'} text-logoPrimary text-xl`}></i>
                <span className="font-medium text-gray-700 dark:text-gray-200">{selectedFile.name}</span>
              </div>
              <span className="text-xs text-gray-500 mb-2">{formatFileSize(selectedFile.size)}</span>
              <button
                className="w-full bg-gradient-to-r from-logoSecondary to-logoPrimary hover:from-logoPrimary hover:to-logoSecondary text-white font-semibold px-6 py-2 rounded-lg shadow transition-all duration-200 mt-2 disabled:opacity-60"
                onClick={handleImport}
                disabled={isImporting}
              >
                {isImporting ? (
                  <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Importing...</span>
                ) : (
                  "Import"
                )}
              </button>
              {isImporting && <div className="text-logoPrimary mt-2 text-sm flex items-center gap-2"><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Importing...</div>}
              {importSuccess && <p className="text-green-600 font-semibold mt-2">✅ Import Successful!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportProduct;