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
import { Search, ChevronUp, ChevronDown } from "lucide-react";
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

const LOCAL_STORAGE_KEY = "mrtEnquiryDetailsTableState";

function EnquiryDetails() {
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
      const offset =pagination.pageIndex * pagination.pageSize;
      const payload = {
        limit: pagination.pageSize,
        offset: offset+1,
        email: mail1,
        startDate,
        endDate,
        search: globalFilter,
        status: selectedStatuses.join(","),
        sortKey: sorting.length > 0 ? sorting[0].id : "",
        sortOrder: sorting.length > 0 ? (sorting[0].desc ? "DESC" : "ASC") : "",
        columnFilters: columnFilters.map((filter) => ({
          id: filter.id,
          value: filter.value,
        })),
      };

      console.log("loadData payload:", payload);

      const response = await axios.post(
        "/server/elite_tech_corp_function/get-enquiry",
        payload
      );
      const enquiries = response.data.parsedEnquiries || [];

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
      const countsByStatus = {};
      mergedAndUserData.forEach((item) => {
        const status = item.enquiry_status || "Unknown";
        countsByStatus[status] = (countsByStatus[status] || 0) + 1;
      });

      setStatusCounts(countsByStatus);
      setData(mergedAndUserData);
      setTotalData(response.data.totalRecords); // Set the total records here
    } catch (error) {
      console.error(
        "Error fetching data:",
        error?.response?.data || error.message
      );
      setData([]); // Set data to empty array on error
      setTotalData(0); // Reset total data on error
    } finally {
      setLoading(false);
    }
  }, [
    mail,
    globalFilter,
    selectedStatuses,
    startDate,
    endDate,
    sorting,
    pagination.pageIndex,
    pagination.pageSize,
    columnFilters,
  ]);

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

  const handleNavigation = (item) => {
    navigate("/enquiry/viewEnquiry", { state: { enquiryData: item } });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "enquiryid",
        header: "Ticket ID",
        enableColumnOrdering: true,
        enableSorting: true,
        size: 220,
        enableColumnPinning: true,
      },
      {
        accessorKey: "LastName",
        header: "Name",
        enableColumnOrdering: true,
        enableSorting: true,
        size: 250,
        enableColumnPinning: true,
      },
      {
        accessorKey: "email_id",
        header: "Email",
        size: 200,
        enableColumnPinning: true,
      },
      {
        accessorKey: "CONTACTPHONE",
        header: "Phone No",
        size: 150,
        enableColumnPinning: true,
      },
      {
        accessorKey: "Bussiness_type",
        header: "Business Type",
        size: 200,
        enableColumnPinning: true,
      },
      {
        accessorKey: "ProductName",
        header: "Enquiry For",
        size: 200,
        enableColumnPinning: true,
      },
      {
        accessorKey: "enquiry_status",
        header: "Enquiry Status",
        size: 200,
        Cell: ({ cell }) => cell.getValue() || "Pending",
        enableColumnPinning: true,
      },
      {
        accessorKey: "CREATEDTIME",
        header: "Created At",
        size: 200,
        Cell: ({ cell }) =>
          cell.getValue() ? cell.getValue().split(" ")[0] : "N/A",
        enableColumnPinning: true,
      },
      {
        accessorKey: "MODIFIEDTIME",
        header: "Modified At",
        size: 180,
        Cell: ({ cell }) =>
          cell.getValue() ? cell.getValue().split(" ")[0] : "N/A",
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
    },
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () => handleNavigation(row.original),
      sx: {
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
      },
    }),
  });

  const statusCards = [
    {
      title: "Scheduled the meeting",
      key: "Scheduled the meeting",
      color: "bg-emerald-500",
      icon: <SquareChartGantt size={15} />,
    },
    {
      title: "Ready to kick off",
      key: "Ready to kick off",
      color: "bg-[#AFDC8F]",
      icon: <SquareCheckBig size={15} />,
    },
    {
      title: "Uploaded",
      key: "Uploaded",
      color: "bg-yellow-900",
      icon: <FolderUp size={15} />,
    },
    {
      title: "Estimation",
      key: "Estimation",
      color: "bg-amber-500",
      icon: <StickyNote size={15} />,
    },
    {
      title: "In Review",
      key: "In Review",
      color: "bg-yellow-800",
      icon: <Copy size={15} />,
    },
    {
      title: "Requested",
      key: "Requested",
      color: "bg-emerald-500",
      icon: <CircleCheckBig size={15} />,
    },
    {
      title: "Pending",
      key: "Pending",
      color: "bg-red-400",
      icon: <FolderClock size={15} />,
    },
  ];

  return (
    <>
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
            <span className="text-[14px] text-[#6B7280]">Enquiry</span>
          </li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {statusCards.map((card, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-[#FAFDFF] border border-gray-200 rounded-2xl shadow-sm cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg text-white ${card.color}`}>
                {card.icon}
              </div>
              <h2 className="text-[16px] font-semibold text-gray-500 mt-2">
                {card.title}
              </h2>
            </div>

            <p className="text-xl font-bold text-gray-700 mt-3">
              {statusCounts[card.key] || 0}
            </p>
          </div>
        ))}
      </div>

      <br></br>

      <div className="">
        <div className="flex flex-col pl-2">
          <h1 className="text-[22px] font-semibold mb-1">Enquiry Details</h1>
        </div>

        {/* Material React Table */}
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
  </>
  );
}

export default EnquiryDetails;
