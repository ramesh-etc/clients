import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  CircularProgress,
  Button,
  Chip,

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Calendar, RefreshCcw, User, Briefcase, Clock, Activity, Users, Send } from "lucide-react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import zohocatalyst from "../assets/Images/zohoCatalyst.png";
import zohoone from "../assets/Images/Zoho-one.png";
import Dashboardteam from "./Dashboardteam";


const LOCAL_STORAGE_KEY = "mrtDashboardTableState";
function ProjectTable() {
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
        left: ["project_display_id"],
        right: [],
      },
      pagination: { pageIndex: 0, pageSize: 10 },
    };
  };
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjectIds, setExpandedProjectIds] = useState(new Set());


  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const tableRef = useRef(null);

  const [showPopupCalendar, setShowPopupCalendar] = useState(false);
  const [rawCalendarApiData, setRawCalendarApiData] = useState(null);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [totaldata, settotaldata] = useState("totalProjects")



  const [filters, setFilters] = useState({
    project_group: "",
    project_name: "",
    user_name: "",
  });
  const [selectedTeam, setSelectedTeam] = useState("All");
  const [selectedProject, setSelectedProject] = useState("All");
  const [selectedDeveloper, setSelectedDeveloper] = useState("All");
  const [teamToalhr, setTeamtotalhr] = useState();
  const [spinning, setSpinning] = useState(false);
  const [tableState, setTableState] = useState(getInitialTableState);
  const [Monthfilter, setMonthfilter] = useState('this_week')
  console.log("monthfilter", Monthfilter);
  const role_name = useSelector((state) => state.user.first_name);
  console.log("userroleid>>>", role_name);




  const eventsServicePlugin = React.useMemo(() => {
    const plugin = createEventsServicePlugin();
    return plugin;
  }, []);
  const calendarApp = useCalendarApp({
    views: [
      createViewDay(),
      createViewWeek(),
      createViewMonthGrid(),
      createViewMonthAgenda(),
    ],
    plugins: eventsServicePlugin ? [eventsServicePlugin] : [],
    events: [],
    defaultView: createViewWeek.name,
    callbacks: {
      onEventClick: (event) => {
        setSelectedEventDetails(event);
      },
    },
  });

  const handleClick = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
  };


  useEffect(() => {
    const fetch = async () => {
      try {
        const range = Monthfilter
        console.log("daterange", range);

        const res = await axios.get(
          `/server/project-details/monthly-team-allocated-hrs/?range=${range}`
        );
        setTeamtotalhr(res.data);
        console.log("show_data", res.data);
      } catch (err) { }
    };
    if (Monthfilter) {
      fetch();
    }
  }, [Monthfilter]);
  const parseHoursAndMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const match = timeStr.match(/(\d+)h\s*(\d+)m/);
    if (!match) return 0;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours + minutes / 60;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {

        const range = "two-days"

        const [projectsRes, calendarRes] = await Promise.all([
          axios.get(`/server/project-details/daily-team-member-allocated-hrs/${range}`),
          axios.get("/server/project-details/weekly-allocated-hours"),
        ]);


        const allocations = projectsRes.data.projectWiseAllocations || {};
        console.log("allocationdata", allocations);

        const processedData = Object.values(allocations).map((project) => {
          const totalToday = project.users.reduce(
            (sum, user) => sum + parseHoursAndMinutes(user.today_allocated_hours),
            0
          );
          const totalTomorrow = project.users.reduce(
            (sum, user) => sum + parseHoursAndMinutes(user.tomorrow_allocated_hours),
            0
          );

          const userNames = project.users.map((u) => u.user_name).filter(Boolean);

          return {
            ...project,
            summary_user_names: userNames,
            summary_today_hours: `${Math.floor(totalToday)}h ${Math.round((totalToday % 1) * 60)}m`,
            summary_tomorrow_hours: `${Math.floor(totalTomorrow)}h ${Math.round((totalTomorrow % 1) * 60)}m`,
          };
        });
        ;


        console.log("Processed Projects Data:", processedData);
        setProjectsData(processedData);


        setRawCalendarApiData(calendarRes.data);
        setLoadingCalendar(false);

      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const transformCalendarData = (payload, calendarFilters) => {
    const {
      selectedTeam: teamFilter,
      selectedDeveloper: devFilter,
      selectedProject: projectFilter,
    } = calendarFilters;

    if (!payload || !payload.employees) return [];

    const slugify = (str) =>
      String(str)
        .toLowerCase()
        .replace(/[^\w-]+/g, "_");

    const events = [];

    Object.entries(payload.employees).forEach(([teamName, developers]) => {
      if (teamFilter !== "All" && teamName !== teamFilter) return;

      Object.entries(developers).forEach(([devName, dates]) => {
        if (devFilter !== "All" && devName !== devFilter) return;

        Object.entries(dates).forEach(([date, details]) => {
          const projectOnThisDay = Object.keys(details).find(
            (k) => k !== "status" && k !== "available"
          );

          if (projectFilter !== "All" && projectOnThisDay !== projectFilter)
            return;

          let title = `${devName}`;
          let color = "#4ade80"; // green by default
          let status = "Working";
          let allocatedHours = 0;

          if (details.status === "Weekend") {
            title += " - Weekend";
            color = "#cbd5e1"; // gray
            status = "Weekend";
          } else if (details.status === "On Leave") {
            title += " - On Leave";
            color = "#f87171"; // red
            status = "On Leave";
          } else {
            if (projectOnThisDay) {
              allocatedHours = details[projectOnThisDay] || 0;
              title += ` - ${projectOnThisDay} (${allocatedHours}h)`;
            } else {
              if (projectFilter !== "All") return;
              allocatedHours = details.available || 0;
              title += ` - Available (${allocatedHours}h)`;
              status = "Available";
            }
          }

          events.push({
            id: slugify(`${teamName}-${devName}-${date}-${projectOnThisDay || "available"}`),
            title,
            start: date,
            end: date,
            calendarId: teamName,
            color,
            extendedProps: {
              userName: devName,
              teamName: teamName,
              date: new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              status,
              projectName: projectOnThisDay || "N/A",
              allocatedHours,
            },
          });
        });
      });
    });

    return events;
  };


  // const safeEventId = originalId.replace(/[^\w-]/g, '_'); 


  useEffect(() => {
    if (!rawCalendarApiData || !eventsServicePlugin) return;


    const timeout = setTimeout(() => {
      try {
        const filterObj = { selectedTeam, selectedDeveloper, selectedProject };
        const events = transformCalendarData(rawCalendarApiData, filterObj);


        if (eventsServicePlugin && typeof eventsServicePlugin.set === "function") {
          eventsServicePlugin.set(events);
        } else {
          console.warn("Events service plugin not ready yet");
        }
      } catch (error) {
        console.error("Error setting calendar events:", error);
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [
    rawCalendarApiData,
    selectedTeam,
    selectedDeveloper,
    selectedProject,
    eventsServicePlugin,
  ]);


  const tableData = useMemo(() => {

    let processedProjects = projectsData.filter((p) => {
      const groupMatch = !filters.project_group || p.project_group === filters.project_group;
      const nameMatch = !filters.project_name || p.project_name === filters.project_name;
      return groupMatch && nameMatch;
    });
    console.log("totalprocessedProjects", processedProjects);

    if (filters.user_name) {
      processedProjects = processedProjects
        .map((project) => {
          const matchingUsers = project.users.filter(
            (user) => user.user_name === filters.user_name
          );
          console.log("singleuser", matchingUsers)
          if (matchingUsers.length > 0) {
            const singleUser = matchingUsers[0];
            console.log("selecteduser", singleUser);
            console.log("selectedusername", singleUser.user_name);
            console.log("selectedusertodayhr", singleUser.today_allocated_hours);
            console.log("selectedusertodayhr", singleUser.tomorrow_allocated_hours);
            const todayHours = parseHoursAndMinutes(singleUser.today_allocated_hours || "0h 0m");
            const tomorrowHours = parseHoursAndMinutes(singleUser.tomorrow_allocated_hours || "0h 0m");
            return {
              ...project,
              users: matchingUsers,
              summary_user_names: [singleUser.user_name],
              summary_today_hours: `${Math.floor(todayHours)}h ${Math.floor((todayHours % 1) * 60)}m`,
              summary_tomorrow_hours: `${Math.floor(tomorrowHours)}h ${Math.floor((tomorrowHours % 1) * 60)}m`
            };

          }


          return null;
        })
        .filter(Boolean);
    }
    const rows = [];
    processedProjects.forEach((project) => {
      rows.push({
        ...project,
        rowType: "project",
        isExpanded: expandedProjectIds.has(project.external_project_id),
      });

      if (expandedProjectIds.has(project.external_project_id)) {
        project.users.forEach((user) => {
          rows.push({
            ...user,
            rowType: "user",
            parent_project_id: project.external_project_id,
          });
        });
      }
    });
    return rows;
  }, [projectsData, filters, expandedProjectIds]);



  const handleToggleExpand = (projectId) => {
    const currentPage = tableRef.current?.getState().pagination.pageIndex || 0;
    setCurrentPageIndex(currentPage);

    setExpandedProjectIds((prev) => {
      const newSet = new Set(prev);
      newSet.has(projectId) ? newSet.delete(projectId) : newSet.add(projectId);
      return newSet;
    });
  };

  useEffect(() => {
    if (tableRef.current && currentPageIndex >= 0) {
      const timer = setTimeout(() => {
        try {
          const totalRows = tableData.length;
          const pageSize = tableRef.current.getState().pagination.pageSize;
          const maxPage = Math.max(0, Math.ceil(totalRows / pageSize) - 1);
          const targetPage = Math.min(currentPageIndex, maxPage);

          tableRef.current.setPageIndex(targetPage);
        } catch (error) {
          console.error("Error setting page index:", error);
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [tableData, currentPageIndex]);


  const projectGroups = useMemo(() => [...new Set(projectsData.map(p => p.project_group))], [projectsData]);
  const projectNames = useMemo(() => [
    ...new Set(projectsData
      .filter(p => !filters.project_group || p.project_group === filters.project_group)
      .map(p => p.project_name))
  ], [projectsData, filters.project_group]);
  const userNames = useMemo(() => {

    if (!filters.project_group) {
      return [
        ...new Set(projectsData
          .flatMap(p => p.users)
          .map(u => u.user_name)
          .filter(Boolean)
        )
      ];
    }


    if (filters.project_group && !filters.project_name) {
      return [
        ...new Set(projectsData
          .filter(p => p.project_group === filters.project_group)
          .flatMap(p => p.users)
          .map(u => u.user_name)
          .filter(Boolean)
        )
      ];
    }


    if (filters.project_group && filters.project_name) {
      return [
        ...new Set(projectsData
          .filter(p => p.project_group === filters.project_group && p.project_name === filters.project_name)
          .flatMap(p => p.users)
          .map(u => u.user_name)
          .filter(Boolean)
        )
      ];
    }

    return [];
  }, [projectsData, filters.project_group, filters.project_name]);




  const columns = useMemo(() => [
    { accessorKey: "project_display_id", header: "Project ID", size: 250, Cell: ({ row }) => (row.original.rowType === "project" ? row.original.project_display_id : "-") },
    { accessorKey: "project_name", header: "Project Name", size: 350, Cell: ({ row }) => (row.original.rowType === "project" ? row.original.project_name : "-") },
    {
      accessorKey: "project_manager",
      header: "Manager",
      size: 350,
      Cell: ({ row }) => {
        const isProject = row.original.rowType === "project";
        let manager = row.original.project_manager;
        if (isProject && typeof manager === "string") {
          manager = manager.replace(/^\[|\]$/g, "").trim();
          return manager || "-";
        }
        return "-";
      }
    },
    {
      accessorKey: "cluster_manager",
      header: "Cluster Manager",
      size: 350,
      Cell: ({ row }) => {
        const isProject = row.original.rowType === "project";
        let manager = row.original.cluster_manager;
        if (isProject && typeof manager === "string") {
          manager = manager.replace(/^\[|\]$/g, "").trim();
          return manager || "-";
        }
        return "-";
      }
    },
    { accessorKey: "business_team", header: "Bussiness Team", size: 350, Cell: ({ row }) => (row.original.rowType === "project" ? row.original.business_team : "-") },
    { accessorKey: "testing_team", header: "Testing Team", size: 350, Cell: ({ row }) => (row.original.rowType === "project" ? row.original.testing_team : "-") },
    { accessorKey: "project_owner_display_name", header: "Owner", size: 250, Cell: ({ row }) => (row.original.rowType === "project" ? row.original.project_owner_display_name : "-") },
    {
      accessorKey: "user_name",
      header: "Users",
      size: 250,
      Cell: ({ row }) => {
        const { rowType, isExpanded, summary_user_names, user_name } = row.original;
        if (rowType === "project" && !isExpanded) {
          if (!summary_user_names || summary_user_names.length === 0) return <Typography variant="body2" color="text.secondary">No Users</Typography>;
          return (<Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>{summary_user_names.map((name) => (<Chip key={name} label={name} size="small" />))}</Box>);
        }
        if (rowType === "user") {
          return (<Typography variant="body2" sx={{ fontWeight: "500" }}>{user_name}</Typography>);
        }
        return "";
      },
    },
    {
      accessorKey: "today_allocated_hours",
      header: "Today's (hrs)",
      size: 250,
      Cell: ({ row }) => {
        const { rowType, isExpanded, summary_today_hours, today_allocated_hours } = row.original;
        if (rowType === "project" && !isExpanded) {
          return <Typography variant="body2" sx={{ fontWeight: "bold" }}>{summary_today_hours}</Typography>;
        }
        if (rowType === "user") {
          return <Typography variant="body2">{today_allocated_hours ?? 0}</Typography>;
        }
        return "";
      },
    },
    {
      accessorKey: "tomorrow_allocated_hours",
      header: "Tomorrow's (hrs)",
      size: 250,
      Cell: ({ row }) => {
        const { rowType, isExpanded, summary_tomorrow_hours, tomorrow_allocated_hours } = row.original;
        if (rowType === "project" && !isExpanded) {
          return <Typography variant="body2" sx={{ fontWeight: "bold" }}>{summary_tomorrow_hours}</Typography>;
        }
        if (rowType === "user") {
          return <Typography variant="body2">{tomorrow_allocated_hours ?? 0}</Typography>;
        }
        return "";
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 250,
      Cell: ({ row }) => {
        if (row.original.rowType === "project" && row.original.users?.length > 0) {
          return (<Button variant="outlined" size="small" onClick={() => handleToggleExpand(row.original.external_project_id)}>{row.original.isExpanded ? "Hide Details" : "View Details"}</Button>);
        }
        return null;
      },
    },
  ], []);


  const parseTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;

    const hourMatch = timeStr.match(/(\d+)h/);
    const minuteMatch = timeStr.match(/(\d+)m/);

    const hours = hourMatch ? parseInt(hourMatch[1], 10) : 0;
    const minutes = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

    return hours * 60 + minutes;
  };


  const getPercentage = (value, total) => {
    if (!value || !total) return 0;
    return Math.min((value / total) * 100, 100);
  };



  const table = useMaterialReactTable({
    columns,
    data: tableData,
    state: {
      isLoading: loading,
      columnPinning: tableState.columnPinning,
      pagination: {
        pageIndex: currentPageIndex,
        pageSize: tableState.pagination?.pageSize || 10
      }

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
    manualPagination: false,
    autoResetPageIndex: false,
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex: currentPageIndex, pageSize: tableState.pagination?.pageSize || 10 });
        setCurrentPageIndex(newState.pageIndex);
        const newTableState = {
          ...tableState,
          pagination: newState
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTableState));
        setTableState(newTableState);
      } else {
        setCurrentPageIndex(updater.pageIndex);

        const newTableState = {
          ...tableState,
          pagination: updater
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTableState));
        setTableState(newTableState);
      }
    },
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="textSecondary">
          Total Records: {tableData.length}
        </Typography>
      </Box>
    ),
    onColumnPinningChange: (updater) => {
      setTableState((prev) => {
        const newPinningState =
          updater instanceof Function ? updater(prev.columnPinning) : updater;
        const newState = { ...prev, columnPinning: newPinningState };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
    },

    muiTableContainerProps: {
      sx: {
        maxHeight: "65vh",
        overflowX: "auto",
        maxWidth: "100%",
        border: "1px solid whitesmoke",
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "fixed",
        maxWidth: "80vw",
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
        border: "1px solid whitesmoke",
        maxWidth: "80vw",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        border: "1px solid whitesmoke",
      },
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      },
    }),
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          select label="Project Group" value={filters.project_group} size="small"
          onChange={(e) => {
            const value = e.target.value;
            setFilters({ project_group: value, project_name: '', user_name: '' });
            setSelectedTeam(value || "All");
            setSelectedProject("All");
            setSelectedDeveloper("All");
            setCurrentPageIndex(0); // Add this line
          }}
          sx={{ minWidth: 200 }}>
          <MenuItem value="">All Groups</MenuItem>
          {projectGroups.map((group) => (
            <MenuItem key={group} value={group}>{group}</MenuItem>
          ))}
        </TextField>
        <TextField
          select label="Project Name" value={filters.project_name} size="small"
          onChange={(e) => {
            const value = e.target.value;
            setFilters(prev => ({ ...prev, project_name: value, user_name: '' }));
            setSelectedProject(value || "All");
            setSelectedDeveloper("All");
            setCurrentPageIndex(0); // Add this line
          }}
          disabled={!filters.project_group}
          sx={{ minWidth: 240 }}>
          <MenuItem value="">All Projects</MenuItem>
          {projectNames.map((name) => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </TextField>
        <TextField
          select label="User Name" value={filters.user_name} size="small"
          onChange={(e) => {
            const value = e.target.value;
            setFilters(prev => ({ ...prev, user_name: value }));
            setSelectedDeveloper(value || "All");
            setCurrentPageIndex(0); // Add this line
          }}
          sx={{ minWidth: 200 }}>
          <MenuItem value="">All Users</MenuItem>
          {userNames?.map((name) => (
            <MenuItem key={name} value={name}>{name}</MenuItem>
          ))}
        </TextField>
        <IconButton onClick={() => setShowPopupCalendar(true)} title="Open Weekly Calendar View" color="primary">
          <Calendar />
        </IconButton>
      </Box>
    ),
  });
  tableRef.current = table;


  return (
    <div className="" style={{ padding: "1rem" }}>

      <div>
        <Dashboardteam />
      </div>
      <br></br>


      <Typography variant="h4" gutterBottom>Project Team Allocations</Typography>
      <MaterialReactTable table={table} />


      {showPopupCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-6xl w-[90vw] max-h-[90vh] overflow-auto">
            <style>{`.sx-event { white-space: normal !important; font-size: 12px; }`}</style>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Weekly Calendar View</h3>
              <button className="text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setShowPopupCalendar(false)}>×</button>
            </div>
            <div className="mb-3 text-sm text-gray-600">
              Showing data for: <strong>Team:</strong> {selectedTeam},{" "}<br></br>
              <strong>Project:</strong> {selectedProject}, <strong>Developer:</strong> {selectedDeveloper}
            </div>
            {loadingCalendar ? (
              <Box display="flex" justifyContent="center" mt={5}>
                <CircularProgress />
              </Box>
            ) : (
              <div style={{ height: "600px" }}>
                <ScheduleXCalendar calendarApp={calendarApp} />
              </div>
            )}
          </div>
        </div>
      )}

      {selectedEventDetails && (
        <Dialog
          open={true}
          onClose={() => setSelectedEventDetails(null)}
          aria-labelledby="event-detail-dialog-title"
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: 10,
              p: 2,
            },
          }}
        >
          <DialogTitle
            id="event-detail-dialog-title"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              borderBottom: '1px solid #eee',
              pb: 1.5,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Activity size={24} color="#6366f1" /> Event Details
            </Box>
            <IconButton
              onClick={() => setSelectedEventDetails(null)}
              edge="end"
              size="small"
              aria-label="close"
              sx={{ color: 'grey.500' }}
            >
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>×</span>
            </IconButton>
          </DialogTitle>

          <DialogContent dividers sx={{ px: 3, py: 2 }}>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <User size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">User</Typography>
                  <Typography fontWeight="500">{selectedEventDetails.extendedProps.userName}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Users size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Team</Typography>
                  <Typography fontWeight="500">{selectedEventDetails.extendedProps.teamName}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Briefcase size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Project</Typography>
                  <Typography fontWeight="500">{selectedEventDetails.extendedProps.projectName}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Calendar size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography fontWeight="500">{selectedEventDetails.extendedProps.date}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Clock size={20} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Allocated Hours</Typography>
                  <Typography fontWeight="500">
                    {selectedEventDetails.extendedProps.allocatedHours ?? 0}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2}>
                <Activity size={20} />
                <Box >
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedEventDetails.extendedProps.status}
                    size="small"
                    color={
                      selectedEventDetails.extendedProps.status === 'Working'
                        ? 'success'
                        : selectedEventDetails.extendedProps.status === 'Available'
                          ? 'info'
                          : selectedEventDetails.extendedProps.status === 'On Leave'
                            ? 'error'
                            : 'default'
                    }
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}

export default ProjectTable;