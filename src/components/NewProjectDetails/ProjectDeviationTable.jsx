// Import required packages
import React, { useState, useEffect } from "react";
import { SquarePen, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

const ProjectDeviationTable = ({ projectId, projectdet, milestone }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviations, setDeviations] = useState([]);
  const [input, setInput] = useState([]);
  const [editingRows, setEditingRows] = useState({});
  const [editableDetails, setEditableDetails] = useState({});
  const rolepremission = useSelector((state) => state.userpermission);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const sessiondata = sessionStorage.getItem("userRole");
  const userRole =
    sessiondata === "superAdmin"
      ? "superAdmin"
      : sessiondata === "client"
        ? "client"
        : "SalesPerson";

  const formatDateSafe = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (projectId) fetchDeviationDetails();
  }, [projectId]);

  const fetchDeviationDetails = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`/server/crm_deviation_list/get/Deviationdetails/${projectId}`);
      if (!res.ok) throw new Error(`Error fetching data: ${res.status}`);
      const json = await res.json();

      if (Array.isArray(json.data)) {
        setDeviations(json.data);
      } else if (json.data) {
        setDeviations([json.data]);
      } else {
        setDeviations([]);
      }
    } catch (err) {
      console.error(err);
      setDeviations([]);
      setError("No Deviation List found.");
    } finally {
      setLoading(false);
    }
  };

  const hasEditPermission = (() => {
    if (!rolepremission?.permissiondata?.data) return false;

    for (const role of rolepremission.permissiondata.data) {
      for (const module of role.modules) {
        if (module.module === "Project view") {
          for (const component of module.components) {
            if (component.name === "Deviation List") {
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
      const actualRow = index < deviations.length
        ? deviations[index]
        : input[index - deviations.length];

      if (actualRow) {
        const matchedMilestone = milestone.find(
          (m) => m.id === actualRow.milestone_display_id
        );

        setEditableDetails((prev) => ({
          ...prev,
          [index]: {
            milestone_display_id: actualRow.milestone_display_id || "",
            milestone_name: actualRow.milestone_name || "",
            external_project_id: matchedMilestone?.external_project_id || actualRow.external_project_id || "",
            external_sprint_id: matchedMilestone?.external_sprint_id || actualRow.external_sprint_id || "",
            requested_date: formatDateSafe(actualRow.requested_date),
            meeting_link: actualRow.meeting_link || "",
            item_name: actualRow.item_name || "",
            item_description: actualRow.item_description || "",
            accommodated_milestone: actualRow.accommodated_milestone || "",
            estimated_hours: actualRow.estimated_hours || "",
            consumed_hours: actualRow.consumed_hours || "",
            approval: actualRow.approval,
            ROWID: actualRow.ROWID,
          },
        }));
      }

      setEditingRows((prev) => ({ ...prev, [index]: true }));
    } else {
      const isNewRow = index >= deviations.length;
      if (isNewRow) {
        const adjustedIndex = index - deviations.length;
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
    }
  };

  const handleRowSave = async (index) => {
    try {
      const row = editableDetails[index];
      if (!row) {
        toast.error("No data to save");
        return;
      }
      const meetingLinkRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      const numberRegex = /^\d+(\.\d+)?$/;
      if (!row.milestone_display_id) {
        toast.error("Milestone is required.");
        return;
      }
      if (row.meeting_link && !meetingLinkRegex.test(row.meeting_link.trim())) {
        toast.error("Invalid Meeting Link.");
        return;
      }
      if (row.estimated_hours && !numberRegex.test(row.estimated_hours)) {
        toast.error("Estimated Hours must be numeric.");
        return;
      }
      if (row.consumed_hours && !numberRegex.test(row.consumed_hours)) {
        toast.error("Consumed Hours must be numeric.");
        return;
      }

      const isExisting = index < deviations.length;

      const payload = {
        ...row,
        project_id: projectId,
        project_display_id: projectdet.project_display_id,
      };

      const res = await fetch(`/server/crm_deviation_list/Deviationdetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit");

      toast.success("Updated successfully");
      if (!isExisting) {
        const adjustedIndex = index - deviations.length;
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

      fetchDeviationDetails();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Error while saving deviation");
    }
  };

  const handleAddRow = () => {
    const newRow = {
      milestone_display_id: "",
      milestone_name: "",
      external_project_id: "",
      external_sprint_id: "",
      requested_date: "",
      meeting_link: "",
      item_name: "",
      item_description: "",
      accommodated_milestone: "",
      estimated_hours: "",
      consumed_hours: "",
      approval: "",
    };

    const index = deviations.length + input.length;
    setInput((prev) => [...prev, newRow]);
    setEditableDetails((prev) => ({
      ...prev,
      [index]: { ...newRow },
    }));
    setEditingRows((prev) => ({ ...prev, [index]: true }));
  };

  const handleDeleteRow = async (index) => {
    const existingLength = deviations.length;

    if (index < existingLength) {
      const item = deviations[index];
      const rowId = item.ROWID;

      if (!rowId) {
        toast.error("Cannot delete row without a valid ID.");
        return;
      }

      try {
        const res = await fetch(`/server/crm_deviation_list/delete/Deviationdetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rowId,
            deleted_by: sessionStorage.getItem("userId") || "unknown_user",
            deleted_by_name: sessionStorage.getItem("userName") || "unknown_user",
          }),
        });

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

        fetchDeviationDetails();
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
    const meetingLinkRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    const numberRegex = /^\d+(\.\d+)?$/;

    if (name === "meeting_link" && value.trim() && !meetingLinkRegex.test(value.trim())) {
      toast.error("Please enter a valid link starting with http:// or https://");
      return;
    }

    if ((name === "estimated_hours" || name === "consumed_hours") && value.trim() && !numberRegex.test(value.trim())) {
      toast.error(`${name.replace("_", " ")} must be numeric.`);
      return;
    }
  };

  const getValueOrNA = (value) =>
    value === undefined || value === null || value === "" ? "No data" : value;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading)
    return (
      <p className="text-center my-4">
        <div className="flex justify-center items-center w-full py-8">
          <div className="border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
        </div>
      </p>
    );

  if (error) return <p className="text-center text-[grey] my-4">{error}</p>;

  const allRows = [...deviations, ...input];
  const totalPages = Math.ceil(allRows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = allRows.slice(startIndex, endIndex);

  return (
    <div className="overflow-x-auto bg-white p-3 border rounded-lg mt-3 w-full">
      <div className="flex justify-between">
        <h3 className="text-[18px] text-[#000000] mt-2">Deviation List</h3>
        {hasEditPermission && (
          <div className="flex justify-end mb-2 gap-2">
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-[#344EA0] text-white hover:bg-[#263970] transition"
            >
              <span className="text-[12px] font-[inter] b-1 leading-none">+</span>
              <span>Add</span>
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
              <th className="border px-4 py-2">Requested Date</th>
              <th className="border px-4 py-2">Meeting Link</th>
              <th className="border px-4 py-2">Item Name</th>
              <th className="border px-4 py-2">Item Description</th>
              <th className="border px-4 py-2">Accommodated Milestone</th>
              <th className="border px-4 py-2">Estimated Hours</th>
              <th className="border px-4 py-2">Consumed Hours</th>
              <th className="border px-4 py-2">Approval</th>
              {hasEditPermission && <th className="border px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {paginatedRows.length === 0 && (
              <tr>
                <td
                  colSpan={hasEditPermission ? 11 : 10}
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

                  {/* Milestone */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <select
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.milestone_display_id ?? row.milestone_display_id ?? ""}
                        onChange={(e) => {
                          const selected = milestone.find((m) => m.id === e.target.value);
                          handleInputChange(actualIndex, "milestone_name", selected?.name || "");
                          handleInputChange(actualIndex, "milestone_display_id", selected?.id || "");
                          handleInputChange(actualIndex, "external_sprint_id", selected?.external_sprint_id || "");
                          handleInputChange(actualIndex, "external_project_id", selected?.external_project_id || "");
                        }}
                      >
                        <option value="">Select Milestone</option>
                        {milestone.map((m, mIdx) => (
                          <option key={mIdx} value={m.id}>
                            {m.id} - {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getValueOrNA(row.milestone_name)
                    )}
                  </td>

                  {/* Requested Date */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <input
                        type="date"
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.requested_date ?? formatDateSafe(row.requested_date)}
                        onChange={(e) => handleInputChange(actualIndex, "requested_date", e.target.value)}
                      />
                    ) : (
                      getValueOrNA(row.requested_date)
                    )}
                  </td>

                  {/* Meeting Link */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.meeting_link ?? row.meeting_link ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "meeting_link", e.target.value)}
                        onBlur={(e) => handleInputBlur(actualIndex, "meeting_link", e.target.value)}
                      />
                    ) : row.meeting_link &&
                      typeof row.meeting_link === "string" &&
                      row.meeting_link.trim().startsWith("http") ? (
                      <a
                        href={row.meeting_link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Meeting
                      </a>
                    ) : (
                      getValueOrNA(row.meeting_link)
                    )}
                  </td>

                  {/* Item Name */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.item_name ?? row.item_name ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "item_name", e.target.value)}
                      />
                    ) : (
                      getValueOrNA(row.item_name)
                    )}
                  </td>

                  {/* Item Description */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        rows={3}
                        value={editableDetails[actualIndex]?.item_description ?? row.item_description ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "item_description", e.target.value)}
                      />
                    ) : (
                      getValueOrNA(row.item_description)
                    )}
                  </td>

                  {/* Accommodated Milestone */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <select
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.accommodated_milestone ?? row.accommodated_milestone ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "accommodated_milestone", e.target.value)}
                      >
                        <option value="">Select Milestone</option>
                        {milestone.map((m, mIdx) => (
                          <option key={mIdx} value={m.id}>
                            {m.id} - {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      getValueOrNA(row.accommodated_milestone)
                    )}
                  </td>

                  {/* Estimated Hours */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <input
                        type="text"
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.estimated_hours ?? row.estimated_hours ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "estimated_hours", e.target.value)}
                        onBlur={(e) => handleInputBlur(actualIndex, "estimated_hours", e.target.value)}
                      />
                    ) : (
                      getValueOrNA(row.estimated_hours)
                    )}
                  </td>

                  {/* Consumed Hours */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <input
                        type="text"
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.consumed_hours ?? row.consumed_hours ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "consumed_hours", e.target.value)}
                        onBlur={(e) => handleInputBlur(actualIndex, "consumed_hours", e.target.value)}
                      />
                    ) : (
                      getValueOrNA(row.consumed_hours)
                    )}
                  </td>

                  {/* Approval */}
                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <select
                        className="p-1 border rounded w-full"
                        value={
                          editableDetails[actualIndex]?.approval !== undefined
                            ? String(editableDetails[actualIndex].approval)
                            : String(row.approval)
                        }
                        onChange={(e) => handleInputChange(actualIndex, "approval", e.target.value === "true")}
                      >
                        <option value="">Select</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : String(row.approval) === "true" ? (
                      "Yes"
                    ) : String(row.approval) === "false" ? (
                      "No"
                    ) : (
                      "No data"
                    )}
                  </td>

                  {/* Actions */}
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
                              className="px-3 py-1 text-[344EA0] rounded transition text-[14px]"
                              title="Cancel"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDeleteRow(actualIndex)}
                              className="px-3 py-1 text-[#454A53] rounded transition text-[14px]"
                              title="Delete"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleRowEditToggle(actualIndex)}
                              className="px-3 py-1 bg-[#344EA0] text-white rounded transition text-[14px] flex items-center gap-1"
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
              <td colSpan={hasEditPermission ? 11 : 10} className="border-0">
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
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProjectDeviationTable;