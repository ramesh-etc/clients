import React, { useState, useEffect } from "react";
import { SquarePen } from "lucide-react";
import { useLocation } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from 'react-select';
import { useSelector, useDispatch } from "react-redux";

const statusOptions = ["Not Started", "In Progress", "Completed", "Yet to start", "Pending"];
const staticFallbackRows = [{ action: "", status: "", date: "", notes: "" }];

function PlanOfAction({ projectIds, projectdet }) {
  const [rows, setRows] = useState([]);
  const [projectName, setProjectName] = useState("Plan Of Action");
  const [isEditing, setIsEditing] = useState(false);
  const [projectDisplayId, setProjectDisplayId] = useState("");
  const [crmID, setCrmID] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState([]);
  const [errors, setErrors] = useState([]);
  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission", rolepremission);

  const sessiondata = sessionStorage.getItem("userRole");
  const userRole =
    sessiondata === "superAdmin"
      ? "superAdmin"
      : sessiondata === "client"
        ? "client"
        : "SalesPerson";

  const location = useLocation();
  const { projectId } = location.state || {};

  useEffect(() => {
    if (projectdet?.project_display_id) {
      setProjectDisplayId(projectdet.project_display_id);
    }
  }, [projectdet]);

  async function fetchMeetingDetails() {
    try {
      setLoading(true);
      const res = await fetch(`/server/poa_integrations/${projectIds}`);
      if (!res.ok) throw new Error(`Error fetching data: ${res.status}`);

      const json = await res.json();
      const data = json.data || [];

      setProjectName(data[0]?.project_name || "Plan Of Action");
      setCrmID(data[0]?.crm_id || "");

      const filledRows = data.map((item) => ({
        action: item.action || "",
        status: item.status || "",
        assignee: item.assignee || "",
        start_date: item.start_date || "",
        end_date: item.end_date || "",
        notes: item.note || "",
        ROWID: item.ROWID || null,
      }));

      if (filledRows.length > 0) {
        setRows(filledRows);
      } else if (!isEditing) {
        setRows([]);
      }

    } catch (error) {
      setRows(staticFallbackRows);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserDetails() {
    try {
      setLoading(true);
      const res = await fetch(`/server/workspace-user-sync/users`);
      if (!res.ok) throw new Error(`Error fetching data: ${res.status}`);

      const json = await res.json();
      const rawData = json.data || [];

      const formattedUsers = rawData
        .map((item) => item.EmployeeDetails)
        .filter((emp) => emp.display_name)
        .map((emp) => ({
          value: emp.display_name,
          label: emp.display_name,
        }));

      setUser(formattedUsers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectIds) {
      fetchMeetingDetails();
      fetchUserDetails()
    } else {
      setRows(staticFallbackRows);
      setLoading(false);
    }
  }, [projectIds]);

  useEffect(() => {
    if (user) {
      console.log(".............user data.........", user);
    }
  }, [user])

  const allowOnlyLettersAndSpaces = (value) => value.replace(/[^A-Za-z\s]/g, "");

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];
      updated[index][field] = field === "assignee"
        ? value.map((v) => v.value).join(", ")
        : value;
      return updated;
    });

    if (field === "action") {
      setErrors((prev) => {
        const updatedErrors = [...prev];
        updatedErrors[index] = "";
        return updatedErrors;
      });
    }
  };

  const validateActionField = (index, value) => {
    if (!value.trim()) {
      toast.error(`Row ${index + 1} - Action cannot be empty`);
      setErrors((prev) => {
        const updatedErrors = [...prev];
        updatedErrors[index] = "Action required";
        return updatedErrors;
      });
    } else {
      setErrors((prev) => {
        const updatedErrors = [...prev];
        updatedErrors[index] = "";
        return updatedErrors;
      });
    }
  };

  const validateAssigneeField = (index, value) => {
    if (!value || value.trim() === "") {
      toast.error(`Row ${index + 1} - Please select at least one assignee`);
      setErrors((prev) => {
        const updatedErrors = [...prev];
        updatedErrors[index] = "Assignee required";
        return updatedErrors;
      });
    } else {
      setErrors((prev) => {
        const updatedErrors = [...prev];
        updatedErrors[index] = "";
        return updatedErrors;
      });
    }
  };

  const hasEditPermission = (() => {
    if (!rolepremission?.permissiondata?.data) return false;

    for (const role of rolepremission.permissiondata.data) {
      for (const module of role.modules) {
        if (module.module === "Project view") {
          for (const component of module.components) {
            if (component.name === "POA") {
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

  const handleAddRow = () => {
    const newRow = { action: "", status: "", assignee: "", start_date: "", end_date: "", notes: "" };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  const handleDeleteRow = async (idx) => {
    try {
      const rowToDelete = rows[idx];
      const payload = {
        project_display_id: projectDisplayId,
        ROWID: rowToDelete.ROWID,
        deleted_by: sessionStorage.getItem("userId") || "unknown_user",
        deleted_by_name: sessionStorage.getItem("userName") || "unknown_user"
      };

      const res = await fetch(`/server/poa_integrations/poa-delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Row deleted successfully");
      setRows((prevRows) => prevRows.filter((_, i) => i !== idx));
    } catch (error) {
      console.error(error);
      toast.error("Error deleting row");
    }
  };

  const handleSubmit = async () => {
    let hasErrors = false;

    rows.forEach((row, idx) => {
      if (!row.assignee || row.assignee.trim() === "") {
        toast.error(`Row ${idx + 1} - Please select at least one assignee`);
        hasErrors = true;
      }
      if (!row.start_date) {
        toast.error(`Row ${idx + 1} - Please select a start date`);
        hasErrors = true;
      }
      if (!row.end_date) {
        toast.error(`Row ${idx + 1} - Please select an end date`);
        hasErrors = true;
      }
      if (row.start_date && row.end_date && new Date(row.end_date) < new Date(row.start_date)) {
        toast.error(`Row ${idx + 1} - End date cannot be before start date`);
        hasErrors = true;
      }
    });

    if (hasErrors) return;
    
    try {
      const payload = {
        project_display_id: projectDisplayId,
        project_name: projectName,
        projectId: projectIds,
        crm_id: crmID,
        poa: rows.map((r, idx) => ({
          sNo: idx + 1,
          action: r.action,
          assignee: r.assignee,
          start_date: r.start_date,
          end_date: r.end_date,
          status: r.status,
          completionDate: r.date,
          note: r.notes,
          ROWID: r.ROWID || null 
        }))
      };

      const res = await fetch(`/server/poa_integrations/poa-create-portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to update");

      await res.json();
      toast.success("Updated successfully");
      setIsEditing(false);
      fetchMeetingDetails();
    } catch (error) {
      toast.error("Error in updating");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full py-8">
        <div className="border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white  p-3 border rounded-lg mt-3 w-full">
        <div className="flex justify-between">
        <h3 className="text-[18px] texxt-[#000000] mt-2">Plan of Action</h3>
      {hasEditPermission && (
        <div className="flex justify-end gap-2 mb-2">
          <button
            onClick={() => {
              setIsEditing((prev) => {
                const next = !prev;
                if (next && rows.length === 0) {
                  setRows([{ action: "", status: "", assignee: "", start_date: "", end_date: "", notes: "" }]);
                }
                return next;
              });
            }}
            className="flex items-center gap-2 font-[inter] text-[12px] border px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition border-gray-300"
            title={isEditing ? "Cancel" : "Edit"}
          >
            <SquarePen size={18} />
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </button>

          {isEditing && (
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-[#344EA0] text-white hover:bg-[#263970] transition"
            >
              <span className="text-[18px] font-[inter] b-1 leading-none">+</span>
              <span className="text-[12px] font-[inter]">Add</span>
            </button>
          )}
        </div>
      )}
      </div>

      <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm text-left">
        <thead className="bg-[#D1D5DB] text-[#111827] font-[Instrument Sans] sticky top-0 z-20">
          <tr>
            <th className="px-3 py-2 border ">S.No</th>
            <th className="px-3 py-2 border ">Action</th>
            <th className="px-3 py-2 border ">Status</th>
            <th className="px-3 py-2 border ">Assignee</th>
            <th className="px-3 py-2 border ">Start Date</th>
            <th className="px-3 py-2 border ">End Date</th>
            <th className="px-3 py-2 border ">Notes</th>
            {isEditing && <th className="px-3 py-2 border">Delete</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {!isEditing && rows.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                No data found. Click 'Edit' to add one.
              </td>
            </tr>
          )}

          {isEditing && rows.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-400">
                No rows yet. Click <strong>+ Add</strong> to start editing.
              </td>
            </tr>
          )}

          {rows.map((row, idx) => (
            <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}>
              <td className="px-3 py-2 border">{idx + 1}</td>

              <td className="px-3 py-2 border">
                <input
                  type="text"
                  readOnly={!isEditing}
                  disabled={!isEditing}
                  className={`w-full border px-1 py-1 rounded ${
                    isEditing
                      ? "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"
                  } ${errors[idx] ? "border-red-500" : ""}`}
                  value={row.action || ""}
                  onChange={(e) => handleChange(idx, "action", e.target.value)}
                  onBlur={(e) => validateActionField(idx, e.target.value)}
                />
              </td>

              <td className="px-3 py-2 border">
                {isEditing ? (
                  <select
                    className="w-full border px-1 py-1 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={row.status}
                    onChange={(e) => handleChange(idx, "status", e.target.value)}
                  >
                    <option value="">Select</option>
                    {statusOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <span>{row.status || "No data"}</span>
                )}
              </td>

              <td className="px-3 py-2 border">
                {isEditing ? (
                  <Select
                    isMulti
                    options={user}
                    value={
                      row.assignee
                        ? user.filter((opt) =>
                            row.assignee.split(", ").includes(opt.value)
                          )
                        : []
                    }
                    onChange={(selected) => handleChange(idx, "assignee", selected)}
                    onBlur={() => validateAssigneeField(idx, row.assignee)}
                    className="text-sm"
                    classNamePrefix="react-select"
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                ) : (
                  <span>{row.assignee || "No data"}</span>
                )}
              </td>

              <td className="px-3 py-2 border">
                <input
                  type="date"
                  className={`w-full border px-1 py-1 rounded ${
                    isEditing
                      ? "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"
                  }`}
                  value={row.start_date ? new Date(row.start_date).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleChange(idx, "start_date", e.target.value)}
                  disabled={!isEditing}
                />
              </td>

              <td className="px-3 py-2 border">
                <input
                  type="date"
                  className={`w-full border px-1 py-1 rounded ${
                    isEditing
                      ? "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"
                  }`}
                  value={row.end_date ? new Date(row.end_date).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleChange(idx, "end_date", e.target.value)}
                  disabled={!isEditing}
                  min={row.start_date ? new Date(row.start_date).toISOString().split("T")[0] : ""}
                />
              </td>

              <td className="px-3 py-2 border">
                <textarea
                  rows="3"
                  className={`w-full border px-1 py-1 rounded resize-none ${
                    isEditing
                      ? "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"
                  }`}
                  value={row.notes || ""}
                  onChange={(e) => handleChange(idx, "notes", e.target.value)}
                  disabled={!isEditing}
                />
              </td>

              {isEditing && (
                <td className="px-3 py-2 border text-center">
                  <button
                    onClick={() => handleDeleteRow(idx)}
                    className="text-red-600 hover:text-red-800 font-bold"
                    title="Delete Row"
                  >
                    X
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer position="top-right" autoClose={3000} />

      {hasEditPermission && isEditing && (
        <div className="flex justify-center mt-4">
          <button
            onClick={handleSubmit}
            className="flex items-center font-[inter] text-[12px] gap-2 border px-6 py-2 rounded-lg bg-[#344EA0] text-white hover:bg-[#263970] transition"
          >
            <span>Submit</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default PlanOfAction;