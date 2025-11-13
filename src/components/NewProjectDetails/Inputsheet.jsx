import { React, useEffect, useState, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SquarePen, Save, Plus } from "lucide-react";
import { useSelector } from "react-redux";

const Inputsheet = ({ projectId, projectdet, milestone }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState([]);
  const [input, setInput] = useState([]);
  const [editableDetails, setEditableDetails] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const [editingRows, setEditingRows] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const sessiondata = sessionStorage.getItem("userRole");
  const userRole =
    sessiondata === "superAdmin"
      ? "superAdmin"
      : sessiondata === "client"
        ? "client"
        : "SalesPerson";

  const user = sessionStorage.getItem("email");
  const milestone_data = milestone;
  const rolepremission = useSelector((state) => state.userpermission);

  const fetchMeetingDetails = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(
        `/server/crm_input_sheet/inputsheetdetails/${projectId}`
      );
      if (!res.ok) throw new Error(`Error fetching data: ${res.status}`);
      const json = await res.json();
      setSummary(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error(error);
      setError(error.message || "Error fetching data");
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchMeetingDetails();
    }
  }, [projectId, fetchMeetingDetails]);

  const hasEditPermission = (() => {
    if (!rolepremission?.permissiondata?.data) return false;

    for (const role of rolepremission.permissiondata.data) {
      for (const module of role.modules) {
        if (module.module === "Project view") {
          for (const component of module.components) {
            if (component.name === "Input Sheet") {
              return component.permissions?.some((perm) =>
                perm.toLowerCase().includes("edit")
              );
            }
          }
        }
      }
    }
    return false;
  })();

  const handleRowEditToggle = (index) => {
    const isCurrentlyEditing = editingRows[index];

    if (!isCurrentlyEditing) {
      const actualRow = index < summary.length
        ? summary[index]?.input_sheets
        : input[index - summary.length];

      if (actualRow) {
        const sheet = actualRow;
        const milestoneNameFromAPI = sheet.milestone_name || "";
        const matchedMilestone = milestone_data.find(
          (m) => m.name === milestoneNameFromAPI
        );

        setEditableDetails((prev) => ({
          ...prev,
          [index]: {
            milestone_name: milestoneNameFromAPI,
            milestone_display_id: matchedMilestone?.id || sheet.milestone_display_id || "",
            external_sprint_id: matchedMilestone?.external_sprint_id || sheet.external_sprint_id || "",
            shared_date: sheet.shared_date || "",
            product: sheet.product || "",
            input_sheet_summary: sheet.input_sheet_summary || "",
            workdrive_link: sheet.workdrive_link || "",
            ROWID: sheet.ROWID,
          },
        }));
      }

      setEditingRows((prev) => ({ ...prev, [index]: true }));
    } else {
      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      setEditableDetails((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const handleRowSave = async (index) => {
    try {
      const row = editableDetails[index];

      if (!row) {
        toast.error("No data to save");
        return;
      }
      if (!row.milestone_display_id || !row.milestone_name) {
        toast.error("Milestone is required.");
        return;
      }
      if (!row.shared_date) {
        toast.error("Shared Date is required.");
        return;
      }
      if (!row.product?.trim()) {
        toast.error("Product is required.");
        return;
      }
      if (row.product && /[^a-zA-Z\s0-9]/.test(row.product)) {
        toast.error("Product should contain only letters, numbers, and spaces!");
        return;
      }
      if (!row.input_sheet_summary?.trim()) {
        toast.error("Input Sheet Summary is required.");
        return;
      }

      const isExisting = index < summary.length;

      const updatedRow = {
        ...row,
        project_display_id: projectdet?.project_display_id,
        project_name: projectdet?.project_name,
        projectId: projectId,
        shared_date: formatDate(row.shared_date),
        sheet_link: `https://forms.zohopublic.in/demoelitetechpark/form/InputSheets/formperma/B88cmNB9DLO8l7t8qItfVbzXcsrN85n34MPfRmVNtVw?milestone=${encodeURIComponent(
          row.milestone_name
        )}&customer_email=${user}&sprints_project_id=${projectId}&sprints_milestone_id=${row.external_sprint_id || ""
          }&project_display_id=${projectdet.project_display_id}&milestone_name=${encodeURIComponent(
            row.milestone_name
          )}&project_name=${encodeURIComponent(projectdet.project_name)}&milestone_display_id=${row.milestone_display_id
          }`,
      };

      const payload = {
        project_id: projectId,
        input_sheets: [updatedRow],
        milestone_display_id: row.milestone_display_id,
        triggerEvent: "Input Sheet Updated",
        actionby: sessionStorage.getItem("userId") || "unknown_user",
        actionbyName: sessionStorage.getItem("userName") || "unknown_user",
      };
      const res = await fetch("/server/crm_input_sheet/inputsheetportal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to submit");
      toast.success("Updated successfully");
      if (!isExisting) {
        const adjustedIndex = index - summary.length;
        setInput((prev) => prev.filter((_, i) => i !== adjustedIndex));
      }
      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setEditableDetails((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      fetchMeetingDetails();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Error while saving input sheet");
    }
  };


  const handleAddRow = () => {
    const index = summary.length + input.length;

    setEditableDetails((prev) => ({
      ...prev,
      [index]: {
        milestone_name: "",
        milestone_display_id: "",
        external_sprint_id: "",
        shared_date: "",
        product: "",
        input_sheet_summary: "",
        workdrive_link: "",
        ROWID: null,
      },
    }));
    setEditingRows((prev) => ({ ...prev, [index]: true }));
  };
  const handleDeleteRow = async (index) => {
    const existingLength = summary.length;
    if (index < existingLength) {
      const item = summary[index];
      const rowId = item?.input_sheets?.ROWID;
      const milestone_display_id = item?.input_sheets?.milestone_display_id;
      if (!rowId) {
        toast.error("Cannot delete row without a valid ID.");
        return;
      }
      try {
        const res = await fetch(
          `/server/crm_input_sheet/delete/inputsheetdetails`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ROWID: rowId,
              milestone_display_id: milestone_display_id,
              project_id: projectId,
              deleted_by: sessionStorage.getItem("userId") || "unknown_user",
              deleted_by_name: sessionStorage.getItem("userName") || "unknown_user",
            }),
          }
        );
        if (!res.ok) throw new Error("Failed to delete");
        toast.success("Row deleted successfully");
        setEditingRows((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });

        setEditableDetails((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });

        fetchMeetingDetails();
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete row");
      }
    } else {
      const adjustedIndex = index - existingLength;
      setInput((prev) => prev.filter((_, i) => i !== adjustedIndex));

      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

      setEditableDetails((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const handleInputChange = (index, name, value) => {
    setEditableDetails((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        [name]: value,
      },
    }));
  };

  const handleInputBlur = (index, name, value) => {
    if (name === "product" && value && /[^a-zA-Z\s0-9]/.test(value)) {
      toast.error("Product should contain only letters, numbers, and spaces!");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  };

  if (loading)
    return (
      <p className="text-center my-4">
        <div className="flex justify-center items-center w-full py-8">
          <div className="border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </p>
    );
  if (error) return <p className="text-center text-red-500 my-4">Error: {error}</p>;
  const allRows = [
    ...summary.map((item) => item?.input_sheets).filter(Boolean),
    ...input,
    ...Object.keys(editingRows)
      .filter(key => parseInt(key) >= summary.length + input.length && editingRows[key])
      .map(key => editableDetails[key] || {})
  ];
  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = allRows.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="overflow-x-auto bg-white p-3 border rounded-lg mt-3 w-full">
      <div className="flex justify-between">
        <h3 className="text-[18px] texxt-[#000000] mt-2">Input Sheet</h3>
        {hasEditPermission && (
          <div className="flex justify-end mb-2 gap-2">
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-[#344EA0] text-white hover:bg-[#263970] transition"
            >
              <Plus size={16} />
              <span className="text-[16px] font-[inter]">Add</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-auto max-h-[65vh] overflow-x-auto overflow-y-auto scrollbar-hide">
        <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
          <thead className="bg-[#D1D5DB] text-[#111827] font-[Instrument Sans] text-center">
            <tr>
              <th className="border px-4 py-2">S.No</th>
              <th className="border px-4 py-2">Milestone</th>
              <th className="border px-4 py-2">Shared Date</th>
              <th className="border px-4 py-2">Product</th>
              <th className="border px-4 py-2">Input Sheet Summary</th>
              <th className="border px-4 py-2">Workdrive Link</th>
              <th className="border px-4 py-2">Form Link</th>
              {hasEditPermission && <th className="border px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {paginatedRows.length === 0 && (
              <tr>
                <td
                  colSpan={hasEditPermission ? 8 : 7}
                  className="text-center align-middle py-4 text-gray-500"
                >
                  {loading ? "Loading..." : "No data found. Click 'Add' to add one."}
                </td>
              </tr>
            )}

            {paginatedRows.map((row, idx) => {
              const actualIndex = startIndex + idx;
              const isRowEditing = editingRows[actualIndex];

              return (
                <tr key={actualIndex}>
                  <td className="border px-4 py-2">{actualIndex + 1}</td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (

                      <select
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.milestone_display_id || ""}
                        onChange={(e) => {
                          const selected = milestone_data.find((m) => m.id === e.target.value);
                          handleInputChange(actualIndex, "milestone_name", selected?.name || "");
                          handleInputChange(actualIndex, "milestone_display_id", selected?.id || "");
                          handleInputChange(actualIndex, "external_sprint_id", selected?.external_sprint_id || "");
                        }}
                      >
                        <option value="">Select Milestone</option>
                        {milestone_data.map((m, mIdx) => (
                          <option key={mIdx} value={m.id}>
                            {m.id} - {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      row.milestone_name || "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <input
                        type="date"
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.shared_date ?? formatDate(row.shared_date)}
                        onChange={(e) => handleInputChange(actualIndex, "shared_date", e.target.value)}
                      />
                    ) : (
                      row.shared_date || "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.product ?? row.product ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "product", e.target.value)}
                        onBlur={(e) => handleInputBlur(actualIndex, "product", e.target.value)}
                      />
                    ) : (
                      row.product || "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        rows={3}
                        value={editableDetails[actualIndex]?.input_sheet_summary ?? row.input_sheet_summary ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "input_sheet_summary", e.target.value)}
                      />
                    ) : (
                      row.input_sheet_summary || "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        rows={2}
                        value={editableDetails[actualIndex]?.workdrive_link ?? row.workdrive_link ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "workdrive_link", e.target.value)}
                      />
                    ) : row.workdrive_link &&
                      typeof row.workdrive_link === "string" &&
                      row.workdrive_link.trim().startsWith("http") ? (
                      <div className="flex items-center gap-2 justify-center">
                        <a
                          href={row.workdrive_link.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-blue-500"
                          >
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                          </svg>
                          <span className="text-gray-700">WorkDrive</span>
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(row.workdrive_link.trim());
                            toast.success("Link copied to clipboard!");
                          }}
                          className="p-1 hover:bg-gray-100 rounded transition"
                          title="Copy link"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-gray-500"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    <button
                      onClick={() => {
                        const displayValues = { ...row, ...(editableDetails[actualIndex] || {}) };
                        const milestone_name = displayValues.milestone_name || "Unknown Milestone";
                        const display_id =
                          displayValues.milestone_display_id || row.milestone_display_id || "";

                        const url = `https://forms.zohopublic.in/demoelitetechpark/form/InputSheets/formperma/B88cmNB9DLO8l7t8qItfVbzXcsrN85n34MPfRmVNtVw?milestone=${encodeURIComponent(
                          milestone_name
                        )}&customer_email=${user}&sprints_project_id=${projectId}&sprints_milestone_id=${displayValues.external_sprint_id || ""
                          }&project_display_id=${projectdet.project_display_id
                          }&milestone_name=${encodeURIComponent(
                            milestone_name
                          )}&project_name=${encodeURIComponent(projectdet.project_name)}&milestone_display_id=${display_id}`;
                        setFormUrl(url);
                        setModalOpen(true);
                      }}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition mx-auto"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-blue-500"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                      <span className="text-gray-700">View Form</span>
                    </button>
                  </td>

                  {hasEditPermission && (
                    <td className="border px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        {isRowEditing ? (
                          <>
                            <button
                              onClick={() => handleRowSave(actualIndex)}
                              className="px-3 py-1 bg-[#344EA0] border rounded-full text-white rounded  transition text-[14px]"
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => handleRowEditToggle(actualIndex)}
                              className="px-3 py-1 text-[344EA0] rounded  transition text-[14px]"
                              title="Cancel"
                            >
                              Cancel
                            </button>

                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDeleteRow(actualIndex)}
                              className="px-3 py-1  text-[#454A53] rounded  transition text-[14px]"
                              title="Delete"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleRowEditToggle(actualIndex)}
                              className="px-3 py-1 bg-[#344EA0] text-white rounded  transition text-[14px] flex items-center gap-1"
                              title="Edit"
                            >
                              <SquarePen size={12} />
                              Edit
                            </button>

                          </>

                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={hasEditPermission ? 8 : 7} className="border-0">
                <div className="flex items-center justify-between py-3 px-4 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, allRows.length)} of {allRows.length} entries
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex gap-1">
                      {[...Array(totalPages)].map((_, index) => {
                        const pageNum = index + 1;
                        if (
                          pageNum === 1 ||
                          pageNum === totalPages ||
                          (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 border rounded ${currentPage === pageNum
                                ? "bg-[#344EA0] text-white"
                                : "hover:bg-gray-100"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        } else if (
                          pageNum === currentPage - 2 ||
                          pageNum === currentPage + 2
                        ) {
                          return <span key={pageNum} className="px-2">...</span>;
                        }
                        return null;
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>

        <ToastContainer position="top-right" autoClose={3000} />
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[50%] h-[80%] rounded-lg shadow-lg relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-2 text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
            >
              x
            </button>
            <iframe
              src={formUrl}
              title="Input Form"
              className="w-full h-full mt-3 rounded-b-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inputsheet;