import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { LineChart } from "@mui/x-charts/LineChart";
import axios from "axios";
import { Chart } from "react-google-charts";
import etplogo from "../assets/Images/logo.svg";
import "../assets/css/Dashboard.css";
import OpenLoader from "./OpenLoader";
import Loader from "./Loader";
import SalesIqBot from "./SalesIqBot";
import {
  LayoutDashboard,
  ListTodo,
  FileText,
  TextQuote,
  CheckCircle2,
  Ban,
  PauseCircle,
  Handshake,
  Rocket,
  XCircle,
  NotebookPen,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { use } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography } from "@mui/material";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
  // createEventsModalPlugin,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
// import { createEventsModalPlugin } from "@schedule-x/events-modal";
import "@schedule-x/theme-default/dist/calendar.css";
import ProjectTable from "./ProjectTable";
import Piecharts from "../components/chart/Piechart";
import BarChart from "../components/chart/Barchart";
import Linechart from "../components/chart/Linechart";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [pendingTask, setPendingTask] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadings, setLoadings] = useState(true);
  const [userDetails, setUserDetails] = useState({});
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [tabeldata, setTabelData] = useState([]);
  const [tabeldatas, setTabelDatas] = useState([]);
  const [searchData, setSearchData] = useState("");
  const [showpopups, setShowpopus] = useState(false);
  const [showpopupcalender, setShowpopupcalender] = useState(false);
  const [projects, setProject] = useState([]);
  const [datas, setDatas] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const dropdownRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedDeveloper, setSelectedDeveloper] = useState("All");
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedWeek, setSelectedWeek] = useState("All");
  const [totalData, setTotalData] = useState(0);
  const LOCAL_STORAGE_KEY = "mrtDashboardTableState";
  const eventsService = useState(() => createEventsServicePlugin())[0];

  // Week utility functions
  const getWeekInfo = (dateString) => {
    const date = new Date(dateString);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );
    return `${date.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
  };
   const role_id = useSelector((state) => state.user.first_name);
    console.log("userroleid>>>", role_id);
  const rolepremission = useSelector((state) => state.userpermission)
  console.log("showuserpermission",rolepremission);
  const premission_user = rolepremission.permissiondata.data
  console.log("permissioneduser",premission_user);
  const premissionuserdata =
  Array.isArray(premission_user) && premission_user.length > 0
    ? premission_user[0]?.roleName
    : null;
console.log("permissionuserdata",premissionuserdata);



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
    {"superAdmin":["Total Project","Completed","In-Progress","On-Hold","Planning","Quote","Abandoned","Negotiation","Implementation","Closed"]},
    {"client":["Total Project","Completed","In-Progress","On-Hold"]},
    {"SalesPerson":["Total Project","Completed","In-Progress","On-Hold","Planning","Quote","Abandoned","Negotiation","Implementation","Closed"]},
    {"Manager":["Total Project","Completed","In-Progress","On-Hold","Planning","Quote","Abandoned","Negotiation","Implementation","Closed"]},
    {"Developer":["Total Project","Completed","In-Progress","On-Hold","Closed"]},
    {"Accountant":["Total Project","Completed","In-Progress","On-Hold","Planning","Quote","Abandoned","Negotiation","Implementation","Closed"]},
    {"TeamLeader":["Total Project","Completed","In-Progress","On-Hold","Planning","Quote","Abandoned","Negotiation","Implementation","Closed"]},
    {"BussinessTeamLead":["Total Project","Completed","In-Progress","On-Hold","Planning","Quote","Abandoned","Negotiation","Implementation","Closed"]},
  ]

  const getAllowedCardsForRole = () => {
    const role = premissionuserdata; 
    const rolePermission = userpremissioncard?.find(obj => obj[role]);
    return rolePermission ? rolePermission[role] : [];
  };
  const allowedCards = getAllowedCardsForRole();


  // const [tabeldata, setTabeldata] = useState([]);
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const mail = user?.email_id;

  const mail1 = sessionStorage.getItem("email");

  const invoices = useSelector((state) => state.invoice.invoices);
  const inputsheet = useSelector((state) => state.form);
  console.log("mail", mail);
  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
    console.log("Selected Filter:", selectedFilter);
  };

  const handleGroupFilterChange = (selectedFilter) => {
    setGroupFilter(selectedFilter);
    console.log("Selected Filter:", selectedFilter);
  };

  // FIXED: Updated navigation function to pass correct stage information
  const handlenavigate = (stage = null) => {
    // console.log("title", title);
    console.log("stage", stage);
    console.log("Filterstatus", groupFilter);
    console.log("Filter range", filter);

    // Navigate with proper state including stage for filtering
    navigate("/project", {
      state: {
        // title,
        groupFilter,
        rangeFilter: filter,
        stage: stage, // Pass the specific stage for filtering
      },
    });
  };

  const closePopup = () => {
    sessionStorage.removeItem("isLoggedIn");
    setShowpopus(false);
  };

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (isLoggedIn) {
      setIsLoading(true);

      const timeout = setTimeout(() => {
        setIsLoading(false);
        setShowpopus(true);
      }, 8000);

      return () => clearTimeout(timeout);
    } else {
      setIsLoading(false);
      setShowpopus(false);
    }
  }, []);

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

  const handleFieldChange = (e) => {
    setGlobalFilter("");
    setColumnFilters([]);
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
      };

      console.log("loadData payload:", payload);

      const response = await axios.post(
        "/server/sprints-projects-sync/get_project",
        payload
      );
      const enquiries = response.data.data || [];
      console.log("enquiries><><><><><", enquiries);
      setProject(response.data);
      console.log("><><>><><>>>AER>Y", response.data);

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
      setData(enquiries);
      setTotalData(response.data.totalProjects);
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
          // stage:stage,
        });

        const response = await axios.get(
          `/server/project-details/project-analytics?${params}`
        );
        const result = response.data;
        console.log("Dashboard Analytics >>", result);

        setProject({
          totalProjects: result.total_projects,
          statusCounts: result.stage_counts || {},
        });

        // Also set statusCounts separately for easier access
        setStatusCounts(result.stage_counts || {});
      } catch (error) {
        console.error("❌ Error fetching project analytics:", error);
        setProject({ totalProjects: 0, statusCounts: {} });
        setStatusCounts({});
      } finally {
        setLoading(false);
      }
    }

    fetchMeetingDetails();
  }, [groupFilter, filter]);

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

  if (isLoading) {
    // return <OpenLoader />;
  }

  return (
    <>
    {/* {hasPermission ("Dashboard","Dashboard")?( */}
       <div className="flex flex-col p-0 pt-3">
       <div className=" p-3 sm:p-4 md:p-0 lg:p-8 pt-2 sm:pt-3 md:pt-4 lg:pt-5 w-[100%]">
         {loading ? (
           <div className="flex items-center justify-center h-[80vh] top-0">
             <Loader />
           </div>
         ) : (
           <>
             {/* Header Section */}
             <div className="flex justify-between items-center">
               <h1 className="text-[30px] font-semibold font-arial">
                 Dashboard
               </h1>
               {/* Filter Dropdown */}
               <div className="flex flex-row gap-6">
                 {/* Group Filter Dropdown */}
                 <div className="relative w-48">
                   <select
                     className="appearance-none w-full py-2 px-3 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 cursor-pointer"
                     onChange={(e) => setGroupFilter(e.target.value)}
                     value={groupFilter}
                   >
                     <option value="">All Projects</option>
                     <option value="Full Stack">Full Stack</option>
                     <option value="Zoho One">Zoho One</option>
                   </select>
                   <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                     <svg
                       className="w-4 h-4"
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

                 {/* Date Filter Dropdown */}
                 <div className="relative w-48">
                   <select
                     className="appearance-none w-full py-2 px-3 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10 cursor-pointer"
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
                   <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">
                     <svg
                       className="w-4 h-4"
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
             <br></br>

             {/* Card section*/}
             {hasPermission("Dashboard", "Cards") && (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 md:gap-2 lg:gap-6 mb-6">
     {[
       {
         title: "Total Project",
         key: "totalProjects",
         icon: <LayoutDashboard size={25} />,
         color: "bg-blue-500",
         stage: null,
       },
       {
         title: "Planning",
         key: "Planning",
         icon: <ListTodo size={25} />,
         color: "bg-green-500",
         stage: "Planning",
       },
       {
         title: "Quote",
         key: "Quote",
         icon: <TextQuote size={25} />,
         color: "bg-yellow-400",
         stage: "Quote",
       },
       {
         title: "In-Progress",
         key: "In-Progress",
         icon: <NotebookPen size={25} />,
         color: "bg-orange-400",
         stage: "In-Progress",
       },
       {
         title: "Completed",
         key: "Completed",
         icon: <CheckCircle2 size={25} />,
         color: "bg-emerald-600",
         stage: "Completed",
       },
       {
         title: "Abandoned",
         key: "Abandoned",
         icon: <Ban size={25} />,
         color: "bg-gray-500",
         stage: "Abandoned",
       },
       {
         title: "On-Hold",
         key: "On-Hold",
         icon: <PauseCircle size={25} />,
         color: "bg-yellow-600",
         stage: "On-Hold",
       },
       {
         title: "Negotiation",
         key: "Negotiation",
         icon: <Handshake size={25} />,
         color: "bg-indigo-400",
         stage: "Negotiation",
       },
       {
         title: "Implementation",
         key: "Implementation",
         icon: <Rocket size={25} />,
         color: "bg-pink-500",
         stage: "Implementation",
       },
       {
         title: "Closed",
         key: "Closed",
         icon: <XCircle size={25} />,
         color: "bg-red-500",
         stage: "Closed",
       },
     ].filter((card) => allowedCards.includes(card.title))
       .map((card, index) => (
         <div
           key={index}
           onClick={() => handlenavigate(card.stage)}
           className="block md:w-[90%] p-2 md:p-2 bg-[#FAFDFF] border border-gray-200 rounded-2xl shadow-sm cursor-pointer transition-all duration-500 hover:scale-110"
         >
           <div className="flex justify-between">
             <div className="flex p-3 md:gap-2 gap-3">
               <div
                 className={`border rounded-lg p-3 mt-1 mb-3 text-white ${card.color}`}
               >
                 {card.icon}
               </div>
               <div>
                 <h2 className="mb-2 text-sm font-bold tracking-tight text-gray-500">
                   {card.title}
                 </h2>
                 <p className="text-2xl font-bold text-gray-700 mt-2">
                   {card.key === "totalProjects"
                     ? projects?.totalProjects || 0
                     : projects?.statusCounts?.[card.key] ||
                       statusCounts?.[card.key] ||
                       0}
                 </p>
               </div>
             </div>
             <div className="mt-8 pr-2 text-gray-500">
               <ChevronRight size={18} />
             </div>
           </div>
         </div>
       ))}
   </div>
 )}


             {/* Charts Section */}
             {hasPermission("Dashboard","Charts") && (
                <div className="flex flex-col xl:flex-row gap-6 mb-6">
                {/* Pie Chart */}
                <div className="flex flex-col w-[100%] sm:w-[95%] md:w-[90%] lg:w-[98%] xl:w-1/2 justify-center p-4 sm:p-6 md:p-9 bg-[#FFFFFF] border border-gray-200 rounded-2xl shadow-sm dashboard_card">
                  <Piecharts />
                </div>

                {/* Line Chart */}
                <div className="flex flex-col lg:w-[98%] xl:w-1/2 md:w-[90%]  justify-center p-9 bg-[#FFFFFF] border border-gray-200 rounded-2xl shadow- w-full">
                  <Linechart />
                </div>
              </div>
             )}


             {/* Projecttable section */}
             {hasPermission("Dashboard", "Project Table") && (
   <div className="lg:w-[100%] md:w-[95%]">
     <ProjectTable />
   </div>
 )}
           </>
         )}
       </div>
     </div>
    {/* ):(
      <div className="p-10 text-center text-red-600 font-semibold">
      You do not have permission to view this page.
    </div>
    )} */}

    </>

  );
};

export default Dashboard;

