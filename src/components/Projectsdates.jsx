import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import {
    Box,
    Typography,
    Chip,
    TextField,
    MenuItem,
    Avatar,
    Button,
} from "@mui/material";
import { ChevronDown, ChevronUp,Calendar  } from "lucide-react";
import axios from 'axios';
import Userprojectstatus from './Userprojectstatus';
import { Link } from "react-router-dom";
import clock from "../assets/Images/Icons.png"



const Projectsdates = () => {
    const [sprintData, setSprintData] = useState([]);
    const [allProjects, setAllProjects] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        projectGroup: '',
        projectName: '',
        assignedUser: '',
        custom: 'this_week',
        startDate: '',
        endDate: '',
    });
    const [globalFilter, setGlobalFilter] = useState('');
    const [allEmployees, setAllEmployees] = useState([]);
    const [expandedProjectIds, setExpandedProjectIds] = useState(new Set());
 const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
});
    const tableRef = useRef(null);

    const getInitials = (name) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return parts[0].charAt(0).toUpperCase() + (parts.length > 1 ? parts[1].charAt(0).toUpperCase() : '');
    };

 const getConsistentColor = (name) => {
    const colors = [
        '#1abc9c', '#3498db', '#9b59b6', '#e67e22',
        '#e74c3c', '#2ecc71', '#f39c12', '#d35400',
        '#7f8c8d', '#8e44ad', '#16a085', '#27ae60',
        '#2980b9', '#8e44ad', '#2c3e50', '#f1c40f',
        '#e67e22', '#e74c3c', '#95a5a6', '#34495e'
    ];
    // Remove Date.now() to keep color consistent based only on name
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const index = Math.abs(hash) % colors.length;
    return colors[index];
};

    const handleToggleExpand = (projectId) => {
        const currentPage = tableRef.current?.getState().pagination.pageIndex || 0;
setPagination(prev => ({ ...prev, pageIndex: currentPage }));
        // setCurrentPageIndex(currentPage);
        
        setExpandedProjectIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const fetchSprintData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (filters.projectGroup) params.project_group = filters.projectGroup;
            if (filters.projectName) params.project_name = filters.projectName;
            if (filters.assignedUser) params.assigned_user = filters.assignedUser;
            if (filters.custom) params.custom = filters.custom;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await axios.get('/server/project-details/allocated-hrs', { params });
            const responseData = response.data?.data ?? response.data ?? [];
            const employees = response.data?.allEmployees ?? [];
            const allProjectsData = response.data?.allProjects ?? [];
            
            setAllProjects(Array.isArray(allProjectsData) ? allProjectsData : []);
            setSprintData(Array.isArray(responseData) ? responseData : []);
            setAllEmployees(Array.isArray(employees) ? employees : []);
        } catch (error) {
            console.error("Fetch Error:", error);
            setAllProjects([]);
            setSprintData([]);
            setAllEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSprintData();
    }, [filters]);

    const filteredData = useMemo(() => {
        let processedData = sprintData.filter(sprint => {
            const groupMatch = !filters.projectGroup || sprint.group === filters.projectGroup;
            const projectMatch = !filters.projectName || sprint.projectName === filters.projectName;
            return groupMatch && projectMatch;
        });

        const expandedData = [];
        processedData.forEach((project, index) => {
            const projectId = project.displayId || `project-${index}`;
            const isExpanded = expandedProjectIds.has(projectId);
            
            expandedData.push({
                ...project,
                rowType: 'project',
                id: projectId,
                isExpanded: isExpanded,
                originalIndex: index
            });

            if (isExpanded && Array.isArray(project.users)) {
                project.users.forEach((user, userIndex) => {
                    expandedData.push({
                        ...user,
                        rowType: 'user',
                        parentId: projectId,
                        projectName: project.projectName,
                        displayId: project.displayId,
                        id: `user-${projectId}-${userIndex}`,
                        parentIndex: index
                    });
                });
            }
        });

        return expandedData;
    }, [sprintData, filters, expandedProjectIds]);

    useEffect(() => {
    if (tableRef.current && pagination.pageIndex >= 0) {
        const timer = setTimeout(() => {
            try {
                const totalRows = filteredData.length;
                const maxPage = Math.max(0, Math.ceil(totalRows / pagination.pageSize) - 1);
                const targetPage = Math.min(pagination.pageIndex, maxPage);
                
                tableRef.current.setPageIndex(targetPage);
            } catch (error) {
                console.error("Error setting page index:", error);
            }
        }, 100);

        return () => clearTimeout(timer);
    }
}, [filteredData, pagination.pageIndex, pagination.pageSize]);

    const projectGroups = useMemo(() => {
        return [...new Set(allProjects.map(proj => proj.project_group).filter(Boolean))];
    }, [allProjects]); 

    const projectNames = useMemo(() => {
        if (!filters.projectGroup) {
            return [...new Set(allProjects.map(proj => proj.project_name).filter(Boolean))];
        }
        return [...new Set(allProjects
            .filter(proj => proj.project_group === filters.projectGroup)
            .map(proj => proj.project_name)
            .filter(Boolean))];
    }, [allProjects, filters.projectGroup]);

    const assignedUsers = useMemo(() => {
        if (!filters.projectGroup && !filters.projectName) {
            return allEmployees
                .map(emp => emp.display_name)
                .filter(Boolean)
                .sort();
        }
        
        if (filters.projectGroup && !filters.projectName) {
            return allEmployees
                .filter(emp => emp.department === filters.projectGroup)
                .map(emp => emp.display_name)
                .filter(Boolean)
                .sort();
        }
        
        if (filters.projectGroup && filters.projectName) {
            const usersInProject = new Set();
            sprintData.forEach(item => {
                const matchesProject = 
                    (item.project?.group === filters.projectGroup || item.group === filters.projectGroup) &&
                    (item.project?.name === filters.projectName || item.projectName === filters.projectName);
                
                if (matchesProject) {
                    if (Array.isArray(item.assignedUserName)) {
                        item.assignedUserName.forEach(name => usersInProject.add(name));
                    } else if (item.assignedUserName) {
                        usersInProject.add(item.assignedUserName);
                    }
                    if (Array.isArray(item.users)) {
                        item.users.forEach(user => {
                            if (user?.name) usersInProject.add(user.name);
                        });
                    }
                }
            });
            
            if (usersInProject.size === 0) {
                return allEmployees
                    .filter(emp => emp.department === filters.projectGroup)
                    .map(emp => emp.display_name)
                    .filter(Boolean)
                    .sort();
            }
            
            return Array.from(usersInProject).sort();
        }
        
        return [];
    }, [allEmployees, sprintData, filters.projectGroup, filters.projectName]);

    const columns = useMemo(() => [
        // {
        //     accessorKey: 'sno',
        //     header: 'S.No',
        //     size: 100,
        //     Cell: ({ row }) => {
        //         if (row.original.rowType === 'project') {
        //             return (
        //                 <Typography variant="body2" sx={{ fontWeight: "500" }}>
        //                     {row.original.originalIndex + 1}
        //                 </Typography>
        //             );
        //         }
        //         return '';
        //     },
        // },
        {
            accessorKey: 'displayId',
            header: 'Project ID',
            size: 200,
            Cell: ({ row }) => {
                if (row.original.rowType === 'project') {
                    const userCount = row.original.users?.length || 0;
                    const multipleUsers = userCount > 1;

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
                                        cursor: "pointer"
                                    }}
                                    onClick={() => handleToggleExpand(row.original.id)}
                                >
                                    {row.original.isExpanded ? (
                                        <ChevronUp size={16} color="white" />
                                    ) : (
                                        <ChevronDown size={16} color="white" />
                                    )}
                                </Box>
                            )}
                            <Typography variant="body2" sx={{ fontWeight: "500" }}>
                                {row.original.displayId}
                            </Typography>
                        </Box>
                    );
                }

                if (row.original.rowType === 'user') {
                    return (
                        <Box sx={{ display: "flex", alignItems: "center", position: "relative", pl: 2 }}>
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: 15,
                                    top: -35, 
                                    width: 2,
                                    height: 80, 
                                    backgroundColor: "#344EA0"
                                }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    left: 15,
                                    top: 15,
                                    width: 20,
                                    height: 2,
                                    backgroundColor: "#344EA0"
                                }}
                            />
                            <Box sx={{ ml: 6, px: 2, py: 1, borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "12px",fontFamily:"inter" }}>
                                    {row.original.displayId || "N/A"}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }
                return "";
            },
        },
        {
            accessorKey: 'projectName',
            header: 'Project Name',
            size: 500,
            Cell: ({ row }) => {
                if (row.original.rowType === 'project') {
                    return (
                        <Typography variant="body2" sx={{ fontWeight: "500",fontFamily:"inter" }}>
                            {row.original.projectName}
                        </Typography>
                    );
                }
                if (row.original.rowType === 'user') {
                    return (
                        <Box sx={{ ml: 5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily:"inter" }}>
                                {row.original.projectName || "N/A"}
                            </Typography>
                        </Box>
                    );
                }
                return "";
            },
        },
    {
    accessorKey: 'users',
    header: 'Users',
    size: 600,
    Cell: ({ row }) => {
        const { rowType, users, name, isExpanded } = row.original;
        
        if (rowType === 'project') {
            if (!users || users.length === 0) {
                return <Typography variant="body2" color="text.secondary">No Users</Typography>;
            }
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {users.slice(0, 3).map((user, index) => {
                        const initials = getInitials(user.name);
                        const color = getConsistentColor(user.name);

                        return (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
                                        fontSize: "11px", 
                                        fontWeight: "bold", 
                                        border: "2px solid white",
                                    }}>
                                    {initials}
                                </Box>
                                <Typography variant="body2" sx={{fontFamily:"inter"}}>{user.name}</Typography>
                            </Box>
                        );
                    })}
                    {users.length > 3 && (
                        <Typography variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                            +{users.length - 3} more
                        </Typography>
                    )}
                </Box>
            );
        } else if (rowType === 'user') {
            const initials = getInitials(name);
            const color = getConsistentColor(name);

            return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
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
                            fontSize: "11px", 
                            fontWeight: "bold",
                            fontFamily:"inter"
                        }}>
                        {initials}
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: "500",fontFamily:"inter" }}>{name}</Typography>
                </Box>
            );
        }
        return '';
    },
},
       {
    accessorKey: 'totalEstimatedTime',
    header: 'Total Estimated',
    size: 230,
    Cell: ({ row }) => {
        const { rowType, totalEstimatedTime, estimatedTime, isExpanded } = row.original;
        
        if (rowType === 'project') {
            return (
                <Typography variant="body2" className='flex gap-3' sx={{ fontWeight: "bold" }}>
                    <img
                        alt="clock"
                        width={16}
                        height={16}
                        src={clock}
                        loading="lazy"
                        color='#6B7280'
                        style={{ borderRadius: '50%' }}
                    />
                    {totalEstimatedTime}
                </Typography>
            );
        } else if (rowType === 'user') {
            return (
                <Box sx={{ pl: 2 }}>
                    <Chip
                        label={estimatedTime || '00:00'}
                        size="small"
                        sx={{ backgroundColor: "#e5e7eb", color: "#454A53", fontWeight: "500" }}
                    />
                </Box>
            );
        }
        return '';
    },
},
        
   {
    accessorKey: 'totalLoggedTime',
    header: 'Total Logged',
    size: 230,
    Cell: ({ row }) => {
        const { rowType, totalLoggedTime, loggedTime, isExpanded } = row.original;
        
        if (rowType === 'project') {
            return (
                <Typography variant="body2" className='flex gap-2' sx={{ fontWeight: "bold" }}>
                    <img
                        alt="clock"
                        width={16}
                        height={16}
                        src={clock}
                        loading="lazy"
                        style={{ borderRadius: '50%' }}
                    />
                    {totalLoggedTime}
                </Typography>
            );
        } else if (rowType === 'user') {
            return (
                <Box sx={{ pl: 2 }}>
                    <Chip
                        label={loggedTime || '00:00'}
                        size="small"
                        sx={{ backgroundColor: "#dbeafe", color: "#1e40af", fontWeight: "500" }}
                    />
                </Box>
            );
        }
        return '';
    },
},
    ], [expandedProjectIds, getInitials, getConsistentColor]);

    const table = useMaterialReactTable({
        columns,
        data: filteredData,
       state: {
    isLoading: loading,
    globalFilter,
    pagination,
},
        onGlobalFilterChange: setGlobalFilter,
        autoResetPageIndex: false, 
        enableGlobalFilter: true,
        enableColumnActions: true,
        enableColumnFilters: false,
        enableDensityToggle: true,
        enableHiding: true,
        enableStickyHeader: true,
        enableColumnResizing: true,
        enableFullScreenToggle: false,
        enableSorting: true,

        onPaginationChange: setPagination,
        
        initialState: {
            sorting: [{ id: 'sno', desc: false }],
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
                fontFamily: 'Inter, sans-serif'
            },
        },
      muiTableHeadCellProps: {
    sx: {
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
        border: "1px solid whitesmoke",
        fontFamily: 'Inter, sans-serif',
    },
},
      muiTableBodyCellProps: {
    sx: {
        border: "1px solid whitesmoke",
        fontFamily: 'Inter, sans-serif',
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
        
        renderBottomToolbarCustomActions: () => (
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2" color="textSecondary">
                    Total Projects: {filteredData.filter(item => item.rowType === 'project').length}
                </Typography>
            </Box>
        ),
        
        renderTopToolbarCustomActions: () => (
            <Box sx={{ display: 'flex', gap: 1.5, p: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField select label="Project Group" value={filters.projectGroup} size="small"
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, projectGroup: e.target.value, projectName: '', assignedUser: '' }));
                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                    }}
                    sx={{ minWidth: 250 }}>
                    <MenuItem value="">All Groups</MenuItem>
                    {projectGroups.map((group) => <MenuItem key={group} value={group}>{group}</MenuItem>)}
                </TextField>

                <TextField select label="Project Name" value={filters.projectName} size="small"
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, projectName: e.target.value, assignedUser: '' }));
              setPagination(prev => ({ ...prev, pageIndex: 0 })); 
                    }}
                    disabled={!filters.projectGroup} 
                        sx={{ minWidth: 250 }}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    maxHeight: 300,
                                    width: 250,
                                }
                            },
                        }
                    }}>
                    <MenuItem value="">All Projects</MenuItem>
                    {projectNames.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </TextField>

                <TextField select label="Assigned User" value={filters.assignedUser} size="small"
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, assignedUser: e.target.value }));
                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                    }}
                    sx={{ minWidth: 250 }}
                    SelectProps={{
                        MenuProps: {
                            PaperProps: {
                                sx: {
                                    maxHeight: 300,
                                    width: 250,
                                }
                            },
                        }
                    }}>
                    <MenuItem value="">All Users</MenuItem>
                    {assignedUsers.map((user) => <MenuItem key={user} value={user}>{user}</MenuItem>)}
                </TextField>

                <TextField select label="Date Range" value={filters.custom} size="small"
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, custom: e.target.value }));
                        setPagination(prev => ({ ...prev, pageIndex: 0 }));
                    }}
                    sx={{ minWidth: 250 }}>
                    <MenuItem value="this_week">This Week</MenuItem>
                    <MenuItem value="last_week">Last Week</MenuItem>
                    <MenuItem value="this_month">This Month</MenuItem>
                    <MenuItem value="current_week">Current Week</MenuItem>
                    <MenuItem value="next_week">Next Week</MenuItem>
                    <MenuItem value="last_month">Last Month</MenuItem>
                    <MenuItem value="next_month">Next Month</MenuItem>
                    <MenuItem value='custom'>Custom</MenuItem>
                </TextField>

                {filters.custom === 'custom' && (
                    <>
                        <TextField
                            type="date"
                            label="Start Date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={filters.startDate || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                        />

                        <TextField
                            type="date"
                            label="End Date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={filters.endDate || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                    </>
                )}
            </Box>
        ),
    });

    tableRef.current = table;

    return (
       <div className="font-[inter]" style={{ fontFamily: 'Inter, sans-serif' }}>
              <div>
            <nav className="mb-4 text-sm">
              <Link to="" className="text-gray-500">Home</Link> / <span className="text-[#6B7280]">Project Log</span>
            </nav>
          </div>
        <h3 className="text-[#374151] font-[inter] text-[20px] Weight-[500] mb-4">Projects Log Details</h3>
        <MaterialReactTable table={table} />
    </div>

    );
};

export default Projectsdates;