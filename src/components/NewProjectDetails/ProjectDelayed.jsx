import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SquarePen, Save } from "lucide-react";
import { useSelector } from "react-redux";

const Projectdelayed = ({ projectId, milestone, projectdet }) => {
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState([]);
  const [summary, setSummary] = useState([]);
  const [editableDetails, setEditableDetails] = useState({});
  const [editingRows, setEditingRows] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const rolepremission = useSelector((state) => state.userpermission);

  const sessiondata = sessionStorage.getItem("userRole");
  const userRole =
    sessiondata === "superAdmin"
      ? "superAdmin"
      : sessiondata === "client"
        ? "client"
        : "SalesPerson";

  const milestone_data = milestone;

  async function fetchMeetingDetails() {
    try {
      setLoading(true);
      const res = await fetch(
        `/server/crm_project_delayed_remainder/get/delayed-reminders/${projectId}`
      );
      if (!res.ok) {
        console.warn(`Error fetching data: ${res.status}`);
        setSummary([]);
        return;
      }
      const json = await res.json();
      setSummary(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) fetchMeetingDetails();
  }, [projectId]);

  const hasEditPermission = (() => {
    if (!rolepremission?.permissiondata?.data) return false;

    for (const role of rolepremission.permissiondata.data) {
      for (const module of role.modules) {
        if (module.module === "Project view") {
          for (const component of module.components) {
            if (component.name === "Project Delayed Reminders") {
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

  const handleRowEditToggle = (actualIndex) => {
    const isCurrentlyEditing = editingRows[actualIndex];

    if (!isCurrentlyEditing) {
      const actualRow = actualIndex < summary.length
        ? summary[actualIndex]
        : input[actualIndex - summary.length];

      if (actualRow) {
        setEditableDetails((prev) => ({
          ...prev,
          [actualIndex]: {
            milestone_display_id: actualRow.milestone_display_id || "",
            task_details_link: actualRow.task_details_link || "",
            reminder_date: actualRow.reminder_date || "",
            remainded_by: actualRow.remainded_by || "",
            acknowledged_by_client: actualRow.acknowledged_by_client,
          },
        }));
      }

      setEditingRows((prev) => ({ ...prev, [actualIndex]: true }));
    } else {
      // Check if this is a new unsaved row (exists in input array but not in summary)
      const isNewRow = actualIndex >= summary.length;

      if (isNewRow) {
        // Remove the row from input array
        const adjustedIndex = actualIndex - summary.length;
        setInput((prev) => prev.filter((_, i) => i !== adjustedIndex));
      }

      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[actualIndex];
        return updated;
      });

      setEditableDetails((prev) => {
        const updated = { ...prev };
        delete updated[actualIndex];
        return updated;
      });
    }
  };

  const handleRowSave = async (actualIndex) => {
    try {
      const row = editableDetails[actualIndex];

      if (!row) {
        toast.error("No data to save");
        return;
      }

      const meetingLinkRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
      const nameRegex = /^[A-Za-z ]+$/;

      if (!row.milestone_display_id) {
        toast.error("Milestone is required.");
        return;
      }

      if (row.task_details_link && !meetingLinkRegex.test(row.task_details_link.trim())) {
        toast.error("Task Detail Link must start with http:// or https://");
        return;
      }

      if (!row.reminder_date) {
        toast.error("Reminder Date is required.");
        return;
      }

      if (row.remainded_by && !nameRegex.test(row.remainded_by.trim())) {
        toast.error("Reminded By must contain only letters and spaces.");
        return;
      }

      if (row.acknowledged_by_client === undefined || row.acknowledged_by_client === "") {
        toast.error("Please select Acknowledged status.");
        return;
      }

      const isExisting = actualIndex < summary.length;
      const payload = {
        data: [{
          ...row,
          project_display_id: projectdet?.project_display_id,
          projectId: projectId,
          project_name: projectdet?.project_name,
          triggerEvent: isExisting ? "Delayed Reminder Updated" : "Delayed Reminder Created",
          actionby: sessionStorage.getItem("userId") || "unknown_user",
          actionbyName: sessionStorage.getItem("userName") || "unknown_user",
        }]
      };

      const res = await fetch(
        "/server/crm_project_delayed_remainder/delayed-remainder-portal",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to submit");

      toast.success("Updated successfully");
      if (!isExisting) {
        const adjustedIndex = actualIndex - summary.length;
        setInput((prev) => prev.filter((_, i) => i !== adjustedIndex));
      }
      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[actualIndex];
        return updated;
      });
      setEditableDetails((prev) => {
        const updated = { ...prev };
        delete updated[actualIndex];
        return updated;
      });
      fetchMeetingDetails();
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Error while saving delayed reminder");
    }
  };

  const handleAddRow = () => {
    const defaultMilestoneId = milestone_data?.[0]?.id || "";
    const newRow = {
      milestone_display_id: defaultMilestoneId,
      task_details_link: "",
      reminder_date: "",
      remainded_by: "",
      acknowledged_by_client: "",
    };

    const index = summary.length + input.length;
    setInput((prev) => [...prev, newRow]);
    setEditableDetails((prev) => ({
      ...prev,
      [index]: { ...newRow },
    }));
    setEditingRows((prev) => ({ ...prev, [index]: true }));
  };

  const handleDeleteRow = async (actualIndex) => {
    console.log("🗑️ Delete clicked for actualIndex:", actualIndex);
    console.log("Summary length:", summary.length);
    console.log("Input length:", input.length);

    const existingLength = summary.length;

    // Check if this is an existing row from summary or a new row from input
    if (actualIndex < existingLength) {
      // This is an existing row from the database
      const item = summary[actualIndex];
      console.log("Deleting existing row:", item);

      const dataToDelete = {
        milestone_display_id: item.milestone_display_id,
        triggerEvent: "Delayed Reminder Deleted",
        actionby: sessionStorage.getItem("userId") || "unknown_user",
        actionbyName: sessionStorage.getItem("userName") || "unknown_user",
      };

      try {
        const res = await fetch(
          "/server/crm_project_delayed_remainder/delete/delayed-reminder",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataToDelete),
          }
        );

        if (!res.ok) throw new Error("Failed to delete");

        toast.success("Row deleted successfully");

        setEditingRows((prev) => {
          const updated = { ...prev };
          delete updated[actualIndex];
          return updated;
        });

        setEditableDetails((prev) => {
          const updated = { ...prev };
          delete updated[actualIndex];
          return updated;
        });

        fetchMeetingDetails();
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete row");
      }
    } else {
      // This is a new unsaved row from input array
      const adjustedIndex = actualIndex - existingLength;
      console.log("Removing new row at adjustedIndex:", adjustedIndex);

      setInput((prev) => prev.filter((_, i) => i !== adjustedIndex));

      setEditingRows((prev) => {
        const updated = { ...prev };
        delete updated[actualIndex];
        return updated;
      });

      setEditableDetails((prev) => {
        const updated = { ...prev };
        delete updated[actualIndex];
        return updated;
      });

      toast.success("New row removed");
    }
  };

  const handleInputChange = (actualIndex, name, value) => {
    setEditableDetails((prev) => ({
      ...prev,
      [actualIndex]: {
        ...(prev[actualIndex] || {}),
        [name]: value,
      },
    }));
  };

  const handleInputBlur = (actualIndex, name, value) => {
    const meetingLinkRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
    const nameRegex = /^[A-Za-z ]+$/;

    if (name === "task_details_link" && value.trim() && !meetingLinkRegex.test(value.trim())) {
      toast.error("Please enter a valid link starting with http:// or https://");
      return;
    }

    if (name === "remainded_by" && value.trim() && !nameRegex.test(value.trim())) {
      toast.error("Reminded By must contain only letters and spaces.");
      return;
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

  const allRows = [...summary, ...input];
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
        <h3 className="text-[18px] text-[#000000] mt-2">Delayed Reminder</h3>
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
              <th className="border px-4 py-2">Task Details Link</th>
              <th className="border px-4 py-2">Reminder Date</th>
              <th className="border px-4 py-2">Remainded By</th>
              <th className="border px-4 py-2">Acknowledged By Client</th>
              {hasEditPermission && <th className="border px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {paginatedRows.length === 0 && (
              <tr>
                <td
                  colSpan={hasEditPermission ? 7 : 6}
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
                        value={editableDetails[actualIndex]?.milestone_display_id ?? row.milestone_display_id ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "milestone_display_id", e.target.value)}
                      >
                        <option value="">Select Milestone</option>
                        {milestone_data.map((m, mIdx) => (
                          <option key={mIdx} value={m.id}>
                            {m.id} - {m.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      row.milestone_name || row.milestone_display_id || "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.task_details_link ?? row.task_details_link ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "task_details_link", e.target.value)}
                        onBlur={(e) => handleInputBlur(actualIndex, "task_details_link", e.target.value)}
                      />
                    ) : row.task_details_link &&
                      typeof row.task_details_link === "string" &&
                      row.task_details_link.trim().startsWith("http") ? (
                      <div className="flex items-center gap-2 justify-center">
                        <a
                          href={row.task_details_link.trim()}
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
                          <span className="text-gray-700">View Task</span>
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(row.task_details_link.trim());
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
                    {isRowEditing ? (
                      <input
                        type="date"
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.reminder_date ?? formatDate(row.reminder_date)}
                        onChange={(e) => handleInputChange(actualIndex, "reminder_date", e.target.value)}
                      />
                    ) : (
                      row.reminder_date || "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <textarea
                        className="p-1 border rounded w-full"
                        value={editableDetails[actualIndex]?.remainded_by ?? row.remainded_by ?? ""}
                        onChange={(e) => handleInputChange(actualIndex, "remainded_by", e.target.value)}
                        onBlur={(e) => handleInputBlur(actualIndex, "remainded_by", e.target.value)}
                      />
                    ) : (
                      row.remainded_by || "No data"
                    )}
                  </td>

                  <td className="border px-4 py-2">
                    {isRowEditing ? (
                      <select
                        className="p-1 border rounded w-full"
                        value={
                          editableDetails[actualIndex]?.acknowledged_by_client !== undefined
                            ? String(editableDetails[actualIndex].acknowledged_by_client)
                            : String(row.acknowledged_by_client)
                        }
                        onChange={(e) => handleInputChange(actualIndex, "acknowledged_by_client", e.target.value === "true")}
                      >
                        <option value="">Select</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : String(row.acknowledged_by_client) === "true" ? (
                      "Yes"
                    ) : String(row.acknowledged_by_client) === "false" ? (
                      "No"
                    ) : (
                      "No data"
                    )}
                  </td>

                  {hasEditPermission && (
                    <td className="border px-4 py-2">
                      <div className="flex items-center justify-center gap-2">
                        {isRowEditing ? (
                          <>
                            <button
                              onClick={() => handleRowSave(actualIndex)}
                              className="px-3 py-1 bg-[#344EA0] border rounded-full text-white transition text-[14px]"
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => handleRowEditToggle(actualIndex)}
                              className="px-3 py-1 text-[#344EA0] rounded transition text-[14px]"
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
              <td colSpan={hasEditPermission ? 7 : 6} className="border-0">
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

export default Projectdelayed;