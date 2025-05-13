"use client";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FaUpload, FaDownload, FaInfoCircle, FaArrowLeft } from "react-icons/fa";
import { studentService } from "../services/api.service";

const StudentImport = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.type !== "text/csv") {
      toast.error("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await studentService.import(formData);
      setImportResults(res.data);
      toast.success(res.data.message);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred during import";
      toast.error(errorMessage);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV content
    const csvContent =
      "name,studentId,class,section,age,gender\nJohn Doe,STU001,5,A,10,Male\nJane Smith,STU002,7,B,12,Female";

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <Link to="/students" className="back-button">
        <FaArrowLeft /> Back to Students
      </Link>

      <h1 className="text-2xl font-bold mb-6">Import Students</h1>

      <div className="form-container">
        <div className="info-box mb-6">
          <div className="flex items-start space-x-4">
            <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" size={20} />
            <div>
              <h3 className="font-medium text-blue-800">Import Instructions</h3>
              <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                <li>Upload a CSV file with student data</li>
                <li>The CSV must include headers: name, studentId, class, section, age, gender</li>
                <li>Student IDs must be unique</li>
                <li>Download the template below for the correct format</li>
              </ul>
              <button
                onClick={downloadTemplate}
                className="mt-3 inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaDownload className="mr-1.5" size={12} />
                Download Template
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="form-section-title">Upload CSV File</h2>
            <div className="file-upload-container">
              <div className="file-upload-area">
                <div className="file-upload-icon">
                  <FaUpload size={32} className="text-gray-400" />
                </div>
                <div className="file-upload-text">
                  <p className="text-sm font-medium text-gray-700">Drag and drop your CSV file here, or</p>
                  <label htmlFor="file-upload" className="file-upload-button">
                    Browse Files
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">CSV up to 10MB</p>
              </div>
              {file && (
                <div className="selected-file">
                  <div className="selected-file-name">
                    <FaInfoCircle className="text-blue-500 mr-2" />
                    <span>{file.name}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB • Selected {new Date().toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="btn btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
            <button type="submit" disabled={!file || uploading} className="btn btn-primary">
              {uploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" />
                  Import Students
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Import Results */}
      {importResults && (
        <div className="form-container mt-6">
          <h2 className="form-title">Import Results</h2>

          <div className="mb-4">
            <div className="success-message">
              <p>{importResults.message}</p>
            </div>
          </div>

          {importResults.errors && importResults.errors.length > 0 && (
            <div className="form-section">
              <h3 className="form-section-title text-red-600">Errors</h3>
              <div className="table-container">
                <table className="data-table error-table">
                  <thead>
                    <tr>
                      <th>Row</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importResults.errors.map((error, index) => (
                      <tr key={index}>
                        <td className="text-sm text-gray-500 max-w-xs truncate">{JSON.stringify(error.row)}</td>
                        <td className="text-sm text-red-500">{error.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button onClick={() => navigate("/students")} className="btn btn-primary">
              Go to Students List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentImport;
