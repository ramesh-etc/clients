import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { PieChart } from "@mui/x-charts/PieChart";

import axios from "axios";
import Loader from "./Loader";
import AuditLog from "./auditLogs";
import { setSort } from "../redux/actions/applicatorActions";
import SalesIqBot from "./SalesIqBot";
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  CheckCircle2,
  Ban,
  PauseCircle,
  Handshake,
  Rocket,
  XCircle,
  NotebookPen,
} from "lucide-react";

import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography, LinearProgress, Paper } from "@mui/material";
import Piecharts from "../components/chart/Piechart";
const LOCAL_STORAGE_KEY = "mrtProjectDetailsTableState";

function ProjectDetails() {
  const location = useLocation();
  const { title, groupFilter, rangeFilter, stage } = location.state || {};
  console.log("title", title);
  console.log("groupfilter--------->", groupFilter);
  console.log("rangeFilter--------->", rangeFilter);
  console.log("stage>><<<<", stage);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  // const mail = user?.email_id || "";
  const mail = sessionStorage.getItem("email");
  console.log("eml", mail);
  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission", rolepremission);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchMember, setSearchMember] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProject] = useState([]);
  const [status, setStatus] = useState({
    Completed: 0,
    InProgress: 0,
    Requested: 0,
    Rejected: 0,
    Paid: 0,
    Pending: 0,
  });
  const handleEditAccess = (e, project) => {
    e.stopPropagation(); // Prevent card click navigation
    setSelectedProject(project);
    setShowAccessModal(true);
  };
  const getInitialTableState = () => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      console.error(
        "Error parsing saved table state from localStorage:",
        error
      );
    }
    return {
      columnPinning: {
        left: ["project_org_id", "project_name"],
        right: [],
      },
    };
  };
  const [tableState, setTableState] = useState(getInitialTableState);
  const [columnFilters, setColumnFilters] = useState(
    tableState.columnFilters || []
  );
  const [globalFilter, setGlobalFilter] = useState(
    tableState.globalFilter || ""
  );
  const [sorting, setSorting] = useState(tableState.sorting || []);
  const [pagination, setPagination] = useState(
    tableState.pagination || { pageIndex: 0, pageSize: 10 }
  );
  const [rowCount, setRowCount] = useState(0);
  const [selectedField, setSelectedField] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedTeam, setSelectedTeam] = useState("All Projects");
  const [selectedView, setSelectedView] = useState("List view");
  const [searchInput, setSearchInput] = useState("");
  const searchTimeoutRef = useRef(null);
  const [gridLoading, setGridLoading] = useState(false);
  const navigate = useNavigate();
  const getAvailableTeams = () => ["All Projects", "Zoho One", "Full Stack"];
  const getView = () => ["Grid view", "List view"];

  const getPageTitle = () => {
    if (stage && stage !== "totalProjects") {
      return `${title} - ${stage} Projects`;
    }
    return title || "Project Details";
  };

  const hasPermission = (moduleName, componentName) => {
    const permissions = rolepremission?.permissiondata?.data || [];

    for (const role of permissions) {
      for (const module of role.modules) {
        if (module.module === moduleName) {
          for (const component of module.components) {
            const permissionArray = component.permissions.flatMap(p =>
              p.split(',').map(str => str.trim())
            );

            if (component.name === componentName && permissionArray.includes("View")) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  const getCompletionColor = (percent) => {
    if (percent === "100%" || percent === "100.00%") return "success";
    if (parseFloat(percent) >= 75) return "info";
    if (parseFloat(percent) >= 50) return "warning";
    return "error";
  };

  const loadData = useCallback(async () => {
    if (data.length === 0) {
      setLoading(true);
    } else {
      setGridLoading(true);
    }

    const offset = pagination.pageIndex * pagination.pageSize
    try {
      const payload = {
        limit: pagination.pageSize,
        offset: offset + 1,
        email: mail,
        startDate: startDate,
        endDate: endDate,
        search: globalFilter,
        status: selectedStatuses.join(","),
        sortKey: sorting.length > 0 ? sorting[0].id : "",
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "",
        groupFilter: selectedTeam === "All Projects" ? groupFilter : selectedTeam,
        rangeFilter,
        stage,
        columnFilters: columnFilters.map((filter) => ({
          id: filter.id,
          value: filter.value,
        })),
      };

      console.log("loadData payload:", payload);

      const response = await axios.post(
        "/server/sprints-projects-sync/get_project",
        payload
      );

      console.log("Response Data:", response.data);
      let projects = response.data.data || [];
      console.log("response data", projects);

      if (stage && stage !== "totalProjects") {
        projects = projects.filter((project) => {
          const projectStage =
            project.stageName || project.stage_name || project.stage;
          return projectStage === stage;
        });
      }

      console.log("Filtered projects by stage:", projects);

      projects = projects.map((project) => {
        const completed = project.data?.completed_percent;
        if (completed === null || completed === undefined) {
          return {
            ...project,
            new_project_table: {
              ...project.new_project_table,
              completed_percent: 0,
            },
          };
        }
        return project;
      });

      setData(projects);
      setProject(response.data);

      console.log("Final filtered data:", projects);
      console.log("><><<><><><><<", response.data);

      setRowCount(response.data.totalProjects);
    } catch (error) {
      console.error(
        "Error fetching table data:",
        error?.response?.data || error.message
      );
      setData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
      setGridLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    globalFilter,
    mail,
    startDate,
    endDate,
    selectedStatuses,
    groupFilter,
    rangeFilter,
    stage,
    selectedTeam,
    columnFilters,
    data.length,
  ]);


  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTeamChange = (team) => {
    setSelectedTeam(team);
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
  };
  const handleFieldChange = (e) => {
    setSelectedField(e.target.value);
    setSelectedStatuses([]);
    setStartDate("");
    setEndDate("");
    setGlobalFilter("");
    setColumnFilters([]);
  };

  const handleCheckboxChange = (status) => {
    setSelectedStatuses((prevStatuses) =>
      prevStatuses.includes(status)
        ? prevStatuses.filter((s) => s !== status)
        : [...prevStatuses, status]
    );
  };

  const clearFilters = () => {
    setSelectedField("");
    setSelectedStatuses([]);
    setStartDate("");
    setEndDate("");
    setSearchInput("");
    setGlobalFilter("");
    setColumnFilters([]);
    setIsDropdownOpen(false);
    setPagination({ pageIndex: 0, pageSize: 10 });
    setSorting([]);
  };

  const isFilterApplied = () => {
    return (
      selectedField ||
      startDate ||
      endDate ||
      selectedStatuses.length > 0 ||
      globalFilter ||
      columnFilters.length > 0
    );
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setGlobalFilter(searchInput);
      setPagination({ pageIndex: 0, pageSize: pagination.pageSize }); // Reset to first page
    }, 500);


    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, pagination.pageSize]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleNavigateNew(project) {
    console.log("Redirecting with Project:", project);
    navigate("/projectview", {
      state: { project },
    });
  }
  const ProjectCard = ({ project }) => {
    const getInitials = (name) => {
      if (!name) return '?';
      const words = name.split(' ');
      return name[0] || '?';
    };

    const getConsistentColor = (name) => {
      if (!name) return "#3B82F6";
      let colour = 0;
      for (let i = 0; i < name.length; i++) {
        colour = name.charCodeAt(i) + ((colour << 5) - colour);
      }
      const r = (colour >> 16) & 0xff;
      const g = (colour >> 8) & 0xff;
      const b = colour & 0xff;
      const adjust = (c) => Math.min(200, Math.max(60, c));

      return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
    };

    const getBadgeColor = (team) => {
      switch (team) {
        case 'Full Stack':
          return 'border-[#344EA0]  text-[#344EA0]';
        case 'Zoho One':
          return 'border-[#15803D] text-[#15803D]';
        default:
          return 'border-gray-200 bg-gray-50 text-gray-700';
      }
    };

    const initials = getInitials(project.project_owner_display_name);
    const backgroundColor = getConsistentColor(project.project_owner_display_name);
    const completionPercent = project.completion_percentage || 0;
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return (
      <div
        className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow duration-200 h-full flex flex-col font-[Inter]" // 👈 Added here
        onClick={() => handleNavigateNew(project)}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 pb-3 border-b border-gray-200">
          <div className="flex-1 w-full sm:w-auto">
            <h3 className="font-[inter] text-gray-900 text-[16px] sm:text-base leading-tight">
              {project.project_name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">{project.project_org_id}</p>
            <h3
              className={`text-xs rounded border flex-shrink-0 inline-block px-2 py-0.5 ${getBadgeColor(
                project.project_group
              )}`}
            >
              {project.project_group || "Full Stack"}
            </h3>
          </div>
          <button
            onClick={(e) => handleEditAccess(e, project)}
            className="px-2 py-1 text-xs rounded border flex-shrink-0 self-start sm:ml-2"
          >
            Edit Access
          </button>
        </div>

        <div className="space-y-3 mb-4 flex-1">
          {/* Team Lead Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full text-white flex items-center justify-center text-xs font-[inter] flex-shrink-0"
                style={{ backgroundColor }}
              >
                {initials.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm text-[#111827] truncate">
                  {project.project_owner_display_name}
                </div>
                <div className="text-xs text-gray-500">Project Owner</div>
              </div>
            </div>
            <div className="text-xs sm:text-right ml-8 sm:ml-0">
              <div className="text-gray-500">Start Date</div>
              <div className="text-gray-700 font-[inter]">
                {formatDate(project.CREATEDTIME)}
              </div>
            </div>
          </div>

          {/* Members Row */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex -space-x-1">
                <div
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full text-white flex items-center justify-center text-xs font-[inter] border-2 border-white"
                  style={{ backgroundColor }}
                >
                  {initials.charAt(0).toUpperCase()}
                </div>
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-[inter]">
                  +
                </div>
              </div>
              <span className="text-xs text-gray-600">
                + {project.project_users_count || project.members_count || 0} Members
              </span>
            </div>
            <div className="text-xs sm:text-right ml-8 sm:ml-0">
              <div className="text-gray-500">Last Modified Date</div>
              <div className="text-gray-700 font-[inter]">
                {formatDate(project.MODIFIEDTIME)}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="border-t border-gray-100 pt-3 mt-auto">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs sm:text-sm text-gray-700 font-[inter]">
              {project.stageName || "Planning"}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-gray-900">
              {Math.round(completionPercent)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="bg-[#344EA0] h-1.5 sm:h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>
    );

  };

  const AccessModal = () => {
    if (!showAccessModal) return null;

    const members = [
      { name: "Ikram", email: "ikram@elitetechcorp.com", role: "Super Admin", roleType: "Admin" },
      { name: "Anand Kumar", email: "anand@elitetechcorp.com", role: "Manager", roleType: "Organise" },
      { name: "Ramesh", email: "ramesh@elitetechcorp.com", role: "Client", roleType: "Viewer" }
    ];

    const getRoleColor = (role) => {
      switch (role) {
        case "Super Admin": return "text-green-600";
        case "Manager": return "text-blue-600";
        case "Client": return "text-orange-600";
        default: return "text-gray-600";
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md mx-4">
          {/* Header */}
          <div className="flex justify-between items-center p-3 border-b">
            <div>
              <h2 className="text-lg font-semibold">Manage Access</h2>
              <p className="text-sm text-gray-600 ">Update member permissions.</p>
            </div>
            <button
              onClick={() => setShowAccessModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">

            {/* Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search by name or email address"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm pr-8"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {members
                .filter(member =>
                  member.name.toLowerCase().includes(searchMember.toLowerCase()) ||
                  member.email.toLowerCase().includes(searchMember.toLowerCase())
                )
                .map((member, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3 flex-1">
                      <input type="checkbox" className="w-4 h-4" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-[inter]">{member.name}</span>

                        </div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-[inter] gap-2 border px-1 py-1 ${getRoleColor(member.role)}`}>
                      {member.role}
                    </span>
                    <select className="text-sm border border-gray-300 rounded px-2 py-1 ml-2">
                      <option>{member.roleType}</option>
                      <option>Admin</option>
                      <option>Organise</option>
                      <option>Viewer</option>
                    </select>
                  </div>
                ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              onClick={() => setShowAccessModal(false)}
              className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    );
  };


  const columns = useMemo(
    () => [
      // {
      //   accessorKey: "project_org_id",
      //   header: "Project ID",
      //   enableSorting: true,
      //   enableColumnFilter: true,
      //   columnDefType: "data",
      //   size: 150,
      //   enableColumnPinning: false,
      // },
      {
        accessorKey: "project_name",
        header: "Project Name",
        enableSorting: true,
        enableColumnFilter: true,
        size: 350,
        Cell: ({ row, cell, table }) => {
          const projectId = row.original.project_org_id;
          const projectName = cell.getValue();

          const displayText = projectId
            ? `${projectId} - ${projectName || ""}`
            : `${projectName || ""}`;
          const columnFilterValue = table
            .getState()
            .columnFilters.find((filter) => filter.id === "project_name")?.value;
          const globalFilterValue = table.getState().globalFilter;

          let highlightedText = displayText;
          const highlight = (text, query) => {
            if (!query || !text) return text;
            const regex = new RegExp(
              `(${query.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`,
              "gi"
            );
            const parts = text.split(regex);
            return (
              <>
                {parts.map((part, i) =>
                  regex.test(part) ? (
                    <span key={i} style={{ backgroundColor: "orange" }}>
                      {part}
                    </span>
                  ) : (
                    part
                  )
                )}
              </>
            );
          };

          if (columnFilterValue) {
            highlightedText = highlight(displayText, columnFilterValue);
          } else if (globalFilterValue) {
            highlightedText = highlight(displayText, globalFilterValue);
          }

          return (
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
                color: "#111827",
              }}
            >
              {highlightedText}
            </Typography>
          );
        },
        enableColumnPinning: false,
      },

      {
        accessorKey: "completion_percentage",
        header: "Status",
        enableSorting: true,
        enableColumnFilter: true,
        size: 320,
        Cell: ({ cell }) => {
          const rawValue = cell.getValue();
          let percent = 0;
          if (rawValue != null && !isNaN(parseFloat(rawValue))) {
            percent = parseFloat(rawValue);
          }
          const color = getCompletionColor(percent);
          return (
            <Box sx={{ width: "100%", mr: 1 }}>
              <LinearProgress
                variant="determinate"
                value={percent}
                color={color}
                sx={{
                  height: 4,
                  borderRadius: 8,
                  backgroundColor: "#e0e0e0",
                }}
              />
              <Box sx={{ mt: 0.5, textAlign: "center", fontSize: 12 }}>
                {percent.toFixed(0)}%
              </Box>
            </Box>
          );
        },
        enableColumnPinning: true,
      },
      {
        accessorKey: "stageName",
        header: "Process",
        enableSorting: true,
        enableColumnFilter: true,
        size: 220,
        enableColumnPinning: true,
        Cell: ({ row }) => {
          const stageName = row.getValue("stageName");

          const getStageColor = (stage) => {
            if (!stage) return { border: '#6B7280', bg: '#6B72801A', text: '#6B7280' };

            let colour = 0;
            for (let i = 0; i < stage.length; i++) {
              colour = stage.charCodeAt(i) + ((colour << 5) - colour);
            }
            const r = (colour >> 16) & 0xff;
            const g = (colour >> 8) & 0xff;
            const b = colour & 0xff;
            const adjust = (c) => Math.min(200, Math.max(60, c));

            const adjustedR = adjust(r);
            const adjustedG = adjust(g);
            const adjustedB = adjust(b);

            const hexColor = `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;

            return {
              border: hexColor,
              bg: `${hexColor}1A`,
              text: hexColor
            };
          };

          const colors = getStageColor(stageName);

          return (
            <span
              className="px-2 rounded-full items-center border-1 text-xs"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.bg,
                color: colors.text
              }}
            >
              {stageName}
            </span>
          );
        },
      },
      {
        accessorKey: "project_group",
        header: "Team",
        enableSorting: true,
        enableColumnFilter: true,
        size: 220,
        enableColumnPinning: true,
      },
      {
        accessorKey: "project_owner_display_name",
        header: "Owner",
        enableSorting: true,
        enableColumnFilter: true,
        size: 250,
        enableColumnPinning: true,
        Cell: ({ row }) => {
          const ownerName = row.getValue("project_owner_display_name");
          const getInitials = (name) => {
            if (!name) return '?';
            const words = name.split(' ');
            return name[0] || '?';
          };

          const getConsistentColor = (name) => {
            if (!name) return "#999";
            let colour = 0;
            for (let i = 0; i < name.length; i++) {
              colour = name.charCodeAt(i) + ((colour << 5) - colour);
            }
            const r = (colour >> 16) & 0xff;
            const g = (colour >> 8) & 0xff;
            const b = colour & 0xff;
            const adjust = (c) => Math.min(200, Math.max(60, c));

            return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
          };

          const initials = getInitials(ownerName);
          const backgroundColor = getConsistentColor(ownerName);

          return (
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-[inter]"
                style={{ backgroundColor }}
                title={ownerName}
              >
                {initials.toUpperCase()}
              </div>
              <span className="text-sm">{ownerName}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "CREATEDTIME",
        header: "Created Date",
        enableSorting: true,
        enableColumnFilter: true,
        size: 250,
        enableColumnPinning: true,
        Cell: ({ cell }) => {
          const dateString = cell.getValue();
          if (!dateString) return 'N/A';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        },
      },
      {
        accessorKey: "MODIFIEDTIME",
        header: "Last Modified",
        enableSorting: true,
        enableColumnFilter: true,
        size: 200,
        enableColumnPinning: true,
        Cell: ({ cell }) => {
          const dateString = cell.getValue();
          if (!dateString) return 'N/A';
          const date = new Date(dateString);
          return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        },
      },
    ],
    [pagination.pageIndex, pagination.pageSize]
  );

  const handleCardClick = (filterType) => {
    if (filterType === "Total") {
      setSelectedStatuses([]);
    } else if (filterType === "Completed") {
      setSelectedStatuses(["Completed"]);
    } else if (filterType === "InProgress") {
      setSelectedStatuses(["InProgress"]);
    }
    setPagination({ pageIndex: 0, pageSize: pagination.pageSize });
  };

  const table = useMaterialReactTable({
    columns,
    data: data,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading: loading,
      pagination,
      sorting,
      columnPinning: tableState.columnPinning,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnPinningChange: (updater) => {
      setTableState((prev) => {
        const newPinningState =
          updater instanceof Function ? updater(prev.columnPinning) : updater;
        const newState = { ...prev, columnPinning: newPinningState };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
    },
    enableColumnActions: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    enableDensityToggle: false,
    enableHiding: true,
    enableStickyHeader: true,
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableFullScreenToggle: false,

    // Bottom toolbar
    renderBottomToolbarCustomActions: () => (
      <Box
        sx={{
          p: "1rem",
          display: "flex",
          alignItems: "center",
          fontFamily: "Inter, sans-serif", // 👈 Added Inter font
        }}
      >
        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "Inter, sans-serif" }}>
          Total Records: {rowCount}
        </Typography>
      </Box>
    ),

    // Table container
    muiTableContainerProps: {
      sx: {
        maxHeight: "65vh",
        overflowX: "auto",
        maxWidth: "100%",
        border: "1px solid whitesmoke",
        fontFamily: "Inter, sans-serif", // 👈 Added here
      },
    },

    // Whole table
    muiTableProps: {
      sx: {
        tableLayout: "fixed",
        maxWidth: "80vw",
        fontFamily: "Inter, sans-serif", // 👈 Added here
      },
    },

    // Header cells
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
        border: "1px solid whitesmoke",
        maxWidth: "80vw",
        fontFamily: "Inter, sans-serif", // 👈 Added here
      },
    },

    // Body cells
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid whitesmoke",
        fontFamily: "Inter, sans-serif", // 👈 Added here
      },
    },

    // Rows
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => handleNavigateNew(row.original),
      sx: {
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
        fontFamily: "Inter, sans-serif", // 👈 Added here
      },
    }),

    // Top toolbar (custom tabs)
    renderTopToolbarCustomActions: () => (
      <div className="flex bg-white border border-[#D1D5DB] rounded-md p-1 gap-2 font-[inter]"> {/* 👈 Added font-[inter] */}
        {getAvailableTeams().map((tab) => (
          <button
            key={tab}
            onClick={() => handleTeamChange(tab)}
            className={`flex items-center rounded-md text-[14px] px-2 py-1 text-sm font-[inter] transition-all duration-300 ${selectedTeam === tab
              ? "text-white bg-[#344EA0] shadow-inner"
              : "text-[#9CA3AF]"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>
    ),
  });


  return (
    <>
      {hasPermission("Project Details", "Project List") ? (
        <div className="flex flex-col p-8 md:p-2 pt-3 font-[Inter]">
          <nav className="flex mb-5" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2 !pl-0">
              <li className="inline-flex items-center">
                <Link
                  to="/dashboard"
                  className="text-[14px] text-gray-400 hover:text-gray-500"
                >
                  Dashboard
                </Link>
              </li>
              <span>/</span>
              <li>
                <span className="text-[14px] text-[#6B7280]">Project Details</span>
              </li>
            </ol>
          </nav>

          <div className="flex justify-between mb-6">
            <h3 className="text-xl font-[inter]">Project Details</h3>
            <div className="flex border-b border-gray-300">
              {getView().map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleViewChange(tab)}
                  className={`relative px-4 py-2 text-sm font-[inter] transition-colors duration-300 ${selectedView === tab
                    ? "text-[#344EA0] after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-[#344EA0]"
                    : "text-[#6B7280]"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            {selectedView === "List view" ? (
              <MaterialReactTable table={table} />
            ) : (
              <div>
                {/* Grid View */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    {/* Optional spinner */}
                  </div>
                ) : (
                  <>
                    <div className="border rounded-md overflow-hidden flex flex-col h-[calc(100vh-100px)]">
                      {/* Fixed Header */}
                      <div className="sticky top-0 z-10 bg-white border-b px-4 py-2">
                        <div className="flex justify-between items-center">
                          <div className="flex bg-white border border-[#D1D5DB] rounded-md p-1 gap-2">
                            {getAvailableTeams().map((tab) => (
                              <button
                                key={tab}
                                onClick={() => handleTeamChange(tab)}
                                className={`flex items-center rounded-md text-[14px] px-2 py-1 text-sm font-[inter] transition-all duration-300 ${selectedTeam === tab
                                  ? "text-white bg-[#344EA0] shadow-inner"
                                  : "text-[#9CA3AF]"
                                  }`}
                              >
                                {tab}
                              </button>
                            ))}
                          </div>

                          {/* Search Input */}
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchInput}
                              onChange={(e) => setSearchInput(e.target.value)}
                              className="border px-3 py-1 bg-white rounded-md text-sm w-64 pr-8"
                            />
                            {searchInput && (
                              <button
                                onClick={() => {
                                  setSearchInput("");
                                  setGlobalFilter("");
                                }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Scrollable Body */}
                      <div className="overflow-y-auto bg-white flex-1 p-4">
                        {gridLoading ? (
                          <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#344EA0]"></div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {data.map((project, index) => (
                                <ProjectCard
                                  key={project.project_org_id || index}
                                  project={project}
                                />
                              ))}
                            </div>

                            {data.length === 0 && !loading && (
                              <div className="text-center py-12">
                                <div className="text-gray-500 text-lg mb-2">
                                  No projects found
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {/* Footer with Pagination */}
                      {rowCount > pagination.pageSize && (
                        <div className="border-t bg-white px-4 py-3">
                          <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              Total Record: {rowCount}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    pageIndex: Math.max(0, prev.pageIndex - 1),
                                  }))
                                }
                                disabled={pagination.pageIndex === 0}
                                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                              >
                                Previous
                              </button>
                              <span className="text-sm text-gray-600">
                                Page {pagination.pageIndex + 1} of{" "}
                                {Math.ceil(rowCount / pagination.pageSize)}
                              </span>
                              <button
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    pageIndex: prev.pageIndex + 1,
                                  }))
                                }
                                disabled={
                                  (pagination.pageIndex + 1) *
                                  pagination.pageSize >=
                                  rowCount
                                }
                                className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 font-[Inter]">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">Access Denied</div>
            <div className="text-gray-400 text-sm">
              You don't have permission to view this page
            </div>
          </div>
        </div>
      )}
      {showAccessModal && <AccessModal />}
    </>
  );

}

export default ProjectDetails;