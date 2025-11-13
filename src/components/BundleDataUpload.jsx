import React, { useState } from "react";
import * as XLSX from "xlsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function BundleDataUpload() {
  const [excelData, setExcelData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setExcelData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const handleSubmit = () => {
    if (excelData.length === 0) {
      toast.error("Please upload an Excel file first.");
      return;
    }

    console.log("JSON Output:", JSON.stringify(excelData, null, 2));
    toast.success("Excel data submitted as JSON!");
  };

  return (
    <div className="p-6 space-y-6 w-[90%] lg:w-[100%] md:w-[92%]">
      <ToastContainer />
      <h2 className="text-2xl font-bold">Excel Upload & Preview</h2>

      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="p-2 border rounded"
      />

      {excelData.length > 0 && (
        <div className="overflow-auto border rounded mt-4">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-200">
              <tr>
                {Object.keys(excelData[0]).map((key) => (
                  <th key={key} className="px-4 py-2 border">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((cell, j) => (
                    <td key={j} className="px-4 py-2 border">
                      {cell === true ? '✓' : cell === false ? '✗' : cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


      <button
        onClick={handleSubmit}
        className="bg-[#06A1E3] text-white px-4 py-2 rounded"
      >
        Submit as JSON
      </button>
    </div>
  );
}
