import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Folder, ImageOff, TrendingUp } from "lucide-react";
import Piecharts from "./chart/Piecharts";
import ProjectTabledashboard from "./Projectstabeldashboard";
import Availability from "./Availability";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import ProjectTable from "./ProjectTable";

function Dashboarddetailspages() {
  const [activeTab, setActiveTab] = useState("All Projects");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProject] = useState([]);
  const [data, setData] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});

  const LOCAL_STORAGE_KEY = "mrtDashboardTableState";
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const user = useSelector((state) => state.user);
  const mail = user?.email_id;

  const role_id = useSelector((state) => state.user.first_name);
  console.log("userroleid>>>", role_id);
  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission", rolepremission);
  const premission_user = rolepremission.permissiondata.data
  console.log("permissioneduser", premission_user);
  const premissionuserdata =
    Array.isArray(premission_user) && premission_user.length > 0
      ? premission_user[0]?.roleName
      : null;
  console.log("permissionuserdata", premissionuserdata);



  const hasPermission = (moduleName, componentName) => {
    const permissions = rolepremission?.permissiondata?.data || [];

    for (const role of permissions) {
      for (const module of role?.modules || []) {
        if (module.module === moduleName) {
          for (const component of module?.components || []) {
            const permissionArray = Array.isArray(component?.permissions)
              ? component.permissions.flatMap(p =>
                p.split(',').map(str => str.trim())
              )
              : [];

            if (component?.name === componentName && permissionArray.includes("View")) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };


  const userpremissioncard = [
    { "superAdmin": ["Total Project", "Completed", "In-Progress", "On-Hold", "Planning", "Quote", "Abandoned", "Negotiation", "Implementation", "Closed"] },
    { "client": ["Total Project", "Completed", "In-Progress", "On-Hold"] },
    { "SalesPerson": ["Total Project", "Completed", "In-Progress", "On-Hold", "Planning", "Quote", "Abandoned", "Negotiation", "Implementation", "Closed"] },
    { "Manager": ["Total Project", "Completed", "In-Progress", "On-Hold", "Planning", "Quote", "Abandoned", "Negotiation", "Implementation", "Closed"] },
    { "Developer": ["Total Project", "Completed", "In-Progress", "On-Hold", "Closed"] },
    { "Accountant": ["Total Project", "Completed", "In-Progress", "On-Hold", "Planning", "Quote", "Abandoned", "Negotiation", "Implementation", "Closed"] },
    { "TeamLeader": ["Total Project", "Completed", "In-Progress", "On-Hold", "Planning", "Quote", "Abandoned", "Negotiation", "Implementation", "Closed"] },
    { "BussinessTeamLead": ["Total Project", "Completed", "In-Progress", "On-Hold", "Planning", "Quote", "Abandoned", "Negotiation", "Implementation", "Closed"] },
  ]

  const getAllowedCardsForRole = () => {
    const role = premissionuserdata;
    const rolePermission = userpremissioncard?.find(obj => obj[role]);
    return rolePermission ? rolePermission[role] : [];
  };
  const allowedCards = getAllowedCardsForRole();

  const getInitialTableState = () => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      console.log("dashboard><><><><><", savedState);

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
        left: ["project_name"],
        right: [],
      },
    };
  };

  const mail1 = sessionStorage.getItem("email");
  const [tableState, setTableState] = useState(getInitialTableState);
  const [globalFilter, setGlobalFilter] = useState(
    tableState.globalFilter || ""
  );

  const [columnFilters, setColumnFilters] = useState(
    tableState.columnFilters || []
  );
  const [sorting, setSorting] = useState(tableState.sorting || []);
  const [pagination, setPagination] = useState(
    tableState.pagination || { pageIndex: 0, pageSize: 10 }
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    switch (tab) {
      case "All Projects":
        setGroupFilter("");
        break;
      case "Zoho One":
        setGroupFilter("Zoho One");
        break;
      case "Full stack":
        setGroupFilter("Full Stack");
        break;
      default:
        setGroupFilter("");
    }
  };
  const handleDateFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    console.log("Selected Date Filter:", selectedFilter);
  };


  const loadDatas = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        email: mail1,
        search: globalFilter,
        status: selectedStatuses.join(","),
        sortKey: sorting.length > 0 ? sorting[0].id : "",
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "",
        columnFilters: columnFilters.map((filter) => ({
          id: filter.id,
          value: filter.value,
        })),
        group: groupFilter,
        range: filter,
      };

      console.log("loadData payload:", payload);

      const response = await axios.post(
        "/server/sprints-projects-sync/get_project",
        payload
      );

      // ✅ Filter only active projects
      const enquiries = (response.data.data || []).filter(
        (project) => project.is_active === true
      );

      console.log("Filtered active enquiries:", enquiries);

      setProject(response.data);

      const userDataList =
        response.data.result2?.map((entry) => entry.user_data) || [];

      const mergedAndUserData = [];

      if (enquiries && userDataList) {
        enquiries.forEach((enquiry) => {
          const user = userDataList.find(
            (u) => u.email_id === enquiry.email_id
          );

          mergedAndUserData.push({
            ...enquiry,
            Name: user
              ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
              : "N/A",
            CONTACTPHONE: user?.phone || user?.whatsup_no || "N/A",
            Bussiness_type: user?.bussiness_type || "N/A",
          });
        });
      }

      // ✅ Set only filtered active projects to state
      setData(mergedAndUserData);
      setTotalData(mergedAndUserData.length);
    } catch (error) {
      console.error(
        "Error fetching data:",
        error?.response?.data || error.message
      );
      setData([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    globalFilter,
    mail,
    selectedStatuses,
    columnFilters,
  ]);


  useEffect(() => {
    loadDatas();
  }, [loadDatas]);

  useEffect(() => {
    async function fetchMeetingDetails() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          group: groupFilter,
          range: filter,
        });

        console.log("Fetching analytics with params:", { group: groupFilter, range: filter });

        const response = await axios.get(
          `/server/project-details/project-analytics?${params}`
        );
        const result = response.data;
        console.log("Dashboard Analytics >>", result);

        setProject({
          totalProjects: result.total_projects,
          statusCounts: result.stage_counts || {},
        });
        setStatusCounts(result.stage_counts || {});
      } catch (error) {
        console.error(" Error fetching project analytics:", error);
        setProject({ totalProjects: 0, statusCounts: {} });
        setStatusCounts({});
      } finally {
        setLoading(false);
      }
    }

    fetchMeetingDetails();
  }, [groupFilter, filter]);

  const cardData = useMemo(() => [
    {
      title: "Total Projects",
      key: "totalProjects",
      icon: <Folder className="w-4 h-4" />,
      value: projects?.totalProjects || 0
    },
    {
      title: "Planning",
      key: "Planning",
      icon: <Folder className="w-4 h-4" />,
      value: statusCounts?.Planning || 0
    },
    {
      title: "In Process",
      key: "In-Progress",
      icon: <Folder className="w-4 h-4" />,
      value: statusCounts?.["In-Progress"] || 0
    },
    {
      title: "Overall Completed",
      key: "Completed",
      icon: <Folder className="w-4 h-4" />,
      value: statusCounts?.Completed || 0
    }
  ], [projects, statusCounts]);

  return (
    <>
      {hasPermission("Dashboard", "Cards") && (
        <div className="flex flex-col pt-3 bg-white font-[Inter]"> {/* 👈 added font-[Inter] here */}
          <div className="px-3 sm:px-4 md:px-8 lg:px-8 py-2 sm:py-3 md:py-4 lg:py-5">
            <div>
              <nav className="mb-4 text-sm">
                <Link to="" className="text-gray-500">Home</Link> / <span className="text-[#6B7280]">Dashboard</span>
              </nav>
            </div>

            <div className="flex flex-col items-center md:flex-row justify-between gap-4">
              <h3 className="text-[#374151] text-[20px] font-medium">Over View</h3>

              <div className="flex justify-between gap-2">
                <div className="flex bg-white border border-[#D1D5DB] text-[14px] rounded-md shadow-md overflow-hidden mb-12 p-1 gap-2">
                  {["All Projects", "Zoho One", "Full stack"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleTabChange(tab)}
                      className={`flex items-center rounded-md px-2 py-1.5 text-sm font-medium transition-all duration-300 ${activeTab === tab
                        ? "text-white bg-[#344EA0] shadow-inner"
                        : "text-[#9CA3AF]"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="relative w-40">
                  <select
                    className="appearance-none w-full py-2.5 px-4 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#344EA0] focus:border-[#344EA0] hover:border-gray-400 transition-all duration-200 pr-10 cursor-pointer font-medium"
                    onChange={(e) => setFilter(e.target.value)}
                    value={filter}
                  >
                    <option value="">Days</option>
                    <option value="last_30_days">Last 30 days</option>
                    <option value="this_month">This Month</option>
                    <option value="this_quarter">This Quarter</option>
                    <option value="this_year">This Year</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_quarter">Last Quarter</option>
                    <option value="last_year">Last Year</option>
                  </select>

                  <div className="pointer-events-none mb-5 absolute inset-y-0 right-0 flex items-center px-3">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {hasPermission("Dashboard", "Cards") && (
              <div className="flex flex-wrap gap-4 sm:gap-4 xl:gap-6 mb-6">
                {cardData.map((card, index) => (
                  <div
                    key={index}
                    className="w-full md:w-[295px] lg:w-[378px] border-1 border-[#D1D5DB] bg-[#FFFFFF] rounded-md p-3"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-[#374151] text-sm font-medium">{card.title}</h3>
                      <div className="bg-[#F3F4F6] border rounded-full p-2 flex items-center justify-center">
                        {card.icon}
                      </div>
                    </div>

                    <p className="text-[25px] text-[#111827] font-bold">
                      {card.value}
                    </p>

                    <div className="flex items-center space-x-2 mt-2">
                      <div className="flex items-center justify-center bg-[#DCFCE7] border rounded-full p-1">
                        <TrendingUp className="w-3 h-3 text-[#15803D]" />
                      </div>
                      <p className="text-sm text-[#15803D] mt-3">
                        +26% <span className="text-[#374151]">Compared to Last FY24</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr className="border-[#D1D5DB] border-2 mb-4" />
            {hasPermission("Dashboard", "Charts") && (
              <div className="mb-8">
                <h3 className="text-[#374151] text-[20px] font-medium">Statistics</h3>
                <div className="border border-[#D1D5DB] rounded-md p-3 mt-10">
                  <Piecharts />
                </div>
              </div>
            )}
            <hr className="border-[#D1D5DB] border-2 mb-4" />

            {hasPermission("Dashboard", "Project Table") && (
              <>
                <div className="mb-8">
                  <Availability />
                </div>
                <hr className="border-[#D1D5DB] border-3 mb-4" />
                <div className="mb-8">
                  <ProjectTabledashboard />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );

}

export default Dashboarddetailspages;