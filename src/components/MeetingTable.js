import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SquarePen, Save } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector, useDispatch } from "react-redux";


function MeetingTable({ projectId: propProjectId, projectdet, milestone }) {
  const location = useLocation();
  const { projectId: stateProjectId } = location.state || {};
  const projectId = propProjectId || stateProjectId;

  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [input, setInput] = useState([]);
  const [editableDetails, setEditableDetails] = useState({});
  const [editingRows, setEditingRows] = useState({});

  const [momPopupVisible, setMomPopupVisible] = useState(false);
  const [selectedMomPoints, setSelectedMomPoints] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission", rolepremission);

  const sessiondata = sessionStorage.getItem("userRole");
  const userRole =
    sessiondata === "superAdmin"
      ? "superAdmin"
      : sessiondata === "client"
        ? "client"
        : "SalesPerson";

  const handleRowEditToggle = (index) => {
    const isCurrentlyEditing = editingRows[index];

    if (!isCurrentlyEditing) {
      const summaryData = summary?.flat().map((item) => item?.meeting_details).filter(Boolean);
      const actualRow = index < summaryData.length
        ? summaryData[index]
        : input[index - summaryData.length];

      if (actualRow) {
        setEditableDetails((prev) => ({
          ...prev,
          [index]: { ...actualRow },
        }));
      }

      setEditingRows((prev) => ({ ...prev, [index]: true }));
    } else {
      const summaryData = summary?.flat().map((item) => item?.meeting_details).filter(Boolean);
      const isNewRow = index >= summaryData.length;
      if (isNewRow) {
        const adjustedIndex = index - summaryData.length;
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

  const handleInputBlur = (index, key, value) => {
    const alphabetOnlyKeys = [
      "meeting_name",
      "meeting_type",
      "requested_by",
      "participants_from_client_side",
      "mom_prepared_by",
    ];

    const linkKeys = ["meeting_recording_link", "mom_documents_link"];
    const linkRegex = /^https?:\/\/[^\s]+$/;
    const nameRegex = /^[^0-9]+$/;

    if (linkKeys.includes(key) && value.trim() && !linkRegex.test(value.trim())) {
      toast.error("Please enter a valid link starting with http:// or https://");
      return;
    }

    if (key === "mom_points" && value.length > 10000) {
      toast.error("MOM Points can have a maximum of 10,000 characters.");
      return;
    }

    if (key === "discussion_start_time" || key === "discussion_end_time") {
      const start = editableDetails[index]?.discussion_start_time;
      const end = editableDetails[index]?.discussion_end_time;

      if (start && end) {
        const startDate = new Date(start);
        const endDate = new Date(end);

        if (startDate >= endDate) {
          toast.error("End time must be after start time.");
        }
      }
    }
  };

  const handleAddRow = () => {
    const newRow = {
      meeting_name: "",
      meeting_type: "",
      requested_by: "",
      meeting_recording_link: "",
      participants_from_our_team: "",
      participants_from_client_side: "",
      mom_prepared_by: "",
      mom_points: "",
      mom_documents_link: "",
      discussion_start_time: "",
      discussion_end_time: "",
      duration: "",
    };

    const summaryData = summary?.flat().map((item) => item?.meeting_details).filter(Boolean);
    const index = summaryData.length + input.length;
    setInput((prev) => [...prev, newRow]);

    setEditableDetails((prev) => ({
      ...prev,
      [index]: { ...newRow },
    }));

    setEditingRows((prev) => ({ ...prev, [index]: true }));
  };

  const handleDeleteRow = async (index) => {
    const summaryData = summary?.flat().map((item) => item?.meeting_details).filter(Boolean);
    const existingLength = summaryData.length;

    if (index < existingLength) {
      const item = summary.flat()[index];
      const meetingId = item.meeting_details.ROWID;

      if (!meetingId) {
        toast.error("Meeting ID not found.");
        return;
      }

      try {
        const res = await fetch(`/server/crm_meeting_details/delete/meetingdetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: meetingId }),
        });

        if (!res.ok) throw new Error("Failed to delete");

        toast.success("Meeting deleted successfully");

        setEditingRows((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });

        const refreshed = await fetch(`/server/crm_meeting_details/get/meetingdetails/${projectId}`);
        const refreshedJson = await refreshed.json();
        setSummary([refreshedJson.data]);

        setEditableDetails((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Error while deleting meeting");
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

  const handleInputChange = (index, key, value) => {
    setEditableDetails((prev) => {
      const updated = { ...prev };
      updated[index] = { ...updated[index], [key]: value };

      if (key === "discussion_start_time" || key === "discussion_end_time") {
        const start = updated[index].discussion_start_time;
        const end = updated[index].discussion_end_time;

        if (start && end) {
          const startDate = new Date(start);
          const endDate = new Date(end);

          if (startDate < endDate) {
            const diffMs = endDate - startDate;
            const totalMinutes = Math.floor(diffMs / 60000);
            const hours = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
            const minutes = String(totalMinutes % 60).padStart(2, "0");

            updated[index].duration = `${hours}:${minutes}`;
          } else {
            updated[index].duration = "";
          }
        }
      }

      return updated;
    });
  };

  const hasEditPermission = (() => {
    if (!rolepremission?.permissiondata?.data) return false;

    for (const role of rolepremission.permissiondata.data) {
      for (const module of role.modules) {
        if (module.module === "Project view") {
          for (const component of module.components) {
            if (component.name === "Meeting Details") {
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

  const handleRowSave = async (index) => {
    try {
      const row = editableDetails[index];

      if (!row) {
        toast.error("No data to save");
        return;
      }

      const nameRegex = /^[A-Za-z, ]+$/;
      const meetingLinkRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

      if (!row.meeting_name || !row.meeting_type || !row.requested_by) {
        toast.error("Please fill all required fields.");
        return;
      }

      if (!nameRegex.test(row.requested_by.trim())) {
        toast.error("Requested By should contain only alphabets.");
        return;
      }

      if (row.mom_prepared_by && !nameRegex.test(row.mom_prepared_by.trim())) {
        toast.error("MOM Prepared By should contain only alphabets.");
        return;
      }

      if (row.meeting_recording_link && !meetingLinkRegex.test(row.meeting_recording_link.trim())) {
        toast.error("Please enter a valid Meeting Recording Link.");
        return;
      }

      if (row.mom_documents_link && !meetingLinkRegex.test(row.mom_documents_link.trim())) {
        toast.error("Please enter a valid MOM Document Link.");
        return;
      }

      const summaryData = summary?.flat().map((item) => item?.meeting_details).filter(Boolean);
      const isExisting = index < summaryData.length;

      const payload = {
        meeting_details: [{
          ...row,
          external_project_id: propProjectId,
          project_display_id: projectdet.project_display_id,
          milestone_display_id: milestone.milestone_display_id,
        }]
      };

      const res = await fetch(`/server/crm_meeting_details/upsert-meeting-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit");

      toast.success("Meeting details saved successfully");

      if (!isExisting) {
        const adjustedIndex = index - summaryData.length;
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

      const refreshed = await fetch(`/server/crm_meeting_details/get/meetingdetails/${projectId}`);
      const refreshedJson = await refreshed.json();
      setSummary([refreshedJson.data]);
    } catch (error) {
      console.error("Submit Error:", error);
      toast.error("Error while saving meeting details");
    }
  };

  // Utility: Get initials from name (first and second word)
  const getUserInitials = (name) => {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
  };

  // Utility: Assign a consistent color per name
  const getConsistentColor = (name) => {
    const colors = [
      '#1abc9c', '#3498db', '#9b59b6', '#e67e22',
      '#e74c3c', '#2ecc71', '#f39c12', '#d35400',
      '#7f8c8d', '#8e44ad'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const renderParticipantAvatars = (participants) => {
    if (!participants || typeof participants !== 'string') return "No data";

    const names = participants.split(',').map(name => name.trim()).filter(Boolean);
    if (names.length === 0) return "No data";

    const displayLimit = 3;
    const visibleNames = names.slice(0, displayLimit);
    const remainingCount = names.length - displayLimit;

    return (
      <div className="flex items-center justify-center -space-x-2">
        {visibleNames.map((name, index) => {
          const initials = getUserInitials(name);
          const color = getConsistentColor(name);

          return (
            <div
              key={index}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold border-2 border-white cursor-pointer hover:z-10 transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              title={name}
            >
              {initials}
            </div>
          );
        })}

        {remainingCount > 0 && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white text-[11px] font-bold border-2 border-white cursor-pointer hover:z-10 transition-transform hover:scale-110"
            title={`${names.slice(displayLimit).join(', ')}`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    async function fetchMeetingDetails() {
      try {
        setError(null);
        setLoading(true);
        const res = await fetch(`/server/crm_meeting_details/get/meetingdetails/${projectId}`);
        if (!res.ok) throw new Error(`Error fetching data: ${res.status}`);
        const json = await res.json();
        setSummary([json.data]);
      } catch (error) {
        console.error(error);
        setSummary([]);
      } finally {
        setLoading(false);
      }
    }
    if (projectId) fetchMeetingDetails();
  }, [projectId]);

  if (loading) return <p className="text-center my-4"><div className="flex justify-center items-center w-full py-8">
    <div className="border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
  </div></p>;
  if (error) return <p className="text-center text-red-500 my-4">Error: {error}</p>;

  const headers = [
    "meeting_name",
    "meeting_type",
    "requested_by",
    "meeting_recording_link",
    "participants_from_our_team",
    "participants_from_client_side",
    "mom_prepared_by",
    "mom_points",
    "mom_documents_link",
    "discussion_start_time",
    "discussion_end_time",
    "duration",
  ];

  const isDateTimeField = (key) => key === "discussion_start_time" || key === "discussion_end_time";

  // Pagination logic
  const allRows = [...summary?.flat().map((item) => item?.meeting_details).filter(Boolean), ...input];
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
    <div className=" bg-white p-3 border rounded-lg mt-3 w-full">
      <div className="flex justify-between">
        <h3 className="text-[18px] texxt-[#000000] mt-2">Meeting Details</h3>
        {hasEditPermission && (
          <div className="flex justify-end mb-2 gap-2">
            <button
              onClick={handleAddRow}
              className="flex items-center text-[12px] gap-2 border px-4 py-2 rounded-lg bg-[#344EA0] text-white hover:bg-[#263970] transition"
            >
              <span className="text-[16px] mb-1 leading-none">+</span>
              <span className="text-[12px]">Add</span>
            </button>
          </div>
        )}
      </div>

      <div className="w-full h-auto max-h-[65vh] overflow-x-auto overflow-y-auto scrollbar-hide">
        <table className="table-auto border-collapse border border-gray-300 text-sm">
          <thead className="bg-[#D1D5DB] text-[#111827] font-[Instrument Sans] text-center">
            <tr>
              <th className="border px-4 py-2">S.No</th>
              <th className="border px-4 py-2">Meeting Name</th>
              <th className="border px-4 py-2">Meeting Type</th>
              <th className="border px-4 py-2">Requested By</th>
              <th className="border px-4 py-2">Meeting Recording Link</th>
              <th className="border px-4 py-2">Participants From Our Team</th>
              <th className="border px-4 py-2">Participants From Client Side</th>
              <th className="border px-4 py-2">Mom Prepared By</th>
              <th className="border px-4 py-2">Mom Points</th>
              <th className="border px-4 py-2">Mom Documents Link</th>
              <th className="border px-4 py-2">Discussion Start Time</th>
              <th className="border px-4 py-2">Discussion End Time</th>
              <th className="border px-4 py-2">Duration</th>
              {hasEditPermission && <th className="border px-4 py-2">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-center">
            {paginatedRows.length === 0 && (
              <tr>
                <td colSpan={hasEditPermission ? headers.length + 2 : headers.length + 1} className="text-center align-middle py-4 text-gray-500">
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
                  {headers.map((key) => (
                    <td key={key} className="border px-4 py-2">
                      {isRowEditing ? (
                        key === "discussion_start_time" || key === "discussion_end_time" ? (
                          <input
                            type="datetime-local"
                            className="p-1 border rounded"
                            value={editableDetails[actualIndex]?.[key] || ""}
                            min={
                              key === "discussion_end_time"
                                ? editableDetails[actualIndex]?.discussion_start_time || ""
                                : undefined
                            }
                            onChange={(e) => handleInputChange(actualIndex, key, e.target.value)}
                            onBlur={(e) => handleInputBlur(actualIndex, key, e.target.value)}
                          />
                        ) : key === "duration" ? (
                          <input
                            type="time"
                            className="p-1 border rounded"
                            step="60"
                            value={editableDetails[actualIndex]?.[key] || ""}
                            onChange={(e) => handleInputChange(actualIndex, key, e.target.value)}
                          />
                        ) : (
                          <textarea
                            className="p-1 border rounded"
                            value={editableDetails[actualIndex]?.[key] || ""}
                            onChange={(e) => handleInputChange(actualIndex, key, e.target.value)}
                            onBlur={(e) => handleInputBlur(actualIndex, key, e.target.value)}
                          />
                        )
                      ) : key === "mom_points" ? (
                        row[key]?.trim() ? (
                          <button
                            onClick={() => {
                              setSelectedMomPoints(row[key]);
                              setMomPopupVisible(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded transition inline-flex items-center justify-center"
                            title="View MOM Points"
                          >
                            View Points
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
                              className="text-gray-600"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                        ) : (
                          "No MOM"
                        )
                      ) : (key === "participants_from_our_team" || key === "participants_from_client_side") ? (
                        renderParticipantAvatars(row[key])
                      ) : (key === "meeting_recording_link" || key === "mom_documents_link") &&
                        row[key] &&
                        typeof row[key] === "string" &&
                        row[key].trim().startsWith("http") ? (
                        <div className="flex items-center gap-2 justify-center">
                          <a
                            href={row[key].trim()}
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
                            <span className="text-gray-700">
                              {key === "meeting_recording_link" ? "Meeting" : "Document"}
                            </span>
                          </a>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(row[key].trim());
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
                        row[key] || "No data"
                      )}
                    </td>
                  ))}

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
              <td colSpan={hasEditPermission ? 14 : 13} className="border-0">
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

      {momPopupVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">MOM Points</h2>
            <div
              className="max-h-[300px] overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words"
              style={{
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedMomPoints}
            </div>
            <button
              onClick={() => setMomPopupVisible(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default MeetingTable;