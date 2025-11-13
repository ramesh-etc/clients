import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography, Tooltip } from "@mui/material";
import { ChevronDown, ChevronUp } from "lucide-react";

const LOCAL_STORAGE_KEY = "mrtMilestonesTableState";

function Milestones({ milestoneNumber, sprintData, proj_no, projectId }) {
  const [tableData, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [projectItemsData, setProjectItemsData] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
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

  const getInitialTableState = () => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) return JSON.parse(savedState);
    } catch (error) {
      console.error("Error parsing saved table state:", error);
    }
    return {
      columnPinning: {
        left: ["sno", "item_name"],
        right: [],
      },
    };
  };
  const [tableState, setTableState] = useState(getInitialTableState);
  const stripHTML = (html) => (html ? html.replace(/<[^>]*>/g, "") : "");

  useEffect(() => {
    let isCancelled = false;
    async function fetchtask() {
      try {
        const sprintId = sprintData?.external_sprint_id;
        if (!sprintId) return;

        setLoading(true);
        const offset = pagination.pageIndex * pagination.pageSize;
        const payload = {
          sprint_id: sprintId,
          limit: pagination.pageSize,
          offset: offset + 1,
          start_date: startDate,
          end_date: endDate,
          search: globalFilter,
          sortKey: sorting.length > 0 ? sorting[0].id : "",
          sortOrder: sorting.length > 0 ? (sorting[0].desc ? "desc" : "asc") : "",
          columnFilters: columnFilters.map((filter) => ({
            id: filter.id,
            value: filter.value,
          })),
        };

        const res = await fetch(`/server/project-details/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const response = await res.json();
        if (isCancelled) return;
        const items = Array.isArray(response) ? response : response?.data || response?.items || [];
        const totalCount = response.total_count || response.total || response.count || 0;
        setTotalData(totalCount);
        setProjectItemsData(items);
      } catch (error) {
        console.error("❌ Error fetching task:", error);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    if (sprintData?.external_sprint_id) {
      fetchtask();
    }
    return () => { isCancelled = true; };
  }, [
    sprintData?.external_sprint_id,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    globalFilter,
    startDate,
    endDate,
    columnFilters,
  ]);

  const fetchsubtask = async (parentItemId, parentNestingLevel = 0) => {
    try {
      if (!parentItemId) return;
      const payload = { parent_item_id: parentItemId };
      const res = await fetch(`/server/project-details/sub-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const response = await res.json();
      const subtasks = Array.isArray(response) ? response : response?.data || response?.items || [];

      setProjectItemsData(prevData => {
        const parentIndex = prevData.findIndex(item => (item.SprintsItems?.external_item_id || item.external_item_id) === parentItemId);
        if (parentIndex === -1) return prevData;

        const subtasksWithMetadata = subtasks.map(subtask => ({
          ...subtask,
          parent_id: parentItemId,
          is_subtask: true,
          nesting_level: parentNestingLevel + 1,
          SprintsItems: { ...subtask.SprintsItems, ...subtask },
        }));

        const newData = [...prevData];
        newData.splice(parentIndex + 1, 0, ...subtasksWithMetadata);
        return newData;
      });
      setExpandedTasks(prev => new Set(prev).add(parentItemId));
    } catch (error) {
      console.error("Error fetching sub-tasks:", error);
    }
  };

  const collapseSubtasks = (parentItemId) => {
    setProjectItemsData(prevData => {
      const getDescendantIds = (pId) => {
        const children = prevData.filter(item => item.parent_id === pId);
        let ids = children.map(c => c.SprintsItems?.external_item_id || c.external_item_id);
        children.forEach(child => {
          const childId = child.SprintsItems?.external_item_id || child.external_item_id;
          ids = [...ids, ...getDescendantIds(childId)];
        });
        return ids.filter(Boolean);
      };

      const allDescendantIds = getDescendantIds(parentItemId);
      setExpandedTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(parentItemId);
        allDescendantIds.forEach(id => newSet.delete(id));
        return newSet;
      });

      return prevData.filter(item => !allDescendantIds.includes(item.SprintsItems?.external_item_id || item.external_item_id));
    });
  };

  const toMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== "string") return 0;
    const [h = 0, m = 0] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

  const calculateTimeDifference = (estimated, consumed) => {
    const estimatedMin = toMinutes(estimated);
    if (estimatedMin === 0) return "-";
    const consumedMin = toMinutes(consumed);
    const diffMin = estimatedMin - consumedMin;
    const absDiff = Math.abs(diffMin);
    const h = Math.floor(absDiff / 60);
    const m = absDiff % 60;
    return `${diffMin >= 0 ? "+" : "-"}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const parseAssignedUsers = useCallback((assignedUserData) => {
    if (!assignedUserData) return [];
    try {
      if (typeof assignedUserData === 'string') {

        const cleaned = assignedUserData.replace(/^"|"$/g, '').trim();
        if (cleaned.startsWith('[')) {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) return parsed;
        }
        return cleaned.split(',').map(name => name.trim()).filter(Boolean);
      }
      return Array.isArray(assignedUserData) ? assignedUserData : [assignedUserData.toString()];
    } catch (e) {
      if (typeof assignedUserData === 'string') {
        return assignedUserData.split(',').map(name => name.trim()).filter(Boolean);
      }
      return [assignedUserData.toString()];
    }
  }, []);

  const loadData = useCallback(() => {
    if (!Array.isArray(projectItemsData)) return;

    let parentCounter = 0;
    const transformed = projectItemsData.map((task) => {
      const item = task.SprintsItems || {};
      const nestingLevel = task.nesting_level || 0;

      let serialNumber = "";
      if (!task.is_subtask) {
        parentCounter++;
        serialNumber = (pagination.pageIndex * pagination.pageSize + parentCounter).toString();
      }

      return {
        sno: serialNumber,
        external_item_display_id: item.external_item_display_id,
        item_name: item.item_name || (task.is_subtask ? "Unnamed Subtask" : "-"),
        sprint_url: item.sprint_url,
        item_type: item.item_type,
        item_priority: item.item_priority || "-",
        status_name: item.status_name || "-",
        created_by_name: item.created_by_name || "-",
        assigned_users: parseAssignedUsers(item.assigned_user_name),
        description: stripHTML(item.description || "-"),
        start_date: item.start_date,
        end_date: item.end_date,
        duration: item.duration || "-",
        total_estimated_hours: item.total_estimated_hours || "-",
        total_consumed_hours: item.total_consumed_hours || "-",
        total_available_hours: calculateTimeDifference(item.total_estimated_hours, item.total_consumed_hours),
        total_billable_hours: item.total_billable_hours || "-",
        available_billable_hours: item.available_billable_hours || "-",
        available_estimated_hours: item.available_estimated_hours || "-",
        sprint_log_link: item.sprint_log_link || "-",
        isParent: item.is_parent === true,
        isSubtask: task.is_subtask || false,
        external_item_id: item.external_item_id || task.external_item_id,
        parent_id: task.parent_id || null,
        nesting_level: nestingLevel,
      };
    });
    setData(transformed);
  }, [projectItemsData, pagination.pageIndex, pagination.pageSize, parseAssignedUsers]);

  useEffect(() => { loadData(); }, [loadData]);

  const handlePaginationChange = useCallback((updater) => {
    setPagination(prev => {
      const newPagination = typeof updater === 'function' ? updater(prev) : updater;
      if (newPagination.pageIndex !== prev.pageIndex) {
        setExpandedTasks(new Set());
      }
      return newPagination;
    });
  }, []);

  const columns = useMemo(() => [
    {
      accessorKey: "sno",
      header: "S.No",
      size: 80,
      enableColumnFilter: false,
    },
    {
      accessorKey: "external_item_display_id",
      header: "Item ID",
      size: 120
    },
    {
      accessorKey: "item_name",
      header: "Task Name",
      size: 350,
      Cell: ({ cell, row }) => {
        const name = cell.getValue();
        const { nesting_level, isSubtask, isParent, external_item_id, parent_id } = row.original;
        const isExpanded = expandedTasks.has(external_item_id);
        if (isSubtask) {
          const currentIndex = tableData.findIndex(item =>
            (item.external_item_id || item.SprintsItems?.external_item_id) === external_item_id
          );

          const nextItem = tableData[currentIndex + 1];
          const isLastSubtask = !nextItem || nextItem.parent_id !== parent_id;
          return (
            <Box sx={{ display: "flex", alignItems: "center", position: "relative", pl: 2 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: 15,
                  top: -60,
                  width: 2,
                  // height:130,
                  height: isLastSubtask ? 80 : "1000px",
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
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  ml: 6,
                  fontFamily: "Inter",
                  fontSize: '14px',
                }}
              >
                {name}
              </Typography>
            </Box>
          );
        }
        //parent tasks 
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isParent && (
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#344EA0",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
                onClick={() =>
                  isExpanded
                    ? collapseSubtasks(external_item_id)
                    : fetchsubtask(external_item_id, nesting_level)
                }
              >
                {isExpanded ? (
                  <ChevronUp size={16} color="white" />
                ) : (
                  <ChevronDown size={16} color="white" />
                )}
              </Box>
            )}
            <Typography
              variant="body2"
              sx={{
                fontWeight: 500,
                ml: isParent ? 0 : 5,
                fontFamily: "Inter",
                fontSize: '14px',
              }}
            >
              {name}
            </Typography>
          </Box>
        );
      }
    },
    {
      accessorKey: "item_type",
      header: "Task Type",
      size: 150
    },
    {
      accessorKey: "item_priority",
      header: "Task Priority",
      size: 150
    },
    {
      accessorKey: "status_name",
      header: "Status",
      size: 150
    },
    {
      accessorKey: "created_by_name",
      header: "Owner",
      size: 150,
      Cell: ({ cell }) => {
        const name = cell.getValue();

        if (!name || name === "-") {
          return <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "Inter", fontSize: '14px' }}>-</Typography>;
        }

        const initials = getUserInitials(name);
        const color = getConsistentColor(name);

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: color,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                border: "2px solid white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {initials}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontFamily: "Inter", fontSize: '14px' }}>
              {name}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: "assigned_users",
      header: "Assigned To",
      size: 300,
      Cell: ({ cell, row }) => {
        const users = cell.getValue() || [];
        const { external_item_id, isParent } = row.original;
        const isExpanded = expandedTasks.has(external_item_id);

        if (!users || users.length === 0) {
          return <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "Inter", fontSize: '14px' }}>-</Typography>;
        }

        // avatars and names when expanded
        if (isExpanded && isParent && users.length > 1) {
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {users.map((name, index) => {
                const initials = getUserInitials(name);
                const color = getConsistentColor(name);

                return (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.875rem', fontFamily: "Inter", fontSize: '14px' }}>
                      {name}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          );
        }

        // avatars for each user
        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            {users.map((name, index) => {
              const initials = getUserInitials(name);
              const color = getConsistentColor(name);

              return (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </Box>
                  <Typography variant="body2" sx={{ fontFamily: "Inter", fontSize: '14px' }}>
                    {name}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        );
      },
    },
    {
      accessorKey: "sprint_url",
      header: "Task URL",
      size: 120,
      Cell: ({ cell }) => {
        const url = cell.getValue();
        return url && url !== "-"
          ? <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Visit Task</a>
          : "-";
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      size: 600,
      Cell: ({ cell }) => {
        const description = cell.getValue();
        return (
          <Box
            sx={{
              maxHeight: '80px',
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '4px 0',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#cbd5e1',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f5f9',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontFamily: "Inter", fontSize: '14px' }}>
              {description || "-"}
            </Typography>
          </Box>
        );
      },
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      size: 130,
      Cell: ({ cell }) =>
        cell.getValue() ? new Date(cell.getValue()).toLocaleDateString("en-GB").replace(/\//g, "-") : "-",
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      size: 130,
      Cell: ({ cell }) =>
        cell.getValue() ? new Date(cell.getValue()).toLocaleDateString("en-GB").replace(/\//g, "-") : "-",
    },
    {
      accessorKey: "duration",
      header: "Duration",
      size: 100
    },
    {
      accessorKey: "total_estimated_hours",
      header: "Est. Hours",
      size: 200
    },
    {
      accessorKey: "total_consumed_hours",
      header: "Cons. Hours",
      size: 120
    },
    {
      accessorKey: "total_available_hours",
      header: "Est. Diff",
      size: 200,
      Cell: ({ cell }) => (
        <span style={{
          fontWeight: 600,
          color: cell.getValue()?.startsWith("+")
            ? '#16a34a'
            : cell.getValue()?.startsWith("-")
              ? '#ea580c'
              : 'inherit'
        }}>
          {cell.getValue()}
        </span>
      ),
    },
    {
      accessorKey: "total_billable_hours",
      header: "Billable Hours",
      size: 150
    },
    {
      accessorKey: "available_billable_hours",
      header: "Avail. Billable",
      size: 150
    },
    {
      accessorKey: "available_estimated_hours",
      header: "Avail. Est.",
      size: 150
    },
    {
      accessorKey: "sprint_log_link",
      header: "Demo Link",
      size: 120,
      Cell: ({ cell }) => {
        const link = cell.getValue();
        return link && link !== "-"
          ? <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>Video</a>
          : "-";
      },
    },
  ], [expandedTasks]);

  const table = useMaterialReactTable({
    columns,
    data: tableData,
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
    onPaginationChange: handlePaginationChange,
    onSortingChange: setSorting,
    onColumnPinningChange: (updater) => {
      setTableState((prev) => {
        const newPinningState = updater instanceof Function ? updater(prev.columnPinning) : updater;
        const newState = { ...prev, columnPinning: newPinningState };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
    },
    enableColumnResizing: true,
    enableColumnPinning: true,
    enableStickyHeader: true,
    enableColumnActions: true,
    enableColumnFilters: true,
    enableGlobalFilter: true,
    muiTableContainerProps: {
      sx: {
        maxHeight: "75vh",
        border: "1px solid #e5e7eb",
      }
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: 'bold',
        fontSize: '14px',
        fontFamily: "Inter",
        backgroundColor: '#f5f5f5',
        borderBottom: '2px solid #e5e7eb',
        padding: '12px 16px',
      },
    },
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="textSecondary" sx={{ fontFamily: "Inter", fontSize: '14px' }}>
          Total Records: {totalData}
        </Typography>
      </Box>
    ),
    muiTableBodyCellProps: {
      sx: {
        border: '1px solid #f1f5f9',
        padding: '12px 16px',
        fontFamily: "Inter",
        fontSize: '14px',
      },
    },
    muiTableBodyRowProps: {
      sx: {
        '&:hover': {
          backgroundColor: '#f9fafb !important',
        },
      },
    },
  });

  return (
    <div style={{ marginTop: '8px' }}>
      <MaterialReactTable table={table} />
    </div>
  );
}

export default Milestones;