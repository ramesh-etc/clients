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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material";
import { Calendar, User, Briefcase, Clock, Activity, Users, Send, ChevronDown, ChevronUp } from "lucide-react";
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

const LOCAL_STORAGE_KEY = "mrtDashboardTableState";

function ProjectTabledashboard() {
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
    const [Monthfilter, setMonthfilter] = useState('this_week'); // Default filter for monthly data
    const [reportDateRange, setReportDateRange] = useState(null); // State to store date range from API response

    const [filters, setFilters] = useState({
        project_group: "",
        project_name: "",
        user_name: "",
    });
    const [allUsers, setAllUsers] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState("All");
    const [selectedProject, setSelectedProject] = useState("All");
    const [selectedDeveloper, setSelectedDeveloper] = useState("All");
    const [teamToalhr, setTeamtotalhr] = useState();
    const [spinning, setSpinning] = useState(false);
    const [tableState, setTableState] = useState(getInitialTableState);

    const role_name = useSelector((state) => state.user.first_name);

    const eventsServicePlugin = React.useMemo(() => {
        const plugin = createEventsServicePlugin();
        return plugin;
    }, []);
    const normalizeUserName = (name) => {
        if (!name) return "";
        return name.trim().toLowerCase().replace(/\s+/g, " ");
    };

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

    // Helper function to parse hours and minutes from "Xh Ym" string to decimal hours
    const parseHoursAndMinutes = (timeStr) => {
        if (!timeStr || typeof timeStr !== "string") return 0;
        const match = timeStr.match(/(\d+)h\s*(\d+)m/);
        if (!match) return 0;
        const hours = parseInt(match[1], 10);
        const minutes = parseInt(match[2], 10);
        return hours + minutes / 60;
    };
    const getUserInitials = (name) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return parts[0].charAt(0).toUpperCase() + (parts.length > 1 ? parts[1].charAt(0).toUpperCase() : '');
    };
    const getConsistentColor = (name) => {
        const colors = [
            '#1abc9c', '#3498db', '#9b59b6', '#e67e22',
            '#e74c3c', '#2ecc71', '#f39c12', '#d35400',
            '#7f8c8d', '#8e44ad'
        ];
        let hash = 0;
        if (name) {
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Effect to fetch data when component mounts or range filter changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const range = "one-week";

                const [projectsRes, calendarRes] = await Promise.all([
                    axios.get(`/server/project-details/daily-team-member-allocated-hrs/${range}`),
                    axios.get("/server/project-details/weekly-allocated-hours"),
                ]);

                setReportDateRange(projectsRes.data.date_range);

                const allocations = projectsRes.data.projectWiseAllocations || {};
                const usersFromApi = projectsRes.data.user || [];
                setAllUsers(usersFromApi);

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
    }, [Monthfilter]);

    const ProjectDataToCalendar = (projectsData, calendarFilters) => {
        const {
            selectedTeam: teamFilter,
            selectedDeveloper: devFilter,
            selectedProject: projectFilter,
        } = calendarFilters;

        console.log("Calendar Filter Applied (Project Data):");
        console.log("  Team:", teamFilter);
        console.log("  Project:", projectFilter);
        console.log("  Developer:", devFilter);

        const events = [];
        const normalizedDevFilter = normalizeUserName(devFilter);

        projectsData.forEach((project) => {
            if (teamFilter !== "All" && project.project_group !== teamFilter) return;
            if (projectFilter !== "All" && project.project_name !== projectFilter) return;
            if (filters.user_name && !project.users.some(u => u.user_name === filters.user_name)) return;

            project.users?.forEach((user) => {
                const normalizedUserName = normalizeUserName(user.user_name);
                if (devFilter !== "All" && normalizedDevFilter !== normalizedUserName) {
                    return;
                }
                console.log(`Including events for: ${user.user_name} in ${project.project_name}`);

                user.daily_allocations?.forEach((allocation) => {
                    const teamColors = {
                        "Full Stack": "#4ade80",
                        "Zoho One": "#60a5fa",
                        "QA": "#facc15",
                        "Design": "#f472b6",
                    };
                    const teamColor = teamColors[project.project_group] || "#a78bfa";
                    const title = `${user.user_name} • ${project.project_name} • ${project.project_group}`;
                    let color = teamColor;
                    let status = "Working";

                    if (allocation.is_weekend) {
                        color = "#cbd5e1";
                        status = "Weekend";
                    } else if (allocation.is_holiday) {
                        color = "#fbbf24";
                        status = "Holiday";
                    } else if (!allocation.allocated_hours || allocation.allocated_hours === "0h 0m") {
                        color = "#60a5fa";
                        status = "Available";
                    }

                    const eventId = `${project.external_project_id}-${user.user_id}-${allocation.date}`
                        .toLowerCase()
                        .replace(/[^\w-]+/g, "_");

                    events.push({
                        id: eventId,
                        title,
                        start: allocation.date,
                        end: allocation.date,
                        calendarId: project.project_group,
                        color,
                        extendedProps: {
                            userName: user.user_name,
                            teamName: project.project_group,
                            projectName: project.project_name,
                            date: new Date(allocation.date).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            }),
                            status,
                            allocatedHours: allocation.allocated_hours,
                            availableHours: allocation.available_hours,
                        },
                    });
                });

            });
        });

        console.log(`Total calendar events created: ${events.length}`);
        return events;
    };

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
        const normalizedDevFilter = normalizeUserName(devFilter);
        console.log(" Calendar Filter Applied:");
        console.log("  Team:", teamFilter);
        console.log("  Developer:", devFilter);
        console.log("  Project:", projectFilter);
        Object.entries(payload.employees).forEach(([teamName, developers]) => {
            if (teamFilter !== "All" && teamFilter !== teamName) {
                return;
            }
            Object.entries(developers).forEach(([devName, dates]) => {
                const normalizedDevName = normalizeUserName(devName);
                if (devFilter !== "All" && normalizedDevFilter !== normalizedDevName) {
                    return;
                }
                console.log(`Including events for: ${devName}`);

                Object.entries(dates).forEach(([date, details]) => {
                    const projectOnThisDay = Object.keys(details).find(
                        (k) => k !== "status" && k !== "available"
                    );
                    if (projectFilter !== "All" && projectOnThisDay !== projectFilter) {
                        return;
                    }

                    let title = `${devName}`;
                    let color = "#4ade80";
                    let status = "Working";
                    let allocatedHours = 0;

                    if (details.status === "Weekend") {
                        title += " - Weekend";
                        color = "#cbd5e1";
                        status = "Weekend";
                    } else if (details.status === "On Leave") {
                        title += " - On Leave";
                        color = "#f87171";
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

        console.log(`📊 Total calendar events created: ${events.length}`);
        return events;
    };

    useEffect(() => {
        if (!eventsServicePlugin) {
            console.log("Waiting for plugin...");
            return;
        }
        const timeout = setTimeout(() => {
            try {
                const filterObj = {
                    selectedTeam,
                    selectedDeveloper,
                    selectedProject,
                };

                console.log("🔄 Updating calendar with filters:", filterObj);
                const hasCalendarFilters = selectedTeam !== "All" || selectedDeveloper !== "All" || selectedProject !== "All";
                let events = [];
                if (hasCalendarFilters) {
                    console.log("📋 Using PROJECT DATA (filtered view with calendar filters only)");
                    if (projectsData && projectsData.length > 0) {
                        events = ProjectDataToCalendar(projectsData, filterObj);
                    }
                } else {
                    console.log("📅 Using WEEKLY DATA (all users view)");
                    if (rawCalendarApiData) {
                        events = transformCalendarData(rawCalendarApiData, filterObj);
                    }
                }
                if (eventsServicePlugin && typeof eventsServicePlugin.set === "function") {
                    eventsServicePlugin.set(events);
                    console.log("Calendar events updated successfully");
                } else {
                    console.warn("Events service plugin not ready yet");
                }
            } catch (error) {
                console.error("Error setting calendar events:", error);
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [
        projectsData,
        rawCalendarApiData,
        selectedTeam,
        selectedDeveloper,
        selectedProject,
        filters,
        eventsServicePlugin,
    ]);

    // table
    const tableData = useMemo(() => {
        let processedProjects = projectsData.filter((p) => {
            const groupMatch = !filters.project_group || p.project_group === filters.project_group;
            const nameMatch = !filters.project_name || p.project_name === filters.project_name;
            return groupMatch && nameMatch;
        });

        if (filters.user_name) {
            processedProjects = processedProjects
                .map((project) => {
                    const matchingUsers = project.users.filter(
                        (user) => user.user_name === filters.user_name
                    );
                    if (matchingUsers.length > 0) {
                        const singleUser = matchingUsers[0];
                        const todayHours = parseHoursAndMinutes(singleUser.today_allocated_hours || "0h 0m");
                        const tomorrowHours = parseHoursAndMinutes(singleUser.tomorrow_allocated_hours || "0h 0m");
                        return {
                            ...project,
                            users: matchingUsers,
                            summary_user_names: [singleUser.user_name],
                            summary_today_hours: `${Math.floor(todayHours)}h ${Math.round((todayHours % 1) * 60)}m`,
                            summary_tomorrow_hours: `${Math.floor(tomorrowHours)}h ${Math.round((tomorrowHours % 1) * 60)}m`
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
                        parent_project_display_id: project.project_display_id,
                        parent_project_name: project.project_name,
                        parent_project_owner_display_name: project.project_owner_display_name,
                    });
                });
            }
        });
        return rows;
    }, [projectsData, filters, expandedProjectIds]);

    // expanding
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
                    const pageSize = tableState.pagination?.pageSize || 10;
                    const maxPage = Math.max(0, Math.ceil(totalRows / pageSize) - 1);
                    const targetPage = Math.min(currentPageIndex, maxPage);

                    tableRef.current.setPageIndex(targetPage);
                } catch (error) {
                    console.error("Error setting page index:", error);
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [tableData, currentPageIndex, tableState.pagination?.pageSize]);

    const projectGroups = useMemo(() => [...new Set(projectsData.map(p => p.project_group))], [projectsData]);
    const projectNames = useMemo(() => [
        ...new Set(projectsData
            .filter(p => !filters.project_group || p.project_group === filters.project_group)
            .map(p => p.project_name))
    ], [projectsData, filters.project_group]);

    const userNames = useMemo(() => {
        if (!filters.project_group || filters.project_group === "") {
            return allUsers
                .map(u => `${u.first_name} ${u.last_name}`)
                .filter(Boolean)
                .sort();
        }

        const filteredUsers = allUsers
            .filter(u => u.department === filters.project_group)
            .map(u => `${u.first_name} ${u.last_name}`)
            .filter(Boolean);

        return [...new Set(filteredUsers)].sort();
    }, [allUsers, filters.project_group]);



    // --- Static Columns Definition ---
    const staticColumns = useMemo(() => [
        {
            accessorKey: "project_display_id",
            header: "Project Name",
            size: 300,
            grow: true,
            Cell: ({ row }) => {
                if (row.original.rowType === "project") {
                    const userCount = row.original.users?.length || 0;
                    const multipleUsers = userCount > 1;
                    const projectId = row.original.project_display_id;
                    const projectName = row.original.project_name;

                    const displayText = projectId
                        ? `${projectId} - ${projectName || ""}`
                        : `${projectName || ""}`;

                    return (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            {multipleUsers && (
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        backgroundColor: "#344EA0",
                                        borderRadius: "6px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        mr: 2,
                                        cursor: "pointer",
                                    }}
                                    onClick={() =>
                                        handleToggleExpand(row.original.external_project_id)
                                    }
                                >
                                    {row.original.isExpanded ? (
                                        <ChevronUp size={16} color="white" />
                                    ) : (
                                        <ChevronDown size={16} color="white" />
                                    )}
                                </Box>
                            )}
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "500",
                                    ml: multipleUsers ? 0 : 0,
                                    fontFamily: '"Inter", sans-serif',
                                }}
                            >
                                {displayText || ""}
                            </Typography>
                        </Box>
                    );
                }

                if (row.original.rowType === "user") {
                    const parentId = row.original.parent_project_display_id;
                    const parentName = row.original.parent_project_name;

                    // ✅ same rule applies for user row → show only project name if ID is missing
                    const displayText = parentId
                        ? `${parentId} - ${parentName || ""}`
                        : `${parentName || ""}`;

                    return (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                position: "relative",
                                pl: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: 15,
                                    top: -35,
                                    width: 2,
                                    height: 80,
                                    backgroundColor: "#344EA0",
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: 15,
                                    top: 15,
                                    width: 20,
                                    height: 2,
                                    backgroundColor: "#344EA0",
                                }}
                            />
                            <Box sx={{ ml: 6, px: 2, py: 1, borderRadius: 1 }}>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontSize: "12px", fontFamily: '"Inter", sans-serif' }}
                                >
                                    {displayText || ""}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }

                return "";
            },
        },

        // {
        //     accessorKey: "project_name",
        //     header: "Project Name",
        //     size: 300,
        //     grow: true,
        //     Cell: ({ row }) => {
        //         if (row.original.rowType === "project") {
        //             return (
        //                 <Typography variant="body2" sx={{ fontWeight: "500", fontFamily: '"Inter", sans-serif' }}>
        //                     {row.original.project_name}
        //                 </Typography>
        //             );
        //         }
        //         if (row.original.rowType === "user") {
        //             return (
        //                 <Box sx={{ ml: 5 }}>
        //                     <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
        //                         {row.original.parent_project_name || "N/A"}
        //                     </Typography>
        //                 </Box>
        //             );
        //         }
        //         return "";
        //     }
        // },
        {
            accessorKey: "project_manager",
            header: "Manager",
            size: 200,
            grow: true,
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
            // accessorKey: "cluster_manager",
            header: "Project Coordinator",
            size: 200,
            grow: true,
            // Cell: ({ row }) => {
            //     const isProject = row.original.rowType === "project";
            //     let manager = row.original.cluster_manager;
            //     if (isProject && typeof manager === "string") {
            //         manager = manager.replace(/^\[|\]$/g, "").trim();
            //         return manager || "-";
            //     }
            //     return "-";
            // }
        },
        {
            accessorKey: "cluster_manager",
            header: "Cluster Manager",
            size: 200,
            grow: true,
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
        { accessorKey: "business_team", header: "Business Team", size: 200, grow: true, Cell: ({ row }) => (row.original.rowType === "project" ? row.original.business_team : "-") },
        { accessorKey: "testing_team", header: "Testing Team", size: 200, grow: true, Cell: ({ row }) => (row.original.rowType === "project" ? row.original.testing_team : "-") },
        {
            accessorKey: "project_owner_display_name",
            header: "Owner",
            size: 200,
            grow: true,
            Cell: ({ row }) => {
                const isProject = row.original.rowType === "project";
                const ownerName = isProject
                    ? row.original.project_owner_display_name
                    : row.original.parent_project_owner_display_name;
                const initials = getUserInitials(ownerName);
                const color = getConsistentColor(ownerName);

                return (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            ml: isProject ? 0 : 5,
                        }}
                    >
                        <Box
                            sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                backgroundColor: color,
                                color: "#ffffff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: "bold",
                            }}>
                            {initials}
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif' }}>
                            {ownerName || "N/A"}
                        </Typography>
                    </Box>
                );
            }
        },
        // User column
        {
            accessorKey: "user_name",
            header: "User",
            size: 300,
            grow: true,
            Cell: ({ row }) => {
                const { rowType, isExpanded, summary_user_names, user_name } = row.original;

                // If it's a project row and not expanded, show summarized users
                if (rowType === "project" && !isExpanded) {
                    if (!summary_user_names || summary_user_names.length === 0) {
                        return <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                            No Users
                        </Typography>;
                    }
                    return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                            {summary_user_names.slice(0, 3).map((name, index) => {
                                const initials = getUserInitials(name);
                                const color = getConsistentColor(name);

                                return (
                                    <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        <Box
                                            sx={{
                                                width: 24, height: 24, borderRadius: "50%", backgroundColor: color, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold", border: "2px solid white",
                                            }}>
                                            {initials}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif' }}>
                                            {name}
                                        </Typography>
                                    </Box>
                                );
                            })}
                            {summary_user_names.length > 3 && (
                                <Typography variant="caption" sx={{ ml: 1, color: "text.secondary", fontFamily: '"Inter", sans-serif' }}>
                                    +{summary_user_names.length - 3} more
                                </Typography>
                            )}
                        </Box>
                    );
                }

                // If it's a user row, show individual user details
                if (rowType === "user") {
                    const initials = getUserInitials(user_name);
                    const color = getConsistentColor(user_name);

                    return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: 2 }}>
                            <Box
                                sx={{
                                    width: 24, height: 24, borderRadius: "50%", backgroundColor: color, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "bold",
                                }}>
                                {initials}
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: "500", fontFamily: '"Inter", sans-serif' }}>
                                {user_name}
                            </Typography>
                        </Box>
                    );
                }
                return "";
            },
        },
        // Existing Project-level summary columns (Today/Tomorrow)
        // {
        //     accessorKey: "summary_today_hours",
        //     header: "Today Hours",
        //     size: 150,
        //     grow: true,
        //     Cell: ({ row }) => {
        //         if (row.original.rowType === "project" && !row.original.isExpanded) {
        //             return <Typography variant="body2" sx={{ fontWeight: "bold" }}>{row.original.summary_today_hours}</Typography>;
        //         }
        //         // For user rows, this column is effectively replaced by dynamic day columns
        //         return null; 
        //     },
        // },
        // {
        //     accessorKey: "summary_tomorrow_hours",
        //     header: "Tomorrow Hours",
        //     size: 150,
        //     grow: true,
        //     Cell: ({ row }) => {
        //         if (row.original.rowType === "project" && !row.original.isExpanded) {
        //             return <Typography variant="body2" sx={{ fontWeight: "bold" }}>{row.original.summary_tomorrow_hours}</Typography>;
        //         }
        //         // For user rows, this column is effectively replaced by dynamic day columns
        //         return null;
        //     },
        // },
    ], [
        projectsData,
        filters,
        expandedProjectIds,
        handleToggleExpand,
        getUserInitials,
        getConsistentColor,
        parseHoursAndMinutes // Make sure parseHoursAndMinutes is accessible here
    ]);

    // --- Dynamic Columns Definition (Moved to top-level useMemo) ---
    const dynamicDayColumns = useMemo(() => {
        if (!reportDateRange || !reportDateRange.days) return [];

        return reportDateRange.days.map(day => {
            return {
                header: day.display, // e.g., "Sat Oct 18"
                accessorKey: day.date, // e.g., "2025-10-18"
                size: 160,
                grow: false,
                Header: ({ column }) => (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" fontWeight="bold">{column.columnDef.header}</Typography>
                    </Box>
                ),
                Cell: ({ row }) => {
                    const { rowType, users, daily_allocations } = row.original;

                    // FOR PROJECT ROWS: Show aggregated total hours
                    if (rowType === "project") {
                        // Calculate total allocated hours for this day across all users
                        let totalAllocatedHours = 0;

                        if (users && users.length > 0) {
                            users.forEach(user => {
                                const dailyAllocation = user.daily_allocations?.find(
                                    allocation => allocation.date === day.date
                                );
                                if (dailyAllocation) {
                                    totalAllocatedHours += parseHoursAndMinutes(dailyAllocation.allocated_hours || "0h 0m");
                                }
                            });
                        }

                        // Format back to "Xh Ym" format
                        const hours = Math.floor(totalAllocatedHours);
                        const minutes = Math.round((totalAllocatedHours % 1) * 60);
                        const formattedTotal = `${hours}h ${minutes}m`;

                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Chip
                                    label={formattedTotal}
                                    size="small"
                                    sx={{
                                        mb: 0.5,
                                        backgroundColor: totalAllocatedHours > 0 ? "#b0b1b4ff" : "#e5e7eb",
                                        color: totalAllocatedHours > 0 ? "#ffffff" : "#4b5563",
                                        fontWeight: "600",
                                        fontFamily: "inter",
                                        cursor: 'default'
                                    }}
                                    title={`Total allocated: ${formattedTotal} (${users?.length || 0} users)`}
                                />
                            </Box>
                        );
                    }

                    // FOR USER ROWS: Show individual user hours (existing logic)
                    if (rowType === "user") {
                        const dailyAllocation = daily_allocations?.find(
                            allocation => allocation.date === day.date
                        );

                        if (dailyAllocation) {
                            return (
                                <Box sx={{ pl: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <Chip
                                        label={dailyAllocation.allocated_hours || "0h 0m"}
                                        size="small"
                                        title={`Available: ${dailyAllocation.available_hours || 'N/A'}`}
                                        sx={{
                                            mb: 0.5,
                                            backgroundColor: "#e5e7eb",
                                            color: "#626468ff",
                                            fontWeight: "500",
                                            cursor: 'help'
                                        }}
                                    />
                                </Box>
                            );
                        }
                    }

                    // Default fallback
                    return (
                        <Box sx={{ pl: rowType === "user" ? 2 : 0 }}>
                            <Chip
                                label="0h 0m"
                                size="small"
                                title="No allocation"
                                sx={{
                                    backgroundColor: "#e5e7eb",
                                    color: "#4b5563",
                                    fontWeight: "500",
                                    fontFamily: "inter",
                                    cursor: 'help'
                                }}
                            />
                        </Box>
                    );
                },
            };
        });
    }, [reportDateRange, parseHoursAndMinutes]); // Dependencies for dynamic columns

    // Combine static and dynamic columns
    const allColumns = useMemo(() => {
        return [...staticColumns, ...dynamicDayColumns];
    }, [staticColumns, dynamicDayColumns]);

    // Initialize Material React Table
    const table = useMaterialReactTable({
        columns: allColumns, // Use the combined columns
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
        enableColumnFilters: true, // Enable column filters
        enableGlobalFilter: true,
        enableDensityToggle: false,
        enableHiding: true,
        enableStickyHeader: true,
        enableColumnResizing: true,
        enableColumnPinning: true,
        enableFullScreenToggle: false,
        manualPagination: false, // Set to true if fetching data page by page from API
        autoResetPageIndex: false, // Keep current page on data update

        // Handle pagination state updates
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

        // Handle column pinning state updates
        onColumnPinningChange: (updater) => {
            setTableState((prev) => {
                const newPinningState =
                    updater instanceof Function ? updater(prev.columnPinning) : updater;
                const newState = { ...prev, columnPinning: newPinningState };
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.JSON.stringify(newState));
                return newState;
            });
        },

        // Custom actions in the bottom toolbar (e.g., total records)
        renderBottomToolbarCustomActions: () => (
            <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="textSecondary">
                    Total Records: {tableData.length}
                </Typography>
            </Box>
        ),

        // Table container and body styling
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
                fontFamily: "Inter"
            },
        },
        muiTableBodyCellProps: {
            sx: {
                border: "1px solid whitesmoke",
                fontFamily: "Inter"
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

        // Render top toolbar with filters and calendar button
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                    select
                    label="Project Group"
                    value={filters.project_group}
                    size="small"
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log("Filter changed - Project Group:", value);
                        setFilters({ project_group: value, project_name: '', user_name: '' });
                        setSelectedTeam(value || "All");
                        setSelectedProject("All");
                        setSelectedDeveloper("All");
                        setCurrentPageIndex(0);
                    }}
                    sx={{ minWidth: 240 }}>
                    <MenuItem value="">All Groups</MenuItem>
                    {projectGroups.map((group) => (
                        <MenuItem key={group} value={group}>{group}</MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="Project Name"
                    value={filters.project_name}
                    size="small"
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log("Filter changed - Project Name:", value);
                        setFilters(prev => ({ ...prev, project_name: value, user_name: '' }));
                        setSelectedProject(value || "All");
                        setSelectedDeveloper("All");
                        setCurrentPageIndex(0);
                    }}
                    disabled={!filters.project_group}
                    sx={{ minWidth: 240 }}>
                    <MenuItem value="">All Projects</MenuItem>
                    {projectNames.map((name) => (
                        <MenuItem key={name} value={name}>{name}</MenuItem>
                    ))}
                </TextField>

                <TextField
                    select
                    label="User Name"
                    value={filters.user_name}
                    size="small"
                    onChange={(e) => {
                        const value = e.target.value;
                        console.log("Filter changed - User Name:", value);
                        setFilters(prev => ({ ...prev, user_name: value }));
                        setSelectedDeveloper(value || "All");
                        setCurrentPageIndex(0);
                    }}
                    sx={{ minWidth: 240 }}
                >
                    <MenuItem value="">All Users</MenuItem>
                    {userNames?.map((name) => (
                        <MenuItem key={name} value={name}>{name}</MenuItem>
                    ))}
                </TextField>

                <IconButton
                    onClick={() => setShowPopupCalendar(true)}
                    title="Open Weekly Calendar View"
                    color="primary"
                >
                    <Calendar className="border w-9 h-9 p-2 bg-[#344EA0] text-white rounded-md" />
                </IconButton>
            </Box>
        ),

    });
    tableRef.current = table; // Assign table instance to ref

    return (
        <div className="font-[Text-X Small/Medium]">
            <h3 className="text-[#374151] text-[20px] Weight-[500]">Project Team Allocations</h3>

            <MaterialReactTable table={table} />

            {/* Calendar Popup */}
            {showPopupCalendar && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 max-w-6xl w-[90vw] max-h-[90vh] overflow-auto">
                        <style>{`
                            @import url('https://cdn.jsdelivr.net/npm/@schedule-x/theme-default@latest/dist/index.css');
                            
                            .sx__calendar-wrapper { 
                                font-size: 14px !important;
                                width: 100% !important;
                                height: 100% !important;
                            }
                            .sx__event { 
                                white-space: normal !important; 
                                font-size: 11px !important;
                                padding: 2px 4px !important;
                                line-height: 1.3 !important;
                                overflow: hidden !important;
                            }
                            .sx__event-title {
                                word-break: break-word !important;
                                white-space: normal !important;
                            }
                            .sx__week-grid__event {
                                white-space: normal !important;
                                word-wrap: break-word !important;
                            }
                            .sx__time-grid-day { 
                                border-right: 1px solid #e5e7eb !important; 
                            }
                            .sx__date-grid-day-header {
                                font-weight: 600 !important;
                                background-color: #f3f4f6 !important;
                            }
                        `}</style>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Weekly Calendar View</h3>
                            <button className="text-gray-500 hover:text-red-600 text-2xl font-bold" onClick={() => setShowPopupCalendar(false)}>×</button>
                        </div>
                        <div className="mb-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                            <div className="flex flex-wrap gap-3 items-center">
                                <span><strong>Team:</strong> {selectedTeam !== "All" ? selectedTeam : "All Teams"}</span>
                                <span>•</span>
                                <span><strong>Project:</strong> {selectedProject !== "All" ? selectedProject : "All Projects"}</span>
                                <span>•</span>
                                <span><strong>Developer:</strong> {selectedDeveloper !== "All" ? selectedDeveloper : "All Developers"}</span>
                            </div>
                        </div>

                        {loadingCalendar ? (
                            <Box display="flex" justifyContent="center" mt={5}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <div style={{ height: "600px", width: "100%" }}>
                                <ScheduleXCalendar calendarApp={calendarApp} />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Event Details Dialog */}
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
                                    <Typography fontWeight="500" >{selectedEventDetails.extendedProps.userName}</Typography>
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

export default ProjectTabledashboard; 