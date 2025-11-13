// InvoiceDetails.jsx using Material React Table
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import axios from "axios";
import { Search, Download, Receipt } from "lucide-react";
import { Box, Typography, IconButton, Tooltip, Button } from "@mui/material";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";

const LOCAL_STORAGE_KEY = "mrtInvoiceDetailsTableState";

const InvoiceDetails = () => {
  const user = useSelector((state) => state.user);
  const mail = user?.email_id || "";
  const dropdownRef = useRef(null);

  const [data, setData] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const rolepremission = useSelector((state) => state.userpermission)
    console.log("showuserpermission", rolepremission);
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

  const getInitialTableState = () => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) return JSON.parse(savedState);
    } catch (error) {
      console.error("Error parsing saved table state", error);
    }
    return { columnPinning: { left: ["invoice_no"], right: [] } };
  };

  const [tableState, setTableState] = useState(getInitialTableState);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const fetchPdfDownload = async (fileId) => {
    try {
      const response = await window.catalyst.file
        .folderId("5053000000858042")
        .fileId(fileId)
        .getDownloadLink();
      const downloadUrl = response.content?.download_url;
      if (downloadUrl) {
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.target = "_blank";
        link.download = `Invoice_${fileId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error("Error fetching PDF download:", err);
    }
  };

  const clearFilters = () => {
    setSelectedField("");
    setSelectedStatuses([]);
    setStartDate("");
    setEndDate("");
    setGlobalFilter("");
    setColumnFilters([]);
    setIsDropdownOpen(false);
    setPagination({ pageIndex: 0, pageSize: 10 });
    setSorting([]);
  };

  const isFilterApplied = () => {
    return (
      selectedField ||
      selectedStatuses.length > 0 ||
      startDate ||
      endDate ||
      globalFilter ||
      columnFilters.length > 0
    );
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        email: mail,
        startDate,
        endDate,
        search: globalFilter,
        status: selectedStatuses.join(","),
        sortKey: sorting[0]?.id || "",
        sortOrder: sorting[0]?.desc ? "desc" : "asc",
      };
      const response = await axios.post(
        "/server/elite_tech_corp_function/get-invoice",
        payload
      );
      const invoices = response.data.data || [];
      const processed = invoices.map((item, i) => ({
        ...item.invoice_list,
        id: item.invoice_list?.invoice_no || `row-${i}`,
      }));
      setData(processed);
      setTotalData(response.data.totalRecords || 0);
    } catch (error) {
      console.error("Fetch error:", error);
      setData([]);
      setTotalData(0);
    } finally {
      setLoading(false);
    }
  }, [mail, pagination, globalFilter, selectedStatuses, startDate, endDate, sorting]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: "invoice_no", header: "Invoice ID", size: 220 },
      { accessorKey: "project_name", header: "Project Name", size: 250 },
      { accessorKey: "due_date", header: "Due Date", size: 180 },
      { accessorKey: "contact_person", header: "Contact Person", size: 180 },
      { accessorKey: "contact_email", header: "Email", size: 200 },
      { accessorKey: "Phone_number", header: "Phone", size: 180 },
      {
        accessorKey: "File_ID",
        header: "Actions",
        size: 180,
        Cell: ({ cell }) => {
          const fileId = cell.getValue();
          return (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Download Invoice">
                <IconButton
                  onClick={() => fetchPdfDownload(fileId)}
                  disabled={!fileId}
                  size="small"
                >
                  <Download size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Receipt">
                <IconButton size="small">
                  <Receipt size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          );
        },
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableColumnFilters: true,
    enableColumnPinning: true,
    enableGlobalFilter: true,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
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
        const newPinning =
          typeof updater === "function" ? updater(prev.columnPinning) : updater;
        const newState = { ...prev, columnPinning: newPinning };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
    },
    muiTableContainerProps: {
      sx: {
        maxHeight: "65vh",
        overflowX: "auto",         // Enables horizontal scroll
        width: "100%",             // Ensure full container width
      },
    },
    muiTableProps: {
      sx: {
        tableLayout: "fixed",
        minWidth: "50vw",
        overflowX: "auto"        // Set a minimum width for scrollability
      },
    },
    muiTableHeadCellProps: {
      sx: {
        fontWeight: "bold",
        backgroundColor: "#f5f5f5",
      },
    },
    muiTableBodyRowProps: () => ({
      sx: {
        cursor: "pointer",
        '&:hover': { backgroundColor: "#f9f9f9" },
      },
    }),
    renderBottomToolbarCustomActions: () => (
      <Box sx={{ p: "1rem" }}>
        <Typography variant="body2" color="textSecondary">
          Total Records: {totalData}
        </Typography>
      </Box>


    ),
  });

  return (
    <>
    {hasPermission ("Invoice Details","InvoiceDetails")?(
      <div className="p-6">
      <nav className="mb-4 text-sm">
        <Link to="/dashboard" className="text-gray-500">Dashboard</Link> / <span className="text-[#6B7280]">Invoice</span>
      </nav>
      <h1 className="text-xl font-semibold mb-4">Invoice Details</h1>
      <Box
        sx={{
          overflowX: 'auto',
          width: {
            xs: '100vw',
            sm: '75vw',
            md: '75vw',
            lg: '90vw',
            xl: '100%',
          },
        }}
      >
        <MaterialReactTable table={table} />
      </Box>

    </div>
    ):(
      <div className="p-10 text-center text-red-600 font-semibold">
      You do not have permission to view this page.
    </div>
    )}
     
    </>
   
  );
};

export default InvoiceDetails;
