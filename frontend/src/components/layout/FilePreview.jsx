import React from 'react';

const FilePreview = ({ filePath, label = 'File', className = '' }) => {
  if (!filePath) return null;

  const fileUrl = import.meta.env.VITE_API_URL + filePath;
  const fileExtension = filePath.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension);
  const isPDF = fileExtension === 'pdf';
  const isCSV = fileExtension === 'csv';

  const handleDownload = async () => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop(); // Extract file name
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className={`mt-3 ${className}`}>
      <span className="flex items-center text-[14px] font-medium text-secondary">
        {label} :
        <span
          className="inline-flex items-center cursor-pointer text-gray-700 mx-2"
          onClick={handleDownload}
        >
          {isImage ? (
            <>
              <img
                src={fileUrl}
                alt="file-preview"
                className="w-[50px] h-[50px] border border-[#eee] rounded-[10px] inline p-1"
              />
              <i className="ri-download-fill ml-2"></i>
            </>
          ) : isPDF ? (
            <>
              <i className="ri-file-pdf-fill text-2xl text-red-500 mr-2"></i> <i className="ri-download-fill"></i>
            </>
          ) : isCSV ? (
            <>
              <i className="ri-file-excel-fill text-2xl text-green-600 mr-2"></i> <i className="ri-download-fill"></i>
            </>
          ) : (
            <>
              <i className="ri-file-line text-2xl text-gray-600 mr-2"></i> <i className="ri-download-fill"></i>
            </>
          )}
        </span>
      </span>
    </div>
  );
};

export default FilePreview;