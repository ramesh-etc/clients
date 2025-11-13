import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography } from "@mui/material";

const LOCAL_STORAGE_KEY = "mrtMilestonesTableState";

function Taskdetails({ milestoneNumber, sprintData, proj_no, projectId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [summary, setSummary] = useState({});
  const [projectItemsData, setProjectItemsData] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  
  const stripHTML = (html) => html.replace(/<[^>]*>/g, '');

  const getInitialTableState = () => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) return JSON.parse(savedState);
    } catch (error) {
      console.error("Error parsing saved table state:", error);
    }
    return {
      columnPinning: {
        left: ["sno", "moduleScreen"],
        right: [],
      },
    };
  };

  const [tableState, setTableState] = useState(getInitialTableState);
  const [columnFilters, setColumnFilters] = useState(tableState.columnFilters || []);
  const [globalFilter, setGlobalFilter] = useState(tableState.globalFilter || "");
  const [sorting, setSorting] = useState(tableState.sorting || []);
  const [pagination, setPagination] = useState(tableState.pagination || { pageIndex: 0, pageSize: 10 });

  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const calculateTimeDifference = (estimated, consumed) => {
    const estimatedMin = toMinutes(estimated);
    const consumedMin = toMinutes(consumed);
    const diffMin = estimatedMin - consumedMin;
    const absDiff = Math.abs(diffMin);
    const h = Math.floor(absDiff / 60);
    const m = absDiff % 60;
    return estimatedMin > 0 ? 
      `${diffMin >= 0 ? "+" : "-"}${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}` : "-";
  };

  const datas = [
    {
      "project_id": "39761000000056310",
      "milestone_name": "June - Requirements",
      "scope_type": "",
      "task_url": "https://sprints.zoho.in/team/elitetechcorporation#sprintdetails/P53/SP3",
      "description": "",
      "start_date": "09-06-2025",
      "end_date": "26-06-2025",
      "duration": "16d 23h 59m",
      "estimated_hr": "02:30",
      "consumed_hr": "04:00",
      "difference_in_estimate": "",
      "demo_link": "",
      "task": [
        {
          "task_name": "test1",
          "sub_task": [
            {
              "scope_type": "",
              "task_name": "Sub-task 1",
              "task_url": "https://sprints.zoho.in/team/elitetechcorporation#sprintdetails/P53/SP3",
              "description": "",
              "start_date": "12-06-2025",
              "end_date": "13-06-2025",
              "duration": "",
              "estimated_hr": "",
              "consumed_hr": "",
              "difference_in_estimate": "",
              "demo_link": "",
              "sub_task": [
                {
                  "task_name": "sub_task 3",
                  "scope_type": "",
                  "task_url": "https://sprints.zoho.in/team/elitetechcorporation#sprintdetails/P53/SP3",
                  "description": "",
                  "start_date": "12-06-2025",
                  "end_date": "12-06-2025",
                  "duration": "",
                  "estimated_hr": "02:00",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": "",
                  "task": [
                    {
                      "task_name": "tasksssss",
                      "scope_type": "",
                      "task_url": "https://sprints.zoho.in/team/elitetechcorporation#sprintdetails/P53/SP3",
                      "description": "",
                      "start_date": "12-06-2025",
                      "end_date": "12-06-2025",
                      "duration": "",
                      "estimated_hr": "02:00",
                      "consumed_hr": "",
                      "difference_in_estimate": "",
                      "demo_link": ""
                    }
                  ]
                },
                {
                  "task_name": "Task Detail 2",
                  "scope_type": "",
                  "task_url": "",
                  "description": "",
                  "start_date": "12-06-2025",
                  "end_date": "12-06-2025",
                  "duration": "",
                  "estimated_hr": "04:00",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": ""
                }
              ]
            },
            {
              "scope_type": "",
              "task_name": "Sub-task 2",
              "task_url": "",
              "description": "",
              "start_date": "",
              "end_date": "13-06-2025",
              "duration": "",
              "estimated_hr": "08:30",
              "consumed_hr": "10:20",
              "difference_in_estimate": "",
              "demo_link": "",
              "task": [
                {
                  "task_name": "Task Detail 1",
                  "scope_type": "",
                  "task_url": "",
                  "description": "",
                  "start_date": "13-06-2025",
                  "end_date": "13-06-2025",
                  "duration": "",
                  "estimated_hr": "02:00",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": ""
                },
                {
                  "task_name": "Task Detail 2",
                  "scope_type": "",
                  "task_url": "",
                  "description": "",
                  "start_date": "13-06-2025",
                  "end_date": "13-06-2025",
                  "duration": "",
                  "estimated_hr": "02:00",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": ""
                }
              ]
            },
            {
              "scope_type": "",
              "task_name": "Sub-task 3",
              "task_url": "",
              "description": "",
              "start_date": "14-06-2025",
              "end_date": "14-06-2025",
              "duration": "",
              "estimated_hr": "08:00",
              "consumed_hr": "06:00",
              "difference_in_estimate": "",
              "demo_link": ""
            }
          ]
        },
        {
          "task_name": "test2",
          "sub_task": [
            {
              "scope_type": "",
              "task_name": "Sub-task 1",
              "task_url": "",
              "description": "",
              "start_date": "15-06-2025",
              "end_date": "17-06-2025",
              "duration": "",
              "estimated_hr": "",
              "consumed_hr": "",
              "difference_in_estimate": "",
              "demo_link": "",
              "task": [
                {
                  "task_name": "Task Detail 1",
                  "scope_type": "",
                  "task_url": "",
                  "description": "",
                  "start_date": "15-06-2025",
                  "end_date": "15-06-2025",
                  "duration": "",
                  "estimated_hr": "",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": ""
                },
                {
                  "task_name": "Task Detail 2",
                  "scope_type": "",
                  "task_url": "",
                  "description": "",
                  "start_date": "",
                  "end_date": "16-06-2025",
                  "duration": "",
                  "estimated_hr": "",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": ""
                }
              ]
            },
            {
              "scope_type": "",
              "task_name": "Sub-task 2",
              "task_url": "",
              "description": "",
              "start_date": "",
              "end_date": "",
              "duration": "",
              "estimated_hr": "",
              "consumed_hr": "",
              "difference_in_estimate": "",
              "demo_link": "",
              "task": [
                {
                  "task_name": "Task Detail 1",
                  "scope_type": "",
                  "task_url": "",
                  "description": "",
                  "start_date": "",
                  "end_date": "",
                  "duration": "",
                  "estimated_hr": "",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": ""
                },
                {
                  "task_name": "Task Detail 2",
                  "scope_type": "",
                  "task_url": "",
                  "description": "",
                  "start_date": "",
                  "end_date": "",
                  "duration": "",
                  "estimated_hr": "",
                  "consumed_hr": "",
                  "difference_in_estimate": "",
                  "demo_link": ""
                }
              ]
            },
            {
              "scope_type": "",
              "task_name": "Sub-task 3",
              "task_url": "",
              "description": "",
              "start_date": "",
              "end_date": "",
              "duration": "",
              "estimated_hr": "",
              "consumed_hr": "",
              "difference_in_estimate": "",
              "demo_link": ""
            }
          ]
        }
      ]
    }
  ];

  // Recursive function to flatten hierarchical data
  const flattenTaskHierarchy = (items, level = 0, parentId = null, milestoneData = null) => {
    const result = [];
    
    items.forEach((item, index) => {
      const itemId = parentId ? `${parentId}-${index}` : `item-${index}`;
      
      // Determine if this item has children
      const hasChildren = (item.sub_task && item.sub_task.length > 0) || (item.task && item.task.length > 0);
      
      // Create the flattened item
      const flatItem = {
        id: itemId,
        level: level,
        isParent: hasChildren,
        parentId: parentId,
        sno: "",
        moduleScreen: level === 0 ? (milestoneData?.milestone_name || "-") : "N/A",
        scopeType: item.scope_type || "-",
        taskUrl: item.task_url || (level === 0 ? milestoneData?.task_url : ""),
        taskName: level === 0 ? item.task_name || "-" : "N/A",
        subTaskName: level > 0 ? item.task_name || "-" : "N/A",
        description: item.description || (level === 0 ? milestoneData?.description : "") || "N/A",
        startDate: item.start_date || (level === 0 ? milestoneData?.start_date : ""),
        endDate: item.end_date || (level === 0 ? milestoneData?.end_date : ""),
        duration: item.duration || (level === 0 ? milestoneData?.duration : "") || "N/A",
        estimatedHours: item.estimated_hr || (level === 0 ? milestoneData?.estimated_hr : "") || "N/A",
        consumedHours: item.consumed_hr || (level === 0 ? milestoneData?.consumed_hr : "") || "N/A",
        differenceInEstimates: calculateTimeDifference(item.estimated_hr, item.consumed_hr),
        demoVideoLink: item.demo_link || (level === 0 ? milestoneData?.demo_link : ""),
        hasSubTasks: hasChildren,
        originalItem: item
      };
      
      result.push(flatItem);
      
      // Add children if this item is expanded
      if (hasChildren && expandedTasks.has(itemId)) {
        // Handle sub_task array
        if (item.sub_task && item.sub_task.length > 0) {
          const subItems = flattenTaskHierarchy(item.sub_task, level + 1, itemId, level === 0 ? milestoneData : null);
          result.push(...subItems);
        }
        
        // Handle task array (for deeper nesting)
        if (item.task && item.task.length > 0) {
          const taskItems = flattenTaskHierarchy(item.task, level + 1, itemId, level === 0 ? milestoneData : null);
          result.push(...taskItems);
        }
      }
    });
    
    return result;
  };

  // Flatten data structure to create expandable rows
  const flattenData = useMemo(() => {
    const flattenedData = [];
    
    datas.forEach((milestone, milestoneIndex) => {
      if (milestone.task && milestone.task.length > 0) {
        const milestoneItems = flattenTaskHierarchy(milestone.task, 0, `milestone-${milestoneIndex}`, milestone);
        flattenedData.push(...milestoneItems);
      }
    });
    
    return flattenedData;
  }, [expandedTasks]);

  const handleToggleExpand = useCallback((taskId) => {
    setExpandedTasks(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(taskId)) {
        newExpanded.delete(taskId);
        // Also remove all children from expanded set
        Array.from(newExpanded).forEach(id => {
          if (id.startsWith(taskId + '-')) {
            newExpanded.delete(id);
          }
        });
      } else {
        newExpanded.add(taskId);
      }
      return newExpanded;
    });
  }, []);

  const loadData = useCallback(() => {
    if (!Array.isArray(datas)) return;

    let tasks = [...flattenData];
    console.log("flattened_tasks", tasks);

    if (globalFilter) {
      tasks = tasks.filter((task) =>
        Object.values(task).some((value) =>
          String(value).toLowerCase().includes(globalFilter.toLowerCase())
        )
      );
    }

    if (columnFilters.length > 0) {
      tasks = tasks.filter((task) =>
        columnFilters.every((filter) =>
          String(task[filter.id] || "").toLowerCase().includes(filter.value.toLowerCase())
        )
      );
    }

    if (sorting.length > 0) {
      const sortKey = sorting[0].id;
      const sortDesc = sorting[0].desc;
      tasks.sort((a, b) => {
        if (a[sortKey] < b[sortKey]) return sortDesc ? 1 : -1;
        if (a[sortKey] > b[sortKey]) return sortDesc ? -1 : 1;
        return 0;
      });
    }

    const paginated = tasks.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize
    );

    setTotalData(tasks.length);
    setData(paginated);
    setLoading(false);
  }, [
    flattenData,
    globalFilter,
    columnFilters,
    sorting,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getRowBackgroundColor = (level) => {
    switch (level) {
      case 0: return "#ffffff"; // Main tasks - white
      case 1: return "#f0f8ff"; // Sub-tasks - light blue
      case 2: return "#f5fffa"; // Nested tasks - light green
      case 3: return "#fff5ee"; // Deep nested - light orange
      default: return "#f9f9f9"; // Fallback
    }
  };

  const columns = useMemo(() => [
    { 
      accessorKey: "moduleScreen", 
      header: "Module/Screen", 
      size: 200,
      Cell: ({ row }) => (
        <div style={{ paddingLeft: `${row.original.level * 20}px` }}>
          {row.original.moduleScreen}
        </div>
      )
    },
    { accessorKey: "scopeType", header: "Scope Type", size: 150 },
    {
      accessorKey: "taskUrl",
      header: "Task URL",
      size: 200,
      Cell: ({ cell }) =>
        cell.getValue() ? (
          <a
            href={cell.getValue()}
            className="bg-[#008698] whitespace-nowrap p-1 rounded-md text-[white] no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Sprint
          </a>
        ) : (
          "-"
        ),
    },
    { 
      accessorKey: "taskName", 
      header: "Task", 
      size: 150,
      Cell: ({ row }) => (
        <div style={{ paddingLeft: `${row.original.level * 20}px` }}>
          {row.original.taskName}
        </div>
      )
    },
    { 
      accessorKey: "subTaskName", 
      header: "Sub Task", 
      size: 150,
      Cell: ({ row }) => (
        <div style={{ paddingLeft: `${row.original.level * 20}px` }}>
          {row.original.subTaskName}
        </div>
      )
    },
    { 
      accessorKey: "description", 
      header: "Description", 
      size: 150,
      Cell: ({ cell }) => {
        const rawHtml = cell.getValue();
        const cleanText = stripHTML(rawHtml);
        return cleanText;
      }
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      size: 150,
      Cell: ({ cell }) =>
        cell.getValue()
          ? new Date(cell.getValue()).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "--",
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      size: 150,
      Cell: ({ cell }) =>
        cell.getValue()
          ? new Date(cell.getValue()).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "--",
    },
    { accessorKey: "duration", header: "Duration", size: 140 },
    { accessorKey: "estimatedHours", header: "Estimated Hours", size: 150 },
    { accessorKey: "consumedHours", header: "Consumed Hours", size: 150 },
    {
      accessorKey: "differenceInEstimates",
      header: "Difference In Estimates",
      size: 250,
      Cell: ({ cell }) => (
        <span
          className={`${
            cell.getValue()?.startsWith("+")
              ? "text-green-600"
              : cell.getValue()?.startsWith("-")
              ? "text-orange-600"
              : ""
          } font-semibold`}
        >
          {cell.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "demoVideoLink",
      header: "Demo Video Link",
      size: 200,
      Cell: ({ cell }) =>
        cell.getValue() ? (
          <a
            href={cell.getValue()}
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Video
          </a>
        ) : (
          "-"
        ),
    },
    {
      accessorKey: "Action",
      header: "Action",
      size: 150,
      Cell: ({ row }) => {
        const hasSubTasks = row.original.hasSubTasks;
        const isExpanded = expandedTasks.has(row.original.id);
        
        if (!hasSubTasks) return "-";
        
        return (
          <button
            onClick={() => handleToggleExpand(row.original.id)}
            className="bg-[#008698] whitespace-nowrap p-1 rounded-md text-[white] no-underline"
          >
            {isExpanded ? "Hide Tasks" : "View Tasks"}
          </button>
        );
      },
    }
  ], [expandedTasks, handleToggleExpand, stripHTML]);

  const table = useMaterialReactTable({
    columns,
    data,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    rowCount: totalData,
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
        const newPinningState = updater instanceof Function ? updater(prev.columnPinning) : updater;
        const newState = { ...prev, columnPinning: newPinningState };
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        } catch (error) {
          console.error("Error saving table state:", error);
        }
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
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="textSecondary">
          Total Records: {totalData}
        </Typography>
      </Box>
    ),
    muiTableContainerProps: {
      sx: {
        maxHeight: "100vh",
        overflowX: "auto",
        maxWidth: "100%",
        border: "1px solid whitesmoke",
      },
    },
    muiTableProps: { sx: { tableLayout: "fixed", maxWidth: "80vw" } },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
        border: "1px solid whitesmoke",
        padding: "8px 10px",
        maxWidth: "80vw",
      },
    },
    muiTableBodyCellProps: ({ row }) => ({
      sx: {
        border: "1px solid whitesmoke",
        backgroundColor: getRowBackgroundColor(row.original.level),
      },
    }),
  });

  return (
    <div className="bg-gray-500 mt-1">
      <MaterialReactTable table={table} />
    </div>
  );
}

export default Taskdetails;