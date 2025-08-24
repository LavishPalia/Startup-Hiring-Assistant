import React from "react";

interface FileUploadProps {
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
  return (
    <label className="cursor-pointer px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 text-center">
      Upload JSON
      <input
        type="file"
        accept=".json"
        onChange={onFileUpload}
        className="hidden"
      />
    </label>
  );
};
