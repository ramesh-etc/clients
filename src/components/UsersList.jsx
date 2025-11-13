import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, ChevronUp, ChevronDown, User } from "lucide-react";
import Loader from "./Loader";
import "../assets/css/EnquiryDetails.css";
import AuditLog from "./auditLogs";
import { setSort } from "../redux/actions/applicatorActions";
import SalesIqBot from "./SalesIqBot";
import {
  ChevronRight,
  Copy,
  CircleCheckBig,
  SquareCheckBig,
  StickyNote,
  SquareChartGantt,
  NotebookPen,
  Users,
  FolderUp,
  FolderClock,
} from "lucide-react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Box, Typography } from "@mui/material";
import Sidebar from "./Sidebar";


const LOCAL_STORAGE_KEY = "mrtUsersListTableState";

function UsersList() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const mail = user?.email_id || "";
  console.log("Email--->", mail);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const dropdownRef = useRef(null);
  const [totalData, setTotalData] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
   const rolepremission = useSelector((state) => state.userpermission)
    console.log("showuserpermission", rolepremission);

  const navigate = useNavigate();
  const mail1 = sessionStorage.getItem("email");
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
        left: ["enquiryid"],
        right: [],
      },
    };
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
    setSelectedField(e.target.value);
    setSelectedStatuses([]);
    setGlobalFilter("");
    setStartDate("");
    setEndDate("");
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

  const loadData = useCallback(async () => {
  try {
    setLoading(true);

    const response = await axios.get("/server/usermanagement/usersdetails");
    
    if (response.data && response.data.status === "success") {
      // Set the users data from the response
      setData(response.data.data || []);
      // Set total count based on the number of users
      setTotalData(response.data.data?.length || 0);

      // Calculate status counts
      const counts = response.data.data.reduce((acc, user) => {
        const status = user.status || "UNKNOWN";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      setStatusCounts(counts);
    } else {
      setData([]);
      setTotalData(0);
      setStatusCounts({});
    }

    console.log("Users data:", response.data);

  } catch (error) {
    console.error("Error fetching data:", error?.response?.data || error.message);
    setData([]);
    setTotalData(0);
    setStatusCounts({});
  } finally {
    setLoading(false);
  }
}, []);
  

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);



  const columns = useMemo(
    () => [
      {
        accessorKey: "org_id",
        header: "org_id",
        enableColumnOrdering: true,
        enableSorting: true,
        size: 150,
        enableColumnPinning: true,
        enableColumnFilters: true,
        enableColumnActions:true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "first_name",
        header: "First Name",
        enableColumnOrdering: true,
        enableSorting: true,
        size: 250,
        enableColumnPinning: true,
         enableColumnFilters: true,
        enableColumnActions:true,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "last_name",
        header: "Last Name",
        enableColumnOrdering: true,
        enableSorting: true,
        size: 200,
        enableColumnPinning: true,
      },
      
      {
        accessorKey: "email_id",
        header: "Email",
        size: 200,
        enableColumnPinning: true,
      },
      
      {
        accessorKey: "status",
        header: "Status",
        size: 200,
        enableColumnPinning: true,
      },
      {
        accessorKey: "role_details.role_name",
        header: "Role Name",
        size: 200,
        enableColumnPinning: true,
      },
      
      {
        accessorKey: "created_time",
        header: "Created Time",
        size: 200,
        // Cell: ({ cell }) =>
        //   cell.getValue() ? cell.getValue().split(" ")[0] : "N/A",
        enableColumnPinning: true,
      },
      {
        accessorKey: "modified_time",
        header: "Modified Time",
        size: 200,
        // Cell: ({ cell }) =>
        //   cell.getValue() ? cell.getValue().split(" ")[0] : "N/A",
        enableColumnPinning: true,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    enableSorting: true,
    manualSorting: false,
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

    renderBottomToolbarCustomActions: () => (
      <Box sx={{ p: "1rem", display: "flex", alignItems: "center" }}>
        <Typography variant="body2" color="textSecondary">
          Total Records: {totalData}
        </Typography>
      </Box>
    ),

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
    }
   
  });



  return (
    <>

    <Sidebar>
    {hasPermission ("Enquiry", "Enquiry") ? (
    <div className="flex flex-col p-8 md:p-2 pt-3">
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
            <span className="text-[14px] text-[#6B7280]">Users</span>
          </li>
        </ol>
      </nav>

   
      <br></br>

      <div className="">
        <div className="flex flex-col pl-2">
          <h1 className="text-[22px] font-semibold mb-1">Users Details</h1>
        </div>

      
        <div className="mt-4 w-full">
          <MaterialReactTable table={table} />
        </div>
      </div>
    </div>
       
  ):(
    <div className="p-10 text-center text-red-600 font-semibold">
    You do not have permission to view this page.
  </div>
  )}

  </Sidebar>
  </>
  );
}

export default UsersList;
