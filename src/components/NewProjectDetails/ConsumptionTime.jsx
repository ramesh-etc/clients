import React, { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";

function ConsumptionTime({ projectId, projectname }) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [projectDisplayId, setProjectDisplayId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formUrl, setFormUrl] = useState("");
  const rolepremission = useSelector((state) => state.userpermission);
  console.log("showuserpermission", rolepremission);

  const firstname = sessionStorage.getItem("first_name");
  const lastname = sessionStorage.getItem("last_name");

  const userRole = sessionStorage.getItem("userRole") || "SalesPerson";
  console.log("userrole", userRole);

  const timeStrToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };
  const minutesToTimeStr = (minutes) => {
    const sign = minutes >= 0 ? "+" : "-";
    const absMin = Math.abs(minutes);
    const h = String(Math.floor(absMin / 60)).padStart(2, "0");
    const m = String(absMin % 60).padStart(2, "0");
    return `${sign}${h}:${m}`;
  };

  async function fetchConsumptionTime() {
    try {
      const res = await fetch(`/server/sprint-sprints-sync/sprints/${projectId}`);
      const json = await res.json();
      const projects = json.data || [];
      console.log(">>>>>>>>>>>>>", projects);

      const processed = projects.map((item) => {
        const estimated = timeStrToMinutes(item.ProjectSprints.total_estimated_hours);
        const consumed = timeStrToMinutes(item.ProjectSprints.total_consumed_hours);
        const diff = estimated - consumed;
        const availableStr = minutesToTimeStr(diff);
        return {
          ...item,
          ProjectSprints: {
            ...item.ProjectSprints,
            total_available_hours: availableStr,
            editableApprovalValue: item.ProjectSprints.accounts_approved ? "Approved" : "Not Approved",
          },
        };
      });

      setSummary(processed);
      setProjectDisplayId(projects[0].ProjectSprints.external_project_id || "");
      console.log("externla", projects[0].ProjectSprints.external_project_id);
    } catch (error) {
      console.error("Error fetching consumption time:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchConsumptionTime();
    }
  }, [projectId]);

  const handleApprovalChange = (index, newValue) => {
    const updated = [...summary];
    updated[index].ProjectSprints.editableApprovalValue = newValue;
    setSummary(updated);
  };

  const hasEditPermission = (() => {
    if (!rolepremission?.permissiondata?.data) return false;

    for (const role of rolepremission.permissiondata.data) {
      for (const module of role.modules) {
        if (module.module === "Project view") {
          for (const component of module.components) {
            if (component.name === "Consumption Time") {
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

  const handleSubmit = async () => {
    console.log(summary);

    const updates = summary.map((item) => ({
      sprint_id: item.ProjectSprints.external_sprint_id,
      status: item.ProjectSprints.sprint_status,
      accounts_approved: item.ProjectSprints.editableApprovalValue === "Approved",
    }));

    const payload = {
      project_id: projectDisplayId,
      updates,
    };

    try {
      const res = await fetch("/server/sprint-sprints-sync/update_accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log(" res", res.status);
      fetchConsumptionTime();
      toast.success("Updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Update error");
    }
  };
  const APPROVAL_ROLES = ["superAdmin", "ProjectsCoordinator", "Manager", "Accountant"];
  const STATUS_ROLES = ["superAdmin", "ProjectsCoordinator", "Manager", "TeamLeader"];

  return (
    <div className="overflow-x-auto bg-white  p-3 border rounded-lg mt-3 w-full">
      <div className="flex justify-between">
        <h3 className="text-[18px] texxt-[#000000] mt-2">Consumption Time</h3>
            {hasEditPermission && (
        <div className="flex justify-end gap-2 mb-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 font-[inter] text-[12px] border px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition border-gray-300"
            title={isEditing ? "Cancel" : "Edit"}
          >
            <SquarePen size={12} />
            <span>{isEditing ? "Cancel" : "Edit"}</span>
          </button>
        </div>
      )}
      </div>
  

      <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm text-left">
        <thead className="bg-[#D1D5DB] text-[#111827] font-[Instrument Sans] sticky top-0 z-20">
          <tr>
            <th className="px-3 py-2 border ">Milestone ID</th>
            <th className="px-3 py-2 border ">Milestone</th>
            <th className="px-3 py-2 border ">Start Date</th>
            <th className="px-3 py-2 border ">End Date</th>
            <th className="px-3 py-2 border ">Duration</th>
            <th className="px-3 py-2 border ">Estimated Hours</th>
            <th className="px-3 py-2 border ">Billable Hours</th>
            <th className="px-3 py-2 border ">Consumed Hours</th>
            <th className="px-3 py-2 border ">Approved Billable Hours</th>
            <th className="px-3 py-2 border ">Available Billable Hours</th>
            <th className="px-3 py-2 border ">Available Estimated Hours</th>
            <th className="px-3 py-2 border ">Approved</th>
            <th className="px-3 py-2 border ">Status</th>
            <th className="px-3 py-2 border ">Support</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={14} className="text-center py-4">
                <div className="flex justify-center items-center w-full py-8">
                  <div className="border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8 animate-spin"></div>
                </div>
              </td>
            </tr>
          ) : summary && summary.length > 0 ? (
            summary.map((item, index) => (
              <tr 
                key={item.ProjectSprints.sprint_id} 
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
              >
                <td className="px-3 py-2 border">{item.ProjectSprints.display_sprint_id}</td>
                <td className="px-3 py-2 border">{item.ProjectSprints.sprint_name}</td>
                <td className="px-3 py-2 border">
                  <input
                    className="w-full border px-1 py-1 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                    value={
                      item.ProjectSprints.start_date
                        ? new Date(item.ProjectSprints.start_date)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "/")
                        : "--"
                    }
                    disabled
                  />
                </td>
                <td className="px-3 py-2 border">
                  <input
                    className="w-full border px-1 py-1 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                    value={
                      item.ProjectSprints.end_date
                        ? new Date(item.ProjectSprints.end_date)
                            .toLocaleDateString("en-GB")
                            .replace(/\//g, "/")
                        : "--"
                    }
                    disabled
                  />
                </td>
                <td className="px-3 py-2 border">{item.ProjectSprints.duration || "-"}</td>
                <td className="px-3 py-2 border">{item.ProjectSprints.total_estimated_hours || "-"}</td>
                <td className="px-3 py-2 border">{item.ProjectSprints.total_billable_hours || "-"}</td>
                <td className="px-3 py-2 border">{item.ProjectSprints.total_consumed_hours || "-"}</td>
                <td className="px-3 py-2 border">{item.ProjectSprints.total_approved_billable_hours || "-"}</td>
                <td className="px-3 py-2 border">
                  <span
                    className={`font-medium ${
                      item.ProjectSprints.available_approved_billable_hours?.startsWith("-")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.ProjectSprints.available_approved_billable_hours || "-"}
                  </span>
                </td>
                <td className="px-3 py-2 border">
                  <span
                    className={`font-medium ${
                      item.ProjectSprints.available_estimated_hours?.startsWith("-")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {item.ProjectSprints.available_estimated_hours || "-"}
                  </span>
                </td>
                <td className="px-3 py-2 border">
                  {APPROVAL_ROLES.includes(userRole) && isEditing ? (
                    <select
                      value={item.ProjectSprints.editableApprovalValue}
                      onChange={(e) => handleApprovalChange(index, e.target.value)}
                      className="w-full border rounded px-1 py-1 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Not Approved">Not Approved</option>
                      <option value="Approved">Approved</option>
                      <option value="On Hold - Accounts">On Hold - Accounts</option>
                      <option value="On Hold - DEV">On Hold - DEV</option>
                      <option value="Input Delay from Client">Input Delay-Client</option>
                      <option value="Input Delay from Third Party Vendor">Input Delay-Third Party Vendor</option>
                    </select>
                  ) : (
                    <span
                      className={`${
                        item.ProjectSprints.accounts_approved ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {item.ProjectSprints.accounts_approved ? "Approved" : "Not Approved"}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 border">
                  {STATUS_ROLES.includes(userRole) && isEditing ? (
                    <select
                      value={item.ProjectSprints.sprint_status || "Open"}
                      onChange={(e) => {
                        const updated = [...summary];
                        updated[index].ProjectSprints.sprint_status = e.target.value;
                        setSummary(updated);
                      }}
                      className="w-full border rounded px-1 py-1 bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Reopen">Reopen</option>
                      <option value="Closed">Closed</option>
                    </select>
                  ) : (
                    <span>{item.ProjectSprints.sprint_status || "-"}</span>
                  )}
                </td>
                <td className="px-3 py-2 border">
                  <button
                    className="flex items-center gap-2 border px-4 py-2 rounded-lg bg-[#344EA0] text-white hover:bg-[#263970] transition"
                    onClick={() => {
                      const url = `https://forms.zohopublic.in/demoelitetechpark/form/SupportRequestForm/formperma/JxscQiU4i6nw0SffsqNPwsv1N19LP0M8in-aHf2iPVs?customer_first_name=${firstname}&customer_last_name=${lastname}&project_name=${projectname}&support_email=support%40demoelitetechpark.zohodesk.in`;
                      setFormUrl(url);
                      setModalOpen(true);
                    }}
                  >
                    Raise ticket
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={14} className="text-center py-4 text-gray-500">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[50%] h-[90%] rounded-lg shadow-lg relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-1 right-2 text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded"
            >
              Close
            </button>
            <iframe
              src={formUrl}
              title="Input Form"
              className="w-full h-full rounded-b-lg"
            />
          </div>
        </div>
      )}

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

export default ConsumptionTime;