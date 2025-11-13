import React, { useEffect, useState } from "react";
import { SquarePen } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import Select from "react-select";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";

function ProjectDetails({ projectId, projectsdisplayID, projectname }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableDetails, setEditableDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [dropdownOptions, setDropdownOptions] = useState({
    project_sponsor_name: [],
    project_manager_name: [],
    project_leader_name: [],
    project_team_list: [],
    project_coordinator_name: [],
  });
  const [inputErrors, setInputErrors] = useState({});
  const rolepremission = useSelector((state) => state.userpermission);
  console.log("showuserpermission", rolepremission);

  const allowedFields = [
    "project_org_id",
    "project_name",
    "project_folder_link",
    "kick_of_meeting_link",
    "proposal_dev_copy_link",
    "meeting_recordings_link",
    "meeting_frequency",
    "project_sponsor_name",
    "project_manager_name",
    "project_leader_name",
    "project_team_list",
    "project_coordinator_name",
  ];


  const multiselectFields = [
    "project_sponsor_name",
    "project_manager_name",
    "project_leader_name",
    "project_team_list",
    "project_coordinator_name",
  ];

  const formatFieldName = (field) =>
    field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const sessiondata = sessionStorage.getItem("userRole");
  const userRole =
    sessiondata === "superAdmin"
      ? "superAdmin"
      : sessiondata === "client"
        ? "client"
        : "SalesPerson";

  useEffect(() => {
    async function fetchProjectDetails() {
      try {
        const res = await fetch(`/server/crm-project-details/get/projectdetails/${projectId}`);
        const json = await res.json();

        // API response structure is { success: true, data: {...} }
        const projects = json.data || {};

        console.log("API Response:", json);
        console.log("Project Org ID from API:", projects.project_org_id);

        const filtered = allowedFields.reduce((acc, key) => {
          let val = projects[key];

          // 🧹 Normalize null/undefined to empty string
          if (val === null || val === undefined) val = "";

          // 🧩 Clean array-like string fields such as "[Anand, Kumar]" → "Anand, Kumar"
          if (typeof val === "string" && /^\[.*\]$/.test(val)) {
            val = val
              .replace(/[\[\]"]/g, "")
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
              .join(", ");
          }

          // ✅ Always show project_org_id
          if (key === "project_org_id") {
            acc[key] = projects.project_org_id || "";
          }

          // ✅ Project name override
          else if (key === "project_name") {
            acc[key] = projectname || projects.project_name || "";
          }

          // ✅ Everything else
          else {
            acc[key] = val === "null" ? "" : val;
          }

          return acc;
        }, {});



        setEditableDetails(filtered);

        const allPeople = projects.peopleDetails || [];

        const sponsorOptions = allPeople
          .filter(
            (item) =>
              ["Management"].includes(item.EmployeeDetails.department) &&
              item.EmployeeDetails.designation !== "Project Coordinator"
          )
          .map((item) => ({
            label: item.EmployeeDetails.display_name,
            value: item.EmployeeDetails.display_name,
          }));

        const managerOptions = allPeople
          .filter((item) =>
            ["Management", "Business Team", "Project Management"].includes(item.EmployeeDetails.department) && item.EmployeeDetails.designation !== "Project Coordinator"
          )
          .map((item) => ({
            label: item.EmployeeDetails.display_name,
            value: item.EmployeeDetails.display_name,
          }));

        const leaderOptions = allPeople
          .filter((item) =>
            ["Zoho one - Team Lead", "Full Stack - Team Lead"].includes(
              item.EmployeeDetails.designation
            )
          )
          .map((item) => ({
            label: item.EmployeeDetails.display_name,
            value: item.EmployeeDetails.display_name,
          }));

        const teamListOptions = allPeople
          .filter((item) =>
            ["Full Stack", "Zoho One", "Testing"].includes(item.EmployeeDetails.department)
          )
          .map((item) => ({
            label: item.EmployeeDetails.display_name,
            value: item.EmployeeDetails.display_name,
          }));

        const coordinatorOptions = allPeople
          .filter(
            (item) =>
              item.EmployeeDetails.designation === "Project Coordinator" &&
              item.EmployeeDetails.department === "Project Management"
          )
          .map((item) => ({
            label: item.EmployeeDetails.display_name,
            value: item.EmployeeDetails.display_name,
          }));

        setDropdownOptions({
          project_sponsor_name: sponsorOptions,
          project_manager_name: managerOptions,
          project_leader_name: leaderOptions,
          project_team_list: teamListOptions,
          project_coordinator_name: coordinatorOptions,
        });
        console.log("coordinatorOptions-->", coordinatorOptions)
      } catch (error) {
        console.error("Error fetching project details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) fetchProjectDetails();
  }, [projectId, projectsdisplayID, projectname]);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const urlFields = [
    "project_folder_link",
    "kick_of_meeting_link",
    "proposal_dev_copy_link",
  ];

  const handleChange = (key, value) => {
    setEditableDetails((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (urlFields.includes(key)) {
      setInputErrors((prev) => ({
        ...prev,
        [key]: "",
      }));
    }
  };

  const handleBlur = (key) => {
    if (urlFields.includes(key)) {
      const value = editableDetails[key]?.trim() ?? "";
      const urlPattern = /^(https?:\/\/)/;

      // optional fields
      const optionalUrls = ["kick_of_meeting_link", "proposal_dev_copy_link"];

      // skip empty optional fields
      if (optionalUrls.includes(key) && value === "") {
        setInputErrors((prev) => ({ ...prev, [key]: "" }));
        return;
      }

      // check validity only if non-empty
      if (value && !urlPattern.test(value)) {
        setInputErrors((prev) => ({
          ...prev,
          [key]: "Please enter a valid http or https URL",
        }));

        toast.error("Please enter a valid http or https URL", {
          toastId: `error-${key}`,
        });
      } else {
        setInputErrors((prev) => ({ ...prev, [key]: "" }));
      }
    }
  };


  const hasEditPermission = (() => {
    if (!rolepremission?.permissiondata?.data) return false;

    for (const role of rolepremission.permissiondata.data) {
      for (const module of role.modules) {
        if (module.module === "Project view") {
          for (const component of module.components) {
            if (component.name === "Project Details") {
              return component.permissions?.some((perm) => perm.toLowerCase().includes("edit"));
            }
          }
        }
      }
    }

    return false;
  })();

  const handleSubmit = async () => {
    // Validate multiselect fields
    for (let key of multiselectFields) {
      const value = editableDetails[key];
      if (!value || value.trim() === "") {
        toast.error(`Please select at least one option for ${formatFieldName(key)}`, {
          toastId: `multi-${key}`,
        });
        return;
      }
    }

    // URL validation logic
    const urlPattern = /^(https?:\/\/)/;
    const optionalUrls = ["kick_of_meeting_link", "proposal_dev_copy_link"];

    for (let key of urlFields) {
      const value = editableDetails[key]?.trim() ?? "";

      // If the field is empty and optional — skip validation
      if (optionalUrls.includes(key) && value === "") continue;

      // If not optional, or if user entered a value, check validity
      if (!urlPattern.test(value)) {
        toast.error(`Please enter a valid http or https URL for ${formatFieldName(key)}`, {
          toastId: `submit-url-${key}`,
        });
        return;
      }
    }

    try {
      const updatedData = { ...editableDetails };

      if (updatedData.project_team_list) {
        updatedData.project_team_list = updatedData.project_team_list
          .split(",")
          .map((member) => member.trim())
          .filter(Boolean);
      }

      const res = await fetch(`/server/crm-project-details/project-details-portal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (!res.ok) throw new Error("Failed to update");

      await res.json();
      toast.success("Updated successfully");
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Error saving data. Please try again.");
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
    <div className="overflow-x-auto bg-white p-3 border rounded-lg mt-3 w-full">
      <div className="flex justify-between">
        <h3 className="text-[18px] texxt-[#000000] mt-2">Projects Details</h3>
        {hasEditPermission && (
          <div className="flex justify-end gap-2 mb-3">
            <button
              onClick={handleEditToggle}
              className="flex items-center font-[inter] text-[12px] gap-2 border px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition border-gray-300"
              title={isEditing ? "Cancel" : "Edit"}
            >
              <SquarePen size={12} />
              <span className="text-[12px]">{isEditing ? "Cancel" : "Edit"}</span>
            </button>
          </div>
        )}
      </div>


      <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm text-left">
        <thead className="bg-[#D1D5DB] text-[#111827] font-[Instrument Sans] sticky top-0 z-20">
          <tr>
            <th className="px-3 py-2 border ">Action</th>
            <th className="px-3 py-2 border ">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {allowedFields.map((field, index) => {
            const value = editableDetails[field] ?? "";
            const isLink = typeof value === "string" && value.startsWith("http");

            return (
              <tr
                key={field}
                className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100`}
              >
                <td className="px-3 py-2 border font-medium">{formatFieldName(field)}</td>

                <td className="px-3 py-2 border">
                  {isEditing ? (
                    multiselectFields.includes(field) ? (
                      <Select
                        isMulti
                        options={dropdownOptions[field] || []}
                        value={
                          value
                            ? value.split(",").map((v) => ({
                              label: v.trim(),
                              value: v.trim(),
                            }))
                            : []
                        }
                        onChange={(selected) =>
                          handleChange(
                            field,
                            selected.map((opt) => opt.value).join(", ")
                          )
                        }
                        className="w-full"
                        classNamePrefix="select"
                        menuPortalTarget={document.body}
                        styles={{
                          control: (base) => ({
                            ...base,
                            minHeight: "2.5rem",
                            height: "auto",
                            overflow: "auto",
                            fontSize: "0.875rem",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            maxHeight: "auto",
                            overflowY: "auto",
                          }),
                          multiValue: (base) => ({
                            ...base,
                            maxWidth: "100%",
                          }),
                          menu: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                          menuPortal: (base) => ({
                            ...base,
                            zIndex: 9999,
                          }),
                        }}
                      />
                    ) : (
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          readOnly={field === "project_org_id" || field === "project_name"}
                          disabled={field === "project_org_id" || field === "project_name"}

                          className={`w-full border px-1 py-1 rounded ${isEditing &&
                            !["project_display_id", "project_name"].includes(field)
                            ? "bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            : "bg-gray-100 text-gray-600 cursor-not-allowed"
                            }`}
                          value={
                            !isEditing && (!value || value.trim() === "") ? "No data" : value
                          }
                          onChange={(e) => handleChange(field, e.target.value)}
                          onBlur={() => handleBlur(field)}
                        />

                        {urlFields.includes(field) &&
                          value.startsWith("http") &&
                          value.trim().length > 8 && (
                            <a href={value} target="_blank" rel="noopener noreferrer">
                              <button className="border px-3 py-1 rounded-lg bg-[#344EA0] text-white hover:bg-[#263970] transition whitespace-nowrap">
                                View Link
                              </button>
                            </a>
                          )}
                      </div>
                    )
                  ) : isLink ? (
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
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
                        <a
                          href={value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition"
                        >
                          Link
                        </a>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(value);
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
                    <span>{!value || value.trim() === "" ? "No data" : value}</span>
                  )}
                </td>
              </tr>
            );
          })}
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

export default ProjectDetails;