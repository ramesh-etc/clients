import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import {
    MaterialReactTable,
    useMaterialReactTable,
} from "material-react-table";
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Chip,
    MenuItem,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import { Edit, Save, X, Calendar, Clock, Timer, MessageSquare,Globe, Goal} from "lucide-react";
import { useSelector } from "react-redux";
import { Autocomplete } from "@mui/material";
import axios from "axios";
import { Link } from "react-router-dom";
// import dates from "../utils/dates"
import clock from "../assets/Images/Icons.png"


const LOCAL_STORAGE_KEY = "mrtuserprojectstatus";

function Userprojectstatus() {
    const getInitialTableState = () => {
        try {
            const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedState) {
                return JSON.parse(savedState);
            }
        } catch (error) {
            console.error("Error parsing saved table state from localStorage:", error);
        }
        return {
            columnPinning: {
                left: [],
                right: ['actions'],
            },
            pagination: { pageIndex: 0, pageSize: 50 },
        };
    };

    const [tasksData, setTasksData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editValues, setEditValues] = useState({});
    const tableRef = useRef(null);
    const [commentDialogOpen, setCommentDialogOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [commentFormData, setCommentFormData] = useState({
        comment: '',
        requiredTime: ''
    });
    const [filters, setFilters] = useState({
        assignee: "",
        status: "",
        custom: "this_week",
        startDate: "",
        endDate: "",
        search: ""
    });
    const [usersData, setUsersData] = useState([]);
    const [tableState, setTableState] = useState(getInitialTableState);
    const [sorting, setSorting] = useState([]);
    const role_name = useSelector((state) => state.user.first_name);

const statusOptions = [
    { value: 'Done', label: 'Done', color: 'success' },
    { value: 'To do', label: 'To Do', color: 'default' },
    { value: 'In progress', label: 'In Progress', color: 'error' },
    { value: 'overdue', label: 'Overdue', color: 'error' },
    { value: 'Waiting for Inputs', label: 'Waiting For Input', color: 'primary' },
];
const priorityOptions = [
    { value: 'Easy', label: 'Easy', color: '#15803D' },
    { value: 'Medium', label: 'Medium', color: '#FF5C02' },
    { value: 'High', label: 'High', color: '#DC2626' },
];

 const hoursToTimeString = (hours) => {
    if (hours === null || hours === undefined) return "0h 0m";
    const numericHours = parseFloat(hours);
    if (isNaN(numericHours)) return "0h 0m";
    const totalMinutes = Math.round(numericHours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}h ${m}m`;
};

    const timeStringToHours = (timeStr) => {
        if (!timeStr) return "0";
        const [h, m] = timeStr.split(':').map(Number);
        return (h + m / 60).toFixed(2);
    };

    const getDateRange = (dateRange) => {
        const today = new Date();
        let startDate = "";
        let endDate = "";

        switch (dateRange) {
            case 'this_week':
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);

                startDate = startOfWeek.toISOString().split('T')[0];
                endDate = endOfWeek.toISOString().split('T')[0];
                break;
            case 'last_week':
                const lastWeekEnd = new Date(today);
                lastWeekEnd.setDate(today.getDate() - today.getDay());

                const lastWeekStart = new Date(lastWeekEnd);
                lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

                startDate = lastWeekStart.toISOString().split('T')[0];
                endDate = lastWeekEnd.toISOString().split('T')[0];
                break;
            case 'this_month':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                break;
            case 'last_month':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
                break;
            case 'next_month':
                startDate = new Date(today.getFullYear(), today.getMonth() + 1, 1).toISOString().split('T')[0];
                endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0).toISOString().split('T')[0];
                break;
            case 'current_week':
                const currentWeekStart = new Date(today);
                currentWeekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

                const currentWeekEnd = new Date(currentWeekStart);
                currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
                startDate = currentWeekStart.toISOString().split('T')[0];
                endDate = currentWeekEnd.toISOString().split('T')[0];
                break;
            case 'next_week':
                const nextWeekStart = new Date(today);
                nextWeekStart.setDate(today.getDate() - today.getDay() + 8);

                const nextWeekEnd = new Date(nextWeekStart);
                nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
                startDate = nextWeekStart.toISOString().split('T')[0];
                endDate = nextWeekEnd.toISOString().split('T')[0];
                break;
            case 'custom':
                startDate = filters.startDate || "";
                endDate = filters.endDate || "";
                break;
            default:
                startDate = "";
                endDate = "";
        }

        return { startDate, endDate };
    };

    const fetchTasksData = useCallback(async () => {
        setLoading(true);
        try {
            const { startDate, endDate } = getDateRange(filters.custom);

        //            const { startDate, endDate } = getDateRange(filters.custom, {
        //     startDate: filters.startDate,
        //     endDate: filters.endDate
        // });

            const requestBody = {
                limit: tableState.pagination?.pageSize || 50,
                offset: (tableState.pagination?.pageIndex || 0) * (tableState.pagination?.pageSize || 50),
                start_date: startDate,
                end_date: endDate,
                search: filters.search || "",
                sortKey: sorting.length > 0 ? sorting[0].id : "",
                sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "",
                status_name: filters.status || "",
                assigned_user_name: filters.assignee || "",
                dateRange: filters.custom || "",
                 fetchAll:false
            };

            const response = await axios.post("/server/user-projects-status/user_status", requestBody);
            console.log("Full API Response:", response.data);
            
            let rawData = [];
            let total = 0;
            
            if (response.data && response.data.users) {
                setUsersData(response.data.users);
            }
            
            if (response.data && Array.isArray(response.data.data)) {
                rawData = response.data.data;
                total = response.data.total || rawData.length;
            } else {
                console.error("Unexpected response structure: 'data' array not found or not an array.");
                setTasksData([]);
                setTotalRecords(0);
                setLoading(false);
                return;
            }

            console.log("Raw data array to process:", rawData);
            if (rawData.length > 0) {
                console.log("First item structure in rawData:", rawData[0]);
            }
            
            const processedData = rawData.map((item, index) => {
                if (item.SprintsItems && typeof item.SprintsItems === 'object') {
                    return {
                        id: item.SprintsItems.ROWID || item.SprintsItems.external_item_id || `temp-${index}`,
                        ...item.SprintsItems
                    };
                }
                return {
                    id: item.ROWID || item.external_item_id || `temp-${index}`,
                    ...item
                };
            });

            console.log("Final processed data for table:", processedData);
            setTasksData(processedData);
            setTotalRecords(total);
        } catch (error) {
            console.error("Error fetching tasks data:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
            setTasksData([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    }, [tableState.pagination, filters, sorting]);

  

const effectRan = useRef(false);

useEffect(() => {
//   if (!effectRan.current) {
//     effectRan.current = true; // avoid React Strict Mode double-call in dev
//     return;
//   }

  fetchTasksData();
}, [tableState.pagination, filters, sorting, fetchTasksData]);



    const handleEdit = (rowId, rowData) => {
        setEditingRowId(rowId);
        setEditValues({
            required_time: rowData.required_time || '',
            reason: rowData.reason || '',
        });
    };

    const handleSaveEdit = async (rowId, originalData) => {
        try {
            const updatedRow = {
                task_id: originalData.external_item_id,
                required_time: editValues.required_time || originalData.required_time || "",
                reason: editValues.reason || originalData.reason || ""
            };
            console.log("Payload to send:", updatedRow);
            const response = await axios.put("/server/user-projects-status/userstatus", updatedRow);
            console.log("Response from backend (update):", response.data);
            await fetchTasksData();
            setEditingRowId(null);
            setEditValues({});
        } catch (error) {
            console.error("Error saving task:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        }
    };

    const handleCancelEdit = () => {
        setEditingRowId(null);
        setEditValues({});
    };

    const handleOpenCommentDialog = (rowData) => {
        setSelectedRow(rowData);
        setCommentFormData({
            comment: rowData.reason || '',
            requiredTime: rowData.required_time || ''
        });
        setCommentDialogOpen(true);
    };

    const handleCloseCommentDialog = () => {
        setCommentDialogOpen(false);
        setSelectedRow(null);
        setCommentFormData({
            comment: '',
            requiredTime: ''
        });
    };

    const handleSaveComment = async () => {
        if (!selectedRow) return;
        
        try {
            const updatedRow = {
                task_id: selectedRow.external_item_id,
                required_time: commentFormData.requiredTime || selectedRow.required_time || "",
                reason: commentFormData.comment || selectedRow.reason || ""
            };
            console.log("Payload to send:", updatedRow);
            const response = await axios.put("/server/user-projects-status/userstatus", updatedRow);
            console.log("Response from backend (update):", response.data);
            await fetchTasksData();
            handleCloseCommentDialog();
        } catch (error) {
            console.error("Error saving comment:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
            } else if (error.request) {
                console.error("Error request:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
        }
    };

    const handleStatusFilter = (status) => {
        setFilters(prev => ({
            ...prev,
            status: prev.status === status ? "" : status
        }));
        setTableState(prev => ({
            ...prev,
            pagination: { ...prev.pagination, pageIndex: 0 }
        }));
    };

    const handleUserFilter = (user) => {
        setFilters(prev => ({
            ...prev,
            assignee: user
        }));
        setTableState(prev => ({
            ...prev,
            pagination: { ...prev.pagination, pageIndex: 0 }
        }));
    };

    const columns = useMemo(() => [
            {
            accessorKey: "external_item_display_id",
            header: "Task ID",
            size: 200,
            enableEditing: false,
        },
      
        {
            accessorKey: "project_name",
            header: "Project Name",
            size: 250,
            enableEditing: false,
        },
     {
    accessorKey: "assigned_user_name",
    header: "Assignee",
    size: 150,
    enableEditing: false,
    Cell: ({ row }) => {
        const userName = row.original.assigned_user_name;
        if (!userName) return '-';
        const getInitials = (name) => {
            return name
                .split(' ')
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);
        };
        const getAvatarColor = (name) => {
            const colors = [
                '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2', 
                '#f57c00', '#0097a7', '#c2185b', '#5d4037'
            ];
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }
            return colors[Math.abs(hash) % colors.length];
        };
        
        return (
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                py: 0.5 
            }}>
                <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: getAvatarColor(userName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    flexShrink: 0
                }}>
                    {getInitials(userName)}
                </Box>
                <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {userName}
                </Typography>
            </Box>
        );
    }
},
{
    accessorKey: "status_name",
    header: "Status",
    size: 150,
    enableEditing: false,
    Cell: ({ row }) => {
        const status = row.original.status_name || row.original.status;
        const statusOption = statusOptions.find(opt =>
            opt.value === status || opt.label.toLowerCase() === status?.toLowerCase()
        );
        return (
            <Chip
                label={statusOption?.label || status || 'N/A'}
                color={statusOption?.color || 'default'}
                size="small"
                variant="outlined"
                sx={{ 
                    width: 'fit-content',
                    fontSize: '0.75rem',
                    height: '24px',
                    borderRadius: '12px'
                }}
            />
        );
    }
},
   {
  accessorKey: "end_date",
  header: "End Date",
  size: 200,
  enableEditing: false,
  Cell: ({ row }) => {
    const endDate = row.original.end_date;
    if (!endDate) return "-";

    const dateOnly = endDate.split(" ")[0];

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          color: "#454A53",
        }}
      >
        <Calendar size={16} />
        <span>{dateOnly}</span>
      </Box>
    );
  },
},
        {
            accessorKey: "total_estimated_hours",
            header: "Estimated hrs",
            size: 200,
            enableEditing: false,
                  Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color:"#454A53"
                }}
              >
                <img
                  alt="clock"
                  width={16}
                  height={16}
                  src={clock}
                  loading="lazy"
                  style={{ borderRadius: '50%' }}
                />
                <span>{renderedCellValue}</span>
              </Box>
            ),
        },
        {
            accessorKey: "total_consumed_hours",
            header: "Logged hrs",
            size: 200,
            enableEditing: false,
                         Cell: ({ renderedCellValue, row }) => (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color:"#454A53"
                }}
              >
                <img
                  alt="clock"
                  width={16}
                  height={16}
                  src={clock}
                  loading="lazy"
                  style={{ borderRadius: '50%' }}
                />
                <span>{renderedCellValue}</span>
              </Box>
            ),
        },
   {
    accessorKey: "item_priority",
    header: "Priority",
    size: 150,
    enableEditing: false,
    Cell: ({ row }) => {
        const priority = row.original.item_priority;
        const priorityOption = priorityOptions.find(opt =>
            opt.value === priority || opt.label.toLowerCase() === priority?.toLowerCase()
        );
        return (
      <Chip
  label={priorityOption?.label || priority || 'N/A'}
  size="small"
  variant="outlined"
  icon={<span style={{ fontSize: '12px', color: priorityOption?.color }}>●</span>}
  sx={{
    width: 'fit-content',
    fontSize: '0.75rem',
    height: '24px',
    borderRadius: '12px',
    color: priorityOption?.color || 'inherit',
    borderColor: priorityOption?.color || 'rgba(0,0,0,0.23)',
  }}
/>

        );
    }
},
{
    accessorKey: "reason",
    header: "Comments",
    size: 250,
    enableEditing: false,
    Cell: ({ row }) => {
        const comment = row.original.reason;
        if (!comment) {
            return (
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontStyle: 'inter',fontSize:"14px" }}>
                    Add Comments
                </Typography>
            );
        }
        return <span>{comment}</span>;
    }
},
{
    accessorKey: "required_time",
    header: "Required Time (hrs)",
    size: 200,
    enableEditing: false,
    Cell: ({ row }) => {
        const displayValue = row.original.required_time;
        if (!displayValue) {
            return (
                <Chip
                    label="0h 0m"
                    size="small"
                    variant="outlined"
                    sx={{ 
                        width: 'fit-content',
                        fontSize: '0.75rem',
                        height: '24px',
                        borderRadius: '12px',
                        color: '#9CA3AF',
                        fontStyle: 'inter',
                        borderColor: '#E5E7EB'
                    }}
                />
            );
        }
        // Convert decimal hours to "Xh Ym" format
        const hours = Math.floor(displayValue);
        const minutes = Math.round((displayValue - hours) * 60);
        const formattedTime = `${hours}h ${minutes}m`;
        
        return (
            <Chip
                label={formattedTime}
                size="small"
                variant="outlined"
                sx={{ 
                    width: 'fit-content',
                    fontSize: '14px',
                    font:"inter",
                    height: '24px',
                    borderRadius: '12px'
                }}
            />
        );
    }
},

        {
            id: "actions",
            header: "Actions",
            size: 200,
            enableColumnFilter: false,
            enableSorting: false,
            enablePinning: true,
            Cell: ({ row }) => {
                return (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Button
                            size="small"
                            variant="text"
                            onClick={() => handleOpenCommentDialog(row.original)}
                            sx={{ 
                                textTransform: 'none',
                                fontSize: '14px',
                                fontStyle: 'inter',
                                fontFamily:"inter",
                                padding: '2px 4px',
                                color:"#344EA0"
                            }}
                        >
                            Add Comments
                        </Button>
                    </Box>
                );
            }
        }
    ], [editingRowId, editValues, statusOptions, hoursToTimeString, timeStringToHours]);
    const setTableStatePagination = useCallback(
        (updater) => {
            setTableState(prev => {
                const newPagination = typeof updater === 'function' ? updater(prev.pagination) : updater;
                if (JSON.stringify(newPagination) === JSON.stringify(prev.pagination)) {
                    console.log("Pagination state has not changed. Skipping update."); 
                    return prev;
                }
                console.log("Pagination state changed. Updating to:", newPagination);
                return { ...prev, pagination: newPagination };
            });
        },
        [] 
    );
    const table = useMaterialReactTable({
        columns,
        data: tasksData,
        rowCount: totalRecords,
        state: {
            columnPinning: tableState.columnPinning,
            pagination: tableState.pagination,
            isLoading: loading,
            sorting: sorting,
            globalFilter: filters.search,
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
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        manualGlobalFilter: true,
        autoResetPageIndex: false,
        enableEditing: false,
    onPaginationChange: setTableStatePagination,
    

        onSortingChange: setSorting,
        onGlobalFilterChange: (filter) => {
            setFilters(prev => ({ ...prev, search: filter || "" }));
            setTableState(prev => ({
                ...prev,
                pagination: { ...prev.pagination, pageIndex: 0 }
            }));
        },
        renderBottomToolbarCustomActions: () => (
            <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="textSecondary" sx={{ fontFamily: '"Inter", sans-serif' }}>
                    Total Records: {totalRecords}
                </Typography>
            </Box>
        ),
        onColumnPinningChange: (updater) => {
            setTableState((prev) => {
                const newPinningState = updater instanceof Function ? updater(prev.columnPinning) : updater;
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
        maxWidth: "70vw",
        fontFamily: 'Inter',
    },
},
 muiTableHeadCellProps: {
    sx: {
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
        border: "1px solid whitesmoke",
        maxWidth: "80vw",
        fontFamily: 'Inter',
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
        renderTopToolbarCustomActions: ({ table }) => (
            <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Autocomplete
                    size="small"
                    options={usersData.map(user => user.first_name) || []}
                    value={filters.assignee || null}
                    onChange={(event, newValue) => {
                        handleUserFilter(newValue || "");
                    }}
                    clearOnEscape
                    sx={{ minWidth: 200 }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="User Name"
                            placeholder="Search user"
                            size="small"
                        />
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                />
   <Autocomplete
        size="small"
        options={statusOptions}
        value={statusOptions.find((opt) => opt.value === filters.status) || null}
        onChange={(event, newValue) => {
          handleStatusFilter(newValue ? newValue.value : "");
        }}
        clearOnEscape
        sx={{ minWidth: 200 }}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        renderOption={(props, option, { selected }) => (
          <li {...props} style={{ padding: "4px 8px" }}>
            <Chip
              label={option.label}
              color={option.color}
              variant={selected ? "filled" : "outlined"}
              size="small"
              sx={{
                width: "auto",
                fontSize: "0.8rem",
              }}
            />
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Status"
            placeholder="Select status"
            size="small"
          />
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              key={option.value}
              label={option.label}
              color={option.color}
              variant="filled"
              size="small"
              {...getTagProps({ index })}
            />
          ))
        }
      />


                {/* <Box sx={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Status:</Typography>
                    {statusOptions.map((option) => (
                        <Chip
                            key={option.value}
                            label={option.label}
                            color={filters.status === option.value ? option.color : 'default'}
                            variant={filters.status === option.value ? 'filled' : 'outlined'}
                            onClick={() => handleStatusFilter(option.value)}
                            sx={{ cursor: 'pointer' }}
                        />
                    ))}
                </Box> */}

                <TextField
                    select
                    label="Date Range"
                    value={filters.custom}
                    size="small"
                    onChange={(e) => {
                        setFilters(prev => ({ ...prev, custom: e.target.value }));
                        setTableState(prev => ({
                            ...prev,
                            pagination: { ...prev.pagination, pageIndex: 0 }
                        }));
                    }}
                    sx={{ minWidth: 200, fontFamily:"inter" }}
                >
                    <MenuItem value="">All</MenuItem>
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
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, startDate: e.target.value }));
                                setTableState(prev => ({
                                    ...prev,
                                    pagination: { ...prev.pagination, pageIndex: 0 }
                                }));
                            }}
                        />

                        <TextField
                            type="date"
                            label="End Date"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            value={filters.endDate || ''}
                            onChange={(e) => {
                                setFilters(prev => ({ ...prev, endDate: e.target.value }));
                                setTableState(prev => ({
                                    ...prev,
                                    pagination: { ...prev.pagination, pageIndex: 0 }
                                }));
                            }}
                        />
                    </>
                )}
            </Box>
        ),
    });

    return (
      
         <div className="font-[inter]" style={{ fontFamily: 'Inter, sans-serif' }}>
             <div>
            <nav className="mb-4 text-sm">
              <Link to="" className="text-gray-500">Home</Link> / <span className="text-[#6B7280]">Dashboard</span>
            </nav>
          </div>
        <h3 className="text-[#374151] font-[inter] text-[20px] Weight-[500] mb-4">User projects Status</h3>
        <MaterialReactTable table={table} ref={tableRef} />
        
        {/* Comment Dialog */}
       <Dialog 
    open={commentDialogOpen} 
    onClose={handleCloseCommentDialog}
    maxWidth="sm"
    fullWidth
>
    <DialogTitle>Add Comments</DialogTitle>
    <DialogContent>
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <TextField
            label="Hours"
            type="number"
            fullWidth
            value={Math.floor(commentFormData.requiredTime || 0)}
            onChange={(e) => {
                const hours = parseInt(e.target.value) || 0;
                const currentMinutes = Math.round(((commentFormData.requiredTime || 0) % 1) * 60);
                const totalHours = hours + (currentMinutes / 60);
                setCommentFormData(prev => ({ 
                    ...prev, 
                    requiredTime: totalHours.toFixed(2)
                }));
            }}
            placeholder="0"
            inputProps={{ min: 0 }}
            InputProps={{
                endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>h</Typography>
            }}
        />
        <TextField
            label="Minutes"
            type="number"
            fullWidth
            value={Math.round(((commentFormData.requiredTime || 0) % 1) * 60)}
            onChange={(e) => {
                const minutes = parseInt(e.target.value) || 0;
                const hours = Math.floor(commentFormData.requiredTime || 0);
                const totalHours = hours + (minutes / 60);
                setCommentFormData(prev => ({ 
                    ...prev, 
                    requiredTime: totalHours.toFixed(2)
                }));
            }}
            placeholder="0"
            inputProps={{ min: 0, max: 59 }}
            InputProps={{
                endAdornment: <Typography variant="body2" sx={{ ml: 1 }}>m</Typography>
            }}
        />
    </Box>
    <TextField
        label="Comments"
        multiline
        rows={4}
        fullWidth
        value={commentFormData.comment}
        onChange={(e) => setCommentFormData(prev => ({ 
            ...prev, 
            comment: e.target.value 
        }))}
        placeholder="Enter your comments"
    />
</Box>
    </DialogContent>
    <DialogActions>
        <Button onClick={handleCloseCommentDialog} color="inherit">
            Cancel
        </Button>
        <Button 
            onClick={handleSaveComment} 
            variant="contained" 
           sx={{
    backgroundColor: '#344EA0',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#2c3e91',
    },
  }}
        >
            Save
        </Button>
    </DialogActions>
</Dialog>

        </div>
    )}
        export default Userprojectstatus;